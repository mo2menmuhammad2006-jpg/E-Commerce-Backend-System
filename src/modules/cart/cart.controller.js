import { ok, created } from "../../utils/responseHelper.js";
import { cartService } from "./cart.service.js";

export class CartController {
  #cartService;

  constructor({ cartService: service = cartService } = {}) {
    this.#cartService = service;
  }

  #identity(req) {
    return req.user
      ? { userId: req.user.id }
      : { cartSessionId: req.session.cartSessionId };
  }

  add = async (req, res, next) => {
    const item = await this.#cartService.addItemToCart({
      ...this.#identity(req),
      variantId: req.body.variantId,
      quantity: req.body.quantity,
    });
    return created(res, item, "item added to cart");
  };

  get = async (req, res, next) => {
    const cart = await this.#cartService.getCart(this.#identity(req));
    return ok(res, cart);
  };

  update = async (req, res, next) => {
    const result = await this.#cartService.updateCartItem({
      ...this.#identity(req),
      variantId: req.params.variantId,
      quantity: req.body.quantity,
    });
    return ok(res, result, result.deleted ? "item removed from cart" : "cart item updated");
  };

  remove = async (req, res, next) => {
    await this.#cartService.removeCartItem({
      ...this.#identity(req),
      variantId: req.params.variantId,
    });
    return ok(res, null, "item removed from cart");
  };

  clear = async (req, res, next) => {
    await this.#cartService.clearCart(this.#identity(req));
    return ok(res, null, "cart cleared");
  };
}

export const cartController = new CartController();
