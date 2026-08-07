"use client";

import { useEffect, useState } from "react";

/**
 * Shown when a page cannot render because the API is unreachable.
 *
 * Visually this is the intro loading screen, deliberately: an outage is
 * temporary and almost always brief, so presenting it as "still loading" is
 * both truer and less alarming than an error page. The alternative the site
 * used to have — rendering placeholder text and dropping every card section —
 * was the worst option, because a visitor cannot tell it from a real, empty site.
 *
 * It retries on its own, so the page appears as soon as the backend answers
 * without anyone having to reload.
 */
const RETRY_MS = 4000;
/** After this many attempts, stop and offer a manual retry instead of hammering. */
const MAX_ATTEMPTS = 15;

export function WaitingScreen({ onRetry }: { onRetry: () => void }) {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) return;

    const timer = setTimeout(() => {
      setAttempts((n) => n + 1);
      onRetry();
    }, RETRY_MS);

    return () => clearTimeout(timer);
  }, [attempts, onRetry]);

  const givenUp = attempts >= MAX_ATTEMPTS;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ground">
      <div aria-hidden="true" className="glow h-[28rem] w-[28rem]" />

      <div
        role="status"
        aria-live="polite"
        className="relative flex flex-col items-center gap-5 px-6 text-center"
      >
        {!givenUp && (
          <span aria-hidden="true" className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-ember [animation:pulse-ring_1.4s_ease-out_infinite]" />
            <span className="h-3 w-3 rounded-full bg-ember" />
          </span>
        )}

        <span className="text-h4 font-bold tracking-tight text-ink">
          {givenUp ? "Still not responding" : "Loading"}
        </span>

        {givenUp && (
          <>
            <p className="max-w-[36ch] text-small text-ink-soft">
              This is taking longer than it should. The site is up — its content
              service is not answering yet.
            </p>
            <button
              type="button"
              onClick={() => {
                setAttempts(0);
                onRetry();
              }}
              className="rounded-full bg-ink px-5 py-2.5 text-small font-medium text-ground transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
