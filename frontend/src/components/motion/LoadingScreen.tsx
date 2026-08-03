"use client";

import { useEffect, useState } from "react";

/**
 * Intro overlay shown while the first page settles, then faded out for good.
 *
 * Two rules keep this from becoming an obstacle:
 *  - It only ever appears on the first visit of a session. A preloader on every
 *    navigation is an artificial delay, not polish.
 *  - It is `aria-hidden` and removed from the DOM once gone, so it can never
 *    trap focus or be read out.
 *
 * The page underneath is fully rendered the whole time — if JS fails, nothing
 * here runs and the visitor simply sees the site.
 */
const SESSION_KEY = "intro-shown";
const HOLD_MS = 900;
const FADE_MS = 600;

export function LoadingScreen({ name }: { name: string }) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "leaving">("hidden");

  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Storage blocked — treat as already seen so nobody gets it on every page.
    }

    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* non-fatal */
    }

    setPhase("visible");
    document.body.style.overflow = "hidden";

    const leave = setTimeout(() => setPhase("leaving"), HOLD_MS);
    const done = setTimeout(() => {
      setPhase("hidden");
      document.body.style.overflow = "";
    }, HOLD_MS + FADE_MS);

    return () => {
      clearTimeout(leave);
      clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ground transition-opacity duration-[600ms] ease-out ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div aria-hidden="true" className="glow h-[28rem] w-[28rem]" />

      <div className="relative flex flex-col items-center gap-5">
        <span className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-ember [animation:pulse-ring_1.4s_ease-out_infinite]" />
          <span className="h-3 w-3 rounded-full bg-ember" />
        </span>

        <span className="text-h4 font-bold tracking-tight text-ink animate-rise">
          {name || "Loading"}
        </span>
      </div>
    </div>
  );
}
