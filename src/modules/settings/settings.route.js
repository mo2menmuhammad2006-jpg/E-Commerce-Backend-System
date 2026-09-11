import { Router } from "express";
import {
  getSettingsHandler,
  createSettingsHandler,
  updateSettingsHandler,
} from "./settings.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  createSettingsSchema,
  updateSettingsSchema,
} from "./settings.validation.js";

export const settingsRoutes = Router();

settingsRoutes.get(
  "/",
  sessionAuthMiddleware,
  requirePermission("store_settings", "read"),
  getSettingsHandler
);

settingsRoutes.put(
  "/",
  sessionAuthMiddleware,
  requirePermission("store_settings", "write"),
  validateRequest(createSettingsSchema),
  createSettingsHandler
);

settingsRoutes.patch(
  "/",
  sessionAuthMiddleware,
  requirePermission("store_settings", "write"),
  validateRequest(updateSettingsSchema),
  updateSettingsHandler
);
