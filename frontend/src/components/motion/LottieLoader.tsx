"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * The Lottie animation used by the intro screen.
 *
 * Both the player and the animation data are kept out of the initial bundle,
 * which matters more here than anywhere else on the site: this is the thing
 * shown *while* the page loads, so paying for it up front would delay the very
 * thing it is covering for.
 *
 *  - The player (`lottie-react`, which carries lottie-web) is imported through
 *    next/dynamic with ssr:false, so it downloads only when this renders.
 *  - The animation is fetched from /public rather than imported. Importing it
 *    would inline ~776 KB of JSON into a JS chunk; as a static file it is served
 *    compressed (~112 KB) and cached separately from the app.
 *
 * Until both arrive the caller's own fallback shows, so there is never a blank
 * frame.
 */
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function LottieLoader({ fallback }: { fallback: React.ReactNode }) {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/loading-animation.json")
      .then((response) => (response.ok ? response.json() : null))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      // A failed fetch is not worth surfacing — the fallback is already a
      // perfectly good loading indicator.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return <>{fallback}</>;

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      className="h-40 w-40 sm:h-48 sm:w-48"
      // The animation is decorative; the caller supplies the accessible text.
      aria-hidden="true"
    />
  );
}
