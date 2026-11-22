import { categoryService } from "./category.service.js";
import { ok, created } from "../../utils/responseHelper.js";

export class CategoryController {
  #categoryService;

  constructor({ categoryService: service = categoryService } = {}) {
    this.#categoryService = service;
  }

  get = async (req, res, next) => {
    const categories = await this.#categoryService.getCategories();
    return ok(res, categories);
  };

  create = async (req, res, next) => {
    const category = await this.#categoryService.createCategory({
      ...req.body,
      performedBy: req.user.id,
    });

    return created(res, category, "category created successfully");
  };

  update = async (req, res, next) => {
    const category = await this.#categoryService.updateCategory({
      id: req.params.id,
      ...req.body,
      performedBy: req.user.id,
    });

    return ok(res, category, "category updated successfully");
  };

  delete = async (req, res, next) => {
    await this.#categoryService.deleteCategory({
      id: req.params.id,
      performedBy: req.user.id,
    });

    return ok(res, null, "category deleted successfully");
  };
}

export const categoryController = new CategoryController();
