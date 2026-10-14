import { productQuery } from "./products.query.js";
import { AppError } from "../../utils/appError.js";
import { prisma } from "../../configs/db.js";
import { ProductStatus, UserRole } from "@prisma/client";

export const ProductService={
    async listProducts({search,sort,filter,skip,take,userRole}){
        const includeInactive=userRole===UserRole.ADMIN;
        return productQuery.list({search,sort,filter,skip,take,includeInactive});

    },
    async getProduct({id,userRole}){
        const includeInactive=userRole===UserRole.ADMIN;
        const product=await productQuery.getById({id,includeInactive});
        if(!product){
            throw new AppError(404, "product not found", "NOT_FOUND");
        }
        return product;
    },
    async createProduct({name,description,category_id}){
        const category=await prisma.category.findUnique({where:{id:category_id}});
        if(!category){
            throw new AppError(404, "category not found", "NOT_FOUND");
        }
        const productWithSameName=await prisma.product.findFirst({where:{name:name}});
        if(productWithSameName){
            throw new AppError(409,"there is product with same name,change the new product name","CONFLICT");
        }
        return prisma.product.create({
            data:{name,description,category_id}
        });
    },
    async updateProduct(product_id,{name,description,category_id,status}){
        if(status===ProductStatus.ACTIVE){
            const activationAbility=await prisma.productVariant.findFirst({where:{product_id:product_id,is_active:true}})
            if(!activationAbility) throw new AppError(409, "you cant active any product that doesn't have at least one active variant");
        }
        if(category_id){
            const category=await prisma.category.findUnique({where:{id:category_id}});
            if(!category){
                throw new AppError(404, "category not found", "NOT_FOUND");
            }
        }
        return prisma.product.update({
            where: { id: product_id },
            data:{name,description,status,category_id}
        });


    },
    async deleteProduct(product_id){
        const existing=await prisma.product.findUnique({where:{id:product_id}});
        if (!existing) {
            throw new AppError(404, "Product not found", "NOT_FOUND");
        }
        if(existing.status===ProductStatus.INACTIVE){
            throw new AppError(409,"this product is inactive already,you can't inactivte","CONFLICT");
        }
        const product=await prisma.product.update({
            where:{id:product_id},
            data:{status:ProductStatus.INACTIVE}
        });
        return {product, previousStatus: existing.status};
    }
}