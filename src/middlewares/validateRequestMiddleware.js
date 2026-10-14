import { AppError } from "../utils/appError.js";

export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const formattedErrors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);      
      return next(new AppError(400, formattedErrors.join(", "), "VALIDATION_ERROR"));
    }
    if (source === "query") req.validatedQuery = result.data; 
    else req[source] = result.data;
    return next();
  };
};