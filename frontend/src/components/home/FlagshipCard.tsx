import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { StatusChip } from "@/components/StatusChip";
import { ToConfirm } from "@/components/ToConfirm";
import type { Project } from "@/lib/types";

/**
 * A featured project, mobile first.
 *
 * On a phone: the visual at the top, then a compact header, the highlight,
 * three metrics in one row, and one link. Everything in a single column with
 * small type. From the large breakpoint the visual moves beside the copy and
 * the type grows. `flip` mirrors the desktop layout so two cards in a row do
 * not read as one template stamped twice.
 */
export function FlagshipCard({
  project,
  visual,
  flip = false,
}: {
  project: Project;
  visual?: React.ReactNode;
  flip?: boolean;
}) {
  // Placeholders stay on the case study page where they are flagged; a card
  // should only show numbers that are real.
  const metrics = project.metrics.filter((m) => !/\[to confirm/i.test(m.value)).slice(0, 3);

  return (
    <Reveal as="article" className="panel overflow-hidden">
      {/* The real screenshot runs across the top of the card. */}
      {project.cover_image && (
        <a
          href={project.links.live ?? `/work/${project.slug}`}
          target={project.links.live ? "_blank" : undefined}
          rel={project.links.live ? "noopener noreferrer" : undefined}
          className="block border-b border-line bg-[#0b1230]"
        >
          <img
            src={project.cover_image.url}
            srcSet={project.cover_image.srcset}
            sizes="(min-width: 82rem) 76rem, 95vw"
            alt={project.cover_image.alt_text}
            className="aspect-[16/9] w-full object-cover object-top sm:aspect-[21/9]"
          />
        </a>
      )}

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-12 lg:gap-10 lg:p-10">
        {/* Demo first on small screens. */}
        <div className={`lg:col-span-5 ${flip ? "lg:order-1" : "lg:order-2"}`}>
          {visual ?? <PipelineSketch project={project} />}
        </div>

        <div className={`lg:col-span-7 ${flip ? "lg:order-2" : "lg:order-1"}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-small font-semibold text-ink-soft">{project.title}</p>
            <StatusChip status={project.status} />
            {project.year && <p className="font-mono text-micro text-ink-faint">{project.year}</p>}
          </div>

          <h3 className="mt-2 max-w-[22ch] text-h3 font-bold tracking-tight text-ink lg:text-h2">
            {project.highlight || project.summary}
          </h3>

          {project.role && <p className="mt-2 text-small text-ink-soft">{project.role}</p>}

          {metrics.length > 0 && (
            <dl className="mt-5 grid grid-cols-3 gap-3 lg:mt-7 lg:gap-5">
              {metrics.map((metric) => (
                <div key={metric.label} className="min-w-0 border-l border-line pl-3 lg:pl-4">
                  <dd className="truncate text-h4 font-bold tracking-tight text-ink lg:text-h3">
                    <ToConfirm text={metric.value} />
                  </dd>
                  <dt className="mt-0.5 text-micro leading-snug text-ink-soft lg:text-small">{metric.label}</dt>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 lg:mt-8">
            <Link
              href={`/work/${project.slug}`}
              className="inline-flex min-h-11 items-center text-small font-semibold text-ember underline decoration-ember/40 underline-offset-4 hover:decoration-ember"
            >
              Read the case study
            </Link>
            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-small text-ink-soft hover:text-ink"
              >
                Visit the product
              </a>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** Default visual: the project's pipeline stages as a vertical sketch. */
export function PipelineSketch({ project }: { project: Project }) {
  if (project.pipeline.length === 0) return null;

  return (
    <ol className="relative flex h-full flex-col justify-center gap-3 rounded-[var(--r-lg)] border border-line bg-ground/70 p-4 sm:gap-4 sm:p-5">
      <span
        aria-hidden="true"
        className="absolute bottom-7 left-[1.6rem] top-7 w-px bg-gradient-to-b from-[#7dd3fc]/60 via-[#f9a8d4]/40 to-[#7dd3fc]/20 sm:left-[1.85rem]"
      />
      {project.pipeline.map((stage, i) => (
        <li key={stage.stage} className="relative flex gap-3 pl-1 sm:gap-4">
          <span className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
            <span className={`h-2 w-2 rounded-full ${i % 2 === 0 ? "bg-[#7dd3fc]" : "bg-[#f9a8d4]"}`} />
          </span>
          <div className="min-w-0">
            <p className="text-small font-semibold text-ink">{stage.stage}</p>
            {stage.detail && (
              <p className="mt-0.5 text-micro leading-relaxed text-ink-soft">
                <ToConfirm text={stage.detail} />
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
