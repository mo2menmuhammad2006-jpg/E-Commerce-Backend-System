import { prisma } from "../../configs/db.js";
import { AppError } from "../../utils/appError.js";
import { ProductStatus, UserRole } from "@prisma/client";
import { MAX_IMAGES_PER_PRODUCT } from "./images.constants.js";

export class ImagesService {
  #prisma;

  constructor({ prisma: prismaClient = prisma } = {}) {
    this.#prisma = prismaClient;
  }

  async getImages({ productId, userRole }) {
    const isAdmin = userRole === UserRole.ADMIN;

    const product = await this.#prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true },
    });
    if (!product || (!isAdmin && product.status !== ProductStatus.ACTIVE)) {
      throw new AppError(404, "product not found", "NOT_FOUND");
    }

    return this.#prisma.productImage.findMany({
      where: { product_id: productId },
      orderBy: { display_order: "asc" },
      select: { id: true, display_order: true, url: true, alt_text: true, is_primary: true },
    });
  }

  async addImages({ productId, images }) {
    return this.#prisma.$transaction(async (tx) => {
      const productExists = await tx.product.findUnique({
        where: { id: productId },
      });
      if (!productExists) {
        throw new AppError(404, "product doesn't exist", "NOT_FOUND");
      }

      const newImagesCount = images.length;
      const [currentIsPrimary, currentCount] = await Promise.all([
        tx.productImage.findFirst({
          where: { is_primary: true, product_id: productId },
        }),
        tx.productImage.count({ where: { product_id: productId } }),
      ]);

      const totalCount = newImagesCount + currentCount;
      if (totalCount > MAX_IMAGES_PER_PRODUCT) {
        throw new AppError(409, "maximum number of images shouldn't be over " + MAX_IMAGES_PER_PRODUCT, "CONFLICT");
      }

      let index = currentCount + 1;
      let hasNewPrimary = false;
      const imagesToCreate = images.map((image) => {
        if (image.is_primary) {
          hasNewPrimary = true;
        }
        return {
          product_id: productId,
          url: image.url,
          alt_text: image.alt_text,
          display_order: index++,
          is_primary: image.is_primary || false,
        };
      });

      if (hasNewPrimary && currentIsPrimary) {
        await tx.productImage.update({
          where: { id: currentIsPrimary.id },
          data: { is_primary: false },
        });
      }

      await tx.productImage.createMany({
        data: imagesToCreate,
      });

      const finalImages = await tx.productImage.findMany({
        where: { product_id: productId },
        orderBy: { display_order: "asc" },
      });

      return { finalImages, totalCount };
    });
  }

  async updateImage({ productId, imageId, alt_text, display_order, is_primary }) {
    return this.#prisma.$transaction(async (tx) => {
      const image = await tx.productImage.findFirst({
        where: { id: imageId, product_id: productId },
      });
      if (!image) {
        throw new AppError(404, "image not found", "NOT_FOUND");
      }

      const imageCount = await tx.productImage.count({
        where: { product_id: productId },
      });

      let newDisplayOrder = image.display_order;
      if (display_order !== undefined && display_order !== image.display_order) {
        if (display_order > imageCount) {
          throw new AppError(409, "display order exceeds number of images", "CONFLICT");
        }

        const imageWithTargetOrder = await tx.productImage.findFirst({
          where: { product_id: productId, display_order: display_order },
        });

        if (imageWithTargetOrder) {
          await tx.productImage.update({
            where: { id: imageWithTargetOrder.id },
            data: { display_order: image.display_order },
          });
        }

        newDisplayOrder = display_order;
      }

      let newIsPrimary = image.is_primary;
      if (is_primary === true && !image.is_primary) {
        const currentPrimary = await tx.productImage.findFirst({
          where: { product_id: productId, is_primary: true, id: { not: imageId } },
        });
        if (currentPrimary) {
          await tx.productImage.update({
            where: { id: currentPrimary.id },
            data: { is_primary: false },
          });
        }
        newIsPrimary = true;
      } else if (is_primary === false && image.is_primary) {
        newIsPrimary = false;
      }

      const updatedImage = await tx.productImage.update({
        where: { id: imageId },
        data: {
          alt_text: alt_text !== undefined ? alt_text : image.alt_text,
          display_order: newDisplayOrder,
          is_primary: newIsPrimary,
        },
      });

      return { updatedImage };
    });
  }

  async reorderImages({ productId, images }) {
    return this.#prisma.$transaction(async (tx) => {
      const currentImages = await tx.productImage.findMany({
        where: { product_id: productId }, orderBy: { id: "asc" }
      });
      const count = currentImages.length;

      if (images.length !== count) {
        throw new AppError(400, "must include all product images", "VALIDATION_ERROR");
      }

      const currentImagesMap = new Map();
      for (const img of currentImages) {
        currentImagesMap.set(img.id, img);
      }

      for (const img of images) {
        if (!currentImagesMap.has(img.id)) {
          throw new AppError(404, "image not found", "NOT_FOUND");
        }
      }

      const displayOrders = images.map((img) => img.display_order);
      for (const order of displayOrders) {
        if (order > count) {
          throw new AppError(400, "display order must be between 1 and " + count, "VALIDATION_ERROR");
        }
      }

      const sorted = [...images].sort((a, b) => (a.id < b.id ? -1 : 1));

      for (const img of sorted) {
        await tx.productImage.update({
          where: { id: img.id },
          data: { display_order: img.display_order },
        });
      }

      const reorderedImages = await tx.productImage.findMany({
        where: { product_id: productId },
        orderBy: { display_order: "asc" },
      });

      return { reorderedImages };
    });
  }

  async deleteImage({ productId, imageId }) {
    return this.#prisma.$transaction(async (tx) => {
      const image = await tx.productImage.findFirst({
        where: { id: imageId, product_id: productId },
      });
      if (!image) {
        throw new AppError(404, "image not found", "NOT_FOUND");
      }

      if (image.is_primary) {
        throw new AppError(
          409,
          "you should set another image as primary before deleting this one",
          "CONFLICT"
        );
      }

      await tx.productImage.delete({
        where: { id: imageId },
      });

      await tx.productImage.updateMany({
        where: { product_id: productId, display_order: { gt: image.display_order } },
        data: { display_order: { decrement: 1 } },
      });

      return { deletedImage: image };
    });
  }
}

export const imagesService = new ImagesService();
