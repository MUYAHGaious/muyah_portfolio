import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { StatusChip } from "@/components/StatusChip";
import type { Project } from "@/lib/types";

/**
 * Stand-in for a project with no screenshot yet: its category in large mono
 * type over a faint diagonal hatch, in the site's own colours. Honest (it is
 * not pretending to be a screenshot) and not empty.
 */
function CoverStandIn({ project }: { project: Project }) {
  const word = project.tech.slice(0, 2).join(" + ") || project.category || "project";
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-end p-5"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(125,211,252,0.10) 0 1px, transparent 1px 14px), repeating-linear-gradient(45deg, rgba(249,168,212,0.07) 0 1px, transparent 1px 22px)",
      }}
    >
      <span className="font-mono text-[1.75rem] font-semibold leading-none tracking-tight text-ink/30 sm:text-[2.1rem]">
        {word}
      </span>
    </div>
  );
}

/** Card grid of projects. Used on the home page and the work index. */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-h4 font-semibold text-ink">Nothing published yet</p>
        <p className="mt-2 text-small text-ink-soft">
          Add a project from the admin panel and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <Reveal as="li" key={project.id} delay={index * 70}>
          <Link
            href={`/work/${project.slug}`}
            className="card card-lift group flex h-full flex-col overflow-hidden focus-visible:outline-offset-4"
          >
            <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-[#0b1230]">
              {project.cover_image ? (
                <img
                  src={project.cover_image.url}
                  srcSet={project.cover_image.srcset}
                  sizes="(min-width: 64rem) 24rem, (min-width: 40rem) 45vw, 90vw"
                  alt={project.cover_image.alt_text}
                  loading={index < 3 ? "eager" : "lazy"}
                  // Very wide screenshots (a terminal, a banner) are shown whole
                  // on the dark ground; the rest fill the frame.
                  className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.02] ${
                    project.cover_image.width / Math.max(1, project.cover_image.height) > 2.2
                      ? "object-contain p-4"
                      : "object-cover object-top"
                  }`}
                />
              ) : (
                <CoverStandIn project={project} />
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-micro text-ink-faint">
                  {project.year ?? ""}
                  {project.category ? `${project.year ? " · " : ""}${project.category}` : ""}
                </p>
                <StatusChip status={project.status} />
              </div>

              <h3 className="mt-3 text-h4 font-bold tracking-tight text-ink">{project.title}</h3>

              {(project.highlight || project.summary) && (
                <p className="mt-2 line-clamp-3 text-small text-ink-soft">
                  {project.highlight || project.summary}
                </p>
              )}

              {project.tech.length > 0 && (
                <p className="mt-auto pt-5 font-mono text-micro text-ink-faint">
                  {project.tech.slice(0, 4).join(" / ")}
                </p>
              )}
            </div>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
