import { Router } from "express";
import {
  getImagesHandler,
  addImagesHandler,
  updateImageHandler,
  reorderImagesHandler,
  deleteImageHandler,
} from "./images.controller.js";
import { optionalSessionAuthMiddleware, sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  addImagesSchema,
  updateImageSchema,
  reorderImagesSchema,
  imageIdSchema,
} from "./images.validation.js";

export const imagesRoutes = Router({ mergeParams: true });

imagesRoutes.get("/", optionalSessionAuthMiddleware,getImagesHandler);

imagesRoutes.post(
  "/",
  sessionAuthMiddleware,
  requirePermission("images", "add"),
  validateRequest(addImagesSchema),
  addImagesHandler
);


imagesRoutes.patch(
  "/reorder",
  sessionAuthMiddleware,
  requirePermission("images", "update"),
  validateRequest(reorderImagesSchema),
  reorderImagesHandler
);

imagesRoutes.patch(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("images", "update"),
  validateRequest(imageIdSchema, "params"),
  validateRequest(updateImageSchema),
  updateImageHandler
);



imagesRoutes.delete(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("images", "delete"),
  validateRequest(imageIdSchema, "params"),
  deleteImageHandler
);