import type { Metadata } from "next";

import { Markdown } from "@/components/Markdown";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ToConfirm } from "@/components/ToConfirm";
import { Reveal } from "@/components/motion/Reveal";
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

  // Derived from the projects, so the list can never claim a tool that
  // appears nowhere on the site.
  const stack = [...new Set(projects.flatMap((project) => project.tech))].slice(0, 24);
  const education = settings.education ?? [];

  return (
    <>
      <PageHero
        eyebrow={settings.title || "about"}
        title={settings.name}
        lead={settings.tagline || undefined}
      >
        {settings.resume_media && (
          <Button href={settings.resume_media.url} variant="ghost" external>
            Download CV
          </Button>
        )}
      </PageHero>

      <section className="shell pt-12 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Markdown>{settings.bio_md}</Markdown>
          </Reveal>

          <div className="space-y-8 lg:col-span-5">
            {settings.avatar && (
              <Reveal>
                <img
                  src={settings.avatar.url}
                  srcSet={settings.avatar.srcset}
                  sizes="(min-width: 64rem) 28rem, 90vw"
                  alt={settings.name ? `Portrait of ${settings.name}` : "Portrait"}
                  className="w-full rounded-[var(--r-lg)] border border-line object-cover"
                />
              </Reveal>
            )}

            {education.length > 0 && (
              <Reveal delay={80}>
                <p className="readout">education</p>
                <ul className="mt-4 divide-y divide-line rounded-[var(--r-lg)] border border-line">
                  {education.map((entry) => (
                    <li key={`${entry.degree}-${entry.school}`} className="px-5 py-4">
                      <p className="text-small font-semibold text-ink">
                        {entry.degree}
                        {entry.status && (
                          <span className="ml-2 font-mono text-micro font-normal text-amber">
                            {entry.status}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-small text-ink-soft">{entry.school}</p>
                      {entry.years && (
                        <p className="mt-0.5 font-mono text-micro text-ink-faint">
                          <ToConfirm text={entry.years} />
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {experience.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading eyebrow={`experience · ${experience.length} roles`} title="Where I have worked." />

          <ol className="divide-y divide-line border-y border-line">
            {experience.map((entry, index) => (
              <Reveal as="li" key={entry.id} delay={index * 70} className="py-7 sm:py-9">
                <article className="grid gap-4 sm:grid-cols-12 sm:gap-6">
                  <p className="font-mono text-micro text-ink-soft sm:col-span-3">
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
                      <ul className="mt-4 space-y-2">
                        {entry.highlights.map((highlight, position) => (
                          <li key={position} className="flex items-start gap-2.5 text-small text-ink-soft">
                            <span
                              aria-hidden="true"
                              className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                            />
                            <ToConfirm text={highlight} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {stack.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow={`toolkit · ${stack.length}`}
            title="What I build with."
            lead="Pulled from the projects on this site, so it stays honest."
          />
          <Reveal>
            <ul className="flex flex-wrap gap-2">
              {stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-line px-3.5 py-1.5 font-mono text-micro text-ink-soft"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}
    </>
  );
}
