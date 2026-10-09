export const PAGE_SIZE = 5;

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

/** Returns one page of items; the page number is clamped, so deleting the last row of a page steps back. */
export function paginate<T>(all: T[], page: number, size = PAGE_SIZE): Page<T> {
  const totalPages = Math.max(1, Math.ceil(all.length / size));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * size;
  return { items: all.slice(start, start + size), page: current, totalPages, total: all.length };
}
