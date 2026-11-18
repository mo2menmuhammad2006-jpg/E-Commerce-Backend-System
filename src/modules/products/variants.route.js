import { Router } from "express";
import { variantsController } from "./variants.controller.js";
import { optionalSessionAuthMiddleware, sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  createVariantSchema,
  updateVariantSchema,
  variantIdSchema,
  getPriceLogsSchema,
} from "./variants.validation.js";

export const variantsRoutes = Router({ mergeParams: true });

/**
 * @openapi
 * /products/{productId}/variants:
 *   post:
 *     tags: [Variants]
 *     summary: Create a variant (admin)
 *     description: Requires an ADMIN session (permission `variants:create`). Creates the variant with its inventory and an initial inventory log.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sku, price, attributes, total_quantity]
 *             properties:
 *               sku: { type: string, minLength: 1, maxLength: 50, example: "SKU-001" }
 *               price: { type: number, exclusiveMinimum: 0, description: "max 2 decimal places", example: 19.99 }
 *               attributes:
 *                 type: object
 *                 additionalProperties: true
 *                 minProperties: 1
 *                 example: { color: "black", size: "M" }
 *               total_quantity: { type: integer, minimum: 0, example: 25 }
 *               low_stock_threshold: { type: integer, minimum: 0, default: 0, example: 5 }
 *               reason: { type: string, minLength: 1, maxLength: 255, description: "optional inventory log reason" }
 *     responses:
 *       201:
 *         description: variant created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "variant created successfully" }
 *                 data: { $ref: "#/components/schemas/ProductVariant" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
variantsRoutes.post(
  "/",
  sessionAuthMiddleware,
  requirePermission("variants", "create"),
  validateRequest(createVariantSchema),
  variantsController.create
);

/**
 * @openapi
 * /products/{productId}/variants/{id}:
 *   get:
 *     tags: [Variants]
 *     summary: Get a variant
 *     description: Public. Non-admins get 404 for inactive variants or non-ACTIVE parent products; admins see any.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: variant with product and inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: "#/components/schemas/ProductVariantDetail" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
variantsRoutes.get(
  "/:id",
  optionalSessionAuthMiddleware,
  validateRequest(variantIdSchema, "params"),
  variantsController.get
);

/**
 * @openapi
 * /products/{productId}/variants/{id}:
 *   patch:
 *     tags: [Variants]
 *     summary: Update a variant (admin)
 *     description: Requires an ADMIN session (permission `variants:update`). A price change is recorded in a price log.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               price: { type: number, exclusiveMinimum: 0, description: "max 2 decimal places", example: 24.99 }
 *               attributes:
 *                 type: object
 *                 additionalProperties: true
 *                 minProperties: 1
 *                 example: { color: "white", size: "L" }
 *     responses:
 *       200:
 *         description: variant updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "variant is updated successfully" }
 *                 data: { $ref: "#/components/schemas/ProductVariant" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
variantsRoutes.patch(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("variants", "update"),
  validateRequest(variantIdSchema, "params"),
  validateRequest(updateVariantSchema),
  variantsController.update
);

/**
 * @openapi
 * /products/{productId}/variants/{id}:
 *   delete:
 *     tags: [Variants]
 *     summary: Deactivate a variant (admin)
 *     description: Requires an ADMIN session (permission `variants:delete`). Sets is_active=false. The product must retain at least one active variant.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: variant deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "variant deactivated successfully" }
 *                 data: { $ref: "#/components/schemas/ProductVariant" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
variantsRoutes.delete(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("variants", "delete"),
  validateRequest(variantIdSchema, "params"),
  variantsController.delete
);

/**
 * @openapi
 * /products/{productId}/variants/{id}/price-logs:
 *   get:
 *     tags: [Variants]
 *     summary: List a variant's price logs (admin)
 *     description: Requires an ADMIN session (permission `price_logs:read`).
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200:
 *         description: paginated price logs (newest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer }
 *                         pageSize: { type: integer }
 *                         priceLogsTotal: { type: integer }
 *                         totalPages: { type: integer }
 *                     priceLogs: { type: array, items: { $ref: "#/components/schemas/PriceLog" } }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
variantsRoutes.get(
  "/:id/price-logs",
  sessionAuthMiddleware,
  requirePermission("price_logs", "read"),
  validateRequest(variantIdSchema, "params"),
  validateRequest(getPriceLogsSchema, "query"),
  variantsController.getPriceLogs
);
