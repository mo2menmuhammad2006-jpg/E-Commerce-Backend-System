import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../../configs/db.js";
import { AppError } from "../../utils/appError.js";

export class CartService {
  #prisma;

  constructor({ prisma: prismaClient = prisma } = {}) {
    this.#prisma = prismaClient;
  }

  static #performedBycheck({ userId, cartSessionId }) {
    if (!userId && !cartSessionId) {
      throw new AppError(400, "cart identity is required", "BAD_REQUEST");
    }
  }

  static async #validateItem({ quantity, variantId, tx }) {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId, is_active: true },
      select: {
        id: true,
        price: true,
        product: { select: { status: true } },
      },
    });
    if (!variant || variant.product.status !== ProductStatus.ACTIVE) {
      throw new AppError(404, "variant not found", "NOT_FOUND");
    }

    const inventory = await tx.inventory.findUnique({
      where: { variant_id: variantId },
      select: { total_quantity: true },
    });
    if (!inventory) throw new AppError(409, "variant has no inventory record", "CONFLICT");
    if (quantity > inventory.total_quantity) {
      throw new AppError(409, `this requested quantity is more than available inventory quantity,available quantity is ${inventory.total_quantity}`, "CONFLICT");
    }

    return variant;
  }

  static #issuesFor(item, stockByVariant) {
    const issues = {};
    const variant = item.variant;
    const available = stockByVariant.get(item.variant_id) ?? 0;

    if (!variant || !variant.is_active || variant.product.status !== ProductStatus.ACTIVE) {
      issues.unavailable = "variant is no longer available";
    }
    if (item.quantity > available) {
      issues.underStock = `available quantity is ${available}`;
    }
    if (variant && !item.price_at_addition.equals(variant.price)) {
      issues.priceChanged = `price changed to ${variant.price}`;
    }

    return issues;
  }

  async #loadCart({ userId, cartSessionId }) {
    CartService.#performedBycheck({ userId, cartSessionId });

    const cart = await this.#prisma.cart.findUnique({
      where: userId ? { user_id: userId } : { session_id: cartSessionId },
      select: { id: true },
    });
    if (!cart) return { cart: null, items: [], stockByVariant: new Map() };

    const items = await this.#prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      select: {
        id: true,
        variant_id: true,
        quantity: true,
        price_at_addition: true,
        variant: {
          select: {
            sku: true,
            price: true,
            is_active: true,
            product: { select: { id: true, name: true, status: true } },
          },
        },
      },
      orderBy: { added_at: "asc" },
    });

    const variantIds = [...new Set(items.map((item) => item.variant_id))];
    const inventories = variantIds.length
      ? await this.#prisma.inventory.findMany({
          where: { variant_id: { in: variantIds } },
          select: { variant_id: true, total_quantity: true },
        })
      : [];

    return {
      cart,
      items,
      stockByVariant: new Map(inventories.map((i) => [i.variant_id, i.total_quantity])),
    };
  }

  async addItemToCart({ userId, cartSessionId, quantity, variantId }) {
    CartService.#performedBycheck({ userId, cartSessionId });

    return this.#prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: userId ? { user_id: userId } : { session_id: cartSessionId },
        create: userId ? { user_id: userId } : { session_id: cartSessionId },
        update: {},
        select: { id: true },
      });

      const cartItemExists = await tx.cartItem.findFirst({
        where: { cart_id: cart.id, variant_id: variantId },
        select: { id: true, price_at_addition: true, quantity: true },
      });

      if (!cartItemExists) {
        const variant = await CartService.#validateItem({ quantity, variantId, tx });
        return tx.cartItem.create({
          data: {
            cart_id: cart.id,
            variant_id: variantId,
            quantity,
            price_at_addition: variant.price,
          },
        });
      }

      const totalRequestedQuantity = cartItemExists.quantity + quantity;
      const variant = await CartService.#validateItem({ quantity: totalRequestedQuantity, variantId, tx });
      const newPrice = cartItemExists.price_at_addition.equals(variant.price)
        ? undefined
        : variant.price;

      return tx.cartItem.update({
        where: { id: cartItemExists.id },
        data: { quantity: totalRequestedQuantity, price_at_addition: newPrice },
        select: { id: true, price_at_addition: true, quantity: true, cart_id: true, variant_id: true },
      });
    });
  }

  async updateCartItem({ userId, cartSessionId, variantId, quantity }) {
    CartService.#performedBycheck({ userId, cartSessionId });

    return this.#prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: userId ? { user_id: userId } : { session_id: cartSessionId },
        select: { id: true },
      });
      if (!cart) throw new AppError(404, "cart not found", "NOT_FOUND");

      const item = await tx.cartItem.findFirst({
        where: { cart_id: cart.id, variant_id: variantId },
        select: { id: true, price_at_addition: true },
      });
      if (!item) throw new AppError(404, "cart item not found", "NOT_FOUND");

      if (quantity === 0) {
        await tx.cartItem.delete({ where: { id: item.id } });
        return { deleted: true };
      }

      const variant = await CartService.#validateItem({ quantity, variantId, tx });
      const newPrice = item.price_at_addition.equals(variant.price)
        ? undefined
        : variant.price;

      return tx.cartItem.update({
        where: { id: item.id },
        data: { quantity, price_at_addition: newPrice },
        select: { id: true, price_at_addition: true, quantity: true, cart_id: true, variant_id: true },
      });
    });
  }

  async removeCartItem({ userId, cartSessionId, variantId }) {
    CartService.#performedBycheck({ userId, cartSessionId });

    const cart = await this.#prisma.cart.findUnique({
      where: userId ? { user_id: userId } : { session_id: cartSessionId },
      select: { id: true },
    });
    if (!cart) throw new AppError(404, "cart not found", "NOT_FOUND");

    const { count } = await this.#prisma.cartItem.deleteMany({
      where: { cart_id: cart.id, variant_id: variantId },
    });
    if (count === 0) throw new AppError(404, "cart item not found", "NOT_FOUND");
  }

  async clearCart({ userId, cartSessionId }) {
    CartService.#performedBycheck({ userId, cartSessionId });

    const cart = await this.#prisma.cart.findUnique({
      where: userId ? { user_id: userId } : { session_id: cartSessionId },
      select: { id: true },
    });
    if (!cart) return;

    await this.#prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
  }

  async validateCart(input) {
    const { cart, items, stockByVariant } = await this.#loadCart(input);
    if (!cart) return { cartId: null, items: [], has_issues: false };

    const results = items.map((item) => ({
      id: item.id,
      variant_id: item.variant_id,
      issues: CartService.#issuesFor(item, stockByVariant),
    }));

    return {
      cartId: cart.id,
      items: results,
      has_issues: results.some((item) => Object.keys(item.issues).length > 0),
    };
  }

  async getCart(input) {
    const { cart, items, stockByVariant } = await this.#loadCart(input);
    if (!cart) {
      return { cartId: null, items: [], subtotal: "0.00", total_items: 0, has_issues: false };
    }

    let subtotal = new Prisma.Decimal(0);
    let total_items = 0;

    const details = items.map((item) => {
      const issues = CartService.#issuesFor(item, stockByVariant);
      const line_total = item.price_at_addition.mul(item.quantity);
      subtotal = subtotal.add(line_total);
      total_items += item.quantity;

      return {
        id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.price_at_addition,
        line_total,
        sku: item.variant?.sku ?? null,
        product: item.variant ? item.variant.product : null,
        issues,
      };
    });

    return {
      cartId: cart.id,
      items: details,
      subtotal,
      total_items,
      has_issues: details.some((item) => Object.keys(item.issues).length > 0),
    };
  }

  async mergeGuestCart({ guestSessionId, userId }) {
    if (!guestSessionId || !userId) return { merged: false };

    return this.#prisma.$transaction(async (tx) => {
      const guestCart = await tx.cart.findUnique({
        where: { session_id: guestSessionId },
        select: { id: true },
      });
      if (!guestCart) return { merged: false };

      const userCart = await tx.cart.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });
      if (!userCart) {
        await tx.cart.update({
          where: { id: guestCart.id },
          data: { user_id: userId, session_id: null },
        });
        return { merged: true };
      }

      const guestItems = await tx.cartItem.findMany({ where: { cart_id: guestCart.id } });
      for (const item of guestItems) {
        const existing = await tx.cartItem.findFirst({
          where: { cart_id: userCart.id, variant_id: item.variant_id },
          select: { id: true },
        });
        if (existing) {
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: { increment: item.quantity } },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cart_id: userCart.id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              price_at_addition: item.price_at_addition,
            },
          });
        }
      }

      await tx.cart.delete({ where: { id: guestCart.id } });
      return { merged: true };
    });
  }
}

export const cartService = new CartService();
