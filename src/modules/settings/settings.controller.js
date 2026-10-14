import { settingsService } from "./settings.service.js";
import { ok, created } from "../../utils/responseHelper.js";

export const getSettingsHandler = async (req, res, next) => {
  const settings = await settingsService.getSettings();
  return ok(res, settings);
};

export const createSettingsHandler = async (req, res, next) => {
  const settings = await settingsService.updateAllOrSomeSettings(req.body);


  return created(res, settings, "settings created successfully");
};

export const updateSettingsHandler = async (req, res, next) => {
  const settings = await settingsService.updateAllOrSomeSettings(req.body);


  return ok(res, settings, "settings updated successfully");
};


