import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { 
    status: 429,
    message: "you exceeded available limit of requests,please try later"
  }
});


export const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { 
    status: 429,
    message: "you exceeded available limit of requests,please try later"
  }}); 
