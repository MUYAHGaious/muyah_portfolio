"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LottieLoader, preloadAnimation } from "@/components/motion/LottieLoader";

/**
 * Branded intro overlay.
 *
 * Shown on first load and again when arriving at one of the main sections. Those
 * navigations are real waits — pages render per request, so there is a server
 * round trip to cover — which is what keeps this from being purely decorative.
 *
 * Deliberate choices:
 *  - A minimum on-screen time, so a fast connection does not reduce it to a
 *    flicker. Previously the overlay could come and go before it registered.
 *  - Main sections only. Case studies and posts are reached from those pages and
 *    would make the overlay feel like an obstacle rather than a transition.
 *  - Skipped entirely under prefers-reduced-motion, and never focusable or
 *    announced, so it cannot trap or interrupt assistive technology.
 *
 * The page underneath is fully rendered the whole time. If JS never runs, none
 * of this does either, and the visitor simply sees the site.
 */
const HOLD_MS = 3000;
const FADE_MS = 600;

/** Sections that get the intro. Sub-pages deliberately do not. */
const MAIN_ROUTES = new Set(["/", "/work", "/services", "/writing", "/contact", "/about"]);

export function LoadingScreen({ name }: { name: string }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"hidden" | "visible" | "leaving">("hidden");
  // Tracks the route the overlay last ran for, so a re-render caused by
  // something other than navigation cannot retrigger it.
  const lastShownFor = useRef<string | null>(null);

  useEffect(() => {
    if (!MAIN_ROUTES.has(pathname)) return;
    if (lastShownFor.current === pathname) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lastShownFor.current = pathname;

    setPhase("visible");
    document.body.style.overflow = "hidden";

    const leave = setTimeout(() => setPhase("leaving"), HOLD_MS);
    const done = setTimeout(() => {
      setPhase("hidden");
      document.body.style.overflow = "";
      // Warm the cache for the next section so the animation starts on frame
      // one rather than after a fetch.
      preloadAnimation();
    }, HOLD_MS + FADE_MS);

    return () => {
      clearTimeout(leave);
      clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, [pathname]);

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
        <LottieLoader />

        <span className="text-h4 font-bold tracking-tight text-ink animate-rise">
          {name || "Loading"}
        </span>
      </div>
    </div>
  );
}
