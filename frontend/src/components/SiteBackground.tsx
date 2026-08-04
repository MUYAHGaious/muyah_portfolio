import { GradientBackground } from "@/components/ui/vermilion-rings";

/**
 * The vermilion rings, behind the whole site.
 *
 * Fixed rather than scrolled, so the rings stay put while content moves over
 * them — the panels then read as floating on a warm field instead of dragging a
 * pattern along with them.
 *
 * Opacity is the whole balancing act. The bands are fully saturated orange at
 * source; the site's body copy sits directly on this in a few places, so it is
 * held at a level where the rings are clearly visible but text keeps its
 * contrast. Dark mode drops much lower, where bright orange would otherwise
 * glare against near-black.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.32] dark:opacity-[0.12]"
    >
      <GradientBackground className="h-full w-full" />
    </div>
  );
}
