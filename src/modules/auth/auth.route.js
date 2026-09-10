import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  changePasswordHandler,
  getProfileHandler,
  updateProfileHandler,
} from "./auth.controller.js";
import { sessionAuthMiddleware } from "../../middlewares/sessionAuthMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequestMiddleware.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest(registerSchema), registerHandler);
authRoutes.post("/login", validateRequest(loginSchema), loginHandler);
authRoutes.post("/logout",sessionAuthMiddleware ,logoutHandler);
authRoutes.post("/change-password", sessionAuthMiddleware, validateRequest(changePasswordSchema), changePasswordHandler);
authRoutes.patch("/me", sessionAuthMiddleware, validateRequest(updateProfileSchema), updateProfileHandler);
authRoutes.get("/me", sessionAuthMiddleware, getProfileHandler);