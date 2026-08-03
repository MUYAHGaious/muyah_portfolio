import type { Metadata } from "next";

import { Markdown } from "@/components/Markdown";
import { getExperience, getSettings } from "@/lib/api";
import { dateRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: "Background, experience, and how to get in touch.",
};

export default async function AboutPage() {
  const [settings, experience] = await Promise.all([getSettings(), getExperience()]);

  return (
    <section className="page-shell pt-16 pb-20 sm:pt-24">
      <div className="grid-field">
        <h1 className="col-span-12 sm:col-span-3 text-h2 font-semibold">About</h1>
        <div className="col-span-12 sm:col-span-8 sm:col-start-5 mt-6 sm:mt-0">
          <Markdown>{settings.bio_md}</Markdown>

          {settings.resume_media && (
            <p className="mt-8">
              <a
                href={settings.resume_media.url}
                download
                className="text-small underline underline-offset-4 hover:text-signal transition-colors duration-150"
              >
                Download CV (PDF)
              </a>
            </p>
          )}
        </div>
      </div>

      {experience.length > 0 && (
        <div className="mt-24">
          <h2 className="label-micro mb-6">Experience</h2>

          <ol className="rule-top">
            {experience.map((entry) => (
              <li key={entry.id} className="rule-bottom grid-field py-8">
                <p className="col-span-12 sm:col-span-3 text-small text-muted">
                  {dateRange(entry.start_date, entry.end_date)}
                </p>

                <div className="col-span-12 sm:col-span-8 sm:col-start-5 mt-2 sm:mt-0">
                  <h3 className="text-h3 font-semibold">{entry.role}</h3>
                  <p className="mt-1 text-small text-muted">
                    {entry.company}
                    {entry.location && ` · ${entry.location}`}
                  </p>

                  {entry.summary && <p className="mt-3 max-w-[46ch]">{entry.summary}</p>}

                  {entry.highlights.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {entry.highlights.map((highlight, index) => (
                        <li key={index} className="relative pl-6 text-small">
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-[0.7em] block h-px w-3 bg-rule"
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
