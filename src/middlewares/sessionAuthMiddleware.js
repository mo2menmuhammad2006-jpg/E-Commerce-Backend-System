export const sessionAuthMiddleware = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return next(new AppError(401, "not authenticated,no session","UNATHURAIZED"));
    }

    const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
    });
    if (!user) {
        return next(new ApiError(401, "user no longer exists","UNATHURAIZED"));
    }

    req.user = user;
    return next();
};