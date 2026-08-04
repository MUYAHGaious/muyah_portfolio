"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Light is the default. The system preference is deliberately ignored — dark
 * only ever applies because someone chose it here, and that choice persists.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = document.documentElement.getAttribute("data-theme");
    setTheme(stored === "dark" ? "dark" : "light");
  }, []);

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
      aria-label={theme ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Switch theme"}
      // 44px on touch screens, tightened to 36px from md up where a pointer is
      // likely. Anything smaller is genuinely hard to hit with a thumb.
      className="flex h-11 w-11 md:h-9 md:w-9 items-center justify-center rounded-full border border-field text-ink transition-colors duration-200 hover:border-ink hover:bg-surface-2"
    >
      <span aria-hidden="true" className="text-[0.95rem] leading-none">
        {theme === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );
}
