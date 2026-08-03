"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Reports a page view to the self-hosted analytics endpoint.
 *
 * No cookie is set and no identifier is stored in the browser — the server
 * derives a same-day-only visitor hash and discards the inputs. Failures are
 * ignored: analytics must never affect what the visitor sees.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastReported = useRef<string | null>(null);

  useEffect(() => {
    // The admin panel is the owner's own traffic; counting it would skew the numbers.
    if (pathname.startsWith("/admin")) return;

    // React 18 mounts effects twice in development; without this the first view
    // of every page is double-counted.
    if (lastReported.current === pathname) return;
    lastReported.current = pathname;

    const controller = new AbortController();

    fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {});

    return () => controller.abort();
  }, [pathname]);

  return null;
}
