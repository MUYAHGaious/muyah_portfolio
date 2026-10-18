import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { PageFrame } from "@/components/PageFrame";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { getProjects, getServices, getSettings } from "@/lib/api";
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
  const [services, settings, projects] = await Promise.all([getServices(), getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);

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
      <PageFrame settings={settings} featured={featured}>
        <PageHero title="How I can help." lead="What I take on, how the work runs, and what you get at the end.">
          <Button href="/contact" variant="ember">
            Start a conversation
          </Button>
        </PageHero>

        {services.length === 0 ? (
          <p className="mt-10 border-y border-line py-8 text-small text-ink-soft">
            No services listed yet. Add them from the admin panel and they will show up here.
          </p>
        ) : (
          <ol className="divide-y divide-line">
            {services.map((service, index) => (
              <li key={service.id} className="grid gap-5 py-10 sm:py-12 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-4">
                  <p className="font-mono text-micro text-ink-faint">{String(index + 1).padStart(2, "0")}</p>
                  <h2 className="mt-2 text-h3 font-bold tracking-tight text-ink">{service.title}</h2>
                  {service.blurb && <p className="mt-2 text-small text-ink-soft">{service.blurb}</p>}
                </div>
                <div className="lg:col-span-8">
                  {service.body_md && <Markdown>{service.body_md}</Markdown>}
                  {service.points.length > 0 && (
                    <ul className="mt-5 grid gap-x-8 gap-y-2 border-t border-line pt-5 sm:grid-cols-2">
                      {service.points.map((point) => (
                        <li key={point} className="text-small text-ink-soft">
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </PageFrame>
    </>
  );
}
