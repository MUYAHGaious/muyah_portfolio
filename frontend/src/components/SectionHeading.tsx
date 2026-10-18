import Link from "next/link";

/**
 * Section header: the heading, an optional lead, an optional side link.
 * No label above it; the heading carries its own meaning.
 */
export function SectionHeading({
  title,
  lead,
  link,
  as: Tag = "h2",
}: {
  title: string;
  lead?: string;
  link?: { href: string; label: string };
  as?: "h2" | "h3";
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Tag className="max-w-[22ch] text-h3 font-bold tracking-tight text-ink">{title}</Tag>
        {lead && <p className="mt-2 max-w-[56ch] text-small text-ink-soft">{lead}</p>}
      </div>

      {link && (
        <Link
          href={link.href}
          className="inline-flex min-h-9 shrink-0 items-center self-start text-small font-semibold text-ember underline decoration-ember/40 underline-offset-4 transition-colors hover:decoration-ember sm:self-end"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
