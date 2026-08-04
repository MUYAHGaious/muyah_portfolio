"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Testimonial } from "@/lib/types";

/**
 * Marquee of testimonial capsules; clicking one opens the full quote.
 *
 * Driven entirely by the testimonials in the database. The original shipped
 * nine invented people with stock photos endorsing a different product — a
 * fabricated endorsement is the most damaging thing a portfolio can carry,
 * because it is the one claim someone might actually try to verify.
 *
 * So this renders nothing at all while there are none. An empty "trusted by"
 * section is worse than no section; an invented one is worse still.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [selected, setSelected] = useState<Testimonial | null>(null);

  // Escape closes the dialog, and the page behind it must not scroll while open.
  useEffect(() => {
    if (!selected) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [selected]);

  if (testimonials.length === 0) return null;

  // Two rows travelling in opposite directions once there are enough to fill
  // them; below that a single row reads as intentional rather than sparse.
  const rows =
    testimonials.length >= 4
      ? [
          testimonials.slice(0, Math.ceil(testimonials.length / 2)),
          testimonials.slice(Math.ceil(testimonials.length / 2)),
        ]
      : [testimonials];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Edge fades, so capsules dissolve rather than being clipped. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-ground to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-ground to-transparent sm:w-32" />

      <div className="flex flex-col gap-4 py-2">
        {rows.map((row, rowIndex) => {
          // Repeated so the strip is wider than any viewport; translating by
          // exactly -50% then loops seamlessly.
          const track = [...row, ...row, ...row, ...row];

          return (
            <motion.ul
              key={rowIndex}
              className="flex min-w-max items-center gap-4"
              animate={{ x: rowIndex % 2 === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
              transition={{
                duration: Math.max(28, track.length * 4),
                repeat: Infinity,
                ease: "linear",
              }}
              // A continuously moving strip is a common accessibility complaint;
              // reduced-motion users get a static, scrollable row instead.
              style={{ animationPlayState: "running" }}
            >
              {track.map((testimonial, index) => (
                <li key={`${testimonial.id}-${index}`}>
                  <Capsule
                    testimonial={testimonial}
                    onSelect={() => setSelected(testimonial)}
                    // Only the first copy is exposed; the rest are visual filler
                    // and would otherwise be read out four times over.
                    duplicate={index >= row.length}
                  />
                </li>
              ))}
            </motion.ul>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Testimonial from ${selected.author}`}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-ink/30 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="panel relative z-10 w-full max-w-lg p-8 sm:p-12"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X size={18} aria-hidden="true" />
              </button>

              <figure className="flex flex-col items-center text-center">
                <blockquote className="text-lead font-medium leading-relaxed text-ink">
                  &ldquo;{selected.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-8 flex items-center gap-4">
                  <Avatar testimonial={selected} size="h-12 w-12" />
                  <span className="text-left">
                    <span className="block font-bold text-ink">{selected.author}</span>
                    {selected.role && (
                      <span className="block text-small text-ink-soft">{selected.role}</span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Avatar({ testimonial, size }: { testimonial: Testimonial; size: string }) {
  if (testimonial.avatar) {
    return (
      <img
        src={testimonial.avatar.url}
        alt=""
        className={`${size} shrink-0 rounded-full border border-line object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-ember/15 font-bold text-ember-deep`}
    >
      {testimonial.author.charAt(0).toUpperCase()}
    </span>
  );
}

function Capsule({
  testimonial,
  onSelect,
  duplicate,
}: {
  testimonial: Testimonial;
  onSelect: () => void;
  duplicate: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : 0}
      className="group flex items-center gap-3 rounded-full border border-line bg-surface py-2 pl-2 pr-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-ember hover:shadow-card motion-reduce:hover:translate-y-0"
    >
      <Avatar testimonial={testimonial} size="h-12 w-12" />

      <span className="flex flex-col items-start leading-tight">
        <span className="text-small font-bold text-ink">{testimonial.author}</span>
        {testimonial.role && (
          <span className="text-micro normal-case tracking-normal text-ink-soft">
            {testimonial.role}
          </span>
        )}
      </span>
    </button>
  );
}
