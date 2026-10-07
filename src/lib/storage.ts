export type Theme = "sepia" | "light" | "dark";
export type Settings = {
  theme: Theme;
  fontSize: number;
  mode: "pages" | "scroll";
  reducedMotion: boolean;
};
export type Progress = {
  anchor: number;
  completed: boolean;
  bookmarks: number[];
};
export type Saved = {
  version: 1;
  settings: Settings;
  progress: Record<string, Progress>;
  lastBook: string | null;
  onboarding: boolean;
};
export const STORAGE_KEY = "lamplit-library:v1";
export const defaultSettings: Settings = {
  theme: "sepia",
  fontSize: 17,
  mode: "pages",
  reducedMotion: false,
};
export function emptySaved(): Saved {
  return {
    version: 1,
    settings: { ...defaultSettings },
    progress: {},
    lastBook: null,
    onboarding: false,
  };
}
const validIndex = (n: unknown): n is number =>
  typeof n === "number" &&
  Number.isFinite(n) &&
  n >= 0 &&
  Number.isInteger(n) &&
  n < 10000000;

export function parseSaved(raw: string | null): Saved {
  const fallback = emptySaved();
  if (!raw) return fallback;
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return fallback;
    const settings = data.settings ?? {};
    if (["sepia", "light", "dark"].includes(settings.theme))
      fallback.settings.theme = settings.theme;
    if (
      typeof settings.fontSize === "number" &&
      Number.isFinite(settings.fontSize)
    )
      fallback.settings.fontSize = Math.min(
        24,
        Math.max(14, settings.fontSize),
      );
    if (["pages", "scroll"].includes(settings.mode))
      fallback.settings.mode = settings.mode;
    fallback.settings.reducedMotion = settings.reducedMotion === true;
    fallback.onboarding = data.onboarding === true;
    fallback.lastBook =
      typeof data.lastBook === "string" ? data.lastBook : null;
    if (data.progress && typeof data.progress === "object") {
      for (const [id, value] of Object.entries(data.progress)) {
        const p = value as Partial<Progress> | null;
        if (p && validIndex(p.anchor))
          fallback.progress[id] = {
            anchor: p.anchor,
            completed: p.completed === true,
            bookmarks: Array.isArray(p.bookmarks)
              ? [...new Set(p.bookmarks.filter(validIndex))]
              : [],
          };
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}
export function readSaved(storage?: Pick<Storage, "getItem">): Saved {
  try {
    return parseSaved((storage ?? window.localStorage).getItem(STORAGE_KEY));
  } catch {
    return emptySaved();
  }
}
export function writeSaved(
  saved: Saved,
  storage?: Pick<Storage, "setItem">,
): boolean {
  try {
    (storage ?? window.localStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(saved),
    );
    return true;
  } catch {
    return false;
  }
}
