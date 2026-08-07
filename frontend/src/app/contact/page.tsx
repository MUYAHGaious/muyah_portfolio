import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { getSettings } from "@/lib/api";

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
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk."
        lead="Tell me what you're working on and what you need. I read everything that comes through here."
      />

      <section className="shell pt-12 sm:pt-16">
        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="card h-full p-6 sm:p-8">
              <p className="eyebrow">Direct</p>

              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-2 inline-flex min-h-11 items-center break-all text-h4 font-bold tracking-tight text-ink transition-colors hover:text-ember-deep"
                >
                  {settings.email}
                </a>
              ) : (
                <p className="mt-2 text-small text-ink-soft">Add an address in Settings.</p>
              )}

              {settings.location && (
                <>
                  <p className="eyebrow mt-8">Based in</p>
                  <p className="mt-2 text-small text-ink">{settings.location}</p>
                </>
              )}

              {settings.socials.length > 0 && (
                <>
                  <p className="eyebrow mt-8">Elsewhere</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {settings.socials.map((social) => (
                      <li key={`${social.label}-${social.url}`}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="me noopener noreferrer"
                          className="inline-block rounded-full border border-field px-4 py-2 text-small text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-ember hover:text-ember-deep"
                        >
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-8" delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
