import {AppError} from "../utils/appError.js";

const ROLES = {
  ADMIN: {
    audit_logs:{ read:"all"},
    store_settings:{ read:"all", write:"all"},
    product:{create:"all",update:"all",delete:"all"},
    variant:{create:"all",update:"all",delete:"all"},
    price_logs:{read:"all"},
    images:{add:"all",update:"all",delete:"all"}
  },
  CUSTOMER: {},
};


export const requirePermission = (resource, action) => (req,res,next) => {
    const userRole = req.user?.role;
    if(!userRole){
        return next(new Error("missing userRole in requirePermissionMiddleware"));
    }
    const scope = ROLES[userRole]?.[resource]?.[action];
    if(!scope) return next(new AppError(403, "forbidden"));
    req.permissionScope = scope;
    next();
};