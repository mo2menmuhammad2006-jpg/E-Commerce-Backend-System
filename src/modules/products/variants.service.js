import { AppError } from "../../utils/appError.js";
import { prisma } from "../../configs/db.js";
import { InventoryOperation, ProductStatus, UserRole } from "@prisma/client";

export const VariantService = {
  async getVariant({productId, variantId,userRole}) {
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        product_id: productId,
        ...(userRole ? {} : { is_active: true, product: { status: ProductStatus.ACTIVE } }),
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
  },

  async createVariant({ productId, sku, price, attributes, total_quantity, low_stock_threshold = 0, reason="initial stock on variant creation"}) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError(404, "product not found", "NOT_FOUND");
    }
    
    return prisma.productVariant.create({
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
  },


  async updateVariant({productId,variantId,price,attributes}){
      let changedFields={};
      const result=prisma.$transaction(async (tx)=>{
        const variantBeforeUpdate=await tx.productVariant.findFirst({
          where:{id:variantId,product_id:productId}
        });
        if(!variantBeforeUpdate)
          throw new AppError(404, "variant not found", "NOT_FOUND");
        const updatedVariant=await tx.productVariant.update({
          data:{price:price,attributes:attributes},where: { id: variantId }
        });
        if(String(variantBeforeUpdate.price)!==String(updatedVariant.price)){
          changedFields.price={from:variantBeforeUpdate.price,to:updatedVariant.price};
          await tx.priceLog.create({
            data:{old_price:variantBeforeUpdate.price,new_price:updatedVariant.price,variant_id:variantId}
          });
        }
        if(JSON.stringify(variantBeforeUpdate.attributes)!==JSON.stringify(updatedVariant.attributes))
          changedFields.attributes={from:variantBeforeUpdate.attributes,to:updatedVariant.attributes}
        return {updatedVariant,changedFields};
      })
      return result;
  },
  

  async deleteVariant(productId, variantId) {
    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, product_id: productId },
    });
    if (!existing) {
      throw new AppError(404, "variant not found", "NOT_FOUND");
    }
    if (!existing.is_active) {
      throw new AppError(409, "variant is already deactivated", "CONFLICT");
    }

    const activeVariants = await prisma.productVariant.count({
      where: { product_id: productId, is_active: true },
    });
    if (activeVariants <= 1) {
      throw new AppError(409, "product must retain at least one active variant", "CONFLICT");
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { is_active: false },
    });

    return { variant, previouslyActive: true };
  },
};