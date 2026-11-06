import { useLayoutEffect, useRef, type ReactNode } from "react";
import { PageFlip } from "../vendor/page-flip";

/** Isolated DOM renderer for corner folds. React owns the templates; the engine
 * receives disposable clones and cannot move or remove React-owned elements. */
export function PaperTurn({
  direction,
  spread,
  front,
  back,
  before,
  after,
  onFinish,
}: {
  direction: number;
  spread: boolean;
  front: ReactNode;
  back: ReactNode;
  before: ReactNode;
  after: ReactNode;
  onFinish: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const templates = useRef<HTMLDivElement>(null);
  const finish = useRef(onFinish);
  finish.current = onFinish;
  useLayoutEffect(() => {
    const host = root.current!;
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    const mount = document.createElement("div");
    mount.className = "corner-flip-engine";
    host.append(mount);
    const pages = [...templates.current!.children].map(
      (node) => node.cloneNode(true) as HTMLElement,
    );
    pages.forEach((page) => mount.append(page));
    const engine = new PageFlip(mount, {
      width: spread ? width / 2 : width,
      height,
      size: "fixed",
      autoSize: false,
      usePortrait: !spread,
      startPage: direction < 0 ? (spread ? 2 : 1) : 0,
      flippingTime: 850,
      drawShadow: true,
      maxShadowOpacity: 0.32,
      showCover: false,
      useMouseEvents: true,
      showPageCorners: false,
      mobileScrollSupport: false,
      // The overlay is already non-interactive. The engine also applies this
      // click-only corner guard to programmatic turns; portrait flipPrev starts
      // at the visible left edge, which is outside its two-page corner bounds.
      disableFlipByClick: false,
    });
    let disposed = false,
      started = false;
    engine.on("init", () => {
      if (disposed) return;
      if (direction > 0) engine.flipNext("bottom");
      else engine.flipPrev("bottom");
    });
    engine.on("changeState", (event) => {
      if (event.data === "flipping") started = true;
      if (!disposed && started && event.data === "read") finish.current();
    });
    engine.loadFromHTML(pages);
    const observer = new ResizeObserver(() => {
      if (host.clientWidth !== width || host.clientHeight !== height)
        finish.current();
    });
    observer.observe(host);
    return () => {
      disposed = true;
      observer.disconnect();
      engine.destroy();
    };
  }, [direction, spread]);
  const sequence = spread
    ? direction > 0
      ? [before, front, back, after]
      : [after, back, front, before]
    : direction > 0
      ? [front, back]
      : [back, front];
  return (
    <div className="turning-leaf corner-fold" ref={root} aria-hidden="true">
      <div className="fold-templates" ref={templates} hidden>
        {sequence.map((content, i) => (
          <div
            className={`fold-page ${spread ? (i % 2 === 0 ? "fold-left" : "fold-right") : "fold-single"}`}
            key={i}
            data-density="soft"
          >
            <div className="fold-page-content prose">{content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
