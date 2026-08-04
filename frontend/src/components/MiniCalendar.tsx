"use client";

import { useMemo, useState } from "react";

/**
 * Compact month calendar.
 *
 * Adapted from the seminar tool's MiniCalendar, with its event-density dots
 * removed. That version flags days with unstaffed courses; there is no
 * equivalent data here, and inventing busy-looking marks would be decoration
 * pretending to be information.
 *
 * What it does show is real: today, and the fact that the owner is currently
 * open to work. It is a way in to the contact page with a bit of warmth.
 */

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function MiniCalendar({ available = true }: { available?: boolean }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const first = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

  // Monday-first. getDay() is Sunday-first, which would shift every date by one.
  const blanks = (first.getDay() + 6) % 7;

  const monthLabel = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const isToday = (day: number) =>
    cursor.year === today.getFullYear() &&
    cursor.month === today.getMonth() &&
    day === today.getDate();

  const isPast = (day: number) =>
    new Date(cursor.year, cursor.month, day) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const step = (delta: number) =>
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-small font-bold text-ink">{monthLabel}</h3>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous month"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next month"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((day, index) => (
          <span
            key={`${day}-${index}`}
            aria-hidden="true"
            className="text-micro font-semibold text-ink-faint"
          >
            {day}
          </span>
        ))}

        {Array.from({ length: blanks }, (_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const current = isToday(day);

          return (
            <span
              key={day}
              className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-micro tabular-nums normal-case tracking-normal ${
                current
                  ? "bg-ember font-bold text-white"
                  : isPast(day)
                    ? "text-ink-faint"
                    : "text-ink-soft"
              }`}
            >
              {current ? (
                <>
                  <span aria-hidden="true">{day}</span>
                  <span className="sr-only">Today, {day}</span>
                </>
              ) : (
                day
              )}
            </span>
          );
        })}
      </div>

      {available && (
        <p className="mt-auto flex items-center gap-2 border-t border-line pt-4 text-small text-ink-soft">
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ember opacity-60 [animation:pulse-ring_1.8s_ease-out_infinite] motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
          </span>
          Available for new work
        </p>
      )}
    </div>
  );
}
