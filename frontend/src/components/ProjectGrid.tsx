import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import type { Project } from "@/lib/types";

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
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <Reveal as="li" key={project.id} delay={index * 90}>
          <Link
            href={`/work/${project.slug}`}
            className="card card-lift group flex h-full flex-col overflow-hidden focus-visible:outline-offset-4"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
              {project.cover_image ? (
                <img
                  src={project.cover_image.url}
                  srcSet={project.cover_image.srcset}
                  sizes="(min-width: 64rem) 24rem, (min-width: 40rem) 45vw, 90vw"
                  alt={project.cover_image.alt_text}
                  loading={index < 3 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-h2 font-bold text-ink-faint/40">
                    {project.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {project.year && (
                <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-micro font-semibold text-ink backdrop-blur-sm">
                  {project.year}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-h4 font-bold tracking-tight text-ink">{project.title}</h3>

              {project.summary && (
                <p className="mt-2 line-clamp-2 text-small text-ink-soft">{project.summary}</p>
              )}

              {project.tech.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.tech.slice(0, 3).map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full bg-surface-2 px-2.5 py-1 text-micro normal-case tracking-normal text-ink-soft"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}

              <span className="mt-5 inline-flex items-center gap-1.5 text-small font-semibold text-ember-deep">
                View case study
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
