import { Router } from "express";
import { settingsController } from "./settings.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  createSettingsSchema,
  updateSettingsSchema,
} from "./settings.validation.js";

export const settingsRoutes = Router();

/**
 * @openapi
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get store settings (admin)
 *     description: Requires an ADMIN session (permission `store_settings:read`).
 *     responses:
 *       200:
 *         description: store settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: "#/components/schemas/StoreSettings" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 */
settingsRoutes.get(
  "/",
  sessionAuthMiddleware,
  requirePermission("store_settings", "read"),
  settingsController.get
);

/**
 * @openapi
 * /settings:
 *   put:
 *     tags: [Settings]
 *     summary: Set all store settings (admin)
 *     description: Requires an ADMIN session (permission `store_settings:write`). Upserts the singleton settings row.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [base_currency, currency_symbol, flat_rate_shipping, free_shipping_threshold, tax_rate_percent]
 *             properties:
 *               base_currency: { type: string, description: "3 uppercase letters", example: "USD" }
 *               currency_symbol: { type: string, minLength: 1, maxLength: 5, example: "$" }
 *               flat_rate_shipping: { type: string, description: "decimal, up to 8 digits and 2 places", example: "5.00" }
 *               free_shipping_threshold: { type: string, description: "decimal, up to 10 digits and 2 places", example: "50.00" }
 *               tax_rate_percent: { type: string, description: "decimal 0-100", example: "10.00" }
 *     responses:
 *       201:
 *         description: settings created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "settings created successfully" }
 *                 data: { $ref: "#/components/schemas/StoreSettings" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 */
settingsRoutes.put(
  "/",
  sessionAuthMiddleware,
  requirePermission("store_settings", "write"),
  validateRequest(createSettingsSchema),
  settingsController.create
);

/**
 * @openapi
 * /settings:
 *   patch:
 *     tags: [Settings]
 *     summary: Update some store settings (admin)
 *     description: Requires an ADMIN session (permission `store_settings:write`). Upserts the singleton settings row.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               base_currency: { type: string, description: "3 uppercase letters", example: "USD" }
 *               currency_symbol: { type: string, minLength: 1, maxLength: 5, example: "$" }
 *               flat_rate_shipping: { type: string, description: "decimal, up to 8 digits and 2 places", example: "5.00" }
 *               free_shipping_threshold: { type: string, description: "decimal, up to 10 digits and 2 places", example: "50.00" }
 *               tax_rate_percent: { type: string, description: "decimal 0-100", example: "10.00" }
 *     responses:
 *       200:
 *         description: settings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "settings updated successfully" }
 *                 data: { $ref: "#/components/schemas/StoreSettings" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 */
settingsRoutes.patch(
  "/",
  sessionAuthMiddleware,
  requirePermission("store_settings", "write"),
  validateRequest(updateSettingsSchema),
  settingsController.update
);
