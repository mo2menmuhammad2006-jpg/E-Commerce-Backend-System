import { ok, created } from "../../utils/responseHelper.js";
import { auditService } from "../audit/audit.service.js";
import { VariantService } from "./variants.service.js";

export const getVariantHandler = async (req, res, next) => {
  const variant = await VariantService.getVariant(req.params.productId, req.params.id);
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
    performed_by_type: "USER",
    performed_by: req.user.id,
    changes: req.body,
  });

  return created(res, variant, "variant created successfully");
};

export const deleteVariantHandler = async (req, res, next) => {
  const { variant, previouslyActive } = await VariantService.deleteVariant(req.params.productId, req.params.id);

  await auditService.log({
    entity_type: "variant",
    entity_id: variant.id,
    action: "deactivate",
    performed_by_type: "USER",
    performed_by: req.user.id,
    changes: { is_active: { from: previouslyActive, to: variant.is_active } },
  });

  return ok(res, variant, "variant deactivated successfully");
};