import Link from "next/link";

import { Markdown } from "@/components/Markdown";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { Testimonials } from "@/components/home/Testimonials";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { getPosts, getProjects, getServices, getSettings, getTestimonials } from "@/lib/api";
import { fullDate } from "@/lib/format";

const FEATURED = 6;

export default async function HomePage() {
  const [settings, projects, posts, services, testimonials] = await Promise.all([
    getSettings(),
    getProjects(),
    getPosts(1),
    getServices(),
    getTestimonials(),
  ]);

  const recent = posts.items.slice(0, 3);

  return (
    <>
      <Hero settings={settings} services={services} projectCount={projects.length} />

      {projects.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow="Selected work"
            title="Things I've designed and built."
            link={{ href: "/work", label: "All work" }}
          />
          <ProjectGrid projects={projects.slice(0, FEATURED)} />
        </section>
      )}

      {services.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow="Services"
            title="How I can help."
            lead="What I take on, and what working together looks like."
            link={{ href: "/services", label: "Details" }}
          />
          <ServicesSection services={services.slice(0, 3)} />
        </section>
      )}

      {settings.bio_md && (
        <section className="shell pt-20 sm:pt-28">
          <div className="panel relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
            <div aria-hidden="true" className="glow -left-20 top-1/2 h-72 w-72 -translate-y-1/2" />

            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
              <Reveal className="lg:col-span-5">
                <p className="eyebrow">About me</p>
                <h2 className="mt-2 text-h2 font-bold tracking-tight text-ink">
                  A bit of background.
                </h2>
                <Link
                  href="/about"
                  className="group mt-6 inline-flex items-center gap-1.5 text-small font-semibold text-ember-deep"
                >
                  Read more
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </Reveal>

              <Reveal className="lg:col-span-7" delay={120}>
                <Markdown>{settings.bio_md}</Markdown>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading eyebrow="Testimonials" title="What people say." />
          <Testimonials testimonials={testimonials.slice(0, 3)} />
        </section>
      )}

      {recent.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <SectionHeading
            eyebrow="Writing"
            title="Notes and longer pieces."
            link={{ href: "/writing", label: "All writing" }}
          />

          <ul className="grid gap-4">
            {recent.map((post, index) => (
              <Reveal as="li" key={post.id} delay={index * 90}>
                <Link
                  href={`/writing/${post.slug}`}
                  className="card card-lift group flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <span className="min-w-0">
                    <span className="block text-h4 font-bold tracking-tight text-ink">
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <span className="mt-1.5 line-clamp-2 block text-small text-ink-soft">
                        {post.excerpt}
                      </span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-4">
                    <span className="text-micro normal-case tracking-normal text-ink-faint">
                      {post.published_at ? fullDate(post.published_at) : "Draft"}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-ember-deep transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* A slow-moving band of warm light: the parallax layer, purely decorative. */}
      <div aria-hidden="true" className="relative h-24 overflow-hidden sm:h-32">
        <Parallax speed={0.22} className="absolute inset-x-0 top-0 flex justify-center">
          <div className="glow h-56 w-[36rem] opacity-40" />
        </Parallax>
      </div>
    </>
  );
}
