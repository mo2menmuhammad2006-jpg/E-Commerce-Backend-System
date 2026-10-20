import { ok, created } from "../../utils/responseHelper.js";
import { getPagination } from "../../utils/pagination.js";
import { productService } from "./products.service.js";

export class ProductsController {
    #productService;

    constructor({ productService: service = productService } = {}) {
        this.#productService = service;
    }

    list = async (req, res, next) => {
        const { search, sort, filter } = req.validatedQuery;
        const { page, pageSize, skip, take } = getPagination(req.validatedQuery);
        const userRole = req?.user?.role;
        const { items, total } = await this.#productService.listProducts({ search, sort, filter, skip, take, userRole });
        return ok(res, { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), }, }, total ? undefined : "no products for your specifications,change it");
    };

    get = async (req, res, next) => {
        const userRole = req?.user?.role;
        const product = await this.#productService.getProduct({ id: req.params.id, userRole });
        return ok(res, product);
    };

    create = async (req, res, next) => {
        const product = await this.#productService.createProduct({...req.body,performedBy:req.user.id});
        return created(res, product, "product created successfully");
    };

    update = async (req, res, next) => {
        const updatedProduct = await this.#productService.updateProduct(req.params.id, req.body, req.user.id);
        return ok(res, updatedProduct, "product updated successfully");
    };

    delete = async (req, res, next) => {
        const product = await this.#productService.deleteProduct(req.params.id, req.user.id);
        return ok(res, product, "product deactivated successfully");
    };
}

export const productsController = new ProductsController();
