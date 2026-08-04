"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Tawk.to live chat.
 *
 * Loaded with `afterInteractive` rather than inline in <head>: the widget is
 * third-party JavaScript that has nothing to do with first paint, and blocking
 * on it would cost the page's loading performance for a feature nobody needs in
 * the first second.
 *
 * The widget is offset upward on small screens so it sits clear of the fixed
 * bottom navigation instead of covering it, and it is suppressed in the admin
 * panel — there is no one to chat with there, and it would overlap the editors.
 *
 * Note this is the one third-party service on the site: it sees visitors' pages
 * and anything they type into the chat.
 */
const TAWK_SRC = "https://embed.tawk.to/6a716b4e4bf7201d4aa60e4b/1jv5gmano";

export function LiveChat() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Script id="tawk-config" strategy="afterInteractive">
        {`
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
          // Lift the launcher above the mobile bottom nav (~5rem tall).
          window.Tawk_API.customStyle = {
            visibility: {
              desktop: { position: 'br', xOffset: 24, yOffset: 24 },
              mobile:  { position: 'br', xOffset: 12, yOffset: 88 }
            }
          };
        `}
      </Script>

      <Script
        id="tawk-widget"
        src={TAWK_SRC}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        charSet="UTF-8"
      />
    </>
  );
}
