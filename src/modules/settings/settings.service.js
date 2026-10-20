import { prisma } from "../../configs/db.js";

export class SettingsService {
  static #DEFAULTS = {
    base_currency: "USD",
    currency_symbol: "$",
    flat_rate_shipping: "0.00",
    free_shipping_threshold: "0.00",
    tax_rate_percent: "0.00",
  };

  static #SELECT = {
    base_currency: true,
    currency_symbol: true,
    flat_rate_shipping: true,
    free_shipping_threshold: true,
    tax_rate_percent: true,
    updated_at: true,
  };

  #prisma;

  constructor({ prisma: prismaClient = prisma } = {}) {
    this.#prisma = prismaClient;
  }

  async getSettings() {
    const existing = await this.#prisma.storeSettings.findUnique({
      where: { id: 1 },
      select: SettingsService.#SELECT,
    });

    if (existing) return existing;

    return this.#prisma.storeSettings.create({
      data: { id: 1, ...SettingsService.#DEFAULTS },
      select: SettingsService.#SELECT,
    });
  }

  async updateAllOrSomeSettings(data) {
    return this.#prisma.storeSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...SettingsService.#DEFAULTS, ...data },
      select: SettingsService.#SELECT,
    });
  }
}

export const settingsService = new SettingsService();
