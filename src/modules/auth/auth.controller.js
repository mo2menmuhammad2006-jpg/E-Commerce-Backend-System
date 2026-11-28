import { authService } from "./auth.service.js";
import { cartService } from "../cart/cart.service.js";
import { ok, created } from "../../utils/responseHelper.js";
import { SESSION_COOKIE_OPTIONS, SESSION_COOKIE_NAME } from "../../middlewares/sessionSetupMiddleware.js";

export class AuthController {
  #authService;
  #cartService;

  constructor({ authService: service = authService, cartService: cart = cartService } = {}) {
    this.#authService = service;
    this.#cartService = cart;
  }

  static #regenerateSession(req) {
    return new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  register = async (req, res, next) => {
    const guestSessionId = req.session?.cartSessionId;
    const user = await this.#authService.register(req.body);
    if (guestSessionId) {
      await this.#cartService.mergeGuestCart({ guestSessionId, userId: user.id });
    }

    await AuthController.#regenerateSession(req);
    req.session.userId = user.id;

    return created(res, user, "user created successfully");
  };

  login = async (req, res, next) => {
    const guestSessionId = req.session?.cartSessionId;
    const user = await this.#authService.login(req.body);
    if (guestSessionId) {
      await this.#cartService.mergeGuestCart({ guestSessionId, userId: user.id });
    }

    await AuthController.#regenerateSession(req);
    req.session.userId = user.id;

    return ok(res, user, "login successful");
  };

  logout = async (req, res, next) => {
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);

    return ok(res, null, "logout successful");
  };

  changePassword = async (req, res, next) => {
    const userId = req.session.userId;

    await this.#authService.changePassword(userId, req.body);

    await AuthController.#regenerateSession(req);
    req.session.userId = userId;

    return ok(res, null, "password changed successfully");
  };

  getProfile = async (req, res, next) => {
    const user = await this.#authService.getProfile(req.session.userId);

    return ok(res, user);
  };

  updateProfile = async (req, res, next) => {
    const user = await this.#authService.updateProfile(req.session.userId, req.body);

    return ok(res, user, "profile updated successfully");
  };
}

export const authController = new AuthController();
