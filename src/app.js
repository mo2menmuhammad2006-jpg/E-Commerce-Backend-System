
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { notFound } from "./middlewares/notFound.js";
import { authRoutes } from "./modules/auth/auth.route.js";


export const app=express();



app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use(morgan("combined"))


app.use("/api/v1/auth",authRoutes);


app.use(notFound);

app.use(errorHandler);