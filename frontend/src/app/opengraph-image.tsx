import { ImageResponse } from "next/og";

import { getSettings } from "@/lib/api";

/**
 * The image shown when the site is shared on WhatsApp, LinkedIn, X, Slack or
 * iMessage. Generated so it always carries the current name and role from the
 * admin panel, and drawn with the site's motif: a small network of neurons
 * and weight fibres, cyan for positive and magenta for negative.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portfolio";

export const dynamic = "force-dynamic";

/** Deterministic pseudo-random so the image is stable between requests. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default async function OpengraphImage() {
  const settings = await getSettings().catch(() => null);
  const name = settings?.name || "Portfolio";
  const title = settings?.title || "";
  const tagline = settings?.tagline || "Selected work, services, and writing.";

  // Three columns of neurons on the right, fully connected.
  const layers = [14, 9, 4];
  const left = 760;
  const gap = 170;
  const top = 90;
  const height = 450;
  const points = layers.map((count, li) =>
    Array.from({ length: count }, (_, i) => ({
      x: left + li * gap,
      y: top + (count === 1 ? height / 2 : (i / (count - 1)) * height),
    })),
  );
  const random = rng(7);
  const fibres: { x1: number; y1: number; x2: number; y2: number; c: string; o: number }[] = [];
  for (let li = 0; li < layers.length - 1; li++) {
    for (const a of points[li]) {
      for (const b of points[li + 1]) {
        const w = random() * 2 - 1;
        fibres.push({
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          c: w >= 0 ? "#22d3ee" : "#e040fb",
          o: 0.08 + Math.abs(w) * 0.45,
        });
      }
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #060a18 0%, #0b1230 60%, #060a18 100%)",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ position: "absolute", inset: 0 }}
        >
          {fibres.map((f, i) => (
            <line
              key={i}
              x1={f.x1}
              y1={f.y1}
              x2={f.x2}
              y2={f.y2}
              stroke={f.c}
              strokeOpacity={f.o}
              strokeWidth={1}
            />
          ))}
          {points.flat().map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={5} fill="#e6ecff" fillOpacity={0.9} />
          ))}
        </svg>

        <div style={{ display: "flex", fontSize: 24, color: "#9aa5cc" }}>{title}</div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#e6ecff",
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              display: "flex",
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 30,
              color: "#9aa5cc",
              lineHeight: 1.35,
              display: "flex",
            }}
          >
            {tagline.length > 110 ? `${tagline.slice(0, 107)}…` : tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 4, background: "#22d3ee", display: "flex" }} />
          <div style={{ fontSize: 24, color: "#9aa5cc", display: "flex" }}>muyah.dev</div>
        </div>
      </div>
    ),
    size,
  );
}
