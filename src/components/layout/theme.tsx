"use client";

import { useEffect, useState } from "react";

// Two keys, because the site and the CMS are two preferences. Someone who
// writes in a dark editor has not thereby asked to read the blog in the dark.
export const SITE_THEME_KEY = "site-theme";

// Runs before first paint, in <head>, so a reader who chose dark never sees a
// white frame first. Default is LIGHT: the class is added only on an explicit
// stored choice, never from the OS. That is deliberate — an <img> answers the
// OS setting on its own and the page answers this script, so letting the OS
// drive the page would be the one way to get the two out of step.
//
// It skips /admin: the CMS has its own key and its own script, and without
// this guard a site set to dark would drag the editor with it.
export const SITE_THEME_INIT = `(function(){try{
if(location.pathname.indexOf("/admin")===0)return;
if(localStorage.getItem(${JSON.stringify(SITE_THEME_KEY)})==="dark"){
document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme="dark";}
}catch(e){}})()`;

export function ThemeToggle() {
  // Starts light and corrects on mount rather than reading storage during
  // render: the server has no localStorage, and rendering the moon on the
  // server and the sun on the client is a hydration mismatch.
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    root.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem(SITE_THEME_KEY, next ? "dark" : "light");
    } catch {
      // A locked-down browser can refuse storage. The toggle still works for
      // this page view; it just will not be remembered, which is the right
      // way round to fail.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light" : "Dark"}
      className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-md-on-surface-variant transition-colors duration-200 ease-md-standard hover:bg-md-on-surface/[0.06] hover:text-md-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* One glyph, not two stacked and swapped: the icon shows what a click
          gives you, so it is a moon while the page is light. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[1.0625rem] w-[1.0625rem]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        )}
      </svg>
    </button>
  );
}
