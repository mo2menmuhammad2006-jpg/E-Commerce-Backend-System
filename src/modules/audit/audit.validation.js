import { z } from "zod";
import { ENTITY_TYPES } from "./audit.constants.js";
import { AuditActorType } from "@prisma/client";

export const logAuditSchema = z.object({
  entity_type: z.enum(ENTITY_TYPES),
  entity_id: z.string().uuid(),
  action: z.string().trim().min(1),
  performed_by_type: z.nativeEnum(AuditActorType),
  performed_by: z.string().uuid().nullable().optional(),
  changes: z.record(z.string(), z.unknown()).default({}),
});

export const listAuditLogsSchema = z.object({
  entity_type: z.enum(ENTITY_TYPES).optional(),
  entity_id: z.string().uuid("invalid entity_id").optional(),
  from: z.coerce.date("invalid from date").optional(),
  to: z.coerce.date("invalid to date").optional(),
  page: z.coerce.number().int().positive("page must be a positive integer").optional(),
  pageSize: z.coerce.number().int().positive("pageSize must be a positive integer").optional(),
});