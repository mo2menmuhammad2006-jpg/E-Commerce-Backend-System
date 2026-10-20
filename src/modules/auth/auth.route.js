import { Router } from "express";
import { authController } from "./auth.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "./auth.validation.js";
import { authLimiter } from "../../configs/ratelimiters.js";

export const authRoutes = Router();

/**
 * @openapi
 * /auth/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Update current profile
 *     description: Requires a session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string, minLength: 1, maxLength: 50 }
 *               last_name: { type: string, minLength: 1, maxLength: 50 }
 *               phone: { type: string, nullable: true, pattern: "^\\+?[0-9]{7,15}$" }
 *     responses:
 *       200:
 *         description: profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "profile updated successfully" }
 *                 data: { $ref: "#/components/schemas/User" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
authRoutes.patch("/me", sessionAuthMiddleware, validateRequest(updateProfileSchema), authController.updateProfile);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current profile
 *     description: Requires a session.
 *     responses:
 *       200:
 *         description: current profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: "#/components/schemas/User" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       404: { $ref: "#/components/responses/NotFound" }
 */
authRoutes.get("/me", sessionAuthMiddleware, authController.getProfile);
authRoutes.use(authLimiter);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates the account and starts a session. Rate limited (5 requests / 15 min).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name: { type: string, minLength: 1, maxLength: 50 }
 *               last_name: { type: string, minLength: 1, maxLength: 50 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8, maxLength: 72, description: "must contain a letter and a number" }
 *               phone: { type: string, pattern: "^\\+?[0-9]{7,15}$" }
 *     responses:
 *       201:
 *         description: user created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "user created successfully" }
 *                 data: { $ref: "#/components/schemas/AuthUser" }
 *       409: { $ref: "#/components/responses/Conflict" }
 *       429: { description: too many requests }
 */
authRoutes.post("/register", validateRequest(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in
 *     description: Starts a session. Rate limited (5 requests / 15 min).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 1, maxLength: 72 }
 *     responses:
 *       200:
 *         description: login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "login successful" }
 *                 data: { $ref: "#/components/schemas/AuthUser" }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 *       429: { description: too many requests }
 */
authRoutes.post("/login", validateRequest(loginSchema), authController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out
 *     description: Requires a session. Destroys the session and clears the cookie.
 *     responses:
 *       200:
 *         description: logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "logout successful" }
 *                 data: { nullable: true, example: null }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 */
authRoutes.post("/logout",sessionAuthMiddleware ,authController.logout);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password
 *     description: Requires a session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, minLength: 1 }
 *               newPassword: { type: string, minLength: 8, maxLength: 72, description: "must contain a letter and a number" }
 *     responses:
 *       200:
 *         description: password changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "password changed successfully" }
 *                 data: { nullable: true, example: null }
 *       401: { $ref: "#/components/responses/Unauthorized" }
 */
authRoutes.post("/change-password", sessionAuthMiddleware, validateRequest(changePasswordSchema), authController.changePassword);
