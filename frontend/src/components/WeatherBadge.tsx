"use client";

import { useEffect, useState } from "react";

/**
 * Tiny live weather readout for the site owner's city.
 *
 * Adapted from the seminar tool's WeatherCard, cut down hard: that one is a
 * full illustrated panel with venue rotation and forecast-for-a-course-date.
 * Here it is a temperature and a condition glyph, because it is a human touch
 * in a nav bar, not information anyone is making a decision on.
 *
 * Open-Meteo needs no API key and no account, so nothing has to be configured
 * or kept secret. The city is geocoded from the location in site settings, so
 * this follows the owner rather than being hardcoded.
 *
 * It renders nothing at all on failure. A nav bar is the worst place for a
 * broken widget, and no one visiting a portfolio needs the weather.
 */

type Condition = "clear" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm";

interface Reading {
  temp: number;
  condition: Condition;
  label: string;
  city: string;
}

/**
 * WMO weather codes collapsed to the glyphs we draw. Every code maps to
 * something — an unhandled one would render a blank space next to a
 * temperature, which reads as broken.
 */
function describe(code: number): { condition: Condition; label: string } {
  if (code === 0) return { condition: "clear", label: "Clear" };
  if (code <= 2) return { condition: "partly", label: "Partly cloudy" };
  if (code === 3) return { condition: "cloud", label: "Overcast" };
  if (code <= 48) return { condition: "fog", label: "Fog" };
  if (code <= 57) return { condition: "rain", label: "Drizzle" };
  if (code <= 67) return { condition: "rain", label: "Rain" };
  if (code <= 77) return { condition: "snow", label: "Snow" };
  if (code <= 82) return { condition: "rain", label: "Showers" };
  if (code <= 86) return { condition: "snow", label: "Snow showers" };
  return { condition: "storm", label: "Storm" };
}

function WeatherGlyph({ condition }: { condition: Condition }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[1.05rem] w-[1.05rem] shrink-0",
    "aria-hidden": true,
  };

  switch (condition) {
    case "clear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "partly":
      return (
        <svg {...common}>
          <path d="M12 4v1.5M5.6 6.6l1 1M4 13h1.5M18.4 6.6l-1 1" />
          <circle cx="12" cy="12" r="3" />
          <path d="M17 19H8a3.5 3.5 0 1 1 .6-6.95A4.5 4.5 0 0 1 17 13.5a2.75 2.75 0 0 1 0 5.5Z" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M17 18H7a4 4 0 1 1 .7-7.94A5 5 0 0 1 17 11.5a3.25 3.25 0 0 1 0 6.5Z" />
        </svg>
      );
    case "fog":
      return (
        <svg {...common}>
          <path d="M16 14H8a3.5 3.5 0 1 1 .6-6.95A4.5 4.5 0 0 1 16 8.5a2.75 2.75 0 0 1 0 5.5Z" />
          <path d="M5 18h14M7 21h10" />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path d="M16 13H8a3.5 3.5 0 1 1 .6-6.95A4.5 4.5 0 0 1 16 7.5a2.75 2.75 0 0 1 0 5.5Z" />
          <path d="M9 17l-1 3M13 17l-1 3M17 17l-1 3" />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <path d="M16 13H8a3.5 3.5 0 1 1 .6-6.95A4.5 4.5 0 0 1 16 7.5a2.75 2.75 0 0 1 0 5.5Z" />
          <path d="M9 18h.01M13 18h.01M11 21h.01M15 21h.01" />
        </svg>
      );
    case "storm":
      return (
        <svg {...common}>
          <path d="M16 12H8a3.5 3.5 0 1 1 .6-6.95A4.5 4.5 0 0 1 16 6.5a2.75 2.75 0 0 1 0 5.5Z" />
          <path d="M12 15l-2 3.5h3L11 22" />
        </svg>
      );
  }
}

export function WeatherBadge({
  location,
  className = "",
  showCity = false,
}: {
  location: string;
  className?: string;
  showCity?: boolean;
}) {
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    if (!location.trim()) return;

    const controller = new AbortController();

    (async () => {
      try {
        // Geocode first so the badge follows whatever is in settings rather
        // than a hardcoded coordinate pair.
        const city = location.split(",")[0].trim();
        const geo = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
          { signal: controller.signal },
        ).then((response) => response.json());

        const place = geo?.results?.[0];
        if (!place) return;

        const weather = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`,
          { signal: controller.signal },
        ).then((response) => response.json());

        const code = weather?.current?.weather_code;
        const temp = weather?.current?.temperature_2m;
        if (typeof code !== "number" || typeof temp !== "number") return;

        setReading({ temp, city: place.name, ...describe(code) });
      } catch {
        // Offline, blocked, rate-limited — the badge simply never appears.
      }
    })();

    return () => controller.abort();
  }, [location]);

  if (!reading) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-small text-ink-soft ${className}`}
      title={`${reading.label} in ${reading.city}`}
    >
      <WeatherGlyph condition={reading.condition} />
      <span className="tabular-nums font-medium text-ink">{Math.round(reading.temp)}°</span>
      {showCity && (
        <span className="truncate text-micro normal-case tracking-normal">
          {reading.label} · {reading.city}
        </span>
      )}
      {/* The glyph and number are decorative shorthand; this is what a screen
          reader actually reads out. */}
      <span className="sr-only">
        {reading.label} in {reading.city}, {Math.round(reading.temp)} degrees
      </span>
    </span>
  );
}
