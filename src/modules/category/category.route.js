import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { requirePermission } from "../../middlewares/requirePermissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from "./category.validation.js";

export const categoriesRoutes = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get the category tree
 *     description: "Public. Returns the complete hierarchy as nested roots; each node's direct counts are in _count: { children, products }."
 *     responses:
 *       200:
 *         description: category tree
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: "#/components/schemas/CategoryTree" }
 */
categoriesRoutes.get("/", categoryController.get);

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin)
 *     description: Requires an ADMIN session (permission `categories:create`). `parent_id` is required and may be null for a root category. Maximum nesting depth is 3.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, parent_id]
 *             properties:
 *               name: { type: string, minLength: 1, maxLength: 150, example: "Phones" }
 *               description: { type: string, minLength: 1, example: "Mobile phones" }
 *               parent_id: { type: string, format: uuid, nullable: true, description: "null = root category" }
 *     responses:
 *       201:
 *         description: category created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "category created successfully" }
 *                 data: { $ref: "#/components/schemas/CategoryNode" }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
categoriesRoutes.post(
  "/",
  sessionAuthMiddleware,
  requirePermission("categories", "create"),
  validateRequest(createCategorySchema),
  categoryController.create
);

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update a category (admin)
 *     description: Requires an ADMIN session (permission `categories:update`). Only name and/or description can change; the parent cannot be reassigned.
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
 *     responses:
 *       200:
 *         description: category updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "category updated successfully" }
 *                 data: { $ref: "#/components/schemas/CategoryNode" }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
categoriesRoutes.patch(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("categories", "update"),
  validateRequest(categoryIdSchema, "params"),
  validateRequest(updateCategorySchema),
  categoryController.update
);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (admin)
 *     description: Requires an ADMIN session (permission `categories:delete`). The category must have no subcategories and no directly assigned products.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: category deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "category deleted successfully" }
 *                 data: { type: "object", nullable: true, example: null }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       403: { $ref: "#/components/responses/Forbidden" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
categoriesRoutes.delete(
  "/:id",
  sessionAuthMiddleware,
  requirePermission("categories", "delete"),
  validateRequest(categoryIdSchema, "params"),
  categoryController.delete
);
