import { Router } from "express";
import { productsController } from "./products.controller.js";
import { optionalSessionAuthMiddleware, sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
  productIdSchema,
  productIdParamSchema
} from "./products.validation.js";

import { imagesRoutes } from "./images.route.js";
import { variantsRoutes } from "./variants.route.js";

export const productsRoutes = Router();

productsRoutes.use("/:productId/images",validateRequest(productIdParamSchema,"params"),imagesRoutes);

productsRoutes.use("/:productId/variants",validateRequest(productIdParamSchema,"params"),variantsRoutes);


/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (admin)
 *     description: Requires an ADMIN session (permission `products:create`).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, category_id]
 *             properties:
 *               name: { type: string, minLength: 1, maxLength: 150, example: "Wireless Mouse" }
 *               description: { type: string, minLength: 1, example: "Ergonomic 2.4GHz mouse" }
 *               category_id: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "product created successfully" }
 *                 data: { $ref: "#/components/schemas/Product" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
productsRoutes.post(
  "/",
  sessionAuthMiddleware,
  requirePermission("products", "create"),
  validateRequest(createProductSchema),
  productsController.create
);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     description: Public. Anonymous users and customers see only ACTIVE products; admins also see DRAFT/INACTIVE.
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: "matches name or description" }
 *       - { in: query, name: sort, schema: { type: string, enum: [newest, oldest, price_asc, price_desc, name_asc, name_desc], default: newest } }
 *       - { in: query, name: category, schema: { type: string }, description: "comma-separated category ids" }
 *       - { in: query, name: priceMin, schema: { type: number } }
 *       - { in: query, name: priceMax, schema: { type: number } }
 *       - { in: query, name: inStock, schema: { type: string, enum: ["true", "false"] } }
 *       - { in: query, name: ratingMin, schema: { type: number, minimum: 0, maximum: 5 } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200:
 *         description: paginated products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, description: "present when the list is empty" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items: { type: array, items: { $ref: "#/components/schemas/ProductListItem" } }
 *                     pagination: { $ref: "#/components/schemas/Pagination" }
 */
productsRoutes.get(
  "/",
  optionalSessionAuthMiddleware,
  validateRequest(listProductsSchema, "query"),
  productsController.list
);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product details
 *     description: Public. Non-admins get 404 for non-ACTIVE products; admins see any status. Includes average_rating and reviews_count from APPROVED reviews.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: "#/components/schemas/ProductDetails" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
productsRoutes.get(
  "/:id",
  optionalSessionAuthMiddleware,
  validateRequest(productIdSchema, "params"),
  productsController.get
);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update a product (admin)
 *     description: Requires an ADMIN session (permission `products:update`). Activating a product requires at least one active variant.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name: { type: string, minLength: 1, maxLength: 150 }
 *               description: { type: string, minLength: 1 }
 *               category_id: { type: string, format: uuid }
 *               status: { type: string, enum: [DRAFT, ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: product updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "product updated successfully" }
 *                 data: { $ref: "#/components/schemas/Product" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
productsRoutes.patch(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("products", "update"),
  validateRequest(productIdSchema, "params"),
  validateRequest(updateProductSchema),
  productsController.update
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Deactivate a product (admin)
 *     description: Requires an ADMIN session (permission `products:delete`). Sets status to INACTIVE.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: product deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "product deactivated successfully" }
 *                 data: { $ref: "#/components/schemas/Product" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
productsRoutes.delete(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("products", "delete"),
  validateRequest(productIdSchema, "params"),
  productsController.delete
);
