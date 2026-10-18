import Link from "next/link";

import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { TalkbackReplay } from "@/components/demo/TalkbackReplay";
import { FlagshipCard, PipelineSketch } from "@/components/home/FlagshipCard";
import { Hero } from "@/components/home/Hero";
import { ReadoutStrip } from "@/components/home/ReadoutStrip";
import { ServicesSection } from "@/components/home/ServicesSection";
import { Reveal } from "@/components/motion/Reveal";
import { getPosts, getProjects, getServices, getSettings } from "@/lib/api";
import { fullDate } from "@/lib/format";

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

  return (
    <>
      <Hero settings={settings} />

      <ReadoutStrip stats={settings.stats ?? []} />

      {featured.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow={`flagship · ${featured.length} ${featured.length === 1 ? "product" : "products"}`}
            title="The work I lead."
          />
          <div className="space-y-6">
            {featured.map((project, index) => (
              <FlagshipCard
                key={project.id}
                project={project}
                flip={index % 2 === 1}
                visual={
                  project.slug === "malegado" ? (
                    <TalkbackReplay />
                  ) : (
                    <PipelineSketch project={project} />
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow={`work · ${projects.length} projects`}
            title="Built with my own hands."
            link={{ href: "/work", label: "All work" }}
          />
          <ProjectGrid projects={rest.slice(0, 6)} />
        </section>
      )}

      {services.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow={`services · ${services.length}`}
            title="How I can help."
            link={{ href: "/services", label: "Details" }}
          />
          <ServicesSection services={services.slice(0, 3)} showPoints={false} />
        </section>
      )}

      {recent.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow={`writing · ${posts.total}`}
            title="Notes."
            link={{ href: "/writing", label: "All writing" }}
          />
          <ul className="divide-y divide-line border-y border-line">
            {recent.map((post, index) => (
              <Reveal as="li" key={post.id} delay={index * 70}>
                <Link
                  href={`/writing/${post.slug}`}
                  className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="min-w-0">
                    <span className="block text-h4 font-bold tracking-tight text-ink group-hover:text-ember">
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <span className="mt-1 line-clamp-2 block text-small text-ink-soft">
                        {post.excerpt}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-micro text-ink-faint">
                    {post.published_at ? fullDate(post.published_at) : "Draft"}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
