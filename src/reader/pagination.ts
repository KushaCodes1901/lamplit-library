export type Page = { start: number; end: number };
export function paginate(
  total: number,
  fits: (start: number, end: number) => boolean,
): Page[] {
  const pages: Page[] = [];
  let start = 0;
  while (start < total) {
    let low = start + 1,
      high = total;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (fits(start, mid)) low = mid;
      else high = mid - 1;
    }
    // Even the smallest viewport can display one word; no missing indices.
    pages.push({ start, end: low });
    start = low;
  }
  return pages;
}
export function pageForAnchor(pages: Page[], anchor: number): number {
  const index = pages.findIndex((p) => p.start <= anchor && anchor < p.end);
  return index < 0 ? Math.max(0, pages.length - 1) : index;
}
