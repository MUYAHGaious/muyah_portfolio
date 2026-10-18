import Link from "next/link";

import { ProjectRows } from "@/components/ProjectRows";
import { SectionHeading } from "@/components/SectionHeading";
import { TalkbackReplay } from "@/components/demo/TalkbackReplay";
import { FlagshipBlock, PipelineList } from "@/components/home/FlagshipBlock";
import { IdentityRail } from "@/components/home/IdentityRail";
import { ServicesSection } from "@/components/home/ServicesSection";
import { NetworkBench } from "@/components/network/NetworkBench";
import { getPosts, getProjects, getServices, getSettings } from "@/lib/api";
import { fullDate } from "@/lib/format";

/**
 * The home page is a lab bench: who Muyah is on the left (sticky), the
 * instruments and the work on the right. Hairlines between sections, no
 * panels, nothing hidden until scrolled to.
 */
export default async function HomePage() {
  const [settings, projects, posts, services] = await Promise.all([
    getSettings(),
    getProjects(),
    getPosts(1),
    getServices(),
  ]);

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const recent = posts.items.slice(0, 3);

  const sections = [
    { id: "network", label: "The network" },
    ...(featured.length > 0 ? [{ id: "leading", label: "What I lead" }] : []),
    ...(rest.length > 0 ? [{ id: "work", label: "Also built" }] : []),
    ...(services.length > 0 ? [{ id: "services", label: "How I can help" }] : []),
    ...(recent.length > 0 ? [{ id: "writing", label: "Notes" }] : []),
  ];

  return (
    <div className="shell pt-8 sm:pt-12 lg:pt-16">
      <div className="bench">
        <IdentityRail settings={settings} featured={featured} sections={sections} />

        <div className="bench-main">
          <section id="network" className="scroll-mt-24">
            <NetworkBench />
          </section>

          {featured.length > 0 && (
            <section id="leading" className="rule scroll-mt-24">
              <SectionHeading title="What I lead." />
              <div className="space-y-14 lg:space-y-20">
                {featured.map((project, index) => (
                  <FlagshipBlock
                    key={project.id}
                    project={project}
                    flip={index % 2 === 1}
                    visual={project.slug === "malegado" ? <TalkbackReplay /> : <PipelineList project={project} />}
                  />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section id="work" className="rule scroll-mt-24">
              <SectionHeading
                title="Also built."
                lead={`${projects.length} projects in all, from a CLI coding agent to a biometric verifier.`}
                link={{ href: "/work", label: "All work" }}
              />
              <ProjectRows projects={rest.slice(0, 7)} />
            </section>
          )}

          {services.length > 0 && (
            <section id="services" className="rule scroll-mt-24">
              <SectionHeading title="How I can help." link={{ href: "/services", label: "Details" }} />
              <ServicesSection services={services.slice(0, 3)} showPoints={false} />
            </section>
          )}

          {recent.length > 0 && (
            <section id="writing" className="rule scroll-mt-24">
              <SectionHeading title="Notes." link={{ href: "/writing", label: "All writing" }} />
              <ul className="divide-y divide-line border-y border-line">
                {recent.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/writing/${post.slug}`}
                      className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    >
                      <span className="min-w-0">
                        <span className="block text-h4 font-bold tracking-tight text-ink group-hover:text-ember-deep">
                          {post.title}
                        </span>
                        {post.excerpt && (
                          <span className="mt-1 line-clamp-2 block text-small text-ink-soft">{post.excerpt}</span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-micro text-ink-faint">
                        {post.published_at ? fullDate(post.published_at) : "Draft"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
