import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getServices, getSettings } from "@/lib/api";
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
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

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
        eyebrow={`services · ${services.length}`}
        title="How I can help."
        lead="What I take on, how the work runs, and what you get at the end."
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
              Add them from the admin panel and they will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {services.map((service, index) => (
              <Reveal as="li" key={service.id} delay={index * 80} className="py-10 first:pt-0 sm:py-14">
                <article className="grid gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <h2 className="text-h3 font-bold tracking-tight text-ink">{service.title}</h2>
                    {service.blurb && <p className="mt-2 text-small text-ink-soft">{service.blurb}</p>}
                  </div>

                  <div className="lg:col-span-8">
                    {service.body_md && <Markdown>{service.body_md}</Markdown>}

                    {service.points.length > 0 && (
                      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                        {service.points.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-small text-ink-soft">
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
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
