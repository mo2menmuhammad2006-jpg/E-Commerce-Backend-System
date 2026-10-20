import { Router } from "express";
import { auditController } from "./audit.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import { listAuditLogsSchema } from "./audit.validation.js";
import {requirePermission} from "../../middlewares/requirePermissionMiddleware.js"

export const auditRoutes = Router();

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: List audit logs (admin)
 *     description: Requires an ADMIN session (permission `audit_logs:read`).
 *     parameters:
 *       - { in: query, name: entity_type, schema: { type: string, enum: [product, category, variant, review, store_settings] } }
 *       - { in: query, name: entity_id, schema: { type: string, format: uuid } }
 *       - { in: query, name: from, schema: { type: string, format: date-time } }
 *       - { in: query, name: to, schema: { type: string, format: date-time } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1 } }
 *     responses:
 *       200:
 *         description: paginated audit logs (newest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items: { type: array, items: { $ref: "#/components/schemas/AuditLog" } }
 *                     pagination: { $ref: "#/components/schemas/Pagination" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 */
auditRoutes.get(
  "/",
  sessionAuthMiddleware,requirePermission("audit_logs","read"),
  validateRequest(listAuditLogsSchema, "query"),
  auditController.list
);
