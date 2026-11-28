import { Router } from "express";
import { cartController } from "./cart.controller.js";
import { optionalSessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import { cartSessionMiddleware } from "./cartSessionMiddleware.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartVariantIdSchema,
} from "./cart.validation.js";

export const cartRoutes = Router();

/**
 * @openapi
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to the cart
 *     description: "Works for a logged-in customer or a guest. The cart is created empty on the first add. If the variant is already in the cart, quantities are summed."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [variantId, quantity]
 *             properties:
 *               variantId: { type: string, format: uuid, example: "123e4567-e89b-12d3-a456-426614174000" }
 *               quantity: { type: integer, minimum: 1, example: 2 }
 *     responses:
 *       201:
 *         description: item added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "item added to cart" }
 *                 data: { $ref: "#/components/schemas/CartItem" }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
cartRoutes.post(
  "/",
  optionalSessionAuthMiddleware,
  cartSessionMiddleware,
  validateRequest(addCartItemSchema),
  cartController.add
);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get cart details
 *     description: "Returns items with product details, unit price, line total, subtotal, item count, and availability/price-change issues."
 *     responses:
 *       200:
 *         description: cart details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: "#/components/schemas/Cart" }
 */
cartRoutes.get(
  "/",
  optionalSessionAuthMiddleware,
  cartSessionMiddleware,
  cartController.get
);

/**
 * @openapi
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear the cart
 *     description: "Deletes all items but keeps the cart itself. No cart is created if none exists."
 *     responses:
 *       200:
 *         description: cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "cart cleared" }
 *                 data: { nullable: true, example: null }
 */
cartRoutes.delete(
  "/",
  optionalSessionAuthMiddleware,
  cartSessionMiddleware,
  cartController.clear
);

/**
 * @openapi
 * /cart/items/{variantId}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update a cart item quantity
 *     description: "A quantity of zero removes the item. The new quantity is checked against available stock. The stored price is updated if it changed."
 *     parameters:
 *       - { in: path, name: variantId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 0, example: 5 }
 *     responses:
 *       200:
 *         description: item updated or removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   oneOf:
 *                     - $ref: "#/components/schemas/CartItem"
 *                     - type: object
 *                       properties:
 *                         deleted: { type: boolean, example: true }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       404: { $ref: "#/components/responses/NotFound" }
 *       409: { $ref: "#/components/responses/Conflict" }
 */
cartRoutes.patch(
  "/items/:variantId",
  optionalSessionAuthMiddleware,
  cartSessionMiddleware,
  validateRequest(cartVariantIdSchema, "params"),
  validateRequest(updateCartItemSchema),
  cartController.update
);

/**
 * @openapi
 * /cart/items/{variantId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from the cart
 *     parameters:
 *       - { in: path, name: variantId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: item removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "item removed from cart" }
 *                 data: { nullable: true, example: null }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
cartRoutes.delete(
  "/items/:variantId",
  optionalSessionAuthMiddleware,
  cartSessionMiddleware,
  validateRequest(cartVariantIdSchema, "params"),
  cartController.remove
);
