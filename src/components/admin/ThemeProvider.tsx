"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Theme is admin-only. The public site has no toggle and no `.dark` rules that
// matter, so the class goes on <html> when an admin page mounts and comes off
// when it unmounts. That keeps one document class doing the work instead of a
// second token set scoped to a wrapper div.

export type Theme = "dark" | "light";

const STORAGE_KEY = "admin-theme";

interface Ctx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<Ctx>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Runs before paint, inlined by the admin layout.
 *
 * Without this the server sends light markup, React hydrates, and only then
 * does the class land, which is a full-brightness flash on every navigation
 * for someone who chose dark. Reading localStorage in a blocking script is the
 * standard fix and the only thing that actually removes the flash.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
if(t!=="light"){document.documentElement.classList.add("dark")}
document.documentElement.style.colorScheme=(t==="light"?"light":"dark");
}catch(e){document.documentElement.classList.add("dark")}})()`;

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default dark: the init script has already applied it, so starting light
  // here would make the first client render disagree with the DOM.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    setThemeState(stored === "light" ? "light" : "dark");
  }, []);

  const apply = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    // Tells the browser which built-in control colours to use, so scrollbars,
    // form controls and the caret stop being light-mode parts on a dark panel.
    root.style.colorScheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      apply(next);
    },
    [apply],
  );

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Leaving /admin must not leave the public site dark.
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
