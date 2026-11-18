import { Router } from "express";
import { imagesController } from "./images.controller.js";
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

/**
 * @openapi
 * /products/{productId}/images:
 *   get:
 *     tags: [Images]
 *     summary: List a product's images
 *     description: Public. Non-admins get 404 when the product is not ACTIVE; admins see images for any status.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: images (ordered by display_order)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: "#/components/schemas/ProductImage" } }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
imagesRoutes.get("/", optionalSessionAuthMiddleware, imagesController.get);

/**
 * @openapi
 * /products/{productId}/images:
 *   post:
 *     tags: [Images]
 *     summary: Add images to a product (admin)
 *     description: Requires an ADMIN session (permission `images:create`). At most 10 images per product and at most one primary.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required: [url, alt_text]
 *                   properties:
 *                     url: { type: string, maxLength: 2048, example: "https://cdn.example.com/p/1.jpg" }
 *                     alt_text: { type: string, maxLength: 255, example: "front view" }
 *                     is_primary: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: images added (returns all product images)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "images added successfully" }
 *                 data: { type: array, items: { $ref: "#/components/schemas/ProductImage" } }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
imagesRoutes.post(
  "/",
  sessionAuthMiddleware,
  requirePermission("images", "create"),
  validateRequest(addImagesSchema),
  imagesController.add
);


/**
 * @openapi
 * /products/{productId}/images/reorder:
 *   patch:
 *     tags: [Images]
 *     summary: Reorder a product's images (admin)
 *     description: Requires an ADMIN session (permission `images:update`). Must include every image exactly once with unique display_order values.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required: [id, display_order]
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     display_order: { type: integer, minimum: 1, maximum: 10 }
 *     responses:
 *       200:
 *         description: images reordered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "images reordered successfully" }
 *                 data: { type: array, items: { $ref: "#/components/schemas/ProductImage" } }
 *       400: { description: invalid payload, content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } } }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
imagesRoutes.patch(
  "/reorder",
  sessionAuthMiddleware,
  requirePermission("images", "update"),
  validateRequest(reorderImagesSchema),
  imagesController.reorder
);

/**
 * @openapi
 * /products/{productId}/images/{id}:
 *   patch:
 *     tags: [Images]
 *     summary: Update an image (admin)
 *     description: Requires an ADMIN session (permission `images:update`). Setting display_order swaps with the image currently at that order.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               alt_text: { type: string, minLength: 1, maxLength: 255 }
 *               display_order: { type: integer, minimum: 1, maximum: 10 }
 *               is_primary: { type: boolean }
 *     responses:
 *       200:
 *         description: image updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "image updated successfully" }
 *                 data: { $ref: "#/components/schemas/ProductImage" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
imagesRoutes.patch(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("images", "update"),
  validateRequest(imageIdSchema, "params"),
  validateRequest(updateImageSchema),
  imagesController.update
);

/**
 * @openapi
 * /products/{productId}/images/{id}:
 *   delete:
 *     tags: [Images]
 *     summary: Delete an image (admin)
 *     description: Requires an ADMIN session (permission `images:delete`). A primary image cannot be deleted; the remaining orders are compacted.
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: image deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "image deleted successfully" }
 *                 data: { $ref: "#/components/schemas/ProductImage" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
imagesRoutes.delete(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("images", "delete"),
  validateRequest(imageIdSchema, "params"),
  imagesController.delete
);
