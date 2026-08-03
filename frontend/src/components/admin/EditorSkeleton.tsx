import { SkeletonBlock, SkeletonLine } from "@/components/motion/Skeleton";

/**
 * Placeholder shaped like the editor form, shown while the record loads.
 *
 * Matching the real layout means the page does not jump when data arrives, and
 * it reads as loading rather than as broken.
 */
export function EditorSkeleton() {
  return (
    <div role="status" aria-label="Loading editor" className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonLine width="6rem" />
        <SkeletonBlock className="h-9 w-20 rounded-full" />
      </div>

      <div className="space-y-2">
        <SkeletonLine width="4rem" className="h-2.5" />
        <SkeletonBlock className="h-10 w-full" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {[0, 1].map((index) => (
          <div key={index} className="space-y-2">
            <SkeletonLine width="4rem" className="h-2.5" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <SkeletonLine width="5rem" className="h-2.5" />
        <SkeletonBlock className="h-24 w-full" />
      </div>

      <div className="space-y-2">
        <SkeletonLine width="8rem" className="h-2.5" />
        <SkeletonBlock className="h-64 w-full" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
