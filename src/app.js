
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { notFound } from "./middlewares/notFoundMiddleware.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { auditRoutes } from "./modules/audit/audit.route.js";
import { settingsRoutes } from "./modules/settings/settings.route.js";
import { sessionSetupMiddleware } from "./middlewares/sessionSetupMiddleware.js";
import { productsRoutes } from "./modules/products/products.route.js";

export const app=express();

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 ,keyGenerator: (req) => {return req.session?.userId || req.ip;}});
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5}); 

app.use(helmet());                                 

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({extended:false}));



app.use(morgan("combined"))
app.use(sessionSetupMiddleware);
app.use(apiLimiter);

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/audit-logs",auditRoutes);
app.use("/api/v1/settings",settingsRoutes);
app.use("/api/v1/products",productsRoutes)


app.use(notFound);

app.use(errorHandler);