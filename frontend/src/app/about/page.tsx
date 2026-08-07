import type { Metadata } from "next";

import { Markdown } from "@/components/Markdown";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { IconCloud } from "@/components/ui/interactive-icon-cloud";
import { getExperience, getProjects, getSettings } from "@/lib/api";
import { dateRange } from "@/lib/format";
import { slugsForTech } from "@/lib/tech-icons";

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

  // The stack is derived from what the projects actually use, so it can never
  // drift from reality or claim a technology that appears nowhere.
  const stack = [...new Set(projects.flatMap((project) => project.tech))].slice(0, 24);
  const iconSlugs = slugsForTech(projects.map((project) => project.tech));

  return (
    <>
      <PageHero eyebrow="About" title="A bit of background." lead={settings.tagline || undefined}>
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

          {settings.avatar && (
            <div className="lg:col-span-5">
              <Parallax speed={0.06}>
                <img
                  src={settings.avatar.url}
                  srcSet={settings.avatar.srcset}
                  sizes="(min-width: 64rem) 28rem, 90vw"
                  alt={settings.name ? `Portrait of ${settings.name}` : "Portrait"}
                  className="w-full rounded-[var(--r-lg)] object-cover shadow-card"
                />
              </Parallax>
            </div>
          )}
        </div>
      </section>

      {stack.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow="Toolkit"
            title="What I build with."
            lead="Pulled from the projects on this site, so it stays honest."
          />

          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-5">
              <div className="card relative overflow-hidden p-2">
                <div aria-hidden="true" className="glow -right-20 -top-20 h-56 w-56 opacity-40" />
                <div className="relative">
                  <IconCloud iconSlugs={iconSlugs} />
                </div>
              </div>
            </Reveal>

            {/* The names stay, in text. The cloud is a canvas: it is not
                selectable, not searchable, and not readable by a screen
                reader, so it cannot be the only place the stack is listed. */}
            <Reveal className="lg:col-span-7" delay={120}>
              <ul className="flex flex-wrap gap-2.5">
                {stack.map((tech) => (
                  <li
                    key={tech}
                    className="card px-4 py-2.5 text-small font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading eyebrow="Experience" title="Where I've worked." />

          <ol className="relative grid gap-4">
            {experience.map((entry, index) => (
              <Reveal as="li" key={entry.id} delay={index * 80}>
                <article className="card p-6 sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-12 sm:gap-6">
                    <p className="text-small font-medium text-ember-deep sm:col-span-4">
                      {dateRange(entry.start_date, entry.end_date)}
                    </p>

                    <div className="sm:col-span-8">
                      <h3 className="text-h4 font-bold tracking-tight text-ink">{entry.role}</h3>
                      <p className="mt-1 text-small text-ink-soft">
                        {entry.company}
                        {entry.location && ` · ${entry.location}`}
                      </p>

                      {entry.summary && (
                        <p className="mt-3 text-small text-ink-soft">{entry.summary}</p>
                      )}

                      {entry.highlights.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {entry.highlights.map((highlight, position) => (
                            <li
                              key={position}
                              className="flex items-start gap-2.5 text-small text-ink-soft"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                              />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
