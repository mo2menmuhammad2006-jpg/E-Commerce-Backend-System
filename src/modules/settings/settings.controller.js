import { settingsService } from "./settings.service.js";
import { ok, created } from "../../utils/responseHelper.js";

export class SettingsController {
  #settingsService;

  constructor({ settingsService: service = settingsService } = {}) {
    this.#settingsService = service;
  }

  get = async (req, res, next) => {
    const settings = await this.#settingsService.getSettings();
    return ok(res, settings);
  };

  create = async (req, res, next) => {
    const settings = await this.#settingsService.createSettings(req.body, req.user.id);

    return created(res, settings, "settings created successfully");
  };

  update = async (req, res, next) => {
    const settings = await this.#settingsService.updateSettings(req.body, req.user.id);

    return ok(res, settings, "settings updated successfully");
  };
}

export const settingsController = new SettingsController();
