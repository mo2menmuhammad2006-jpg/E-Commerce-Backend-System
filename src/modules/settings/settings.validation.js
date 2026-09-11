import { z } from "zod";
import { MAX_TAX_RATE_PERCENT,MIN_TAX_RATE_PERCENT } from "./settings.constants";

const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(3, "currency code must be 3 characters")
  .regex(/^[A-Z]{3}$/, "currency code must be 3 uppercase letters");

const currencySymbolSchema = z
  .string()
  .trim()
  .min(1, "currency symbol is required")
  .max(5, "currency symbol is too long");

const nonNegativeDecimal = (precision, scale) =>
  z
    .string()
    .regex(
      new RegExp(`^\\d{1,${precision - scale}}(\\.\\d{1,${scale}})?$`),
      `must be a non-negative decimal with max ${precision - scale} digits before decimal and up to ${scale} after`
    );

const taxRateSchema = z
  .string()
  .regex(/^\d{1,3}(\.\d{1,2})?$/, "must be a valid decimal")
  .refine((val) => {
    const num = parseFloat(val);
    return num >= MIN_TAX_RATE_PERCENT && num <= MAX_TAX_RATE_PERCENT;
  }, `tax rate must be between ${MIN_TAX_RATE_PERCENT} and ${MAX_TAX_RATE_PERCENT}(involved)`);

export const createSettingsSchema = z.object({
  base_currency: currencyCodeSchema,
  currency_symbol: currencySymbolSchema,
  flat_rate_shipping: nonNegativeDecimal(10, 2),
  free_shipping_threshold: nonNegativeDecimal(12, 2),
  tax_rate_percent: taxRateSchema,
});

export const updateSettingsSchema = z.object({
  base_currency: currencyCodeSchema.optional(),
  currency_symbol: currencySymbolSchema.optional(),
  flat_rate_shipping: nonNegativeDecimal(10, 2).optional(),
  free_shipping_threshold: nonNegativeDecimal(12, 2).optional(),
  tax_rate_percent: taxRateSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "at least one field must be provided",
});
