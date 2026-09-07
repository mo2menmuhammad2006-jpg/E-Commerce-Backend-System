import { AppError } from "../utils/appError.js";

export const validateRequest=(schema)=>{
    return (req,res,next)=>{
        const result =schema.safeParse(req.body);
    if (!result.success) {
      const formatted = result.error.format();

      const flatErrors = Object.values(formatted)
        .flat()
        .filter(Boolean)
        .map((err) => err._errors)
        .flat();
      return next(new AppError(400,flatErrors.join(", ")));
    }
    return next();
    }
}
