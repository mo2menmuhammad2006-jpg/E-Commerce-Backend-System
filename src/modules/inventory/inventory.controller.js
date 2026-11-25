import { ok } from "../../utils/responseHelper.js";
import { getPagination } from "../../utils/pagination.js";
import { inventoryService } from "./inventory.service.js";

export class InventoryController {
  #inventoryService;

  constructor({ inventoryService: service = inventoryService } = {}) {
    this.#inventoryService = service;
  }

  update = async (req, res, next) => {
    const result = await this.#inventoryService.updateInventory({
      variantId: req.params.variantId,
      ...req.body,
    });

    return ok(res, result, "inventory updated successfully");
  };

  listLogs = async (req, res, next) => {
    const { page, pageSize, skip, take } = getPagination(req.validatedQuery);
    const { logs, total } = await this.#inventoryService.listInventoryLogs({
      inventoryId: req.params.inventoryId,
      skip,
      take,
    });

    return ok(res, {
      items: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  };
}

export const inventoryController = new InventoryController();
