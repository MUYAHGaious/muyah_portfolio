import type { MetadataRoute } from "next";

import { getSettings } from "@/lib/api";

// Metadata routes do not inherit the root layout's segment config, so the
// build-time API problem has to be opted out of here as well.
export const dynamic = "force-dynamic";

/**
 * Makes the site installable and gives Android/Chrome a proper name and colour
 * when someone adds it to their home screen, instead of a URL and a grey box.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();

  return {
    name: settings.name || "Portfolio",
    short_name: settings.name?.split(" ")[0] || "Portfolio",
    description: settings.tagline || "Selected work, services, and writing.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0D0C",
    theme_color: "#F2643A",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
