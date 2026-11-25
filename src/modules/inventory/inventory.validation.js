import { z } from "zod";
import { InventoryOperation } from "@prisma/client";
import { MAX_PAGE_SIZE } from "../../utils/pagination.js";

export const initialInventorySchema = z.object({
  total_quantity: z.number().int().nonnegative("total quantity must be a non-negative integer"),
  low_stock_threshold: z.number().int().nonnegative("low stock threshold must be a non-negative integer").default(0),
  reason: z.string().trim().min(1, "reason is required").max(255, "reason is too long")
    .default("initial stock on variant creation"),
});

export const updateInventorySchema = z.object({
  variantId: z.string().uuid("invalid variant id"),
  operation: z.enum([InventoryOperation.INCREMENT, InventoryOperation.DECREMENT]),
  quantity: z.number().int().positive("quantity must be a positive integer"),
  reason: z.string().trim().min(1, "reason is required").max(255, "reason is too long"),
  low_stock_threshold: z.number().int().nonnegative("low stock threshold must be a non-negative integer").optional(),
});

export const inventoryVariantIdSchema = z.object({
  variantId: z.string().uuid("invalid variant id"),
});

export const inventoryIdSchema = z.object({
  inventoryId: z.string().uuid("invalid inventory id"),
});

export const listInventoryLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).optional(),
});
