import type { MetadataRoute } from "next";

import { absolute } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Behind auth already, but there is no reason to advertise it.
          "/admin",
          "/admin/",
          // Filtered and paginated listings are the same posts in a different
          // order. Letting crawlers grind through them wastes crawl budget that
          // should go to the actual work pages.
          "/writing?*",
        ],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: absolute(""),
  };
}
