
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { notFound } from "./middlewares/notFoundMiddleware.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { auditRoutes } from "./modules/audit/audit.route.js";
import { settingsRoutes } from "./modules/settings/settings.route.js";
import { categoriesRoutes } from "./modules/category/category.route.js";
import { sessionSetupMiddleware } from "./middlewares/sessionSetupMiddleware.js";
import { productsRoutes } from "./modules/products/products.route.js";
import { apiLimiter } from "./configs/ratelimiters.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./configs/swagger.js";
import { env } from "./configs/env.js";
export const app=express();


app.set('json replacer', (key, value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value && typeof value === 'object' && value.constructor?.name === 'Decimal') {
    return value.toString();
  }
  return value;
});

app.use(helmet());                                 

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({extended:false}));



app.use(morgan("combined"))
app.use(sessionSetupMiddleware);
app.use(apiLimiter);

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/audit-logs",auditRoutes);
app.use("/api/v1/settings",settingsRoutes);
app.use("/api/v1/categories",categoriesRoutes);
app.use("/api/v1/products",productsRoutes);

if(env.NODE_ENV==="development"){
  app.get("/api/v1/docs.json", (req, res) => res.json(swaggerSpec));
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


app.use(notFound);

app.use(errorHandler);