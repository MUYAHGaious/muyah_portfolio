import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";

/**
 * Section header: a mono readout rail (real information, like a count or a
 * status), then the heading, an optional lead and an optional side link.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  link,
}: {
  /** Readout text, e.g. "work · 10 projects". Only pass real data. */
  eyebrow: string;
  title: string;
  lead?: string;
  link?: { href: string; label: string };
}) {
  return (
    <Reveal className="mb-8 sm:mb-10">
      <p className="readout">{eyebrow}</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="max-w-[22ch] text-h2 font-bold tracking-tight text-ink">{title}</h2>
          {lead && <p className="mt-3 max-w-[56ch] text-lead text-ink-soft">{lead}</p>}
        </div>

        {link && (
          <Link
            href={link.href}
            className="inline-flex min-h-9 shrink-0 items-center self-start text-small font-semibold text-ember underline decoration-ember/40 underline-offset-4 transition-colors hover:decoration-ember"
          >
            {link.label}
          </Link>
        )}
      </div>
    </Reveal>
  );
}
