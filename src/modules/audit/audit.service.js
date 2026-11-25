import { prisma } from "../../configs/db.js";
import { logAuditSchema } from "./audit.validation.js";

export class AuditService {
  #prisma;

  constructor({ prisma: prismaClient = prisma } = {}) {
    this.#prisma = prismaClient;
  }

  async log(input, tx) {
    const data = logAuditSchema.parse(input);
    return (tx ?? this.#prisma).auditLog.create({ data });
  }

  async list({ filters = {}, skip, take }) {
    const where = {};
    if (filters.entity_type) where.entity_type = filters.entity_type;
    if (filters.entity_id) where.entity_id = filters.entity_id;
    if (filters.from || filters.to) {
      where.created_at = {};
      if (filters.from) where.created_at.gte = filters.from;
      if (filters.to) where.created_at.lte = filters.to;
    }

    const [data, total] = await Promise.all([
      this.#prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: {
          performed_by_user: { select: { id: true, email: true, role: true } },
        },
      }),
      this.#prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}

export const auditService = new AuditService();
