import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  keyGenerator: (req) => req.session?.userId || ipKeyGenerator(req.ip),
});


export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5}); 
