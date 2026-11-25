import { AppError } from "../../utils/appError.js";
import { prisma } from "../../configs/db.js";
import { auditService } from "../audit/audit.service.js";
import { ENTITY } from "../audit/audit.constants.js";
import { ProductStatus, UserRole, AuditActorType } from "@prisma/client";
import { isDeepStrictEqual } from "node:util";
import { inventoryService } from "../inventory/inventory.service.js";

export class VariantService {
  #prisma;
  #auditService;
  #inventoryService;

  constructor({ prisma: prismaClient = prisma, auditService: audit = auditService, inventoryService: inventory = inventoryService } = {}) {
    this.#prisma = prismaClient;
    this.#auditService = audit;
    this.#inventoryService = inventory;
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
          select: { id:true,total_quantity: true, low_stock_threshold: true },
        },
      },
    });
    if (!variant) {
      throw new AppError(404, "variant not found", "NOT_FOUND");
    }
    return variant;
  }

  async createVariant({ productId, sku, price, attributes, total_quantity, low_stock_threshold, reason, is_active, performedBy }) {
    const variant = await this.#prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new AppError(404, "product not found", "NOT_FOUND");

      const variantWithSameSku = await tx.productVariant.findFirst({ where: { sku } });
      if (variantWithSameSku) throw new AppError(409, "sku already exists", "CONFLICT");

      const created = await tx.productVariant.create({
        data: { sku, price, attributes, is_active, product_id: productId },
      });

      await this.#inventoryService.setInitialInventory({
        variantId: created.id,
        total_quantity,
        low_stock_threshold,
        reason,
        tx,
      });

      const changes = { sku, price, attributes, total_quantity };
      if (low_stock_threshold !== undefined) changes.low_stock_threshold = low_stock_threshold;
      if (is_active !== undefined) changes.is_active = is_active;

      await this.#auditService.log({
        entity_type: ENTITY.VARIANT,
        entity_id: created.id,
        action: "create",
        performed_by_type: AuditActorType.USER,
        performed_by: performedBy,
        changes,
      }, tx);

      return created;
    });

    return variant;
  }

  async updateVariant({ productId, variantId, price, attributes, is_active, performedBy }) {
    if (is_active === false) {
      throw new AppError(400, "use DELETE to deactivate a variant", "BAD_REQUEST");
    }

    const { updatedVariant, changedFields } = await this.#prisma.$transaction(async (tx) => {
      const before = await tx.productVariant.findFirst({
        where: { id: variantId, product_id: productId },
      });
      if (!before) throw new AppError(404, "variant not found", "NOT_FOUND");

      const data = {};
      if (price !== undefined) data.price = price;
      if (attributes !== undefined) data.attributes = attributes;
      const changed = {};

      if (is_active === true && !before.is_active) {
        data.is_active = true;
        changed.is_active = { from: false, to: true };
      }

      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data,
      });

      if (data.price !== undefined && !before.price.equals(updatedVariant.price)) {
        changed.price = { from: before.price, to: updatedVariant.price };
        await tx.priceLog.create({
          data: { old_price: before.price, new_price: updatedVariant.price, variant_id: variantId },
        });
      }
      if (data.attributes !== undefined && !isDeepStrictEqual(before.attributes, updatedVariant.attributes)) {
        changed.attributes = { from: before.attributes, to: updatedVariant.attributes };
      }

      if (Object.keys(changed).length > 0) {
        await this.#auditService.log({
          entity_type: ENTITY.VARIANT,
          entity_id: updatedVariant.id,
          action: "update",
          performed_by_type: AuditActorType.USER,
          performed_by: performedBy,
          changes: changed,
        }, tx);
      }

      return { updatedVariant, changedFields: changed };
    });

    return { updatedVariant, changedFields };
  }

  async deleteVariant({ productId, variantId, performedBy }) {
    return this.#prisma.$transaction(async (tx) => {
      const existing = await tx.productVariant.findFirst({
        where: { id: variantId, product_id: productId },
      });
      if (!existing) throw new AppError(404, "variant not found", "NOT_FOUND");
      if (!existing.is_active) throw new AppError(409, "variant is already deactivated", "CONFLICT");

      const activeVariants = await tx.productVariant.count({
        where: { product_id: productId, is_active: true },
      });
      if (activeVariants <= 1) {
        throw new AppError(409, "product must retain at least one active variant", "CONFLICT");
      }

      const variant = await tx.productVariant.update({
        where: { id: variantId },
        data: { is_active: false },
      });

      await this.#auditService.log({
        entity_type: ENTITY.VARIANT,
        entity_id: variant.id,
        action: "deactivate",
        performed_by_type: AuditActorType.USER,
        performed_by: performedBy,
        changes: { is_active: { from: true, to: variant.is_active } },
      }, tx);

      return { variant, previouslyActive: true };
    });
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
