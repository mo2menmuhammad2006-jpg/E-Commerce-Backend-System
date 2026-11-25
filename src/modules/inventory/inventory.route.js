import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  updateInventorySchema,
  inventoryVariantIdSchema,
  inventoryIdSchema,
  listInventoryLogsSchema,
} from "./inventory.validation.js";

export const inventoryRoutes = Router();

/**
 * @openapi
 * /inventory/{inventoryId}/logs:
 *   get:
 *     tags: [Inventory]
 *     summary: List an inventory's logs (admin)
 *     description: "Requires an ADMIN session (permission `inventory_logs:read`). Newest first."
 *     parameters:
 *       - { in: path, name: inventoryId, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1 } }
 *     responses:
 *       200:
 *         description: paginated inventory logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items: { type: array, items: { $ref: "#/components/schemas/InventoryLog" } }
 *                     pagination: { $ref: "#/components/schemas/Pagination" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
inventoryRoutes.get(
  "/:inventoryId/logs",
  sessionAuthMiddleware,
  requirePermission("inventory_logs", "read"),
  validateRequest(inventoryIdSchema, "params"),
  validateRequest(listInventoryLogsSchema, "query"),
  inventoryController.listLogs
);

/**
 * @openapi
 * /inventory/{variantId}:
 *   patch:
 *     tags: [Inventory]
 *     summary: Adjust a variant's stock (admin)
 *     description: "Requires an ADMIN session (permission `inventory:update`). INCREMENT and DECREMENT apply a delta and reject results below zero. The quantity change and its inventory log are written atomically."
 *     parameters:
 *       - { in: path, name: variantId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [operation, quantity, reason]
 *             properties:
 *               operation: { type: string, enum: [INCREMENT, DECREMENT] }
 *               quantity: { type: integer, minimum: 1, description: "delta to apply", example: 10 }
 *               reason: { type: string, minLength: 1, maxLength: 255, example: "stock correction" }
 *               low_stock_threshold: { type: integer, minimum: 0, example: 5 }
 *     responses:
 *       200:
 *         description: inventory updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "inventory updated successfully" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     previous_quantity: { type: integer }
 *                     new_quantity: { type: integer }
 *                     low_stock_threshold: { type: integer, nullable: true }
 *                     log: { $ref: "#/components/schemas/InventoryLog" }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
inventoryRoutes.patch(
  "/:variantId",
  sessionAuthMiddleware,
  requirePermission("inventory", "update"),
  validateRequest(inventoryVariantIdSchema, "params"),
  validateRequest(updateInventorySchema),
  inventoryController.update
);
