/**
 * Shimmer placeholders shown while a client-side fetch is in flight.
 *
 * Public pages are server-rendered and arrive with their content, so these are
 * for the admin panel and for any client-fetched section — showing the shape of
 * what is coming reads as faster than a spinner, and stops the layout jumping
 * when data lands.
 */

export function SkeletonLine({ width = "100%", className = "" }: { width?: string; className?: string }) {
  return <div className={`skeleton h-3.5 ${className}`} style={{ width }} aria-hidden="true" />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Mirrors the proportions of a project row so nothing shifts on load. */
export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading content" className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card flex items-center gap-4 p-5">
          <SkeletonBlock className="h-16 w-16 shrink-0 rounded-[var(--r-sm)]" />
          <div className="flex-1 space-y-2.5">
            <SkeletonLine width="45%" />
            <SkeletonLine width="70%" className="h-3" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card p-6 space-y-3">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <SkeletonLine width="60%" />
          <SkeletonLine width="90%" className="h-3" />
          <SkeletonLine width="75%" className="h-3" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
