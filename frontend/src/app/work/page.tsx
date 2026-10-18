import type { Metadata } from "next";

import { PageFrame } from "@/components/PageFrame";
import { PageHero } from "@/components/PageHero";
import { ProjectRows } from "@/components/ProjectRows";
import { SectionHeading } from "@/components/SectionHeading";
import { FlagshipBlock, PipelineList } from "@/components/home/FlagshipBlock";
import { getProjects, getSettings } from "@/lib/api";

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
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  // Group the index by year, newest first, so the list reads as a timeline.
  const years = [...new Set(rest.map((p) => p.year ?? 0))].sort((a, b) => b - a);

  return (
    <PageFrame settings={settings} featured={featured}>
      <PageHero
        title="Work."
        lead={`${projects.length} projects: products I lead at Skye8, software I built, and research I did. Each one has a case study.`}
      />

      {featured.length > 0 && (
        <section className="pt-10 sm:pt-14">
          <div className="space-y-14 lg:space-y-20">
            {featured.map((project, index) => (
              <FlagshipBlock
                key={project.id}
                project={project}
                flip={index % 2 === 1}
                visual={<PipelineList project={project} />}
              />
            ))}
          </div>
        </section>
      )}

      {years.map((year) => {
        const group = rest.filter((p) => (p.year ?? 0) === year);
        return (
          <section key={year} className="rule">
            <SectionHeading title={year ? String(year) : "Undated"} as="h2" />
            <ProjectRows projects={group} />
          </section>
        );
      })}
    </PageFrame>
  );
}
