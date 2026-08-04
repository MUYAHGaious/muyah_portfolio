import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";

/** Consistent section header: eyebrow, title, optional lead and side link. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  link,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  link?: { href: string; label: string };
}) {
  return (
    <Reveal className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 max-w-[18ch] text-h2 font-bold tracking-tight text-ink">{title}</h2>
        {lead && <p className="mt-3 max-w-[52ch] text-lead text-ink-soft">{lead}</p>}
      </div>

      {link && (
        <Link
          href={link.href}
          // min-h-9 so the hit area clears the 24px minimum — the text is 22px.
          className="group inline-flex min-h-9 shrink-0 items-center gap-1.5 self-start text-small font-semibold text-ember-deep"
        >
          {link.label}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      )}
    </Reveal>
  );
}
