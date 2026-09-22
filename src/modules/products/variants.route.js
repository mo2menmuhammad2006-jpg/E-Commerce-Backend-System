import { Router } from "express";
import {
  createVariantHandler,
  getVariantHandler,
  updateVariantHandler,
  deleteVariantHandler,
  getPriceLogsHandler,
} from "./variants.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  createVariantSchema,
  updateVariantSchema,
  variantIdSchema,
} from "./variants.validation.js";

export const variantsRoutes = Router({ mergeParams: true });

variantsRoutes.post(
  "/",
  sessionAuthMiddleware,
  requirePermission("variant", "create"),
  validateRequest(createVariantSchema),
  createVariantHandler
);

variantsRoutes.get(
  "/:id",
  validateRequest(variantIdSchema, "params"),
  getVariantHandler
);

variantsRoutes.patch(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("variant", "update"),
  validateRequest(variantIdSchema, "params"),
  validateRequest(updateVariantSchema),
  updateVariantHandler
);

variantsRoutes.delete(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("variant", "delete"),
  validateRequest(variantIdSchema, "params"),
  deleteVariantHandler
);

variantsRoutes.get(
  "/:id/price-logs",
  sessionAuthMiddleware,
  requirePermission("price_logs", "read"),
  validateRequest(variantIdSchema, "params"),
  getPriceLogsHandler
);
