import { ok, created } from "../../utils/responseHelper.js";
import { imagesService } from "./images.service.js";

export class ImagesController {
  #imagesService;

  constructor({ imagesService: service = imagesService } = {}) {
    this.#imagesService = service;
  }

  get = async (req, res, next) => {
    const userRole = req?.user?.role;
    const images = await this.#imagesService.getImages({ productId: req.params.productId, userRole });
    return ok(res, images);
  };

  add = async (req, res, next) => {
    const { finalImages } = await this.#imagesService.addImages({
      productId: req.params.productId,
      images: req.body.images,
    });

    return created(res, finalImages, "images added successfully");
  };

  update = async (req, res, next) => {
    const { updatedImage } = await this.#imagesService.updateImage({
      productId: req.params.productId,
      imageId: req.params.id,
      alt_text: req.body.alt_text,
      display_order: req.body.display_order,
      is_primary: req.body.is_primary,
    });

    return ok(res, updatedImage, "image updated successfully");
  };

  delete = async (req, res, next) => {
    const { deletedImage } = await this.#imagesService.deleteImage({
      productId: req.params.productId,
      imageId: req.params.id,
    });

    return ok(res, deletedImage, "image deleted successfully");
  };

  reorder = async (req, res, next) => {
    const { reorderedImages } = await this.#imagesService.reorderImages({
      productId: req.params.productId,
      images: req.body.images,
    });

    return ok(res, reorderedImages, "images reordered successfully");
  };
}

export const imagesController = new ImagesController();
