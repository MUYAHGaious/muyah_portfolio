import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { WorkShowcase } from "@/components/home/WorkShowcase";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects and case studies.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Work",
    description: "Selected projects and case studies.",
    type: "website",
    url: "/work",
  },
};

export default async function WorkPage() {
  const projects = await getProjects();
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Selected work."
        lead="A few things I've built, with the thinking behind them."
      >
        {categories.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li
                key={category}
                className="rounded-full bg-surface-2 px-3.5 py-1.5 text-micro normal-case tracking-normal text-ink-soft"
              >
                {category}
              </li>
            ))}
          </ul>
        )}
      </PageHero>

      {/* Expanding panels for the most recent handful, then the full grid.
          This treatment lives here rather than on the home page, where it
          would compete with the slider for the same job. */}
      {projects.length >= 2 && (
        <section className="shell pt-12 sm:pt-16">
          <SectionHeading eyebrow="Most recent" title="Open a panel." />
          <WorkShowcase projects={projects.slice(0, 4)} />
        </section>
      )}

      <section className="shell pt-16 sm:pt-20">
        {projects.length >= 2 && (
          <SectionHeading eyebrow="Everything" title="The full index." />
        )}
        <ProjectGrid projects={projects} />
      </section>
    </>
  );
}
