"use client";

import { useEffect } from "react";

import { ContentUnavailable } from "@/components/ContentUnavailable";

/**
 * Boundary for errors thrown while rendering a page.
 *
 * Reached when a data fetch fails — lib/api.ts lets those propagate rather than
 * turning an unreachable API into empty content. Errors in the root layout
 * itself are not caught here; see global-error.tsx.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Next redacts server error details before they reach the browser, leaving
    // only a digest. Logging it here is what makes a report traceable back to
    // the matching entry in the server logs.
    console.error("Page failed to render:", error.digest ?? error.message);
  }, [error]);

  return <ContentUnavailable onRetry={reset} />;
}
