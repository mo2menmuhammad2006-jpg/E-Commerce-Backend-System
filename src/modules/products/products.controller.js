import {ok,created} from "../../utils/responseHelper.js";
import { getPagination } from "../../utils/pagination.js";
import { ProductService } from "./products.service.js";
import { auditService } from "../audit/audit.service.js";
import { prisma } from "../../configs/db.js";
import { AppError } from "../../utils/appError.js";

export const listProductsHandler=async(req,res,next)=>{
    const {search,sort,filter}=req.query;
    const {page,pageSize,skip,take}=getPagination(req.query);
    const {items,total}=await ProductService.listProducts({search,sort,filter,skip,take});
    return ok(res,{items,pagination: {page,pageSize,total,totalPages: Math.ceil(total / pageSize),},},total?undefined:"no products for your specifications,change it");
};

export const getProductHandler=async(req,res,next)=>{
    const product=await ProductService.getProduct(req.params.id);
    return ok(res,product);
}

export const createProductHandler=async(req,res,next)=>{
    const product=await ProductService.createProduct(req.body);
    await auditService.log({
        entity_type: "product",
        entity_id: product.id,
        action: "create",
        performed_by_type: "USER",
        performed_by: req.user.id,
        changes: req.body,
    });
    return created(res,product,"product created successfully");
}
export const updateProductHandler=async(req,res,next)=>{
    const oldProduct=await prisma.product.findUnique({where:{id:req.params.id}});
    if(!oldProduct) return next(new AppError(404,"this product doesn't exist","NOT_FOUND"))
    const updatedProduct=await ProductService.updateProduct(req.params.id,req.body);
    const changes = {};
    for (const [key, newVal] of Object.entries(req.body)) {
    if (String(oldProduct[key]) !== String(newVal)) {
        changes[key] = { from: oldProduct[key], to: newVal };
    }
    }

    if (Object.keys(changes).length > 0) {
    await auditService.log({
        entity_type: "product",
        entity_id: updatedProduct.id,
        action: "update",
        performed_by_type: "USER",
        performed_by: req.user.id,
        changes,
    });
    }

    return ok(res, updatedProduct, "product updated successfully");
}

export const deleteProductHandler=async(req,res,next)=>{
    const {product,previousStatus}=await ProductService.deleteProduct(req.params.id);
    await auditService.log({
        entity_type: "product",
        entity_id: product.id,
        action: "deactivate",
        performed_by_type: "USER",
        performed_by: req.user.id,
        changes: { status: { from: previousStatus, to: product.status } },
    });
    return ok(res, product, "product deactivated successfully");
}