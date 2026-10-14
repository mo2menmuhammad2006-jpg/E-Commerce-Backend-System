import { z } from "zod";
import { MAX_IMAGES_PER_PRODUCT } from "./images.constants.js";

const imageSchema = z.object({
  url: z
    .string({ error: "url is required" })
    .trim()
    .min(1, "url is required")
    .max(2048, "url is too long"),
  alt_text: z
    .string({ error: "alt text is required" })
    .trim()
    .min(1, "alt text is required")
    .max(255, "alt text is too long"),
  is_primary: z.boolean({ error: "is_primary must be a boolean" }).optional().default(false),
});

export const imageIdSchema = z.object({
  id: z.string().uuid("invalid image id"),
});

export const addImagesSchema = z.object({
  images: z
    .array(imageSchema, { error: "images must be an array of image objects" })
    .min(1, "at least one image is required")
    .max(MAX_IMAGES_PER_PRODUCT, "maximum number of images shouldn't be over " + MAX_IMAGES_PER_PRODUCT)
    .refine((images) => images.filter((image) => image.is_primary).length <= 1, {
      message: "only one image can be primary",
    }),
});

export const updateImageSchema = z
  .object({
    alt_text: z.string().trim().min(1, "alt text is required").max(255, "alt text is too long").optional(),
    display_order: z
      .number()
      .int("display order must be an integer")
      .positive("display order must be a positive number")
      .max(MAX_IMAGES_PER_PRODUCT, "display order shouldn't be over " + MAX_IMAGES_PER_PRODUCT)
      .optional(),
    is_primary: z.boolean({ error: "is_primary must be a boolean" }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });

export const reorderImagesSchema = z.object({
  images: z
    .array(
      z.object({
        id: z.string().uuid("invalid image id"),
        display_order: z
          .number({ error: "display_order is required" })
          .int("display order must be an integer")
          .positive("display order must be a positive number")
          .max(MAX_IMAGES_PER_PRODUCT, "display order shouldn't be over " + MAX_IMAGES_PER_PRODUCT),
      })
    )
    .min(1, "at least one image is required")
    .max(MAX_IMAGES_PER_PRODUCT, "maximum number of images shouldn't be over " + MAX_IMAGES_PER_PRODUCT)
    .refine((images) => new Set(images.map((image) => image.id)).size === images.length, {
      message: "duplicate image ids",
    })
    .refine((images) => new Set(images.map((image) => image.display_order)).size === images.length, {
      message: "display orders must be unique",
    }),
});
