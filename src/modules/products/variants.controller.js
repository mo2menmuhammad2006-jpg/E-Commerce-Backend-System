import { prisma } from "../../configs/db.js";
import { ok, created } from "../../utils/responseHelper.js";
import { auditService } from "../audit/audit.service.js";
import { VariantService } from "./variants.service.js";
import { getPagination } from "../../utils/pagination.js";
import { AppError } from "../../utils/appError.js";
import { AuditActorType } from "@prisma/client";

export const getVariantHandler = async (req, res, next) => {
  const userRole=req?.user?.role;
  const variant = await VariantService.getVariant({productId:req.params.productId, variantId:req.params.id,userRole});
  return ok(res, variant);
};

export const createVariantHandler = async (req, res, next) => {
  const variant = await VariantService.createVariant({
    productId: req.params.productId,
    ...req.body,
  });

  await auditService.log({
    entity_type: "variant",
    entity_id: variant.id,
    action: "create",
    performed_by_type: AuditActorType.USER,
    performed_by: req.user.id,
    changes: req.body,
  });

  return created(res, variant, "variant created successfully");
};


export const updateVariantHandler=async (req,res,next)=>{
  const {updatedVariant,changedFields}=await VariantService.updateVariant({productId:req.params.productId,variantId:req.params.id,...req.body});
  if(changedFields.attributes!==undefined||changedFields.price!==undefined){
    await auditService.log({
      entity_type: "variant",
      entity_id: updatedVariant.id,
      action: "update",
      performed_by_type: AuditActorType.USER,
      performed_by: req.user.id,
      changes: changedFields,
    });
  }
  return ok(res,updatedVariant,"variant is updated successfully")
}

export const deleteVariantHandler = async (req, res, next) => {
  const { variant, previouslyActive } = await VariantService.deleteVariant(req.params.productId, req.params.id);

  await auditService.log({
    entity_type: "variant",
    entity_id: variant.id,
    action: "deactivate",
    performed_by_type: AuditActorType.USER,
    performed_by: req.user.id,
    changes: { is_active: { from: previouslyActive, to: variant.is_active } },
  });

  return ok(res, variant, "variant deactivated successfully");
};


export const getPriceLogsHandler=async (req,res,next)=>{
  const variantExists=await prisma.productVariant.findFirst({
    where:{id:req.params.id,product_id:req.params.productId}
  })
  if(!variantExists) return next(new AppError(404, "variant not found", "NOT_FOUND"));
  const {page,pageSize,skip,take}=getPagination(req.validatedQuery);
  const priceLogs=await prisma.priceLog.findMany({
    where:{variant_id:req.params.id},select:{old_price:true,new_price:true},
    take,skip,orderBy: { created_at: "desc" }
  })
  const priceLogsTotal=await prisma.priceLog.count({
    where:{variant_id:req.params.id}
  })
  return ok(res,{pagination:{page,pageSize,priceLogsTotal,totalPages: Math.ceil(priceLogsTotal / pageSize)},priceLogs});
}