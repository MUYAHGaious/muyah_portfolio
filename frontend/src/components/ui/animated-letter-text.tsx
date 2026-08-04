import type React from "react";

import { cn } from "@/lib/utils";

/**
 * Replaces the first occurrence of a letter with a rotating gem.
 *
 * Adapted from the "Portfolio" treatment. Two changes: the palette is the site's
 * ember rather than the original's lime, and the filter and gradient ids are
 * namespaced — they are document-global in SVG, so a second instance on the same
 * page would silently steal the first one's fills.
 *
 * The replaced letter is still announced: the visual is `aria-hidden` and the
 * full text is exposed to assistive technology, so the name reads correctly
 * even though one glyph is a picture.
 */
export function AnimatedLetterText({
  text,
  letterToReplace = "o",
  className,
  id = "gem",
}: {
  text: string;
  letterToReplace?: string;
  className?: string;
  /** Namespace for the SVG ids; must be unique per instance on a page. */
  id?: string;
}) {
  const replaceIndex = text.toLowerCase().indexOf(letterToReplace.toLowerCase());

  if (replaceIndex === -1) {
    return <span className={className}>{text}</span>;
  }

  const before = text.slice(0, replaceIndex);
  const after = text.slice(replaceIndex + 1);

  const ids = {
    shape: `${id}-shape`,
    gem: `${id}-gem`,
    shine: `${id}-shine`,
    glow: `${id}-glow`,
    inner: `${id}-inner`,
  };

  const petal = `M50 0
    C55 15, 65 15, 75 10
    C70 25, 75 35, 90 35
    C80 45, 80 55, 90 65
    C75 65, 70 75, 75 90
    C65 85, 55 85, 50 100
    C45 85, 35 85, 25 90
    C30 75, 25 65, 10 65
    C20 55, 20 45, 10 35
    C25 35, 30 25, 25 10
    C35 15, 45 15, 50 0Z`;

  return (
    <span className={cn("inline", className)}>
      {/* The whole string, for anyone not looking at it. */}
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {before}

        <span className="relative mx-[-0.02em] inline-flex items-center justify-center align-baseline">
          <svg className="absolute h-0 w-0" aria-hidden="true">
            <defs>
              <filter id={ids.inner} x="-50%" y="-50%" width="200%" height="200%">
                <feComponentTransfer in="SourceAlpha">
                  <feFuncA type="table" tableValues="1 0" />
                </feComponentTransfer>
                <feGaussianBlur stdDeviation="3" />
                <feOffset dx="0" dy="2" result="offsetblur" />
                <feFlood floodColor="rgba(255,255,255,0.18)" result="color" />
                <feComposite in2="offsetblur" operator="in" />
                <feComposite in2="SourceAlpha" operator="in" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode />
                </feMerge>
              </filter>

              <filter id={ids.glow} x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                <feFlood floodColor="#ff7a3c" floodOpacity="0.45" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id={ids.gem} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffc79a" />
                <stop offset="40%" stopColor="#ff9a5c" />
                <stop offset="60%" stopColor="#ff7a3c" />
                <stop offset="100%" stopColor="#e8541a" />
              </linearGradient>

              <linearGradient id={ids.shine} x1="0%" y1="0%" x2="50%" y2="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>

              <radialGradient id={ids.shape} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#6b2a19" />
                <stop offset="100%" stopColor="#2e0f08" />
              </radialGradient>
            </defs>
          </svg>

          {/* Scalloped outer shape, standing in for the letterform. */}
          <svg viewBox="0 0 100 100" className="h-[0.78em] w-[0.78em]" aria-hidden="true">
            <path d={petal} fill={`url(#${ids.shape})`} filter={`url(#${ids.inner})`} />
            <path d={petal} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </svg>

          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="h-[0.33em] w-[0.33em] animate-gem-spin"
              filter={`url(#${ids.glow})`}
              aria-hidden="true"
            >
              <path d="M50 8 L92 50 L50 92 L8 50 Z" fill={`url(#${ids.gem})`} />
              <path d="M50 8 L8 50 L50 50 Z" fill={`url(#${ids.shine})`} />
              <path
                d="M50 18 L82 50 L50 82 L18 50 Z"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
              />
            </svg>
          </span>
        </span>

        {after}
      </span>
    </span>
  );
}
