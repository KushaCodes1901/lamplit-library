import { describe, expect, it } from "vitest";
import { books, bookWords, filterBooks, genres } from "../src/data/books";
import {
  emptySaved,
  parseSaved,
  readSaved,
  writeSaved,
} from "../src/lib/storage";
import {
  distance,
  findPath,
  isFree,
  lineFree,
  move,
  project,
  shelves,
  SPAWN,
  unproject,
} from "../src/game/navigation";
import { paginate, pageForAnchor } from "../src/reader/pagination";

describe("device persistence", () => {
  it("roundtrips reader anchors, bookmarks, theme and onboarding", () => {
    const s = emptySaved();
    s.settings = {
      theme: "dark",
      fontSize: 22,
      mode: "scroll",
      reducedMotion: true,
    };
    s.progress["last-light"] = {
      anchor: 216,
      completed: false,
      bookmarks: [19, 216],
    };
    s.lastBook = "last-light";
    s.onboarding = true;
    let value = "";
    expect(
      writeSaved(s, {
        setItem: (_, v) => {
          value = v;
        },
      }),
    ).toBe(true);
    expect(readSaved({ getItem: () => value })).toEqual(s);
  });
  it("recovers from malformed, obsolete and partially corrupt data", () => {
    expect(parseSaved("{broken")).toEqual(emptySaved());
    expect(parseSaved('{"version":99}')).toEqual(emptySaved());
    const s = parseSaved(
      JSON.stringify({
        version: 1,
        settings: { fontSize: 500, theme: "unknown" },
        progress: {
          a: { anchor: -1 },
          b: { anchor: 14, bookmarks: [1, 1, -2, "x", 15] },
        },
      }),
    );
    expect(s.settings.fontSize).toBe(24);
    expect(s.settings.theme).toBe("sepia");
    expect(s.progress.a).toBeUndefined();
    expect(s.progress.b.bookmarks).toEqual([1, 15]);
  });
  it("supports browsers with blocked reads or exhausted storage", () => {
    expect(
      readSaved({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toEqual(emptySaved());
    expect(
      writeSaved(emptySaved(), {
        setItem: () => {
          throw new Error("full");
        },
      }),
    ).toBe(false);
  });
});
describe("catalog and original content", () => {
  it("searches case-insensitively with independent genre filtering and empty states", () => {
    expect(filterBooks("  LIGHT  ", "Romance").map((b) => b.id)).toEqual([
      "last-light",
    ]);
    expect(filterBooks("light", "Mystery")).toEqual([]);
    expect(filterBooks("nothing matches", "All")).toEqual([]);
    expect(filterBooks("", "All")).toHaveLength(8);
  });
  it("includes two full stories per genre, distinct IDs and complete anchored text", () => {
    expect(new Set(books.map((b) => b.id)).size).toBe(8);
    for (const g of genres)
      expect(books.filter((b) => b.genre === g)).toHaveLength(2);
    for (const b of books) {
      expect(b.words, b.title).toBeGreaterThanOrEqual(500);
      expect(b.words).toBeLessThanOrEqual(900);
      const words = bookWords(b);
      expect(words).toHaveLength(b.words);
      expect(words.at(-1)?.index).toBe(b.words - 1);
    }
  });
});
describe("reader position through reflow", () => {
  it("partitions every word exactly once including one-word pages", () => {
    for (const capacity of [1, 7, 53, 1000]) {
      const p = paginate(567, (s, e) => e - s <= capacity);
      expect(p[0].start).toBe(0);
      expect(p.at(-1)?.end).toBe(567);
      p.forEach((page, i) => {
        expect(page.end - page.start).toBeLessThanOrEqual(capacity);
        if (i) expect(page.start).toBe(p[i - 1].end);
      });
    }
  });
  it("preserves a content anchor when changing font capacity or spread size", () => {
    const anchor = 236;
    for (const capacity of [100, 87, 32, 172]) {
      const pages = paginate(587, (s, e) => e - s <= capacity),
        p = pages[pageForAnchor(pages, anchor)];
      expect(p.start).toBeLessThanOrEqual(anchor);
      expect(p.end).toBeGreaterThan(anchor);
    }
  });
});
describe("ground movement and obstacle-aware routes", () => {
  it("projects and reverses logical ground coordinates", () => {
    for (const p of [SPAWN, { x: 50, y: 900 }, { x: 1050, y: 40 }]) {
      const result = unproject(project(p));
      expect(result.x).toBeCloseTo(p.x);
      expect(result.y).toBeCloseTo(p.y);
    }
  });
  it("normalizes diagonal speed and is frame-rate independent", () => {
    let straight = { ...SPAWN },
      diagonal = { ...SPAWN },
      slower = { ...SPAWN };
    for (let i = 0; i < 30; i++) {
      straight = move(straight, { x: 1, y: 0 }, 1 / 60);
      diagonal = move(diagonal, { x: 1, y: 1 }, 1 / 60);
    }
    for (let i = 0; i < 15; i++) slower = move(slower, { x: 1, y: 0 }, 1 / 30);
    expect(distance(SPAWN, straight)).toBeCloseTo(distance(SPAWN, diagonal));
    expect(straight.x).toBeCloseTo(slower.x);
  });
  it("prevents furniture penetration and wall escape even over long frames", () => {
    let p = { x: 375, y: 275 };
    for (let i = 0; i < 120; i++) {
      p = move(p, { x: 0, y: -1 }, 2);
      expect(isFree(p)).toBe(true);
    }
    expect(p.y).toBeGreaterThanOrEqual(237);
  });
  it("reaches all shelves from spawn and all other shelves without cutting corners", () => {
    for (const start of [SPAWN, ...shelves.map((s) => s.approach)])
      for (const shelf of shelves) {
        const path = findPath(start, shelf.approach);
        expect(path.length, shelf.genre).toBeGreaterThan(0);
        let p = start;
        for (const target of path) {
          expect(lineFree(p, target)).toBe(true);
          p = target;
        }
        expect(distance(p, shelf.approach)).toBeLessThan(0.001);
      }
  });
});
