"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

/**
 * Meta (Facebook) Pixel, loaded only when NEXT_PUBLIC_META_PIXEL_ID is set.
 *
 * What it gives the owner: a record in Meta Events Manager of who visited,
 * which pages, and which actions (we send a Lead event when the contact form
 * is submitted), so Facebook and Instagram ads can be measured and retargeted
 * to people who already saw the site.
 *
 * What it costs the visitor: a third-party script and a cookie. The site's
 * own analytics stay cookieless; this is the one exception, and it is off
 * until the owner opts in with the environment variable. Respects the
 * browser's Global Privacy Control signal and does not load when it is set.
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export function MetaPixel() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  // Track client-side navigations; the initial PageView is sent by the loader.
  useEffect(() => {
    if (!PIXEL_ID || !window.fbq) return;
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  if (!PIXEL_ID) return null;
  if (typeof navigator !== "undefined" && (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl) {
    return null;
  }

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/** Call after a successful contact submission so ads can count it as a lead. */
export function trackLead() {
  if (typeof window !== "undefined" && window.fbq) window.fbq("track", "Lead");
}
