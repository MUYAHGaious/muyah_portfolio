import type { Metadata } from "next";

import { Markdown } from "@/components/Markdown";
import { PageFrame } from "@/components/PageFrame";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ToConfirm } from "@/components/ToConfirm";
import { Button } from "@/components/ui/Button";
import { getExperience, getProjects, getSettings } from "@/lib/api";
import { dateRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: "Background, experience, and how to get in touch.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About",
    description: "Background, experience, and how to get in touch.",
    type: "profile",
    url: "/about",
  },
};

export default async function AboutPage() {
  const [settings, experience, projects] = await Promise.all([
    getSettings(),
    getExperience(),
    getProjects(),
  ]);

  const featured = projects.filter((p) => p.featured);
  // Derived from the projects, so the list can never claim a tool that
  // appears nowhere on the site.
  const stack = [...new Set(projects.flatMap((project) => project.tech))].slice(0, 24);
  const education = settings.education ?? [];

  return (
    <PageFrame settings={settings} featured={featured}>
      <PageHero title="About." lead={settings.tagline || undefined}>
        {settings.resume_media && (
          <Button href={settings.resume_media.url} variant="ghost" external>
            Download CV
          </Button>
        )}
      </PageHero>

      <section className="grid gap-10 pt-10 sm:pt-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Markdown>{settings.bio_md}</Markdown>
        </div>

        <div className="lg:col-span-5">
          {settings.avatar && (
            <img
              src={settings.avatar.url}
              srcSet={settings.avatar.srcset}
              sizes="(min-width: 64rem) 20rem, 90vw"
              alt={settings.name ? `Portrait of ${settings.name}` : "Portrait"}
              className="w-full rounded-[var(--r-md)] border border-line object-cover"
            />
          )}

          {education.length > 0 && (
            <dl className={`divide-y divide-line border-y border-line ${settings.avatar ? "mt-8" : ""}`}>
              {education.map((entry) => (
                <div key={`${entry.degree}-${entry.school}`} className="py-4">
                  <dt className="text-small font-semibold text-ink">
                    {entry.degree}
                    {entry.status && (
                      <span className="ml-2 font-mono text-micro font-normal text-amber">{entry.status}</span>
                    )}
                  </dt>
                  <dd className="mt-0.5 text-small text-ink-soft">{entry.school}</dd>
                  {entry.years && (
                    <dd className="mt-0.5 font-mono text-micro text-ink-faint">
                      <ToConfirm text={entry.years} />
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {experience.length > 0 && (
        <section className="rule">
          <SectionHeading title="Where I have worked." />
          <ol className="divide-y divide-line border-y border-line">
            {experience.map((entry) => (
              <li key={entry.id} className="grid gap-3 py-6 sm:grid-cols-12 sm:gap-6 sm:py-7">
                <p className="font-mono text-micro text-ink-soft sm:col-span-3 sm:pt-1">
                  {dateRange(entry.start_date, entry.end_date)}
                </p>
                <div className="sm:col-span-9">
                  <h3 className="text-h4 font-bold tracking-tight text-ink">{entry.role}</h3>
                  <p className="mt-1 text-small text-ink-soft">
                    {entry.company}
                    {entry.location && `, ${entry.location}`}
                  </p>
                  {entry.summary && (
                    <p className="mt-3 max-w-[64ch] text-small text-ink-soft">
                      <ToConfirm text={entry.summary} />
                    </p>
                  )}
                  {entry.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {entry.highlights.map((highlight, position) => (
                        <li key={position} className="text-small text-ink-soft">
                          <ToConfirm text={highlight} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {stack.length > 0 && (
        <section className="rule">
          <SectionHeading title="What I build with." lead="Pulled from the projects on this site, so it stays honest." />
          <p className="font-mono text-small leading-loose text-ink-soft">{stack.join("  ·  ")}</p>
        </section>
      )}
    </PageFrame>
  );
}
