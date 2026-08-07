"use client";

/**
 * Last-resort screen for when a page cannot render because the content API is
 * unreachable.
 *
 * This should almost never be seen. nginx serves the last known-good copy of a
 * page when the app or API fails (`proxy_cache_use_stale`), so a visitor during
 * an outage gets the real site. This only appears when there is no cached copy
 * at all — a first-ever visit to a page during an outage.
 *
 * Two things it deliberately is not:
 *
 *  - It is not a spinner. Disguising a failure as loading promises content that
 *    is not coming; if the backend is down for an hour, the spinner spins for an
 *    hour with nothing the visitor can do. Nielsen Norman's error guidelines are
 *    explicit that errors must be visible and recoverable.
 *  - It does not render placeholder content. The site used to substitute a stand-in
 *    name and silently drop every section, which a visitor cannot distinguish from
 *    a real, unfinished site.
 *
 * It says what is wrong, makes clear the problem is temporary and not the
 * visitor's fault, and offers a way to retry.
 */
export function ContentUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ground px-6">
      <div aria-hidden="true" className="glow h-[30rem] w-[30rem]" />

      <div role="alert" className="relative max-w-[42ch] text-center">
        <p className="eyebrow text-ember-deep">Temporarily unavailable</p>

        <h1 className="mt-3 text-h2 font-bold tracking-tight text-ink">
          This page can&rsquo;t load right now.
        </h1>

        <p className="mt-4 text-body text-ink-soft">
          The site is running, but the service that stores its content
          isn&rsquo;t responding. Nothing is wrong on your end, and nothing has
          been lost — it should be back shortly.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-ink px-6 py-3 text-small font-semibold text-ground transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
          >
            Try again
          </button>

          {/* mailto rather than a link to /contact — the contact page needs the
              same API that is currently unreachable. */}
          <a
            href="mailto:hello@muyah.dev"
            className="rounded-full border border-rule px-6 py-3 text-small font-medium text-ink transition-colors duration-200 hover:bg-surface-2"
          >
            Email instead
          </a>
        </div>
      </div>
    </main>
  );
}
