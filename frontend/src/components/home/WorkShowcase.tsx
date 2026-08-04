"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { Project } from "@/lib/types";

/**
 * Expanding accordion of featured projects.
 *
 * Adapted from the "impact section" pattern. Two deliberate departures from the
 * original:
 *
 *  - The original leads each card with a headline metric ("3x conversions").
 *    There are no such figures for this work, and inventing them is exactly the
 *    thing this rebuild exists to stop. The lead slot carries the year instead,
 *    which is real, and the discipline sits beneath it.
 *  - The animation is CSS `flex-grow` and `max-height` transitions rather than
 *    framer-motion springs. It is the same motion for none of the bundle.
 *
 * Interaction: hover or focus opens a panel on desktop; on touch, where hover
 * does not exist, the panels are always open and simply stack.
 */
export function WorkShowcase({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(0);

  if (projects.length === 0) return null;

  const TINTS = [
    "from-[#FFE0CB] to-[#FFC7A4]",
    "from-[#F4ECDF] to-[#E6D8C2]",
    "from-[#F7E1D6] to-[#EBC4B1]",
    "from-[#E7EDE1] to-[#D3DFC7]",
  ];

  return (
    <ul className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3">
      {projects.map((project, index) => {
        const isOpen = open === index;

        return (
          <li
            key={project.id}
            onMouseEnter={() => setOpen(index)}
            onFocus={() => setOpen(index)}
            // flex-grow carries the expansion on desktop; on mobile every panel
            // is full width and open, so nothing is hidden behind a hover.
            className={`group relative overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-br ${
              TINTS[index % TINTS.length]
            } shadow-soft transition-[flex-grow,box-shadow] duration-500 ease-out lg:min-h-[26rem] ${
              isOpen ? "lg:grow-[4] shadow-card" : "lg:grow"
            }`}
          >
            <Link
              href={`/work/${project.slug}`}
              className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
                  {project.category || "Project"}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[#46190f] transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                />
              </div>

              <div>
                <p className="text-[2.75rem] font-bold leading-none tracking-tight text-[#46190f] sm:text-[3.25rem]">
                  {project.year ?? "—"}
                </p>

                <h3 className="mt-3 text-h4 font-bold tracking-tight text-[#46190f]">
                  {project.title}
                </h3>

                {/* Revealed with the panel. max-height rather than display so the
                    text can transition; it stays readable for screen readers
                    either way. */}
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-out ${
                    isOpen ? "max-h-48 opacity-100" : "lg:max-h-0 lg:opacity-0 max-h-48 opacity-100"
                  }`}
                >
                  <p className="mt-2 max-w-[38ch] text-small leading-relaxed text-[#46190f]/75">
                    {project.summary}
                  </p>

                  {project.tech.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {project.tech.slice(0, 4).map((tech) => (
                        <li
                          key={tech}
                          className="rounded-full bg-white/50 px-2.5 py-1 text-micro normal-case tracking-normal text-[#46190f]/80"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
