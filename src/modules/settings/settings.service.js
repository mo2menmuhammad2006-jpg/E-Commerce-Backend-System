import { prisma } from "../../configs/db.js";
import { AppError } from "../../utils/appError.js";
import { auditService } from "../audit/audit.service.js";
import { ENTITY } from "../audit/audit.constants.js";
import { AuditActorType } from "@prisma/client";
import { SETTINGS_ID } from "./settings.constants.js";

export class SettingsService {

  static #SELECT = {
    base_currency: true,
    currency_symbol: true,
    flat_rate_shipping: true,
    free_shipping_threshold: true,
    tax_rate_percent: true,
    updated_at: true,
  };

  #prisma;
  #auditService;

  constructor({ prisma: prismaClient = prisma, auditService: audit = auditService } = {}) {
    this.#prisma = prismaClient;
    this.#auditService = audit;
  }

  async getSettings() {
    const existing = await this.#prisma.storeSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: SettingsService.#SELECT,
    });

    if (existing) return existing;
    throw new AppError(404, "settings not found", "NOT_FOUND");
  }

  async createSettings(data, performedBy) {
    const exists = await this.#prisma.storeSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (exists) throw new AppError(409, "settings already exist", "CONFLICT");

    const settings = await this.#prisma.storeSettings.create({
      data: { id: SETTINGS_ID, ...data },
      select: SettingsService.#SELECT,
    });

    await this.#auditService.log({
      entity_type: ENTITY.STORE_SETTINGS,
      entity_id: SETTINGS_ID,
      action: "create",
      performed_by_type: AuditActorType.USER,
      performed_by: performedBy,
      changes: data,
    });

    return settings;
  }

  async updateSettings(data, performedBy) {
    const existing = await this.#prisma.storeSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!existing) throw new AppError(404, "settings not found", "NOT_FOUND");

    const settings = await this.#prisma.storeSettings.update({
      where: { id: SETTINGS_ID },
      data,
      select: SettingsService.#SELECT,
    });

    const changes = {};
    for (const [key, newVal] of Object.entries(data)) {
      const oldVal = existing[key];
      const equal = typeof oldVal?.equals === "function" ? oldVal.equals(newVal) : oldVal === newVal;
      if (!equal) changes[key] = { from: oldVal, to: newVal };
    }

    if (Object.keys(changes).length > 0) {
      await this.#auditService.log({
        entity_type: ENTITY.STORE_SETTINGS,
        entity_id: SETTINGS_ID,
        action: "update",
        performed_by_type: AuditActorType.USER,
        performed_by: performedBy,
        changes,
      });
    }

    return settings;
  }
}

export const settingsService = new SettingsService();
