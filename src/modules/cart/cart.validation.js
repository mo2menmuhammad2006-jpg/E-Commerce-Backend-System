import { z } from "zod";

export const cartVariantIdSchema = z.object({
  variantId: z.string().uuid("invalid variant id"),
});

export const addCartItemSchema = z.object({
  variantId: z.string().uuid("invalid variant id"),
  quantity: z.number().int().positive("quantity must be a positive integer"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative("quantity must be a non-negative integer"),
});
