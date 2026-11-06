import { useEffect, useRef, useState } from "react";
import { BookOpen, Search, ArrowLeft, Clock3 } from "lucide-react";
import { filterBooks, genres, type Book, type Genre } from "../data/books";
import type { Progress } from "../lib/storage";
import { BookVolume, BOOK_OPEN_DURATION } from "./BookVolume";
import { Modal } from "./Modal";
export function Cover({
  book,
  small = false,
}: {
  book: Book;
  small?: boolean;
}) {
  return (
    <div
      className={`cover cover-${book.cover} ${small ? "cover-small" : ""}`}
      aria-hidden="true"
    >
      <div
        className="cover-art"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}assets/covers.webp)`,
        }}
      />
      <div className="cover-frame" />
      <span className="cover-genre">{book.genre}</span>
      <span className="cover-title">{book.title}</span>
      <span className="cover-imprint">THE LAMPLIT COLLECTION</span>
    </div>
  );
}
export function Catalog({
  genre,
  progress,
  storageOk = true,
  reducedMotion = false,
  onClose,
  onOpen,
}: {
  genre?: Genre;
  progress: Record<string, Progress>;
  storageOk?: boolean;
  reducedMotion?: boolean;
  onClose: () => void;
  onOpen: (b: Book) => void;
}) {
  const [filter, setFilter] = useState<Genre | "All">(genre ?? "All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Book | null>(null);
  const [opening, setOpening] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const picked = useRef<HTMLButtonElement | null>(null);
  const openButton = useRef<HTMLButtonElement | null>(null);
  const filtered = filterBooks(query, filter);
  useEffect(() => {
    if (!selected) return;
    openButton.current?.focus();
  }, [selected]);
  useEffect(() => {
    if (!opening || !selected) return;
    const timer = setTimeout(
      () => onOpen(selected),
      reducedMotion ? 0 : BOOK_OPEN_DURATION,
    );
    return () => clearTimeout(timer);
  }, [opening, selected, reducedMotion, onOpen]);
  function putBack() {
    setSelected(null);
    setOpening(false);
    requestAnimationFrame(() => picked.current?.focus());
  }
  return (
    <Modal
      title={genre ? `${genre} shelf` : "Browse Books"}
      className={`catalog-modal shelf-modal ${selected ? "has-selected" : ""}`}
      onClose={selected ? putBack : onClose}
    >
      <div className="shelf-browsing" inert={selected ? true : undefined}>
        <div className="catalog-heading">
          <span className="eyebrow">THE LAMPLIT COLLECTION</span>
          <h1>
            {filter === "All"
              ? "A shelf of little escapes."
              : `A little ${filter.toLowerCase()}.`}
          </h1>
          <p>Run your eyes along the spines. See what calls to you.</p>
        </div>
        <div className="catalog-tools">
          <div className="filter-list" aria-label="Filter by genre">
            {(["All", ...genres] as const).map((g) => (
              <button
                key={g}
                aria-pressed={g === filter}
                onClick={() => setFilter(g)}
              >
                {g === "All" ? "All stories" : g}
              </button>
            ))}
          </div>
          <label className="search">
            <Search size={17} />
            <input
              aria-label="Search book titles"
              placeholder="Find a story…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="catalog-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "story" : "stories"} on the
          shelf
        </div>
        {filtered.length > 0 ? (
          <div className="shelf-stage" aria-label="Books on the shelf">
            <div className="spine-row">
              {filtered.map((b) => (
                <button
                  key={b.id}
                  className={`book-spine spine-${b.cover} ${selected?.id === b.id ? "picked" : ""}`}
                  aria-label={`Read ${b.title}`}
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setOrigin({
                      x: rect.x + rect.width / 2 - window.innerWidth / 2,
                      y: rect.y + rect.height / 2 - window.innerHeight / 2,
                    });
                    picked.current = event.currentTarget;
                    setSelected(b);
                  }}
                >
                  <span className="spine-ornament">✦</span>
                  <span className="spine-title">{b.title}</span>
                  <span className="spine-imprint">LAMPLIT</span>
                  {(progress[b.id]?.anchor ?? 0) > 0 && (
                    <span
                      className="spine-ribbon"
                      aria-label="Reading started"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="wooden-ledge" />
            <p className="shelf-invitation">
              Choose a spine. Find a little escape.
            </p>
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={34} />
            <h2>No stories found.</h2>
            <p>Try another title or explore a different shelf.</p>
            <button
              className="button"
              onClick={() => {
                setQuery("");
                setFilter("All");
              }}
            >
              Show all stories
            </button>
          </div>
        )}
        <div className="catalog-note">
          Original AI-assisted demo stories ·{" "}
          {storageOk
            ? "Your reading place is saved on this device."
            : "Progress cannot be saved in this browser."}
        </div>
      </div>
      {selected && (
        <div className={`book-selection ${opening ? "is-opening" : ""}`}>
          <BookVolume book={selected} origin={origin} key={selected.id}>
            <Cover book={selected} />
          </BookVolume>
          <div className="selection-details">
            <span className="eyebrow">
              {selected.genre} · THE LAMPLIT COLLECTION
            </span>
            <h2>{selected.title}</h2>
            <p>{selected.blurb}</p>
            <span className="selection-meta">
              <Clock3 size={14} /> {selected.minutes} min read
              {progress[selected.id]?.completed ? " · Finished" : ""}
              {(progress[selected.id]?.bookmarks.length ?? 0) > 0
                ? " · bookmarked"
                : ""}
            </span>
            <button
              className="button primary"
              ref={openButton}
              disabled={opening}
              onClick={() => setOpening(true)}
            >
              <BookOpen size={17} /> {opening ? "Opening…" : "Open Book"}
            </button>
            <button
              className="text-button"
              disabled={opening}
              onClick={putBack}
            >
              <ArrowLeft size={15} /> Put back on shelf
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
