"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";

  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  // Rendered only after mount: the server cannot know the visitor's stored theme,
  // and guessing produces a hydration mismatch.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => setTheme(currentTheme()), []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing can reject writes; the toggle still works for this page.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Switch theme"}
      className="text-small text-muted hover:text-signal transition-colors duration-150"
    >
      {/* A filled/hollow square rather than a sun-moon icon — consistent with the
          page's geometric vocabulary, and it needs no icon library. */}
      <span aria-hidden="true">{theme === "dark" ? "◻" : "◼"}</span>
    </button>
  );
}
