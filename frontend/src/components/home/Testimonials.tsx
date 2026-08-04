"use client";

import { useState } from "react";

import type { Testimonial } from "@/lib/types";

/**
 * Testimonial marquee: a card per quote, each paired with a panel carrying the
 * person's company set on a dotted grid.
 *
 * Adapted from the supplied component. Three departures:
 *
 *  - It is fed by the testimonials table, not a hardcoded array. The original
 *    ships six invented people with stock photographs endorsing an unnamed
 *    product; a fabricated endorsement is the one claim on a portfolio someone
 *    might actually try to verify.
 *  - The company panel renders the company as a wordmark rather than an image.
 *    There are no client logo assets, and a generic placeholder logo would
 *    imply a client relationship that may not exist.
 *  - The marquee is a CSS animation rather than a JS library, and it pauses on
 *    hover and halts entirely under prefers-reduced-motion.
 *
 * Renders nothing while there are no testimonials. An empty "Success stories"
 * heading is worse than no section.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [paused, setPaused] = useState(false);

  if (testimonials.length === 0) return null;

  // Duplicated so the strip is wider than any viewport and -50% loops seamlessly.
  const track = [...testimonials, ...testimonials];

  // Slower with more cards, so the reading speed stays constant.
  const duration = Math.max(30, testimonials.length * 12);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-ground to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-ground to-transparent sm:w-28" />

      <ul
        className="flex min-w-max items-stretch gap-4 motion-reduce:animate-none"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {track.map((testimonial, index) => (
          <li
            key={`${testimonial.id}-${index}`}
            // Alternating direction gives the row the staggered rhythm of the
            // original without needing a second track.
            className={`flex w-[22rem] shrink-0 flex-col gap-px ${
              index % 2 === 1 ? "flex-col-reverse" : ""
            }`}
            aria-hidden={index >= testimonials.length || undefined}
          >
            <article className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar.url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember font-bold text-white"
                    >
                      {testimonial.author.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{testimonial.author}</p>
                    {testimonial.role && (
                      <p className="truncate text-small text-ink-soft">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-5 text-small leading-relaxed text-ink-soft">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </article>

            {/* Company panel: the wordmark on a dotted grid, matching the
                original's logo plate without inventing a logo. */}
            <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-[var(--r-md)] p-6">
              <span className="relative z-10 max-w-full truncate text-h4 font-extrabold uppercase tracking-tight text-ink-faint">
                {companyOf(testimonial.role) || testimonial.author}
              </span>

              <div
                aria-hidden="true"
                className="absolute inset-0 -z-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--field) 1px, transparent 1px), linear-gradient(to bottom, var(--field) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  maskImage:
                    "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          ul[style*="marquee"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/** "CTO, InsightTech" → "InsightTech". Returns "" when there is no company part. */
function companyOf(role: string): string {
  if (!role.includes(",")) return "";
  return role.split(",").slice(1).join(",").trim();
}
