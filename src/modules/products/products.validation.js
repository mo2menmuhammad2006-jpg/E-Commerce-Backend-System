import { z } from "zod";
import { MAX_PAGE_SIZE } from "../../utils/pagination.js";
import { ProductStatus } from "@prisma/client";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(150, "name is too long"),
  description: z.string().trim().min(1, "description is required"),
  category_id: z.string().uuid("invalid category id"),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().min(1).optional(),
  category_id: z.string().uuid("invalid category id").optional(),
  status: z.enum(ProductStatus).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "at least one field must be provided",
});

export const productIdSchema = z.object({
  id: z.string().uuid("invalid product id"),
});

export const listProductsSchema = z.object({
  search: z.string().trim().optional(),
  sort: z.enum([
    "newest", "oldest",
    "price_asc", "price_desc",
    "rating_asc", "rating_desc",
    "name_asc", "name_desc",
  ]).default("newest"),
  category: z.string().optional(),
  priceMin: z.coerce.number().nonnegative("price must be non-negative").optional(),
  priceMax: z.coerce.number().nonnegative("price must be non-negative").optional(),
  inStock: z.enum(["true", "false"]).optional(),
  ratingMin: z.coerce.number().min(0, "rating min must be at least 0").max(5, "rating min must be at most 5").optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).optional(),
}).transform(({ search, sort, category, priceMin, priceMax, inStock, ratingMin, page, pageSize }) => ({
  search,
  sort,
  filter: {
    category: category ? category.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    priceMin,
    priceMax,
    inStock: inStock === "true" ? true : inStock === "false" ? false : undefined,
    ratingMin,
  },
  page,
  pageSize,
}));
