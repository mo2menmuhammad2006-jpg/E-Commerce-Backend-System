import { Router } from "express";
import {
  createProductHandler,
  listProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "./products.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
  productIdSchema,
} from "./products.validation.js";

import { imagesRoutes } from "./images.route.js";
import { variantsRoutes } from "./variants.route.js";

export const productsRoutes = Router();

productsRoutes.use("/:productId/images",imagesRoutes);

productsRoutes.use("/:productId/variants",variantsRoutes);


productsRoutes.post(
  "/",
  sessionAuthMiddleware,
  requirePermission("product", "create"),
  validateRequest(createProductSchema),
  createProductHandler
);

productsRoutes.get(
  "/",
  validateRequest(listProductsSchema, "query"),
  listProductsHandler
);

productsRoutes.get(
  "/:id",
  validateRequest(productIdSchema, "params"),
  getProductHandler
);

productsRoutes.patch(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("product", "update"),
  validateRequest(productIdSchema, "params"),
  validateRequest(updateProductSchema),
  updateProductHandler
);

productsRoutes.delete(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("product", "delete"),
  validateRequest(productIdSchema, "params"),
  deleteProductHandler
);