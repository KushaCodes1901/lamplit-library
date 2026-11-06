import type { CSSProperties, ReactNode } from "react";
import type { Book } from "../data/books";

export const BOOK_OPEN_DURATION = 2400;

/** A small, self-contained 3D volume: covers, page block and staggered leaves. */
export function BookVolume({
  book,
  origin,
  children,
}: {
  book: Book;
  origin: { x: number; y: number };
  children: ReactNode;
}) {
  return (
    <div
      className="selected-volume"
      aria-hidden="true"
      style={
        {
          "--from-x": `${origin.x}px`,
          "--from-y": `${origin.y}px`,
          "--opening-duration": `${BOOK_OPEN_DURATION}ms`,
        } as CSSProperties
      }
    >
      <div className="volume-back-cover" />
      <div className="volume-pages" />
      <div className="volume-title-page volume-paper-face">
        <span>THE LAMPLIT COLLECTION</span>
        <i>✦</i>
        <strong>{book.title}</strong>
        <small>{book.genre}</small>
        <em>{book.sections[0].title}</em>
      </div>
      {Array.from({ length: 7 }, (_, index) => (
        <div
          className="volume-leaf"
          key={index}
          style={{ "--leaf": index } as CSSProperties}
        >
          <div className="volume-leaf-front volume-paper-face" />
          <div className="volume-leaf-back volume-paper-face">
            <i>✦</i>
            <span>A LITTLE ROOM FOR STORIES</span>
          </div>
        </div>
      ))}
      <div className="volume-cover">
        {children}
        <div className="volume-cover-lining" />
      </div>
    </div>
  );
}
