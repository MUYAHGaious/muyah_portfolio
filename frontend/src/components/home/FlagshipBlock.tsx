import Link from "next/link";

import { ToConfirm } from "@/components/ToConfirm";
import type { Project } from "@/lib/types";

const STATUS_WORD: Record<string, string> = {
  live: "live",
  in_build: "in build",
  archived: "archived",
};

/**
 * A product Muyah leads, laid out like a page in a lab notebook: the
 * screenshot on one side, the facts on the other, a hairline underneath.
 * No panel. `flip` mirrors the two halves so two blocks in a row do not read
 * as one template stamped twice.
 */
export function FlagshipBlock({
  project,
  visual,
  flip = false,
}: {
  project: Project;
  /** Something that moves or explains, shown under the screenshot. */
  visual?: React.ReactNode;
  flip?: boolean;
}) {
  const metrics = project.metrics.filter((m) => !/\[to confirm/i.test(m.value)).slice(0, 3);
  const status = STATUS_WORD[project.status] ?? project.status;

  return (
    <article className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div className={`lg:col-span-7 ${flip ? "lg:order-2" : "lg:order-1"}`}>
        {project.cover_image ? (
          <a
            href={project.links.live ?? `/work/${project.slug}`}
            target={project.links.live ? "_blank" : undefined}
            rel={project.links.live ? "noopener noreferrer" : undefined}
            className="group block overflow-hidden rounded-[var(--r-md)] border border-line bg-[#0b1230]"
          >
            <img
              src={project.cover_image.url}
              srcSet={project.cover_image.srcset}
              sizes="(min-width: 64rem) 44rem, 95vw"
              alt={project.cover_image.alt_text}
              className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.015]"
            />
          </a>
        ) : null}
        {visual && <div className="mt-4">{visual}</div>}
      </div>

      <div className={`lg:col-span-5 ${flip ? "lg:order-1" : "lg:order-2"}`}>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-h4 font-bold tracking-tight text-ink">{project.title}</span>
          <span className="font-mono text-micro text-ink-faint">
            {project.year}
            {status && ` · ${status}`}
          </span>
        </p>

        <h3 className="mt-3 max-w-[22ch] text-h3 font-bold tracking-tight text-ink">
          {project.highlight || project.summary}
        </h3>

        {project.role && <p className="mt-3 max-w-[48ch] text-small text-ink-soft">{project.role}</p>}

        {metrics.length > 0 && (
          <p className="mt-5 flex flex-wrap gap-x-2 gap-y-1 text-small text-ink-soft">
            {metrics.map((metric, i) => (
              <span key={metric.label}>
                <span className="font-semibold text-ink">
                  <ToConfirm text={metric.value} />
                </span>{" "}
                {metric.label}
                {i < metrics.length - 1 && <span className="ml-2 text-ink-faint">·</span>}
              </span>
            ))}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href={`/work/${project.slug}`}
            className="inline-flex min-h-10 items-center text-small font-semibold text-ember underline decoration-ember/40 underline-offset-4 hover:decoration-ember"
          >
            Read the case study
          </Link>
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center text-small text-ink-soft hover:text-ink"
            >
              Visit the product
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/** The project's pipeline as a plain numbered list with hairlines. */
export function PipelineList({ project }: { project: Project }) {
  if (project.pipeline.length === 0) return null;

  return (
    <ol className="divide-y divide-line border-y border-line">
      {project.pipeline.map((stage, i) => (
        <li key={stage.stage} className="grid grid-cols-[2.5rem_1fr] gap-3 py-2.5">
          <span className="font-mono text-micro text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
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
