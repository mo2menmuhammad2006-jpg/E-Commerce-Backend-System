
import express from "express";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { notFound } from "./middlewares/notFoundMiddleware.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { auditRoutes } from "./modules/audit/audit.route.js";
import { settingsRoutes } from "./modules/settings/settings.route.js";
import { sessionSetupMiddleware } from "./middlewares/sessionSetupMiddleware.js";

export const app=express();



app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use(morgan("combined"))

app.use(sessionSetupMiddleware);
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/audit-logs",auditRoutes);
app.use("/api/v1/settings",settingsRoutes);


app.use(notFound);

app.use(errorHandler);