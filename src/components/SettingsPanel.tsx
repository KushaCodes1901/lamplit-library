import { BookOpen, Check, Keyboard, Monitor, Moon, Sun } from "lucide-react";
import type { Settings } from "../lib/storage";
import { Modal } from "./Modal";
export function SettingsPanel({
  settings,
  storageOk,
  onChange,
  onHelp,
  onClose,
}: {
  settings: Settings;
  storageOk: boolean;
  onChange: (s: Partial<Settings>) => void;
  onHelp: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Settings" className="settings-modal" onClose={onClose}>
      <span className="eyebrow">MAKE YOURSELF AT HOME</span>
      <h1>A little comfort.</h1>
      <p className="panel-intro">Settle in just the way you like.</p>
      <div className="setting-section">
        <h2>Reading theme</h2>
        <div className="theme-options">
          {(
            [
              { theme: "light", Icon: Sun },
              { theme: "sepia", Icon: BookOpen },
              { theme: "dark", Icon: Moon },
            ] as const
          ).map(({ theme, Icon }) => (
            <button
              key={theme}
              className={`theme-choice theme-${theme}`}
              aria-pressed={settings.theme === theme}
              onClick={() => onChange({ theme })}
            >
              <Icon size={20} />
              <span>{theme}</span>
              {settings.theme === theme && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>
      <div className="setting-section">
        <label className="setting-label" htmlFor="text-size">
          Text size <span>{settings.fontSize}px</span>
        </label>
        <input
          id="text-size"
          type="range"
          min={14}
          max={24}
          value={settings.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
        />
      </div>
      <div className="setting-section">
        <h2>Reading layout</h2>
        <div className="preference-group">
          <button
            aria-pressed={settings.mode === "pages"}
            onClick={() => onChange({ mode: "pages" })}
          >
            Book pages
          </button>
          <button
            aria-pressed={settings.mode === "scroll"}
            onClick={() => onChange({ mode: "scroll" })}
          >
            Continuous scroll
          </button>
        </div>
      </div>
      <label className="motion-setting">
        <span>
          <Monitor size={18} /> Reduce animation
          <small>
            Keep rain and fire still. Your device preference is also respected.
          </small>
        </span>
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          onChange={(e) => onChange({ reducedMotion: e.target.checked })}
        />
      </label>
      <button className="text-button help-settings" onClick={onHelp}>
        <Keyboard size={17} /> Show library controls
      </button>
      <div className="storage-note">
        {storageOk
          ? "Your progress, bookmarks, and preferences are saved only in this browser on this device."
          : "Browser storage is unavailable. You can read normally, but progress will not survive a reload."}
      </div>
    </Modal>
  );
}
