import { ProductStatus, UserRole } from "@prisma/client";
import { prisma } from "../../configs/db.js";
import { ok, created } from "../../utils/responseHelper.js";
import { AppError } from "../../utils/appError.js";
import { ImagesService } from "./images.service.js";

export const getImagesHandler = async (req, res, next) => {
  const isAdmin = req?.user?.role === UserRole.ADMIN;

  const product = await prisma.product.findUnique({
    where: { id: req.params.productId },
    select: { id: true, status: true },
  });
  if (!product ||(!isAdmin && product.status !== ProductStatus.ACTIVE)) {
    throw new AppError(404, "product not found", "NOT_FOUND");
  }

  const images = await prisma.productImage.findMany({
    where: { product_id: req.params.productId },
    orderBy: { display_order: "asc" },
    select: { id: true, display_order: true, url: true, alt_text: true, is_primary: true },
  });

  return ok(res, images);
};

export const addImagesHandler = async (req, res, next) => {
  const { finalImages } = await ImagesService.addImages({
    productId: req.params.productId,
    images: req.body.images,
  });

  return created(res, finalImages, "images added successfully");
};

export const updateImageHandler = async (req, res, next) => {
  const { updatedImage } = await ImagesService.updateImage({
    productId: req.params.productId,
    imageId: req.params.id,
    alt_text: req.body.alt_text,
    display_order: req.body.display_order,
    is_primary: req.body.is_primary,
  });

  return ok(res, updatedImage, "image updated successfully");
};

export const deleteImageHandler = async (req, res, next) => {
  const { deletedImage } = await ImagesService.deleteImage({
    productId: req.params.productId,
    imageId: req.params.id,
  });

  return ok(res, deletedImage, "image deleted successfully");
};

export const reorderImagesHandler = async (req, res, next) => {
  const { reorderedImages } = await ImagesService.reorderImages({
    productId: req.params.productId,
    images: req.body.images,
  });

  return ok(res, reorderedImages, "images reordered successfully");
};