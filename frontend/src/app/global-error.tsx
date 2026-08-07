"use client";

import { useEffect } from "react";

import { ContentUnavailable } from "@/components/ContentUnavailable";

import "./globals.css";

/**
 * Boundary for errors thrown in the root layout itself.
 *
 * The layout fetches site settings, so an unreachable API fails there before any
 * page renders — and app/error.tsx cannot catch that, because it lives inside
 * the layout that just failed. This replaces the layout entirely, which is why
 * it has to supply its own <html> and <body> and import the stylesheet.
 *
 * The font is not loaded here. next/font is configured in the layout, and
 * reaching for it in the very boundary that handles the layout failing would
 * add a second thing that can break. globals.css names real fallbacks, so this
 * renders in a system sans-serif — acceptable for a screen this rare.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout failed to render:", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ContentUnavailable onRetry={reset} />
      </body>
    </html>
  );
}
