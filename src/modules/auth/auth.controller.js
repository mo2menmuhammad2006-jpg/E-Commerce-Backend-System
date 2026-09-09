import { authService } from "./auth.service.js";
import { ok, created } from "../../utils/responseHelper.js";

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const registerHandler = async (req, res, next) => {
  const user = await authService.register(req.body);

  await regenerateSession(req);
  req.session.userId = user.id;

  return created(res, user, "user created successfully");
};

export const loginHandler = async (req, res, next) => {
  const user = await authService.login(req.body);

  await regenerateSession(req);
  req.session.userId = user.id;

  return ok(res, user, "login successful");
};

export const logoutHandler = async (req, res, next) => {

  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  res.clearCookie("session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return ok(res, null, "logout successful");
};

export const changePasswordHandler = async (req, res, next) => {
  const userId = req.session.userId;

  await authService.changePassword(userId, req.body);

  await regenerateSession(req);
  req.session.userId = userId;

  return ok(res, null, "password changed successfully");
};

export const getProfileHandler = async (req, res, next) => {
  const user = await authService.getProfile(req.session.userId);

  return ok(res, user);
};

export const updateProfileHandler = async (req, res, next) => {
  const user = await authService.updateProfile(req.session.userId, req.body);

  return ok(res, user, "profile updated successfully");
};