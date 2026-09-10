import { Router } from "express";
import { listAuditLogsHandler } from "./audit.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import { listAuditLogsSchema } from "./audit.validation.js";
import {requirePermission} from "../../middlewares/requirePermissionMiddleware.js"

export const auditRoutes = Router();

auditRoutes.get(
  "/",
  sessionAuthMiddleware,requirePermission("audit_logs","read"),
  validateRequest(listAuditLogsSchema, "query"),
  listAuditLogsHandler
);