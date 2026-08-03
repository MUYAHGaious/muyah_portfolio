import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects and case studies.",
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

      <section className="shell pt-12 sm:pt-16">
        <ProjectGrid projects={projects} />
      </section>
    </>
  );
}
