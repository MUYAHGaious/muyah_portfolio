import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { FlagshipCard } from "@/components/home/FlagshipCard";
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
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];

  return (
    <>
      <PageHero
        eyebrow={`work · ${projects.length} projects${categories.length ? ` · ${categories.join(", ")}` : ""}`}
        title="Selected work."
        lead="Products I lead, software I built, and research I did. Each one has a case study with the thinking behind it."
      />

      {featured.length > 0 && (
        <section className="shell pt-12 sm:pt-16">
          <SectionHeading eyebrow={`flagship · ${featured.length}`} title="Leading." />
          <div className="space-y-6">
            {featured.map((project, index) => (
              <FlagshipCard key={project.id} project={project} flip={index % 2 === 1} />
            ))}
          </div>
        </section>
      )}

      <section className="shell pt-16 sm:pt-20">
        {rest.length > 0 && <SectionHeading eyebrow={`index · ${rest.length}`} title="Building." />}
        <ProjectGrid projects={rest} />
      </section>
    </>
  );
}
