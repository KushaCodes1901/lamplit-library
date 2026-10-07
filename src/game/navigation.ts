import type { Genre } from "../data/books";
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type Shelf = Rect & { genre: Genre; approach: Point };
export const ROOM = { w: 1120, h: 960 };
export const RADIUS = 17;
export const SPAWN: Point = { x: 575, y: 765 };
export const shelves: Shelf[] = [
  {
    genre: "Romance",
    x: 230,
    y: 150,
    w: 285,
    h: 70,
    approach: { x: 375, y: 265 },
  },
  {
    genre: "Comedy",
    x: 650,
    y: 165,
    w: 285,
    h: 70,
    approach: { x: 795, y: 280 },
  },
  {
    genre: "Thriller",
    x: 220,
    y: 430,
    w: 285,
    h: 70,
    approach: { x: 365, y: 545 },
  },
  {
    genre: "Mystery",
    x: 650,
    y: 470,
    w: 285,
    h: 70,
    approach: { x: 795, y: 585 },
  },
];
export const table: Rect = { x: 45, y: 710, w: 305, h: 140 };
// Perimeter furniture is painted into the far wall; only its feet occupy ground.
export const obstacles: Rect[] = [
  ...shelves,
  table,
  { x: 1010, y: 0, w: 110, h: 300 },
  { x: 1060, y: 330, w: 60, h: 310 },
];
export const project = (p: Point): Point => ({
  x: 155 + p.x * 0.99 + p.y * 0.145,
  y: 270 + p.x * 0.12 + p.y * 0.6,
});
export const unproject = (p: Point): Point => {
  const x = p.x - 155,
    y = p.y - 270,
    det = 0.99 * 0.6 - 0.145 * 0.12;
  return { x: (x * 0.6 - y * 0.145) / det, y: (y * 0.99 - x * 0.12) / det };
};
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function isFree(p: Point, radius = RADIUS, walls = obstacles): boolean {
  return (
    p.x >= radius &&
    p.y >= radius &&
    p.x <= ROOM.w - radius &&
    p.y <= ROOM.h - radius &&
    !walls.some((r) => {
      const nx = Math.max(r.x, Math.min(p.x, r.x + r.w));
      const ny = Math.max(r.y, Math.min(p.y, r.y + r.h));
      return Math.hypot(p.x - nx, p.y - ny) < radius;
    })
  );
}
export function move(p: Point, direction: Point, dt: number): Point {
  const norm = Math.hypot(direction.x, direction.y);
  if (!norm) return p;
  // Substeps keep long frames from tunneling through narrow ground footprints.
  const steps = Math.max(1, Math.ceil((215 * Math.min(dt, 0.1)) / 6));
  const dx = ((direction.x / norm) * 215 * Math.min(dt, 0.1)) / steps;
  const dy = ((direction.y / norm) * 215 * Math.min(dt, 0.1)) / steps;
  let result = { ...p };
  for (let i = 0; i < steps; i++) {
    const both = { x: result.x + dx, y: result.y + dy };
    if (isFree(both)) {
      result = both;
      continue;
    }
    const xOnly = { x: result.x + dx, y: result.y };
    const yOnly = { x: result.x, y: result.y + dy };
    if (isFree(xOnly)) result = xOnly;
    if (isFree({ x: result.x, y: yOnly.y })) result.y = yOnly.y;
  }
  return result;
}
export function lineFree(a: Point, b: Point): boolean {
  const steps = Math.ceil(distance(a, b) / 8);
  for (let i = 0; i <= steps; i++) {
    const t = steps ? i / steps : 0;
    if (!isFree({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }))
      return false;
  }
  return true;
}

// A small 24-unit grid with A*; diagonal edges must also clear the corner.
export function findPath(start: Point, goal: Point): Point[] {
  if (!isFree(start) || !isFree(goal)) return [];
  if (lineFree(start, goal)) return [goal];
  const cell = 24,
    cols = Math.floor(ROOM.w / cell),
    rows = Math.floor(ROOM.h / cell);
  const coord = (id: number): Point => ({
    x: ((id % cols) + 0.5) * cell,
    y: (Math.floor(id / cols) + 0.5) * cell,
  });
  const nearest = (p: Point) => {
    let chosen = -1,
      best = Infinity;
    for (let id = 0; id < cols * rows; id++) {
      const c = coord(id),
        d = distance(p, c);
      if (d < best && isFree(c) && lineFree(p, c)) {
        chosen = id;
        best = d;
      }
    }
    return chosen;
  };
  const first = nearest(start),
    last = nearest(goal);
  if (first < 0 || last < 0) return [];
  const open = new Set([first]),
    parents = new Map<number, number>(),
    cost = new Map([[first, 0]]);
  const f = new Map([[first, distance(coord(first), goal)]]);
  while (open.size) {
    let current = -1,
      best = Infinity;
    for (const id of open)
      if ((f.get(id) ?? Infinity) < best) {
        current = id;
        best = f.get(id)!;
      }
    if (current === last) {
      const route = [goal, coord(last)];
      while (parents.has(current)) {
        current = parents.get(current)!;
        route.push(coord(current));
      }
      route.push(start);
      route.reverse();
      const smooth: Point[] = [];
      let i = 0;
      while (i < route.length - 1) {
        let j = route.length - 1;
        while (j > i + 1 && !lineFree(route[i], route[j])) j--;
        smooth.push(route[j]);
        i = j;
      }
      return smooth;
    }
    open.delete(current);
    const cx = current % cols,
      cy = Math.floor(current / cols);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (
          (!dx && !dy) ||
          cx + dx < 0 ||
          cx + dx >= cols ||
          cy + dy < 0 ||
          cy + dy >= rows
        )
          continue;
        const next = current + dx + dy * cols;
        if (!lineFree(coord(current), coord(next))) continue;
        const candidate = cost.get(current)! + cell * Math.hypot(dx, dy);
        if (candidate < (cost.get(next) ?? Infinity)) {
          parents.set(next, current);
          cost.set(next, candidate);
          f.set(next, candidate + distance(coord(next), goal));
          open.add(next);
        }
      }
  }
  return [];
}
