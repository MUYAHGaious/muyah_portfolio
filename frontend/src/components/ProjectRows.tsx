import Link from "next/link";

import type { Project } from "@/lib/types";

/**
 * Projects as an editorial list: year, title and one line, the stack in
 * mono, a small thumbnail. One hairline between rows, nothing else. Reads as
 * an index, which is what it is.
 */
export function ProjectRows({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="border-y border-line py-8 text-small text-ink-soft">
        Nothing here yet. Add a project from the admin panel and it will appear.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            href={`/work/${project.slug}`}
            className="group grid grid-cols-[3.5rem_1fr_4rem] items-center gap-4 py-4 sm:grid-cols-[4rem_1fr_9rem_7rem] sm:gap-6 sm:py-5"
          >
            <span className="font-mono text-micro text-ink-faint">{project.year ?? "—"}</span>

            <span className="min-w-0">
              <span className="block text-h4 font-bold tracking-tight text-ink transition-colors group-hover:text-ember-deep">
                {project.title}
                {project.links.live && (
                  <span className="ml-2 align-middle font-mono text-micro font-normal text-ember-deep">live</span>
                )}
              </span>
              {project.summary && (
                <span className="mt-0.5 line-clamp-1 block text-small text-ink-soft">{project.summary}</span>
              )}
              {project.tech.length > 0 && (
                <span className="mt-1 block font-mono text-micro text-ink-faint sm:hidden">
                  {project.tech.slice(0, 3).join(" · ")}
                </span>
              )}
            </span>

            <span className="hidden font-mono text-micro leading-relaxed text-ink-faint sm:block">
              {project.tech.slice(0, 3).join(" · ")}
            </span>

            <span className="justify-self-end">
              {project.cover_image ? (
                <img
                  src={project.cover_image.url}
                  srcSet={project.cover_image.srcset}
                  sizes="7rem"
                  alt=""
                  loading="lazy"
                  className="h-10 w-16 rounded-[var(--r-sm)] border border-line object-cover object-top transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-12 sm:w-[7rem]"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="block h-10 w-16 rounded-[var(--r-sm)] border border-line sm:h-12 sm:w-[7rem]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, var(--line) 0 1px, transparent 1px 8px)",
                  }}
                />
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
