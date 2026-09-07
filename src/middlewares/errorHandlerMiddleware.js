import { AppError } from "../utils/appError.js";


export const errorHandler=(err,req,res,next)=>{
    console.error(err);

    if(res.headersSent){
        
        return next(err);
    }
    const isKnown=err instanceof AppError;

    if (!isKnown&&err.code === 'P2025') return res.status(404).json({success:false,error:{code:"NOT_FOUND",message:"resource not found"}});
    if (!isKnown&&err.code === 'P2002') return res.status(409).json({success:false,error:{code:"CONFLICT",message:"this resource already exists"}});

    
    return res.status(isKnown?err.status:500).json({success:false,error:{
        code:isKnown?err.code:"ERROR",message:isKnown?err.message:"internal server error"
    }});
};
