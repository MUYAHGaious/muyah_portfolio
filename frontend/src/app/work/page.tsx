import type { Metadata } from "next";

import { WorkIndex } from "@/components/WorkIndex";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects.",
};

export default async function WorkPage() {
  const projects = await getProjects();

  // Categories come from the data rather than a hardcoded list, so adding a
  // project in a new category needs no code change.
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];

  return (
    <section className="page-shell pt-16 pb-20 sm:pt-24">
      <div className="grid-field">
        <h1 className="col-span-12 sm:col-span-5 text-h2 font-semibold">Work</h1>
        {categories.length > 0 && (
          <p className="col-span-12 sm:col-span-5 sm:col-start-8 mt-3 sm:mt-2 text-small text-muted">
            {categories.join(" · ")}
          </p>
        )}
      </div>

      <div className="mt-12">
        <WorkIndex projects={projects} />
      </div>
    </section>
  );
}
