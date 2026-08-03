"use client";

import Link from "next/link";
import { useState } from "react";

import type { Project } from "@/lib/types";

/**
 * The work index, set as a typographic table rather than a card grid.
 *
 * Rows are keyed by year — real information, unlike the decorative 01/02/03
 * markers a portfolio usually gets. Pointing at a row raises its cover image in
 * a fixed panel, which keeps the index dense and scannable while still showing
 * the work. The panel is a progressive enhancement: it appears only on wide
 * pointer-driven screens, and every row is a plain link without it.
 */
export function WorkIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);

  if (projects.length === 0) {
    return (
      <p className="text-muted text-small py-8">
        No projects published yet. Add one from the admin panel.
      </p>
    );
  }

  return (
    <div className="relative">
      <ul className="rule-top">
        {projects.map((project) => (
          <li key={project.id} className="rule-bottom">
            <Link
              href={`/work/${project.slug}`}
              onMouseEnter={() => setActive(project)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(project)}
              onBlur={() => setActive(null)}
              className="group grid grid-cols-12 items-baseline gap-x-4 py-5 sm:py-6 transition-colors duration-150 hover:text-signal focus-visible:text-signal"
            >
              <span className="col-span-3 sm:col-span-2 text-small text-muted group-hover:text-signal transition-colors duration-150">
                {project.year ?? "—"}
              </span>

              <span className="col-span-9 sm:col-span-5 text-h3 font-semibold">
                {project.title}
              </span>

              <span className="col-start-4 col-span-9 sm:col-start-8 sm:col-span-3 text-small text-muted">
                {project.role || project.category}
              </span>

              <span className="col-start-4 col-span-9 sm:col-start-11 sm:col-span-2 text-small text-muted sm:text-right truncate">
                {project.tech.slice(0, 2).join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Decorative duplicate of information already in the row — hidden from
          assistive tech and from anyone who prefers reduced motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-8 top-1/2 hidden w-72 -translate-y-1/2 lg:block motion-reduce:hidden"
      >
        {active?.cover_image && (
          <img
            src={active.cover_image.url}
            srcSet={active.cover_image.srcset}
            sizes="18rem"
            alt=""
            width={active.cover_image.width}
            height={active.cover_image.height}
            className="w-full h-auto"
          />
        )}
      </div>
    </div>
  );
}
