import { useState } from "react";
import { ArrowUpRight, BookOpen, Clock3, Search } from "lucide-react";
import { filterBooks, genres, type Book, type Genre } from "../data/books";
import type { Progress } from "../lib/storage";
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
  onClose,
  onOpen,
}: {
  genre?: Genre;
  progress: Record<string, Progress>;
  storageOk?: boolean;
  onClose: () => void;
  onOpen: (b: Book) => void;
}) {
  const [filter, setFilter] = useState<Genre | "All">(genre ?? "All");
  const [query, setQuery] = useState("");
  const filtered = filterBooks(query, filter);
  return (
    <Modal
      title={genre ? `${genre} shelf` : "Browse Books"}
      className="catalog-modal"
      onClose={onClose}
    >
      <div className="catalog-heading">
        <span className="eyebrow">THE LAMPLIT COLLECTION</span>
        <h1>
          {genre
            ? `A little ${genre.toLowerCase()}.`
            : "Find your next little escape."}
        </h1>
        <p>Eight original stories. A few quiet minutes. Somewhere new to go.</p>
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
      <div className="book-grid">
        {filtered.map((b) => {
          const p = progress[b.id];
          const percent = p?.completed
            ? 100
            : Math.floor(((p?.anchor ?? 0) / b.words) * 100);
          return (
            <button
              className="book-card"
              key={b.id}
              onClick={() => onOpen(b)}
              aria-label={`Read ${b.title}`}
            >
              <Cover book={b} />
              <div className="book-info">
                <span className="eyebrow">{b.genre}</span>
                <h2>{b.title}</h2>
                <p>{b.blurb}</p>
                <div className="book-meta">
                  <Clock3 size={14} /> {b.minutes} min read{" "}
                  <ArrowUpRight size={17} />
                </div>
                {percent > 0 && (
                  <div className="card-progress">
                    <span style={{ width: `${percent}%` }} />
                    <small>
                      {percent === 100 ? "Finished" : `${percent}% read`}
                      {(p?.bookmarks.length ?? 0) > 0 ? " · bookmarked" : ""}
                    </small>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {!filtered.length && (
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
    </Modal>
  );
}
