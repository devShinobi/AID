export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

export const DEFAULT_PAGE_SIZE = 24;

export function buildPaginationParams(
  page: number,
  limit: number = DEFAULT_PAGE_SIZE
): PaginationParams {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getPageFromUrl(url: URL): number {
  const raw = url.searchParams.get("page");
  const parsed = parseInt(raw ?? "1", 10);
  return isNaN(parsed) ? 1 : parsed;
}
