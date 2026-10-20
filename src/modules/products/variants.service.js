import { AppError } from "../../utils/appError.js";
import { prisma } from "../../configs/db.js";
import { auditService } from "../audit/audit.service.js";
import { InventoryOperation, ProductStatus, UserRole, AuditActorType } from "@prisma/client";
import { isDeepStrictEqual } from "node:util";

export class VariantService {
  #prisma;
  #auditService;

  constructor({ prisma: prismaClient = prisma, auditService: audit = auditService } = {}) {
    this.#prisma = prismaClient;
    this.#auditService = audit;
  }

  async getVariant({ productId, variantId, userRole }) {
    const variant = await this.#prisma.productVariant.findFirst({
      where: {
        id: variantId,
        product_id: productId,
        ...(userRole===UserRole.ADMIN ? {} : { is_active: true, product: { status: ProductStatus.ACTIVE } }),
      },
      select: {
        id: true,
        sku: true,
        price: true,
        attributes: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        product: {
          select: { id: true, name: true, description: true, status: true },
        },
        inventory: {
          select: { total_quantity: true, low_stock_threshold: true },
        },
      },
    });
    if (!variant) {
      throw new AppError(404, "variant not found", "NOT_FOUND");
    }
    return variant;
  }

  async createVariant({ productId, sku, price, attributes, total_quantity, low_stock_threshold = 0, reason = "initial stock on variant creation" }, performedBy) {
    const product = await this.#prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError(404, "product not found", "NOT_FOUND");
    }

    const variantWithSameSku=await this.#prisma.productVariant.findFirst({
      where:{sku:sku}
    })
    if(variantWithSameSku){
      throw new AppError(409,"sku already exists","CONFLICT");
    }

    const variant = await this.#prisma.productVariant.create({
      data: {
        sku,
        price,
        attributes,
        product_id: productId,
        inventory: {
          create: {
            total_quantity,
            low_stock_threshold,
            inventory_logs: {
              create: {
                operation_type: InventoryOperation.SET,
                previous_quantity: 0,
                new_quantity: total_quantity,
                reason,
              },
            },
          },
        },
      },
    });

    await this.#auditService.log({
      entity_type: "variant",
      entity_id: variant.id,
      action: "create",
      performed_by_type: AuditActorType.USER,
      performed_by: performedBy,
      changes: { sku, price, attributes, total_quantity, low_stock_threshold },
    });

    return variant;
  }

  async updateVariant({ productId, variantId, price, attributes }, performedBy) {
    const { updatedVariant, changedFields } = await this.#prisma.$transaction(async (tx) => {
      const variantBeforeUpdate = await tx.productVariant.findFirst({
        where: { id: variantId, product_id: productId },
      });
      if (!variantBeforeUpdate)
        throw new AppError(404, "variant not found", "NOT_FOUND");
      const updatedVariant = await tx.productVariant.update({
        data: { price, attributes }, where: { id: variantId },
      });
      const changed = {};
      if (!variantBeforeUpdate.price.equals(updatedVariant.price)) {
        changed.price = { from: variantBeforeUpdate.price, to: updatedVariant.price };
        await tx.priceLog.create({
          data: { old_price: variantBeforeUpdate.price, new_price: updatedVariant.price, variant_id: variantId },
        });
      }
      if (!isDeepStrictEqual(variantBeforeUpdate.attributes,updatedVariant.attributes))
        changed.attributes = { from: variantBeforeUpdate.attributes, to: updatedVariant.attributes };
      return { updatedVariant, changedFields: changed };
    });

    if (changedFields.attributes !== undefined || changedFields.price !== undefined) {
      await this.#auditService.log({
        entity_type: "variant",
        entity_id: updatedVariant.id,
        action: "update",
        performed_by_type: AuditActorType.USER,
        performed_by: performedBy,
        changes: changedFields,
      });
    }

    return { updatedVariant, changedFields };
  }

  async deleteVariant(productId, variantId, performedBy) {
    const existing = await this.#prisma.productVariant.findFirst({
      where: { id: variantId, product_id: productId },
    });
    if (!existing) {
      throw new AppError(404, "variant not found", "NOT_FOUND");
    }
    if (!existing.is_active) {
      throw new AppError(409, "variant is already deactivated", "CONFLICT");
    }

    const activeVariants = await this.#prisma.productVariant.count({
      where: { product_id: productId, is_active: true },
    });
    if (activeVariants <= 1) {
      throw new AppError(409, "product must retain at least one active variant", "CONFLICT");
    }

    const variant = await this.#prisma.productVariant.update({
      where: { id: variantId },
      data: { is_active: false },
    });

    await this.#auditService.log({
      entity_type: "variant",
      entity_id: variant.id,
      action: "deactivate",
      performed_by_type: AuditActorType.USER,
      performed_by: performedBy,
      changes: { is_active: { from: true, to: variant.is_active } },
    });

    return { variant, previouslyActive: true };
  }

  async getPriceLogs({ productId, variantId, skip, take }) {
    const variantExists = await this.#prisma.productVariant.findFirst({
      where: { id: variantId, product_id: productId },
    });
    if (!variantExists) {
      throw new AppError(404, "variant not found", "NOT_FOUND");
    }

    const where = { variant_id: variantId };
    const [priceLogs, priceLogsTotal] = await Promise.all([
      this.#prisma.priceLog.findMany({
        where,
        select: { old_price: true, new_price: true },
        take,
        skip,
        orderBy: { created_at: "desc" },
      }),
      this.#prisma.priceLog.count({ where }),
    ]);

    return { priceLogs, priceLogsTotal };
  }
}

export const variantService = new VariantService();
