import { prisma } from "../../configs/db.js";

const DEFAULTS = {
  base_currency: "USD",
  currency_symbol: "$",
  flat_rate_shipping: "0.00",
  free_shipping_threshold: "0.00",
  tax_rate_percent: "0.00",
};

const SELECT = {
  base_currency: true,
  currency_symbol: true,
  flat_rate_shipping: true,
  free_shipping_threshold: true,
  tax_rate_percent: true,
  updated_at: true,
};

export const settingsService = {
  async getSettings() {
    const existing = await prisma.storeSettings.findUnique({
      where: { id: 1 },
      select: SELECT,
    });

    if (existing) return existing;

    return prisma.storeSettings.create({
      data: { id: 1, ...DEFAULTS },
      select: SELECT,
    });
  },

  async updateAllOrSomeSettings(data) {
    return prisma.storeSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1,...DEFAULTS,...data },
      select:SELECT
    });
  },
};
