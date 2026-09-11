import { settingsService } from "./settings.service.js";
import { auditService } from "../audit/audit.service.js";
import { ok, created } from "../../utils/responseHelper.js";
import { SETTINGS_ENTITY_ID } from "./settings.constants.js";

export const getSettingsHandler = async (req, res, next) => {
  const settings = await settingsService.getSettings();
  return ok(res, settings);
};

export const createSettingsHandler = async (req, res, next) => {
  const settings = await settingsService.updateAllOrSomeSettings(req.body);

  await auditService.log({
    entity_type: "store_settings",
    entity_id: SETTINGS_ENTITY_ID,
    action: "create",
    performed_by_type: "USER",
    performed_by: req.user.id,
    changes: req.body,
  });

  return created(res, settings, "settings created successfully");
};

export const updateSettingsHandler = async (req, res, next) => {
  const old = await settingsService.getSettings();
  const settings = await settingsService.updateAllOrSomeSettings(req.body);

  const changes = {};
  for (const [key, newVal] of Object.entries(req.body)) {
    if (String(old[key]) !== String(newVal)) {
      changes[key] = { from: old[key], to: newVal };
    }
  }

  if (Object.keys(changes).length > 0) {
    await auditService.log({
      entity_type: "store_settings",
      entity_id: SETTINGS_ENTITY_ID,
      action: "update",
      performed_by_type: "USER",
      performed_by: req.user.id,
      changes,
    });
  }

  return ok(res, settings, "settings updated successfully");
};


