import { prisma } from "../../configs/db.js";
import { AppError } from "../../utils/appError.js";
import { AuditActorType } from "@prisma/client";
import { auditService } from "../audit/audit.service.js";
import { ENTITY } from "../audit/audit.constants.js";
import { MAX_LEVELS } from "./category.constants.js";

export class CategoryService{
    #prisma
    #auditService
    constructor({prisma:prismaClient=prisma,auditService:audit=auditService}={}){
        this.#prisma=prismaClient;
        this.#auditService=audit;
    }
    async getCategories(){
        const categories=await this.#prisma.category.findMany({
            select:{id: true, name: true, description: true, parent_id: true,
            _count:{select:{products:true,children:true}}}
        });
        if(categories.length===0){
            return categories;
        }
        const categoriesTreeMap=new Map(categories.map((category)=>[category.id,{...category,children:[]}]));
        const roots=[];
        for(const x of categoriesTreeMap.values()){
            if(x.parent_id!==null&&categoriesTreeMap.has(x.parent_id)){
                categoriesTreeMap.get(x.parent_id).children.push(x);
            }else{
                roots.push(x);
            }
        }
        return roots;
    }
    async calculateDepth(parent_id){
        if(parent_id===null) return 0;
        let currentParentId=parent_id;
        let depth=0;
        while(depth<=MAX_LEVELS-1){
            if(currentParentId===null) break
            const category=await this.#prisma.category.findUnique({where:{id:currentParentId},select:{id:true,parent_id:true}})
            if(!category) throw new AppError(404, "parent category not found", "NOT_FOUND");
            currentParentId=category.parent_id;
            depth++;
        }
        return depth;
    }
    async createCategory({name,description,parent_id,performedBy}){
        const sameLevelCategory=await this.#prisma.category.findFirst({
            select:{id:true},where:{parent_id:parent_id,name:name}
        })
        if(sameLevelCategory) throw new AppError(409,"you can't create category with name repeated in same category level","CONFLICT");
        if(await this.calculateDepth(parent_id)>MAX_LEVELS-1){
            throw new AppError(409,`you can't create category under ${MAX_LEVELS} levels`,"CONFLICT");
        }
        const createdCategory=await this.#prisma.category.create({
            data:{name:name,description:description,parent_id:parent_id}
        })

        await this.#auditService.log({
            entity_type:ENTITY.CATEGORY,
            entity_id:createdCategory.id,
            action:"create",
            performed_by_type:AuditActorType.USER,
            performed_by:performedBy,
            changes:{name,description,parent_id}
        });

        return createdCategory;
    }
    async updateCategory({id,name,description,performedBy}){
        const existing=await this.#prisma.category.findUnique({
            where:{id},
            select:{name:true,description:true,parent_id:true},
        });
        if(!existing) throw new AppError(404,"category not found","NOT_FOUND");

        const data={};
        if(name!==undefined){
            const sameLevelCategory=await this.#prisma.category.findFirst({
                where:{parent_id:existing.parent_id,name:name,id:{not:id}},
                select:{id:true},
            });
            if(sameLevelCategory) throw new AppError(409,"you can't update category to a name repeated in same category level","CONFLICT");
            data.name=name;
        }
        if(description!==undefined) data.description=description;

        const updatedCategory=await this.#prisma.category.update({
            where:{id},
            data:data,
        });

        const changes={};
        for(const [key,newValue] of Object.entries(data)){
            const oldValue=existing[key];
            if(oldValue!==newValue) changes[key]={from:oldValue,to:newValue};
        }
        if(Object.keys(changes).length>0){
            await this.#auditService.log({
                entity_type:ENTITY.CATEGORY,
                entity_id:id,
                action:"update",
                performed_by_type:AuditActorType.USER,
                performed_by:performedBy,
                changes:changes,
            });
        }

        return updatedCategory;
    }
    async deleteCategory({id,performedBy}){
        const category=await this.#prisma.category.findUnique({
            where:{id:id},
            select:{
                parent_id:true,
                _count:{select:{children:true,products:true}},
            },
        });

        if(!category) throw new AppError(404,"category not found","NOT_FOUND");
        if(category._count.children>0) throw new AppError(409,"you can't delete category that has subcategories","CONFLICT");
        if(category._count.products>0) throw new AppError(409,"you can't delete category that has products","CONFLICT");

        await this.#prisma.category.delete({where:{id:id}});

        await this.#auditService.log({
            entity_type:ENTITY.CATEGORY,
            entity_id:id,
            action:"delete",
            performed_by_type:AuditActorType.USER,
            performed_by:performedBy
        });

    }
    
}

export const categoryService=new CategoryService();