import { randomUUID } from "node:crypto";

export const cartSessionMiddleware = (req, res, next) => {
  if (!req.user && !req.session?.cartSessionId) {
    req.session.cartSessionId = randomUUID();
  }
  next();
};
