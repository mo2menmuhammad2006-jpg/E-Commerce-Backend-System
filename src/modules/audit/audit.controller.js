import { auditService } from "./audit.service.js";
import { ok } from "../../utils/responseHelper.js";
import { getPagination } from "../../utils/pagination.js";

export const listAuditLogsHandler = async (req, res, next) => {
  const { page, pageSize, skip, take } = getPagination(req.query);

  const { data, total } = await auditService.list({
    filters: {
      entity_type: req.query.entity_type,
      entity_id: req.query.entity_id,
      from: req.query.from,
      to: req.query.to,
    },
    skip,
    take,
  });

  return ok(res, {
    items: data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};