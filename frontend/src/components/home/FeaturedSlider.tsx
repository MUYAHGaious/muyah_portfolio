"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
  ProgressSlider,
  SliderBtn,
  SliderBtnGroup,
  SliderContent,
  SliderWrapper,
} from "@/components/ui/progress-slider";
import type { Project } from "@/lib/types";

/**
 * Featured projects as an auto-advancing slider.
 *
 * On imagery: a slide uses the project's cover once one is uploaded. Until
 * then it gets a generated panel built from the project's own initial and
 * palette rather than a stock photograph — an unrelated Unsplash shot sitting
 * beside "veinRecon" reads as a screenshot of the work, which is the kind of
 * quiet dishonesty this rebuild exists to remove.
 */

const TINTS = [
  "from-[#FFD9BE] via-[#FFBE95] to-[#F79B6A]",
  "from-[#F1E7D6] via-[#E3D2B6] to-[#CFB994]",
  "from-[#F7DCCF] via-[#EABBA5] to-[#D9977C]",
  "from-[#E4EDDC] via-[#CCDDBE] to-[#AEC79B]",
];

export function FeaturedSlider({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <ProgressSlider activeSlider={projects[0].slug} duration={6500} className="w-full">
      <SliderContent>
        {projects.map((project, index) => (
          <SliderWrapper key={project.id} value={project.slug}>
            <article className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="relative overflow-hidden rounded-[var(--r-lg)] shadow-card lg:col-span-7">
                {project.cover_image ? (
                  <img
                    src={project.cover_image.url}
                    srcSet={project.cover_image.srcset}
                    sizes="(min-width: 64rem) 46rem, 92vw"
                    alt={project.cover_image.alt_text || project.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div
                    className={`relative flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br ${TINTS[index % TINTS.length]}`}
                  >
                    <span
                      aria-hidden="true"
                      className="text-[9rem] font-extrabold leading-none tracking-tighter text-white/35"
                    >
                      {project.title.charAt(0).toUpperCase()}
                    </span>
                    <span className="absolute bottom-4 left-5 rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
                      Add a cover in Media
                    </span>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center gap-2">
                  {project.year && (
                    <span className="rounded-full bg-surface-2 px-3 py-1 text-micro font-semibold text-ink-soft">
                      {project.year}
                    </span>
                  )}
                  {project.category && (
                    <span className="rounded-full bg-ember/15 px-3 py-1 text-micro font-semibold text-ember-deep">
                      {project.category}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-h2 font-bold tracking-tight text-ink">{project.title}</h3>

                {project.summary && (
                  <p className="mt-3 max-w-[46ch] text-lead text-ink-soft">{project.summary}</p>
                )}

                {project.tech.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 5).map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full bg-surface-2 px-2.5 py-1 text-micro normal-case tracking-normal text-ink-soft"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/work/${project.slug}`}
                  className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 text-small font-semibold text-surface transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                >
                  Read case study
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
              </div>
            </article>
          </SliderWrapper>
        ))}
      </SliderContent>

      <SliderBtnGroup className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <SliderBtn
            key={project.id}
            value={project.slug}
            className="rounded-[var(--r-sm)] bg-surface-2 p-4"
            // Sits beneath the label as a filling bar rather than a hairline,
            // so the countdown is legible at a glance.
            progressBarClass="h-full bg-ember/25"
          >
            <span className="block text-small font-semibold text-ink">{project.title}</span>
            <span className="mt-0.5 block truncate text-micro normal-case tracking-normal text-ink-soft">
              {project.category || "Project"}
              {project.year ? ` · ${project.year}` : ""}
            </span>
          </SliderBtn>
        ))}
      </SliderBtnGroup>
    </ProgressSlider>
  );
}
