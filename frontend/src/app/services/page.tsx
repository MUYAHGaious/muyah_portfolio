import type { Metadata } from "next";

import { Markdown } from "@/components/Markdown";
import { PageHero } from "@/components/PageHero";
import { Testimonials } from "@/components/home/Testimonials";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";
import { getServices, getSettings, getTestimonials } from "@/lib/api";
import { breadcrumbSchema, graph, servicesSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description: "What I take on, and what working together looks like.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services",
    description: "What I take on, and what working together looks like.",
    type: "website",
    url: "/services",
  },
};

export default async function ServicesPage() {
  const [services, testimonials, settings] = await Promise.all([
    getServices(),
    getTestimonials(),
    getSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={graph(
          servicesSchema(services, settings),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        )}
      />
      <PageHero
        eyebrow="Services"
        title="How I can help."
        lead="What I take on, how the process runs, and what you get at the end."
      >
        <Button href="/contact" variant="ember">
          Start a conversation
        </Button>
      </PageHero>

      <section className="shell pt-12 sm:pt-16">
        {services.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-h4 font-semibold text-ink">No services listed yet</p>
            <p className="mt-2 text-small text-ink-soft">
              Add them from the admin panel and they&apos;ll show up here and in the hero.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5">
            {services.map((service, index) => (
              <Reveal as="li" key={service.id} delay={index * 80}>
                <article className="card relative overflow-hidden p-6 sm:p-9">
                  <div aria-hidden="true" className="glow -right-24 -top-24 h-56 w-56 opacity-30" />

                  <div className="relative grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ember/15 text-small font-bold text-ember-deep">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="mt-4 text-h3 font-bold tracking-tight text-ink">
                        {service.title}
                      </h2>
                      {service.blurb && (
                        <p className="mt-2 text-small text-ink-soft">{service.blurb}</p>
                      )}
                    </div>

                    <div className="lg:col-span-8">
                      {service.body_md && <Markdown>{service.body_md}</Markdown>}

                      {service.points.length > 0 && (
                        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                          {service.points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-2.5 rounded-[var(--r-sm)] bg-surface-2 px-4 py-3 text-small text-ink-soft"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                              />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      {testimonials.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading eyebrow="Testimonials" title="What people say." />
          <Testimonials testimonials={testimonials} />
        </section>
      )}
    </>
  );
}
