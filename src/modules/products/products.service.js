import { productQuery } from "./products.query.js";
import { AppError } from "../../utils/appError.js";
import { prisma } from "../../configs/db.js";
import { ProductStatus, UserRole, AuditActorType } from "@prisma/client";
import { auditService } from "../audit/audit.service.js";
import { ENTITY } from "../audit/audit.constants.js";

export class ProductService {
    #prisma;
    #auditService;
    #productQuery;

    constructor({ prisma: prismaClient = prisma, auditService: audit = auditService, productQuery: query = productQuery } = {}) {
        this.#prisma = prismaClient;
        this.#auditService = audit;
        this.#productQuery = query;
    }

    async listProducts({ search, sort, filter, skip, take, userRole }) {
        const includeInactive = userRole === UserRole.ADMIN;
        return this.#productQuery.list({ search, sort, filter, skip, take, includeInactive });
    }

    async getProduct({ id, userRole }) {
        const includeInactive = userRole === UserRole.ADMIN;
        const product = await this.#productQuery.getById({ id, includeInactive });
        if (!product) {
            throw new AppError(404, "product not found", "NOT_FOUND");
        }
        return product;
    }

    async createProduct({ name, description, category_id ,performedBy}) {
        const category = await this.#prisma.category.findUnique({ where: { id: category_id } });
        if (!category) {
            throw new AppError(404, "category not found", "NOT_FOUND");
        }
        const productWithSameName = await this.#prisma.product.findFirst({ where: { name: name } });
        if (productWithSameName) {
            throw new AppError(409, "there is product with same name,change the new product name", "CONFLICT");
        }
        const product = await this.#prisma.product.create({
            data: { name, description, category_id }
        });
        await this.#auditService.log({
            entity_type: ENTITY.PRODUCT,
            entity_id: product.id,
            action: "create",
            performed_by_type: AuditActorType.USER,
            performed_by: performedBy,
            changes: { name, description, category_id },
        });
        return product;
    }

    async updateProduct(product_id, data, performedBy) {
        const { name, description, category_id, status } = data;
        const existing = await this.#prisma.product.findUnique({ where: { id: product_id } });
        if (!existing) {
            throw new AppError(404, "this product doesn't exist", "NOT_FOUND");
        }
        if (status === ProductStatus.ACTIVE) {
            const activationAbility = await this.#prisma.productVariant.findFirst({ where: { product_id: product_id, is_active: true } });
            if (!activationAbility) throw new AppError(409, "you cant active any product that doesn't have at least one active variant");
        }
        if (category_id) {
            const category = await this.#prisma.category.findUnique({ where: { id: category_id } });
            if (!category) {
                throw new AppError(404, "category not found", "NOT_FOUND");
            }
        }
        const product = await this.#prisma.product.update({
            where: { id: product_id },
            data: { name, description, status, category_id }
        });
        const changes = {};
        for (const [key, newVal] of Object.entries(data)) {
            if (existing[key]!== newVal) {
                changes[key] = { from: existing[key], to: newVal };
            }
        }
        if (Object.keys(changes).length > 0) {
            await this.#auditService.log({
                entity_type: ENTITY.PRODUCT,
                entity_id: product.id,
                action: "update",
                performed_by_type: AuditActorType.USER,
                performed_by: performedBy,
                changes,
            });
        }
        return product;
    }

    async deleteProduct(product_id, performedBy) {
        const existing = await this.#prisma.product.findUnique({ where: { id: product_id } });
        if (!existing) {
            throw new AppError(404, "Product not found", "NOT_FOUND");
        }
        if (existing.status === ProductStatus.INACTIVE) {
            throw new AppError(409, "this product is inactive already,you can't inactivte", "CONFLICT");
        }
        const product = await this.#prisma.product.update({
            where: { id: product_id },
            data: { status: ProductStatus.INACTIVE }
        });
        await this.#auditService.log({
            entity_type: ENTITY.PRODUCT,
            entity_id: product.id,
            action: "deactivate",
            performed_by_type: AuditActorType.USER,
            performed_by: performedBy,
            changes: { status: { from: existing.status, to: product.status } },
        });
        return product;
    }
}

export const productService = new ProductService();
