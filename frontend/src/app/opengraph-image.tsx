import { ImageResponse } from "next/og";

import { getSettings } from "@/lib/api";

/**
 * The image shown when the site is shared on WhatsApp, LinkedIn, X, Slack or
 * iMessage. Generated rather than a static file so it always carries the
 * current name and tagline from the admin panel.
 *
 * 1200x630 is the size every platform crops from. Anything smaller gets
 * upscaled and looks cheap.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portfolio";

/**
 * Rendered on request rather than at build time.
 *
 * The underlying renderer (@vercel/og) cannot be prerendered on Windows — it
 * throws `TypeError: Invalid URL` resolving its own WASM path — which breaks
 * `next build` on a dev machine even though it works in the Linux container.
 * Rendering on demand keeps both environments working, and the cost is trivial:
 * only crawlers and link unfurlers ever request this.
 */
export const dynamic = "force-dynamic";

export default async function OpengraphImage() {
  const settings = await getSettings().catch(() => null);
  const name = settings?.name || "Portfolio";
  const tagline = settings?.tagline || "Selected work, services, and writing.";
  const location = settings?.location || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0E0D0C",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Warm bloom in the corner, echoing the site's accent. */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "radial-gradient(circle, #F2643A 0%, rgba(242,100,58,0) 68%)",
            opacity: 0.55,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg, #F2643A, #C2350F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {name.trim().charAt(0).toUpperCase() || "M"}
          </div>
          {location ? (
            <div style={{ fontSize: 26, color: "#8A8580", display: "flex" }}>{location}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#FAF7F4",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 36,
              color: "#B8B2AC",
              lineHeight: 1.35,
              maxWidth: 900,
              display: "flex",
            }}
          >
            {tagline.length > 120 ? `${tagline.slice(0, 117)}…` : tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 5, background: "#F2643A", display: "flex" }} />
          <div style={{ fontSize: 26, color: "#8A8580", display: "flex" }}>muyah.dev</div>
        </div>
      </div>
    ),
    size,
  );
}
