import { AppError } from "../utils/appError.js";
import { prisma } from "../configs/db.js";
export const sessionAuthMiddleware = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return next(new AppError(401, "not authenticated,no session","UNAUTHORIZED"));
    }

    const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select:{id:true,role:true}
    });
    if (!user) {
        return next(new AppError(401, "user no longer exists","UNAUTHORIZED"));
    }

    req.user = user;
    return next();
};