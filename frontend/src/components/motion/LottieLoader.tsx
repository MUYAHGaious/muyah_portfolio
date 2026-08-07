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
 * The parsed animation is held at module scope. The loading screen now appears
 * on every main-page navigation, and re-parsing 776 KB of JSON each time would
 * cost a visible pause on exactly the frame that is meant to look smooth.
 */
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const SOURCE = "/loading-animation.json";

let cached: unknown = null;
let inFlight: Promise<unknown> | null = null;

function load(): Promise<unknown> {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  inFlight = fetch(SOURCE)
    .then((response) => (response.ok ? response.json() : null))
    .then((json) => {
      cached = json;
      return json;
    })
    .catch(() => null)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * Warms the cache so the animation is ready before it is needed.
 *
 * Called once the first intro has finished, so by the time someone navigates to
 * another main page the animation plays from the first frame instead of after a
 * fetch.
 */
export function preloadAnimation(): void {
  void load();
}

export function LottieLoader() {
  const [data, setData] = useState<unknown>(cached);

  useEffect(() => {
    if (data) return;

    let cancelled = false;
    void load().then((json) => {
      if (!cancelled) setData(json);
    });

    return () => {
      cancelled = true;
    };
  }, [data]);

  // Nothing stands in while the animation loads. A placeholder spinner here is
  // what produced the "two different loading screens" — a dot, then the cat.
  // The overlay behind this is already the loading state.
  if (!data) return <div className="h-40 w-40 sm:h-48 sm:w-48" aria-hidden="true" />;

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      className="h-40 w-40 sm:h-48 sm:w-48"
      aria-hidden="true"
    />
  );
}
