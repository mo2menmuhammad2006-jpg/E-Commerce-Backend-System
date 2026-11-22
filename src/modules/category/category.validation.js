import { z } from "zod";

const nameSchema = z.string().trim().min(1, "name is required").max(150, "name is too long");
const descriptionSchema = z.string().trim().min(1, "description is required");

export const createCategorySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  parent_id: z.string().uuid("invalid uuid").nullable(),
});

export const updateCategorySchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "at least one field must be provided",
});

export const categoryIdSchema = z.object({
  id: z.string().uuid("invalid id"),
});
