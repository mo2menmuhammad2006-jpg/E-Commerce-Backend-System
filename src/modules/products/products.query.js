import { ProductStatus } from "@prisma/client";
import { prisma } from "../../configs/db.js";

export class ProductQuery {
  static #SORT_ORDER = {
    newest: { created_at: "desc" },
    oldest: { created_at: "asc" },
    price_asc: { variants: { _min: { price: "asc" } } },
    price_desc: { variants: { _min: { price: "desc" } } },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
  };

  static #LIST_SELECT = {
    id: true,
    name: true,
    created_at: true,
    images: {
      where: { is_primary: true },
      select: { url: true, alt_text: true },
    },
    variants: {
      where: { is_active: true },
      select: { price: true },
      orderBy: { price: "asc" },
    },
  };

  static #escapeLike(s) {
    return s.replace(/[\\%_]/g, (c) => "\\" + c);
  }

  static #buildListConditions({ search, filter }) {
    const conditions = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: ProductQuery.#escapeLike(search), mode: "insensitive" } },
          { description: { contains: ProductQuery.#escapeLike(search), mode: "insensitive" } },
        ],
      });
    }

    if (filter.category?.length) {
      conditions.push({ category_id: { in: filter.category } });
    }

    if (filter.priceMin != null || filter.priceMax != null) {
      const price = {};
      if (filter.priceMin != null) price.gte = filter.priceMin;
      if (filter.priceMax != null) price.lte = filter.priceMax;
      conditions.push({ variants: { some: { price } } });
    }

    if (filter.inStock === true) {
      conditions.push({
        variants: { some: { is_active: true, inventory: { total_quantity: { gt: 0 } } } },
      });
    }

    return conditions;
  }

  #prisma;

  constructor({ prisma:prismaClient = prisma } = {}) {
    this.#prisma = prismaClient;
  }

  async #matchProductIdsByRating(minRating) {
    const grouped = await this.#prisma.review.groupBy({
      by: ["product_id"],
      where: { status: "APPROVED" },
      _avg: { rating: true },
      having: { rating: { _avg: { gte: minRating } } },
    });
    return grouped.map((row) => row.product_id);
  }

  async list({ search, filter = {}, sort, skip, take, includeInactive }) {
    const conditions = [
      ...(includeInactive ? [] : [{ status: ProductStatus.ACTIVE }]),
      ...ProductQuery.#buildListConditions({ search, filter }),
    ];

    if (filter.ratingMin != null) {
      const ids = await this.#matchProductIdsByRating(filter.ratingMin);
      conditions.push({ id: { in: ids } });
    }

    const where = { AND: conditions };
    const orderBy = ProductQuery.#SORT_ORDER[sort] ?? ProductQuery.#SORT_ORDER.newest;
    const select = {
      ...ProductQuery.#LIST_SELECT,
      variants: {
        ...ProductQuery.#LIST_SELECT.variants,
        where: includeInactive ? undefined : { is_active: true },
      },
    };
    const [items, total] = await Promise.all([
      this.#prisma.product.findMany({ where, orderBy, skip, take, select: select }),
      this.#prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async getById({ id, includeInactive }) {
    const productCondition = includeInactive ? { id } : { id, status: ProductStatus.ACTIVE };
    const variantsCondition = includeInactive ? undefined : { is_active: true };

    const [product, stats] = await Promise.all([
      this.#prisma.product.findUnique({
        where: productCondition,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          created_at: true,
          updated_at: true,
          category: { select: { id: true, name: true } },
          images: { select: { url: true, alt_text: true, display_order: true, is_primary: true }, orderBy: { display_order: "asc" } },
          variants: {
            where: variantsCondition,
            orderBy: { price: "asc" },
            include: {
              inventory: { select: { total_quantity: true, low_stock_threshold: true } },
            },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true, title: true, body: true, created_at: true },
            orderBy: { created_at: "desc" },
          },
        },
      }),
      this.#prisma.review.aggregate({
        where: { product_id: id, status: "APPROVED" },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    if (!product) return null;
    return {
      ...product,
      average_rating: stats._avg.rating ?? 0,
      reviews_count: stats._count._all,
    };
  }
}

export const productQuery = new ProductQuery();
