export declare class PageFlip {
  constructor(
    root: HTMLElement,
    options: Record<string, string | number | boolean>,
  );
  loadFromHTML(pages: HTMLElement[]): void;
  on(event: string, callback: (event: { data: unknown }) => void): void;
  flipNext(corner?: "top" | "bottom"): void;
  flipPrev(corner?: "top" | "bottom"): void;
  destroy(): void;
}
