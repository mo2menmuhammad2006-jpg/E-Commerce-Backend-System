import {AppError} from "../utils/appError.js";

const ROLES = {
  ADMIN: {
    audit_logs:{ read:"all"},
    store_settings:{ read:"all", write:"all"}
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