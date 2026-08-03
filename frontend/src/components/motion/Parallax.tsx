"use client";

import { useEffect, useRef } from "react";

/**
 * Moves its children at a fraction of the scroll speed.
 *
 * Driven by rAF-throttled scroll rather than a scroll event handler that writes
 * styles directly — the latter causes layout thrash on every wheel tick. Only
 * `transform` is written, so the work stays on the compositor.
 *
 * Disabled outright when the visitor prefers reduced motion; parallax is one of
 * the most reliable triggers for motion sickness.
 */
export function Parallax({
  children,
  speed = 0.15,
  className = "",
}: {
  children: React.ReactNode;
  /** Fraction of scroll distance to offset by. Negative moves against the scroll. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      // Distance of the element's centre from the viewport's centre.
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      node.style.transform = `translate3d(0, ${(-offset * speed).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
