import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";

// A 404 already sends the right status code, but an explicit noindex stops
// mistyped and long-dead URLs accumulating as thin pages in the index.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="shell pt-3">
      <div className="panel relative overflow-hidden px-6 py-20 text-center sm:px-12 sm:py-28">
        <div
          aria-hidden="true"
          className="glow left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="relative mx-auto max-w-lg">
          <p className="eyebrow animate-rise">404</p>
          <h1
            className="mt-3 text-h1 font-bold tracking-tight text-ink animate-rise"
            style={{ animationDelay: "100ms", fontSize: "clamp(3rem, 12vw, 7rem)" }}
          >
            Lost
          </h1>
          <p
            className="mx-auto mt-4 max-w-[34ch] text-lead text-ink-soft animate-rise"
            style={{ animationDelay: "180ms" }}
          >
            This page doesn&apos;t exist. The link may be out of date, or the page may have
            been renamed.
          </p>

          <div
            className="mt-8 flex flex-wrap justify-center gap-3 animate-rise"
            style={{ animationDelay: "260ms" }}
          >
            <Button href="/" variant="ember">
              Back home
            </Button>
            <Button href="/work" variant="ghost">
              See the work
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
