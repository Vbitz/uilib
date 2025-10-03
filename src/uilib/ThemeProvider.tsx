import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PropsWithChildren,
} from "react";
import { cn } from "./utils/cn";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  accent: string;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const DEFAULT_ACCENT = "#2563eb"; // Tailwind blue-600

let hasWarnedForMissingProvider = false;

function warnMissingProvider(action?: string) {
  if (typeof console === "undefined") return;
  const message = action
    ? `[ThemeProvider] ${action} was called without an enclosing <ThemeProvider>.`
    : "[ThemeProvider] useTheme was called outside of a <ThemeProvider>.";
  if (!hasWarnedForMissingProvider || action) {
    console.warn(message);
  }
  hasWarnedForMissingProvider = true;
}

function getDocumentMode(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getDocumentAccent(): string {
  if (typeof document === "undefined") return DEFAULT_ACCENT;
  const accent = document.documentElement.style.getPropertyValue("--accent");
  return accent.trim() || DEFAULT_ACCENT;
}

const fallbackContext: ThemeContextValue = {
  mode: "light",
  accent: DEFAULT_ACCENT,
  setMode: mode => {
    warnMissingProvider("setMode");
    applyTheme(mode, getDocumentAccent());
  },
  toggleMode: () => {
    warnMissingProvider("toggleMode");
    const next = getDocumentMode() === "dark" ? "light" : "dark";
    applyTheme(next, getDocumentAccent());
  },
  setAccent: accent => {
    warnMissingProvider("setAccent");
    applyTheme(getDocumentMode(), accent);
  },
};

function normalizeHex(color: string): string | null {
  const trimmed = color.trim();
  if (!trimmed.startsWith("#")) return null;
  const hex = trimmed.slice(1);
  if (hex.length === 3) {
    return `#${hex.split("").map(char => char + char).join("")}`;
  }
  if (hex.length === 6) {
    return `#${hex}`;
  }
  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex) ?? DEFAULT_ACCENT;
  const value = normalized.slice(1);
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function toHexChannel(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, "0");
}

function mixHexColor(baseHex: string, mixWith: [number, number, number], ratio: number): string {
  const [r, g, b] = hexToRgb(baseHex);
  const mixRatio = Math.max(0, Math.min(1, ratio));
  const mixedR = r + (mixWith[0] - r) * mixRatio;
  const mixedG = g + (mixWith[1] - g) * mixRatio;
  const mixedB = b + (mixWith[2] - b) * mixRatio;
  return `#${toHexChannel(mixedR)}${toHexChannel(mixedG)}${toHexChannel(mixedB)}`;
}

function adjustColor(hex: string, amount: number): string {
  const ratio = Math.max(-1, Math.min(1, amount));
  if (ratio === 0) return normalizeHex(hex) ?? DEFAULT_ACCENT;
  // Positive ratio lightens toward white, negative ratio darkens toward black
  return ratio > 0
    ? mixHexColor(hex, [255, 255, 255], ratio)
    : mixHexColor(hex, [0, 0, 0], Math.abs(ratio));
}

function getContrastingText(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#f8fafc";
}

type AccentPalette = Record<
  `--${| "accent"
  | "accent-hover"
  | "accent-active"
  | "accent-muted"
  | "accent-muted-foreground"
  | "accent-surface"
  | "accent-surface-foreground"
  | "accent-contrast"
  }`,
  string
>;

function getAccentPalette(mode: ThemeMode, accent: string): AccentPalette {
  const normalizedAccent = normalizeHex(accent) ?? DEFAULT_ACCENT;
  const accentHover =
    mode === "light"
      ? adjustColor(normalizedAccent, -0.08)
      : mixHexColor(normalizedAccent, [255, 255, 255], 0.14);
  const accentActive =
    mode === "light"
      ? adjustColor(normalizedAccent, -0.14)
      : mixHexColor(normalizedAccent, [255, 255, 255], 0.22);

  const baseLight: [number, number, number] = [248, 250, 252]; // slate-50
  const baseDark: [number, number, number] = [15, 23, 42]; // slate-950
  const accentMuted =
    mode === "light"
      ? mixHexColor(normalizedAccent, baseLight, 0.82)
      : mixHexColor(normalizedAccent, [255, 255, 255], 0.42);
  const accentSurface =
    mode === "light"
      ? mixHexColor(normalizedAccent, baseLight, 0.9)
      : mixHexColor(normalizedAccent, [255, 255, 255], 0.55);
  const accentSurfaceForeground = getContrastingText(accentSurface);
  const accentContrast = getContrastingText(normalizedAccent);
  const accentMutedForeground = getContrastingText(accentMuted);

  return {
    "--accent": normalizedAccent,
    "--accent-hover": accentHover,
    "--accent-active": accentActive,
    "--accent-muted": accentMuted,
    "--accent-muted-foreground": accentMutedForeground,
    "--accent-surface": accentSurface,
    "--accent-surface-foreground": accentSurfaceForeground,
    "--accent-contrast": accentContrast,
  };
}

function applyTheme(mode: ThemeMode, accent: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = mode;
  root.style.colorScheme = mode;

  const palette = getAccentPalette(mode, accent);
  for (const [token, value] of Object.entries(palette)) {
    root.style.setProperty(token, value);
  }
}

type ThemeProviderProps = PropsWithChildren<{
  initialMode?: ThemeMode;
  initialAccent?: string;
  className?: string;
}>;

export function ThemeProvider({
  children,
  initialMode = "light",
  initialAccent = DEFAULT_ACCENT,
  className,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [accent, setAccentState] = useState<string>(initialAccent);

  useEffect(() => {
    applyTheme(mode, accent);
  }, [mode, accent]);

  const accentVars = useMemo<CSSProperties>(() => {
    return getAccentPalette(mode, accent) as CSSProperties;
  }, [accent, mode]);

  const setAccent = (value: string) => {
    setAccentState(value);
  };

  const toggleMode = () => {
    setMode(prev => (prev === "light" ? "dark" : "light"));
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, accent, setMode, toggleMode, setAccent }),
    [mode, accent]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={cn(
          "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300",
          "dark:bg-slate-950 dark:text-slate-100",
          className
        )}
        data-mode={mode}
        style={accentVars}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    warnMissingProvider();
    return fallbackContext;
  }
  return context;
}

export type { ThemeMode, ThemeContextValue };
