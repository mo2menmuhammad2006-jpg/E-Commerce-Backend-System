import { ok, created } from "../../utils/responseHelper.js";
import { getPagination } from "../../utils/pagination.js";
import { variantService } from "./variants.service.js";

export class VariantsController {
  #variantService;

  constructor({ variantService: service = variantService } = {}) {
    this.#variantService = service;
  }

  get = async (req, res, next) => {
    const userRole = req?.user?.role;
    const variant = await this.#variantService.getVariant({ productId: req.params.productId, variantId: req.params.id, userRole });
    return ok(res, variant);
  };

  create = async (req, res, next) => {
    const variant = await this.#variantService.createVariant({ productId: req.params.productId, ...req.body }, req.user.id);
    return created(res, variant, "variant created successfully");
  };

  update = async (req, res, next) => {
    const { updatedVariant } = await this.#variantService.updateVariant({ productId: req.params.productId, variantId: req.params.id, ...req.body }, req.user.id);
    return ok(res, updatedVariant, "variant is updated successfully");
  };

  delete = async (req, res, next) => {
    const { variant } = await this.#variantService.deleteVariant(req.params.productId, req.params.id, req.user.id);
    return ok(res, variant, "variant deactivated successfully");
  };

  getPriceLogs = async (req, res, next) => {
    const { page, pageSize, skip, take } = getPagination(req.validatedQuery);
    const { priceLogs, priceLogsTotal } = await this.#variantService.getPriceLogs({ productId: req.params.productId, variantId: req.params.id, skip, take });
    return ok(res, { pagination: { page, pageSize, priceLogsTotal, totalPages: Math.ceil(priceLogsTotal / pageSize) }, priceLogs });
  };
}

export const variantsController = new VariantsController();
