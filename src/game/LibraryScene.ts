import Phaser from "phaser";
import type { Genre } from "../data/books";
import {
  distance,
  findPath,
  move,
  project,
  shelves,
  SPAWN,
  table,
  type Point,
} from "./navigation";

export type SceneBridge = {
  paused: boolean;
  reducedMotion: boolean;
  direction: Point;
  ready: (ready: boolean, error?: string) => void;
  near: (genre: Genre | null) => void;
  open: (genre: Genre) => void;
  labels: Map<Genre, HTMLElement>;
  stage: HTMLElement;
};
export class LibraryScene extends Phaser.Scene {
  bridge: SceneBridge;
  position = { ...SPAWN };
  private character!: Phaser.GameObjects.Image;
  private shadow!: Phaser.GameObjects.Ellipse;
  private furniture: {
    sprite: Phaser.GameObjects.Image;
    ground: Point;
    shelf?: Genre;
  }[] = [];
  private keys = new Set<string>();
  private route: Point[] = [];
  private destination: Genre | null = null;
  private nearby: Genre | null = null;
  private facing = 0;
  private walkClock = 0;
  private rain!: Phaser.GameObjects.Graphics;
  private fire!: Phaser.GameObjects.Ellipse;
  private ready = false;
  private hadPause = true;
  constructor(bridge: SceneBridge) {
    super("library");
    this.bridge = bridge;
  }
  preload() {
    this.load.image("room", `${import.meta.env.BASE_URL}assets/room.webp`);
    this.load.image("shelf", `${import.meta.env.BASE_URL}assets/shelf.webp`);
    this.load.image("table", `${import.meta.env.BASE_URL}assets/table.webp`);
    this.load.spritesheet(
      "visitor",
      `${import.meta.env.BASE_URL}assets/visitor.webp`,
      { frameWidth: 96, frameHeight: 176 },
    );
    this.load.on("loaderror", (file: Phaser.Loader.File) =>
      this.bridge.ready(
        false,
        `Could not load ${file.key}. Please reload to try again.`,
      ),
    );
  }
  create() {
    if (
      ["room", "shelf", "table", "visitor"].some(
        (k) => !this.textures.exists(k),
      )
    )
      return;
    this.add.image(768, 512, "room").setDepth(-1000);
    this.rain = this.add.graphics().setDepth(-900);
    this.fire = this.add
      .ellipse(1340, 348, 44, 48, 0xffaa43, 0.05)
      .setDepth(-800)
      .setBlendMode(Phaser.BlendModes.ADD);
    for (const s of shelves) {
      const p = project({ x: s.x + s.w / 2, y: s.y + s.h });
      const sprite = this.add
        .image(p.x, p.y, "shelf")
        .setOrigin(0.5, 0.9)
        .setDisplaySize(348, 215)
        .setDepth(p.y)
        .setInteractive({
          useHandCursor: true,
          pixelPerfect: true,
          alphaTolerance: 16,
        });
      sprite.on("pointerdown", () => {
        if (this.bridge.paused) return;
        this.approach(s.genre);
        this.bridge.stage.focus();
      });
      this.furniture.push({
        sprite,
        ground: { x: s.x + s.w / 2, y: s.y + s.h },
        shelf: s.genre,
      });
    }
    const tp = project({ x: table.x + table.w / 2, y: table.y + table.h });
    this.furniture.push({
      sprite: this.add
        .image(tp.x, tp.y, "table")
        .setOrigin(0.5, 0.9)
        .setDisplaySize(380, 264)
        .setDepth(tp.y),
      ground: { x: table.x + table.w / 2, y: table.y + table.h },
    });
    this.shadow = this.add.ellipse(0, 0, 43, 16, 0x090805, 0.35);
    this.character = this.add
      .image(0, 0, "visitor", 0)
      .setOrigin(0.5, 0.96)
      .setDisplaySize(78, 143);
    const down = (e: KeyboardEvent) => {
      if (
        this.bridge.paused ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target as HTMLElement)?.closest(
          "button,input,select,textarea,dialog",
        )
      )
        return;
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.key)
      ) {
        e.preventDefault();
        this.keys.add(e.key.toLowerCase());
        this.route = [];
        this.destination = null;
      }
      if ((e.key.toLowerCase() === "e" || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        this.interact();
      }
    };
    const up = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
    const blur = () => this.stop();
    const hidden = () => {
      if (document.hidden) this.stop();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", hidden);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", hidden);
    });
    this.ready = true;
    this.bridge.ready(true);
    this.update(0, 0);
  }
  stop() {
    this.keys.clear();
    this.route = [];
    this.destination = null;
    this.bridge.direction = { x: 0, y: 0 };
  }
  approach(genre: Genre) {
    if (!this.ready || this.bridge.paused) return;
    this.stop();
    const shelf = shelves.find((s) => s.genre === genre)!;
    this.route = findPath(this.position, shelf.approach);
    this.destination = genre;
    if (distance(this.position, shelf.approach) < 12) {
      this.destination = null;
      this.bridge.open(genre);
    }
  }
  interact() {
    if (this.nearby && !this.bridge.paused) {
      this.stop();
      this.bridge.open(this.nearby);
    }
  }
  update(time: number, delta: number) {
    if (!this.ready) return;
    const b = this.bridge;
    if (b.paused && !this.hadPause) this.stop();
    this.hadPause = b.paused;
    let dir = { x: 0, y: 0 };
    if (!b.paused && !document.hidden) {
      // Screen directions are converted to ground directions so arrow-up goes up.
      const screen = {
        x:
          (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0) -
          (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0) +
          b.direction.x,
        y:
          (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0) -
          (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0) +
          b.direction.y,
      };
      if (screen.x || screen.y) {
        dir = {
          x: screen.x * 0.6 - screen.y * 0.145,
          y: screen.y * 0.99 - screen.x * 0.12,
        };
        this.route = [];
        this.destination = null;
      } else if (this.route.length) {
        const target = this.route[0];
        dir = { x: target.x - this.position.x, y: target.y - this.position.y };
        if (
          distance(target, this.position) <=
          Math.max(5, 215 * Math.min(delta / 1000, 0.1))
        ) {
          this.position = target;
          this.route.shift();
          dir = { x: 0, y: 0 };
        }
        if (!this.route.length && this.destination) {
          const genre = this.destination;
          this.destination = null;
          b.open(genre);
        }
      }
      this.position = move(this.position, dir, delta / 1000);
    }
    const p = project(this.position),
      walking = !!(dir.x || dir.y);
    if (walking) {
      this.walkClock += delta;
      const screenX = dir.x * 0.99 + dir.y * 0.145,
        screenY = dir.x * 0.12 + dir.y * 0.6;
      this.facing =
        screenY >= 0 ? (screenX >= 0 ? 0 : 1) : screenX >= 0 ? 2 : 3;
    }
    const frame = walking
      ? ((Math.floor(this.walkClock / 160) % 2) + 1) * 4 + this.facing
      : this.facing;
    this.character
      .setFrame(frame)
      .setPosition(p.x, p.y)
      .setDepth(p.y + 1);
    this.character.setDisplaySize(
      78,
      143 +
        (walking || b.reducedMotion || b.paused
          ? 0
          : Math.sin(time / 850) * 0.65),
    );
    this.shadow.setPosition(p.x, p.y - 2).setDepth(p.y - 1);
    const near =
      shelves.find((s) => distance(this.position, s.approach) < 105)?.genre ??
      null;
    if (near !== this.nearby) {
      this.nearby = near;
      b.near(near);
    }
    for (const item of this.furniture) {
      // Tall sprites fade only when they would conceal the character standing behind them.
      const fp = project(item.ground),
        behind = p.y < fp.y && p.y > fp.y - 150 && Math.abs(p.x - fp.x) < 165;
      item.sprite.setAlpha(behind ? 0.42 : 1);
    }
    const camera = this.cameras.main,
      width = this.scale.width,
      height = this.scale.height;
    const mobile = width < 650;
    const zoom = mobile
      ? Math.max(0.64, height / 1200)
      : Math.min(width / 1536, height / 1024);
    camera.setZoom(zoom);
    if (mobile) {
      const viewW = width / zoom,
        viewH = height / zoom;
      camera.centerOn(
        Phaser.Math.Clamp(p.x, viewW / 2, 1536 - viewW / 2),
        Phaser.Math.Clamp(p.y - 80, viewH / 2, 1024 - viewH / 2),
      );
    } else camera.centerOn(768, 512);
    for (const s of shelves) {
      const label = b.labels.get(s.genre);
      if (!label) continue;
      const lp = project({ x: s.x + s.w / 2, y: s.y + s.h });
      lp.y -= 123;
      const sx = (lp.x - camera.scrollX - width / 2) * zoom + width / 2;
      const sy = (lp.y - camera.scrollY - height / 2) * zoom + height / 2;
      label.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
      label.style.opacity =
        sx < -30 || sx > width + 30 || sy < -20 || sy > height + 20 ? "0" : "1";
      label.style.pointerEvents =
        sx < 0 || sx > width || sy < 0 || sy > height ? "none" : "auto";
      label.dataset.near = String(s.genre === near);
    }
    b.stage.dataset.position = `${this.position.x.toFixed(1)},${this.position.y.toFixed(1)}`;
    this.rain.clear();
    if (!b.reducedMotion && !b.paused && !document.hidden) {
      this.rain.lineStyle(1, 0xb8c9df, 0.19);
      for (const [wx, wy, ww, hh] of [
        [397, 55, 119, 145],
        [686, 51, 130, 172],
        [999, 80, 122, 166],
      ])
        for (let i = 0; i < 12; i++) {
          const x = wx + ((i * 31) % ww),
            y = wy + ((time * 0.08 + i * 23) % hh);
          this.rain.lineBetween(x, y, x - 2, y + 11);
        }
      this.fire.setAlpha(
        0.05 + (Math.sin(time / 180) + Math.sin(time / 79)) * 0.01,
      );
    }
  }
}
export function createLibrary(parent: HTMLElement, bridge: SceneBridge) {
  const scene = new LibraryScene(bridge);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#191e1b",
    scene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: parent.clientWidth,
      height: parent.clientHeight,
    },
    antialias: true,
    fps: { target: 60, forceSetTimeOut: false },
    audio: { noAudio: true },
    banner: false,
    input: { keyboard: false, gamepad: false },
  });
  return { game, scene };
}
