import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  CloudRain,
  LampDesk,
  Settings2,
} from "lucide-react";
import { books, type Book, type Genre } from "./data/books";
import {
  emptySaved,
  readSaved,
  writeSaved,
  type Progress,
  type Settings,
} from "./lib/storage";
import { Game } from "./components/Game";
import { Catalog } from "./components/Catalog";
import { Reader } from "./reader/Reader";
import { SettingsPanel } from "./components/SettingsPanel";
import { Help } from "./components/Help";

type Panel =
  | { type: "catalog"; genre?: Genre }
  | { type: "reader"; book: Book }
  | { type: "settings" }
  | { type: "help" }
  | null;
export default function App() {
  const [saved, setSaved] = useState(readSaved),
    [storageOk, setStorageOk] = useState(true);
  const [entered, setEntered] = useState(false),
    [ready, setReady] = useState(false),
    [panel, setPanel] = useState<Panel>(null);
  const [deviceReduced, setDeviceReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setDeviceReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    setStorageOk(writeSaved(saved));
  }, [saved]);
  const settings = useCallback(
    (s: Partial<Settings>) =>
      setSaved((previous) => ({
        ...previous,
        settings: { ...previous.settings, ...s },
      })),
    [],
  );
  const close = useCallback(() => setPanel(null), []);
  const openShelf = useCallback(
    (genre: Genre) => setPanel({ type: "catalog", genre }),
    [],
  );
  const open = (book: Book) => {
    setSaved((prev) => ({ ...prev, lastBook: book.id }));
    setPanel({ type: "reader", book });
  };
  const last = books.find((b) => b.id === saved.lastBook);
  const reducedMotion = saved.settings.reducedMotion || deviceReduced;
  function enter() {
    setEntered(true);
    if (!saved.onboarding) setPanel({ type: "help" });
    requestAnimationFrame(() =>
      document.getElementById("library-stage")?.focus(),
    );
  }
  function dismissHelp() {
    setSaved((prev) => ({ ...prev, onboarding: true }));
    close();
  }
  return (
    <main
      className={`app ${entered ? "entered" : "welcome"} ${reducedMotion ? "reduced-motion" : ""}`}
    >
      <header className="app-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (entered) {
              close();
              document.getElementById("library-stage")?.focus();
            }
          }}
          aria-label="The Lamplit Library home"
        >
          <BookOpen size={27} strokeWidth={1.3} />
          <div>
            <span>THE LAMPLIT</span>
            <strong>LIBRARY</strong>
          </div>
        </a>
        <div className="header-rule" />
        <span className="header-invitation">A little room for stories.</span>
        {entered && (
          <nav className="main-nav" aria-label="Library menu">
            <button
              className="nav-browse"
              onClick={() => setPanel({ type: "catalog" })}
            >
              <BookOpen size={16} />
              <span>Browse Books</span>
            </button>
            {last && (
              <button className="continue-nav" onClick={() => open(last)}>
                <span>Continue Reading</span>
                <ArrowRight size={16} />
              </button>
            )}
            <button
              className="icon-button"
              aria-label="Library controls"
              onClick={() => setPanel({ type: "help" })}
            >
              <CircleHelp size={19} />
            </button>
            <button
              className="icon-button"
              aria-label="Settings"
              onClick={() => setPanel({ type: "settings" })}
            >
              <Settings2 size={19} />
            </button>
          </nav>
        )}
      </header>
      <Game
        paused={!entered || !!panel}
        suspended={!!panel}
        reducedMotion={reducedMotion}
        onOpen={openShelf}
        onReady={setReady}
      />
      {!entered && ready && (
        <section className="opening">
          <div className="opening-panel">
            <span className="opening-lamp">
              <LampDesk size={28} strokeWidth={1.1} />
            </span>
            <span className="eyebrow">
              SOMEWHERE QUIET. SOMETHING GOOD TO READ.
            </span>
            <h1>
              The Lamplit
              <br />
              <em>Library</em>
            </h1>
            <p>
              Leave the rain at the door.
              <br />
              There’s a story waiting for you.
            </p>
            <button className="button primary enter-button" onClick={enter}>
              Enter Library <ArrowRight size={17} />
            </button>
            <span className="opening-note">
              Eight stories · Four shelves · Take your time
            </span>
          </div>
        </section>
      )}
      <footer className="app-footer">
        <div className="evening">
          <CloudRain size={17} strokeWidth={1.4} />
          <span>A rainy evening</span>
          <span className="footer-dot">·</span>
          <span>Always open</span>
        </div>
        <div className="desktop-controls">
          {entered ? (
            <>
              <span>
                <kbd>W</kbd>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd> to wander
              </span>
              <span>
                <kbd>E</kbd> to browse
              </span>
              <span>or click a shelf</span>
            </>
          ) : (
            <span>A small escape, one page at a time.</span>
          )}
        </div>
        <span className="footer-note">MADE FOR QUIET MOMENTS</span>
      </footer>
      {panel?.type === "catalog" && (
        <Catalog
          genre={panel.genre}
          storageOk={storageOk}
          progress={saved.progress}
          onClose={close}
          onOpen={open}
        />
      )}
      {panel?.type === "reader" && (
        <Reader
          key={panel.book.id}
          book={panel.book}
          storageOk={storageOk}
          settings={saved.settings}
          progress={saved.progress[panel.book.id]}
          onSettings={settings}
          onProgress={(p: Progress) =>
            setSaved((prev) => ({
              ...(prev ?? emptySaved()),
              lastBook: panel.book.id,
              progress: { ...prev.progress, [panel.book.id]: p },
            }))
          }
          onClose={close}
        />
      )}
      {panel?.type === "settings" && (
        <SettingsPanel
          settings={saved.settings}
          storageOk={storageOk}
          onChange={settings}
          onHelp={() => setPanel({ type: "help" })}
          onClose={close}
        />
      )}
      {panel?.type === "help" && <Help onClose={dismissHelp} />}
    </main>
  );
}
