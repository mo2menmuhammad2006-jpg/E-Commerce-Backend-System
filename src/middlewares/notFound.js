import { AppError } from "../utils/appError.js";

export const notFound=((req,res,next)=>{
    
    return next(new AppError(404,'Not Found'));
});