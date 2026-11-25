import { z } from "zod";
import { MAX_PAGE_SIZE } from "../../utils/pagination.js";
import { initialInventorySchema } from "../inventory/inventory.validation.js";

const priceSchema = z
  .number()
  .positive("price must be a positive number")
  .refine((value) => Math.round(value * 100) / 100 === value, "price must have at most 2 decimal places");

const attributeValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
]);

const attributesSchema = z
  .record(z.string().min(1, "attribute name is required"), attributeValueSchema)
  .refine((value) => Object.keys(value).length > 0, "attributes must not be empty");

export const variantIdSchema = z.object({
  id: z.string().uuid("invalid variant id"),
});

export const getPriceLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).optional(),
});

export const createVariantSchema = z.object({
  sku: z.string().trim().min(1, "sku is required").max(50, "sku is too long"),
  price: priceSchema,
  attributes: attributesSchema,
  ...initialInventorySchema.shape,
  is_active: z.boolean().default(true),
});

export const updateVariantSchema = z
  .object({
    price: priceSchema.optional(),
    attributes: attributesSchema.optional(),
    is_active: z.literal(true, { error: "use DELETE to deactivate a variant" }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });