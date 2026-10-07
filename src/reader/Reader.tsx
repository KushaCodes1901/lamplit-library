import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { bookWords, type Book, type Word } from "../data/books";
import type { Progress, Settings } from "../lib/storage";
import { Modal } from "../components/Modal";
import { paginate, pageForAnchor, type Page } from "./pagination";

function chunks(
  book: Book,
  words: Word[],
  start: number,
  end: number,
  renderWords: (slice: Word[]) => ReactNode,
): ReactNode[] {
  const result: ReactNode[] = [];
  let i = start;
  while (i < end) {
    const first = words[i];
    let j = i + 1;
    while (
      j < end &&
      words[j].paragraph === first.paragraph &&
      words[j].section === first.section
    )
      j++;
    if (first.paragraph === 0 && first.first)
      result.push(
        <h2 key={`h${i}`} className="section-title">
          {book.sections[first.section].title}
        </h2>,
      );
    result.push(
      <p key={i} className={first.first ? "" : "continued-paragraph"}>
        {renderWords(words.slice(i, j))}
      </p>,
    );
    i = j;
  }
  return result;
}
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function measureHtml(
  book: Book,
  words: Word[],
  start: number,
  end: number,
): string {
  let html = "",
    i = start;
  while (i < end) {
    const first = words[i];
    let j = i + 1;
    while (
      j < end &&
      words[j].paragraph === first.paragraph &&
      words[j].section === first.section
    )
      j++;
    if (first.paragraph === 0 && first.first)
      html += `<h2 class="section-title">${escapeHtml(book.sections[first.section].title)}</h2>`;
    html += `<p${first.first ? "" : ' class="continued-paragraph"'}>${words
      .slice(i, j)
      .map((w) => escapeHtml(w.text))
      .join(" ")}</p>`;
    i = j;
  }
  return html;
}

export function Reader({
  book,
  progress,
  settings,
  storageOk,
  onSettings,
  onProgress,
  onClose,
}: {
  book: Book;
  progress?: Progress;
  settings: Settings;
  storageOk: boolean;
  onSettings: (s: Partial<Settings>) => void;
  onProgress: (p: Progress) => void;
  onClose: () => void;
}) {
  const words = useMemo(() => bookWords(book), [book]);
  const [anchor, setAnchor] = useState(() =>
    Math.min(progress?.anchor ?? 0, words.length - 1),
  );
  const [pages, setPages] = useState<Page[]>([]);
  const [spread, setSpread] = useState(false);
  const [controls, setControls] = useState(false);
  const [chapters, setChapters] = useState(false);
  const [bookmarks, setBookmarks] = useState(progress?.bookmarks ?? []);
  const [completed, setCompleted] = useState(progress?.completed ?? false);
  const pageArea = useRef<HTMLDivElement>(null),
    measure = useRef<HTMLDivElement>(null),
    scroller = useRef<HTMLDivElement>(null);
  const anchorRef = useRef(anchor);
  anchorRef.current = anchor;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const bookmarksRef = useRef(bookmarks);
  bookmarksRef.current = bookmarks;
  const completedRef = useRef(completed);
  completedRef.current = completed;
  const restoreScroll = useRef(true),
    ignoreScroll = useRef(false);
  const pageIndex = pageForAnchor(pages, anchor);
  const leftPage = spread ? Math.floor(pageIndex / 2) * 2 : pageIndex;
  const shown = pages.slice(leftPage, leftPage + (spread ? 2 : 1));
  const atEnd = pages.length > 0 && leftPage + (spread ? 2 : 1) >= pages.length;

  const save = useCallback((index: number, done = completedRef.current) => {
    setAnchor(index);
    onProgressRef.current({
      anchor: index,
      completed: done,
      bookmarks: bookmarksRef.current,
    });
  }, []);
  useEffect(() => {
    onProgressRef.current({
      anchor: anchorRef.current,
      completed: completedRef.current,
      bookmarks: bookmarksRef.current,
    });
  }, []);

  useLayoutEffect(() => {
    const area = pageArea.current,
      measuring = measure.current;
    if (!area || !measuring || settings.mode !== "pages") return;
    let disposed = false,
      raf = 0;
    const layout = () => {
      if (disposed) return;
      const wide = area.clientWidth >= 800;
      const gap = wide ? 54 : 0;
      const width = (area.clientWidth - gap) / (wide ? 2 : 1);
      measuring.style.width = `${width}px`;
      const height = area.clientHeight - 18;
      if (height < 80 || width < 100) return;
      const next = paginate(words.length, (start, end) => {
        measuring.innerHTML = measureHtml(book, words, start, end);
        return measuring.scrollHeight <= height;
      });
      setPages(next);
      setSpread(wide);
    };
    const request = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    };
    const observer = new ResizeObserver(request);
    observer.observe(area);
    // Measuring text requests the reader font for the first time. Await that
    // explicit load as well as already-pending fonts before the final reflow.
    void Promise.all([
      document.fonts.load(`${settings.fontSize}px "Libre Baskerville"`),
      document.fonts.load('500 30px "Cormorant Garamond"'),
    ]).then(request, request);
    request();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [book, words, settings.fontSize, settings.mode]);

  useLayoutEffect(() => {
    if (settings.mode !== "scroll" || !scroller.current) {
      restoreScroll.current = true;
      return;
    }
    const el = scroller.current;
    ignoreScroll.current = true;
    let disposed = false,
      raf = 0;
    const restore = () => {
      if (disposed) return;
      ignoreScroll.current = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (disposed) return;
        const span = el.querySelector<HTMLElement>(
          `[data-word="${anchorRef.current}"]`,
        );
        if (span)
          el.scrollTop +=
            span.getBoundingClientRect().top -
            el.getBoundingClientRect().top -
            28;
        restoreScroll.current = false;
        requestAnimationFrame(() => {
          if (!disposed) ignoreScroll.current = false;
        });
      });
    };
    restore();
    void Promise.all([
      document.fonts.load(`${settings.fontSize}px "Libre Baskerville"`),
      document.fonts.load('500 30px "Cormorant Garamond"'),
    ]).then(restore, restore);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, [settings.mode, settings.fontSize, book]);

  useEffect(() => {
    if (settings.mode !== "scroll" || !scroller.current) return;
    const el = scroller.current;
    let raf = 0;
    const scroll = () => {
      if (ignoreScroll.current || restoreScroll.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const top = el.getBoundingClientRect().top + 28;
        const spans = [...el.querySelectorAll<HTMLElement>("[data-word]")];
        const visible = spans.find(
          (s) => s.getBoundingClientRect().bottom > top,
        );
        const end = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
        if (end) {
          setCompleted(true);
          save(words.length - 1, true);
        } else if (visible) save(Number(visible.dataset.word));
      });
    };
    const observer = new ResizeObserver(() => {
      if (ignoreScroll.current) return;
      ignoreScroll.current = true;
      requestAnimationFrame(() => {
        const span = el.querySelector<HTMLElement>(
          `[data-word="${anchorRef.current}"]`,
        );
        if (span)
          el.scrollTop +=
            span.getBoundingClientRect().top -
            el.getBoundingClientRect().top -
            28;
        requestAnimationFrame(() => {
          ignoreScroll.current = false;
        });
      });
    });
    observer.observe(el);
    el.addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      el.removeEventListener("scroll", scroll);
    };
  }, [settings.mode, save, words.length]);

  function go(index: number) {
    const target = Math.max(0, Math.min(words.length - 1, index));
    save(target);
    if (settings.mode === "scroll" && scroller.current) {
      ignoreScroll.current = true;
      const el = scroller.current,
        span = el.querySelector<HTMLElement>(`[data-word="${target}"]`);
      if (span)
        el.scrollTop +=
          span.getBoundingClientRect().top -
          el.getBoundingClientRect().top -
          28;
      requestAnimationFrame(() => {
        ignoreScroll.current = false;
      });
    }
  }
  function turn(direction: number) {
    const index = leftPage + direction * (spread ? 2 : 1);
    if (index >= 0 && index < pages.length) go(pages[index].start);
  }
  function toggleBookmark() {
    const next = bookmarks.includes(anchor)
      ? bookmarks.filter((i) => i !== anchor)
      : [...bookmarks, anchor].sort((a, b) => a - b);
    setBookmarks(next);
    onProgressRef.current({ anchor, completed, bookmarks: next });
  }
  const renderWords = (slice: Word[]) =>
    slice.map((w, i) => (
      <span data-word={w.index} key={w.index}>
        {w.text}
        {i < slice.length - 1 ? " " : ""}
      </span>
    ));
  const percent = completed
    ? 100
    : Math.floor((anchor / Math.max(1, words.length - 1)) * 100);

  return (
    <Modal
      title={`Reading ${book.title}`}
      className={`reader-modal theme-${settings.theme}`}
      onClose={onClose}
    >
      <div
        className="reader"
        tabIndex={0}
        data-anchor={anchor}
        onKeyDown={(e) => {
          if ((e.target as HTMLElement).matches("input, select, textarea"))
            return;
          if (
            settings.mode === "pages" &&
            ["ArrowLeft", "ArrowRight"].includes(e.key)
          ) {
            e.preventDefault();
            turn(e.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <header className="reader-header">
          <button
            className="text-button"
            aria-label="Return to Library"
            onClick={onClose}
          >
            <ArrowLeft size={16} /> <span>Return to Library</span>
          </button>
          <div className="reader-book-title">
            <span className="eyebrow">
              {book.genre} · {book.minutes} MIN READ
            </span>
            <h1>{book.title}</h1>
          </div>
          <div className="reader-tools">
            <button
              className="icon-button"
              aria-label="Chapters and bookmarks"
              aria-expanded={chapters}
              onClick={() => {
                setChapters(!chapters);
                setControls(false);
              }}
            >
              <List size={20} />
            </button>
            <button
              className="icon-button"
              aria-label={
                bookmarks.includes(anchor)
                  ? "Remove bookmark"
                  : "Bookmark this place"
              }
              aria-pressed={bookmarks.includes(anchor)}
              onClick={toggleBookmark}
            >
              <Bookmark
                size={19}
                fill={bookmarks.includes(anchor) ? "currentColor" : "none"}
              />
            </button>
            <button
              className="icon-button"
              aria-label="Reading preferences"
              aria-expanded={controls}
              onClick={() => {
                setControls(!controls);
                setChapters(false);
              }}
            >
              <SlidersHorizontal size={19} />
            </button>
          </div>
        </header>
        {controls && (
          <div className="reader-popover">
            <label>
              Text size{" "}
              <input
                aria-label="Reader text size"
                type="range"
                min={14}
                max={24}
                value={settings.fontSize}
                onChange={(e) =>
                  onSettings({ fontSize: Number(e.target.value) })
                }
              />
              <span>{settings.fontSize}px</span>
            </label>
            <div className="preference-group" aria-label="Reading theme">
              {(["light", "sepia", "dark"] as const).map((t) => (
                <button
                  key={t}
                  aria-pressed={settings.theme === t}
                  onClick={() => onSettings({ theme: t })}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="preference-group" aria-label="Reading layout">
              <button
                aria-pressed={settings.mode === "pages"}
                onClick={() => onSettings({ mode: "pages" })}
              >
                Pages
              </button>
              <button
                aria-pressed={settings.mode === "scroll"}
                onClick={() => onSettings({ mode: "scroll" })}
              >
                Scroll
              </button>
            </div>
            <p>Preferences and your place are saved on this device.</p>
          </div>
        )}
        {chapters && (
          <div className="reader-popover chapter-menu">
            <span className="eyebrow">CONTENTS</span>
            {book.sections.map((s, i) => (
              <button
                key={s.title}
                onClick={() => {
                  go(words.find((w) => w.section === i)!.index);
                  setChapters(false);
                }}
              >
                {String(i + 1).padStart(2, "0")} <span>{s.title}</span>
              </button>
            ))}
            <span className="eyebrow bookmark-heading">YOUR BOOKMARKS</span>
            {bookmarks.length ? (
              bookmarks.map((index) => (
                <button
                  key={index}
                  onClick={() => {
                    go(index);
                    setChapters(false);
                  }}
                >
                  <Bookmark size={14} />
                  <span>
                    {words
                      .slice(index, index + 7)
                      .map((w) => w.text)
                      .join(" ")}
                    …
                  </span>
                </button>
              ))
            ) : (
              <p>Save a place with the bookmark button.</p>
            )}
          </div>
        )}
        <div
          className="reader-body"
          style={
            {
              "--reading-size": `${settings.fontSize}px`,
            } as React.CSSProperties
          }
        >
          <div className="book-running-title">
            THE LAMPLIT COLLECTION <span>Original AI-assisted demo story</span>
          </div>
          {settings.mode === "pages" ? (
            <div
              className={`page-area ${spread ? "spread" : ""}`}
              ref={pageArea}
            >
              {shown.map((p, i) => (
                <article
                  className="paper-page prose"
                  key={`${p.start}-${p.end}`}
                  aria-label={`Page ${leftPage + i + 1}`}
                >
                  {chunks(book, words, p.start, p.end, renderWords)}
                  <span className="page-number">{leftPage + i + 1}</span>
                </article>
              ))}
              <div ref={measure} className="prose measure" aria-hidden="true" />
            </div>
          ) : (
            <div className="scroll-pages prose" ref={scroller}>
              {chunks(book, words, 0, words.length, renderWords)}
              <div className="end-mark">✦</div>
              <p className="end-note">
                The end. Thank you for spending a little time here.
              </p>
            </div>
          )}
        </div>
        <footer className="reader-footer">
          <button
            className="text-button"
            disabled={settings.mode !== "pages" || leftPage === 0}
            aria-label="Previous page"
            onClick={() => turn(-1)}
          >
            <ChevronLeft size={19} />
            <span>Previous</span>
          </button>
          <div className="reading-status">
            <span>
              {settings.mode === "pages"
                ? `Page ${leftPage + 1}${spread && shown.length === 2 ? `–${leftPage + 2}` : ""} of ${pages.length || "…"}`
                : "Scrolling"}{" "}
              <i>·</i> {percent}% read
            </span>
            <div className="reading-progress">
              <span style={{ width: `${percent}%` }} />
            </div>
            <small>
              {storageOk && <Check size={12} />}
              {storageOk ? "Saved on this device" : "Saving unavailable"}
            </small>
          </div>
          {settings.mode === "pages" && atEnd ? (
            <button
              className="text-button"
              onClick={() => {
                setCompleted(true);
                save(words.length - 1, true);
                onClose();
              }}
            >
              <span>Finish</span>
              <Check size={17} />
            </button>
          ) : (
            <button
              className="text-button"
              disabled={settings.mode !== "pages" || !pages.length}
              aria-label="Next page"
              onClick={() => turn(1)}
            >
              <span>Next</span>
              <ChevronRight size={19} />
            </button>
          )}
        </footer>
      </div>
    </Modal>
  );
}
