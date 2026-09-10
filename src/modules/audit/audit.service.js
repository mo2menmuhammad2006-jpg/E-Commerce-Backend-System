import { prisma } from "../../configs/db.js";
import { logAuditSchema } from "./audit.validation.js";
export const auditService = {
  async log(input) {

    const data = logAuditSchema.parse(input); 
    return prisma.auditLog.create({data});
  },

  async list({ filters = {}, skip = 0, take = 20 }) {
    const where = {};
    if (filters.entity_type) where.entity_type = filters.entity_type;
    if (filters.entity_id) where.entity_id = filters.entity_id;
    if (filters.from || filters.to) {
      where.created_at = {};
      if (filters.from) where.created_at.gte = filters.from;
      if (filters.to) where.created_at.lte = filters.to;
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: {
          performed_by_user: { select: { id: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  },
};