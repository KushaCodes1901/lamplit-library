import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Footprints,
} from "lucide-react";
import { genres, type Genre } from "../data/books";
import type { SceneBridge, createLibrary } from "../game/LibraryScene";
import type { Point } from "../game/navigation";

export function Game({
  paused,
  suspended,
  reducedMotion,
  onOpen,
  onReady,
}: {
  paused: boolean;
  suspended: boolean;
  reducedMotion: boolean;
  onOpen: (g: Genre) => void;
  onReady: (b: boolean) => void;
}) {
  const mount = useRef<HTMLDivElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const labels = useRef(new Map<Genre, HTMLElement>());
  const engine = useRef<ReturnType<typeof createLibrary> | null>(null);
  const [near, setNear] = useState<Genre | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const bridge = useRef<SceneBridge | null>(null);
  const callbacks = useRef({ onOpen, onReady });
  callbacks.current = { onOpen, onReady };
  useEffect(() => {
    let disposed = false;
    const b: SceneBridge = {
      paused: true,
      reducedMotion: false,
      direction: { x: 0, y: 0 },
      labels: labels.current,
      stage: stage.current!,
      near: setNear,
      open: (g) => {
        b.paused = true;
        b.direction = { x: 0, y: 0 };
        callbacks.current.onOpen(g);
      },
      ready: (ready, message) => {
        if (disposed) return;
        setLoading(!ready);
        if (message) setError(message);
        callbacks.current.onReady(ready);
      },
    };
    bridge.current = b;
    void import("../game/LibraryScene")
      .then(({ createLibrary }) => {
        if (!disposed) engine.current = createLibrary(mount.current!, b);
      })
      .catch(() =>
        setError("The library could not load. Please reload to try again."),
      );
    const resize = new ResizeObserver(() =>
      engine.current?.game.scale.resize(
        mount.current!.clientWidth,
        mount.current!.clientHeight,
      ),
    );
    resize.observe(mount.current!);
    return () => {
      disposed = true;
      resize.disconnect();
      engine.current?.game.destroy(true);
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    if (bridge.current) {
      bridge.current.paused = paused;
      bridge.current.reducedMotion = reducedMotion;
      if (paused) engine.current?.scene.stop();
    }
  }, [paused, reducedMotion]);
  useEffect(() => {
    if (!engine.current || loading) return;
    if (suspended) engine.current.game.loop.sleep();
    else engine.current.game.loop.wake();
    const visibility = () => {
      if (document.hidden || suspended) engine.current?.game.loop.sleep();
      else engine.current?.game.loop.wake();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, [suspended, loading]);
  const held = useRef(new Map<number, Point>());
  const updateDirection = () => {
    if (bridge.current)
      bridge.current.direction = [...held.current.values()].reduce(
        (p, d) => ({ x: p.x + d.x, y: p.y + d.y }),
        { x: 0, y: 0 },
      );
  };
  useEffect(() => {
    if (paused) held.current.clear();
  }, [paused]);
  useEffect(() => {
    const clear = () => {
      held.current.clear();
      if (bridge.current) bridge.current.direction = { x: 0, y: 0 };
    };
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, []);
  return (
    <div
      id="library-stage"
      className="library-stage"
      tabIndex={0}
      ref={stage}
      aria-label="Library room. Move with WASD or arrow keys. Interact with E or Enter. You can also use Browse Books."
      data-testid="library-stage"
    >
      <div ref={mount} className="game-canvas" aria-hidden="true" />
      <div className="scene-vignette" />
      <div className="shelf-labels" aria-label="Walk to a genre shelf">
        {genres.map((g) => (
          <button
            className="shelf-label"
            key={g}
            ref={(el) => {
              if (el) labels.current.set(g, el);
              else labels.current.delete(g);
            }}
            disabled={paused || loading}
            onClick={() => {
              engine.current?.scene.approach(g);
              stage.current?.focus();
            }}
            aria-label={`Walk to ${g} shelf`}
          >
            <span className={`genre-dot genre-${g.toLowerCase()}`} />
            {g}
            <ChevronRight size={12} />
          </button>
        ))}
      </div>
      {loading && (
        <div className="loading-state" role="status">
          <BookOpen size={32} />
          <span>{error || "Lighting the lamps…"}</span>
          {error && (
            <button className="button" onClick={() => location.reload()}>
              Try again
            </button>
          )}
        </div>
      )}
      {!paused && !loading && (
        <>
          <div className="room-caption">
            <span className="tiny-rule" /> A RAINY EVENING AT THE LIBRARY
          </div>
          <div className="shelf-prompt" aria-live="polite">
            {near ? (
              <button
                className="prompt-button"
                onClick={() => engine.current?.scene.interact()}
              >
                <BookOpen size={17} />
                <span>Browse {near}</span>
                <kbd>E</kbd>
              </button>
            ) : (
              <span>
                <Footprints size={15} /> Wander a little. Find a story.
              </span>
            )}
          </div>
          <div className="touch-controls" aria-label="Movement controls">
            <div className="d-pad">
              {[
                { x: 0, y: -1, name: "Move up", Icon: ChevronUp },
                { x: -1, y: 0, name: "Move left", Icon: ChevronLeft },
                { x: 0, y: 1, name: "Move down", Icon: ChevronDown },
                { x: 1, y: 0, name: "Move right", Icon: ChevronRight },
              ].map(({ x, y, name, Icon }) => (
                <button
                  key={name}
                  className={`direction dir-${name.split(" ")[1]}`}
                  aria-label={name}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    held.current.set(e.pointerId, { x, y });
                    updateDirection();
                  }}
                  onPointerUp={(e) => {
                    held.current.delete(e.pointerId);
                    updateDirection();
                  }}
                  onPointerCancel={(e) => {
                    held.current.delete(e.pointerId);
                    updateDirection();
                  }}
                  onLostPointerCapture={(e) => {
                    held.current.delete(e.pointerId);
                    updateDirection();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      held.current.set(-1, { x, y });
                      updateDirection();
                    }
                  }}
                  onKeyUp={() => {
                    held.current.delete(-1);
                    updateDirection();
                  }}
                  onBlur={() => {
                    held.current.delete(-1);
                    updateDirection();
                  }}
                >
                  <Icon size={21} />
                </button>
              ))}
            </div>
            <button
              className="touch-interact"
              disabled={!near}
              aria-label={
                near
                  ? `Browse nearby ${near} shelf`
                  : "Approach a shelf to browse"
              }
              onClick={() => engine.current?.scene.interact()}
            >
              <BookOpen size={23} />
              <span>Browse</span>
            </button>
          </div>
          <nav className="mobile-shelves" aria-label="Navigate to shelf">
            {genres.map((g) => (
              <button key={g} onClick={() => engine.current?.scene.approach(g)}>
                <span className={`genre-dot genre-${g.toLowerCase()}`} />
                {g}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
