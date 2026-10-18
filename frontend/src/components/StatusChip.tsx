import type { ProjectStatus } from "@/lib/types";

/**
 * Project status, shown only when it carries information. "Live" is the
 * default and says nothing, so it renders nothing. "In build" is the one
 * place on the site that uses amber.
 */
export function StatusChip({ status, className = "" }: { status: ProjectStatus; className?: string }) {
  if (status === "live") return null;

  const label = status === "in_build" ? "in build" : "archived";
  const tone =
    status === "in_build"
      ? "status-build"
      : "border-line text-ink-faint";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-micro ${tone} ${className}`}
    >
      {status === "in_build" && (
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber animate-blink" />
      )}
      {label}
    </span>
  );
}
