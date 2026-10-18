import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { PageFrame } from "@/components/PageFrame";
import { PageHero } from "@/components/PageHero";
import { getProjects, getSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about work or collaboration.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact",
    description: "Get in touch about work or collaboration.",
    type: "website",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);

  return (
    <PageFrame settings={settings} featured={featured}>
      <PageHero
        title="Let's talk."
        lead="Tell me what you're working on and what you need. I read everything that comes through here."
      />

      <section className="grid gap-10 pt-10 sm:pt-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <dl className="divide-y divide-line border-y border-line text-small">
            <div className="py-4">
              <dt className="font-mono text-micro text-ink-faint">Direct</dt>
              <dd className="mt-1">
                {settings.email ? (
                  <a
                    href={`mailto:${settings.email}`}
                    className="break-all font-semibold text-ink transition-colors hover:text-ember-deep"
                  >
                    {settings.email}
                  </a>
                ) : (
                  <span className="text-ink-soft">Add an address in Settings.</span>
                )}
              </dd>
            </div>
            {settings.location && (
              <div className="py-4">
                <dt className="font-mono text-micro text-ink-faint">Based in</dt>
                <dd className="mt-1 text-ink">{settings.location}</dd>
              </div>
            )}
            {settings.socials.length > 0 && (
              <div className="py-4">
                <dt className="font-mono text-micro text-ink-faint">Elsewhere</dt>
                <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {settings.socials.map((social) => (
                    <a
                      key={`${social.label}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="me noopener noreferrer"
                      className="text-ink-soft underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink"
                    >
                      {social.label}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="lg:col-span-8">
          <ContactForm />
        </div>
      </section>
    </PageFrame>
  );
}
