export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getPagination = ({ page, pageSize } = {}) => {
  const safePage = toPositiveInt(page, 1);
  const safePageSize = Math.min(toPositiveInt(pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
};