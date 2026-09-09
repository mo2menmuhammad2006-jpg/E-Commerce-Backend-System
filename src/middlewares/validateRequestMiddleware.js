import { AppError } from "../utils/appError.js";

export const validateRequest=(schema)=>{
    return (req,res,next)=>{
        const result =schema.safeParse(req.body);
    if (!result.success) {

      const flatErrors = result.error.issues.map((i) => i.message);
      return next(new AppError(400,flatErrors.join(", ")));
    }
    return next();
    }
}
