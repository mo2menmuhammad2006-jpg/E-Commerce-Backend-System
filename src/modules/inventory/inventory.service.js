import { InventoryOperation } from "@prisma/client";
import { prisma } from "../../configs/db.js";
import { AppError } from "../../utils/appError.js";
import {
  initialInventorySchema
} from "./inventory.validation.js";

export class InventoryService {
  #prisma;

  constructor({ prisma: prismaClient = prisma } = {}) {
    this.#prisma = prismaClient;
  }

  static #parseOrThrow(schema, input) {
    try {
      return schema.parse(input);
    } catch (error) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      throw new AppError(400, details, "VALIDATION_ERROR");
    }
  }

  async setInitialInventory({ variantId, total_quantity, low_stock_threshold, reason, tx }) {
    const data = InventoryService.#parseOrThrow(initialInventorySchema, {
      total_quantity,
      low_stock_threshold,
      reason,
    });

    return tx.inventory.create({
      data: {
        variant_id: variantId,
        total_quantity: data.total_quantity,
        low_stock_threshold: data.low_stock_threshold,
        inventory_logs: {
          create: {
            operation_type: InventoryOperation.SET,
            previous_quantity: 0,
            new_quantity: data.total_quantity,
            reason: data.reason,
          },
        },
      },
    });
  }

  async updateInventory({variantId,operation,quantity,low_stock_threshold,reason}) {

    return this.#prisma.$transaction(async (db) => {
      const existing = await db.inventory.findUnique({
        where: { variant_id: variantId },
        select: { id: true },
      });
      if (!existing) throw new AppError(404, "inventory not found", "NOT_FOUND");

      const delta = operation === InventoryOperation.DECREMENT ? -quantity : quantity;
      const rows = await db.$queryRaw`
        UPDATE "Inventory"
        SET total_quantity = total_quantity + ${delta}
        WHERE variant_id = ${variantId}::uuid AND total_quantity + ${delta} >= 0
        RETURNING id, total_quantity - ${delta} AS "previous_quantity", total_quantity AS "new_quantity"
      `;

      if (rows.length === 0) throw new AppError(409, "insufficient stock", "CONFLICT");

      const inventoryId = rows[0].id;
      const previous_quantity = Number(rows[0].previous_quantity);
      const new_quantity = Number(rows[0].new_quantity);

      if (low_stock_threshold !== undefined) {
        await db.inventory.update({
          where: { id: inventoryId },
          data: { low_stock_threshold: low_stock_threshold },
        });
      }

      const log = await db.inventoryLog.create({
        data: {
          inventory_id: inventoryId,
          operation_type: operation,
          previous_quantity,
          new_quantity,
          reason: reason,
        },
      });

      return { previous_quantity, new_quantity, updated_low_stock_threshold: low_stock_threshold ?? null, log };
    });

  }

  async listInventoryLogs({ inventoryId, skip, take }) {
    const inventory = await this.#prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { id: true },
    });
    if (!inventory) throw new AppError(404, "inventory not found", "NOT_FOUND");

    const where = { inventory_id: inventory.id };
    const [logs, total] = await Promise.all([
      this.#prisma.inventoryLog.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
      }),
      this.#prisma.inventoryLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const inventoryService = new InventoryService();
