"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LottieLoader, preloadAnimation } from "@/components/motion/LottieLoader";

/**
 * Page-change loader.
 *
 * The old overlay waited for the new page to render and then held the screen
 * for three seconds, so a visitor saw a frozen page, then a loader, then the
 * page again. This one runs the other way round:
 *
 *  1. It appears the instant an internal link is clicked, before the server
 *     has answered, so the click always gets an immediate response.
 *  2. It leaves as soon as the new route has rendered, after a short minimum
 *     so it never flickers.
 *  3. It never stays longer than MAX_MS, whatever the network does.
 *
 * Skipped under prefers-reduced-motion, never focusable or announced.
 */
const MIN_MS = 450;
const MAX_MS = 3000;
const FADE_MS = 320;

function internalTarget(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  return url.pathname;
}

export function RouteLoader({ name }: { name: string }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"hidden" | "visible" | "leaving">("hidden");
  const shownAt = useRef(0);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const hide = () => {
    clear();
    const elapsed = Date.now() - shownAt.current;
    const wait = Math.max(0, MIN_MS - elapsed);
    timers.current.push(
      window.setTimeout(() => {
        setPhase("leaving");
        timers.current.push(window.setTimeout(() => setPhase("hidden"), FADE_MS));
      }, wait),
    );
  };

  // Show on click of any internal link.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (event: MouseEvent) => {
      if (!internalTarget(event)) return;
      clear();
      shownAt.current = Date.now();
      setPhase("visible");
      // Safety cap: whatever happens, the loader is gone after MAX_MS.
      timers.current.push(window.setTimeout(hide, MAX_MS));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The route changed: the new page is on screen, so let go.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (phase === "visible") hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    preloadAnimation();
    return clear;
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ground transition-opacity ease-out ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="flex flex-col items-center gap-6">
        <LottieLoader />
        <span className="font-mono text-[13px] tracking-wide text-ink-soft">{name || "Loading"}</span>
      </div>
    </div>
  );
}
