import { AppError } from "../utils/appError.js";
import { prisma } from "../configs/db.js";
const createSessionAuth =(softAuthn=false)=>async (req, res, next) => {
    if (!req.session?.userId) {
        if(softAuthn) return next();
        return next(new AppError(401, "not authenticated,no session","UNAUTHORIZED"));
    }

    const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select:{id:true,role:true}
    });
    
    if(!user){
        return next(new AppError(401, "user no longer exists","UNAUTHORIZED"));
    }
    req.user = user;
     
    
    return next();
};


export const sessionAuthMiddleware = createSessionAuth(false);
export const optionalSessionAuthMiddleware = createSessionAuth(true);