import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getProject, getProjects, getSettings } from "@/lib/api";
import { absolute, breadcrumbSchema, graph, projectSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProject((await params).slug);
  // A missing project must not be indexable — otherwise every mistyped URL
  // becomes a thin page competing with the real ones.
  if (!project) return { title: "Not found", robots: { index: false, follow: false } };

  const path = `/work/${project.slug}`;
  const images = project.cover_image
    ? [
        {
          url: absolute(project.cover_image.url),
          width: project.cover_image.width,
          height: project.cover_image.height,
          alt: project.cover_image.alt_text || project.title,
        },
      ]
    : undefined;

  return {
    title: project.title,
    description: project.summary,
    ...(project.tech.length > 0 && { keywords: project.tech }),
    alternates: { canonical: path },
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      url: absolute(path),
      publishedTime: project.created_at,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      ...(images && { images: images.map((image) => image.url) }),
    },
  };
}

const LINK_LABELS: Record<string, string> = { live: "Visit site", repo: "Source code" };

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [project, all, settings] = await Promise.all([
    getProject(slug),
    getProjects(),
    getSettings(),
  ]);
  if (!project) notFound();

  const links = Object.entries(project.links).filter(([, url]) => url);
  const others = all.filter((item) => item.slug !== project.slug).slice(0, 3);

  return (
    <article>
      <JsonLd
        data={graph(
          projectSchema(project, settings),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        )}
      />
      <section className="shell pt-3">
        <div className="panel relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
          <div aria-hidden="true" className="glow -top-24 right-0 h-80 w-80" />

          <div className="relative grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5 animate-rise">
                {project.year && (
                  <span className="rounded-full bg-surface-2 px-3 py-1 text-micro font-semibold text-ink-soft">
                    {project.year}
                  </span>
                )}
                {project.category && (
                  <span className="rounded-full bg-ember/15 px-3 py-1 text-micro font-semibold text-ember-deep">
                    {project.category}
                  </span>
                )}
              </div>

              <h1
                className="mt-4 text-h1 font-bold tracking-tight text-ink animate-rise"
                style={{ animationDelay: "100ms", fontSize: "clamp(2.25rem, 5vw, 4.25rem)" }}
              >
                {project.title}
              </h1>

              {project.summary && (
                <p
                  className="mt-4 max-w-[52ch] text-lead text-ink-soft animate-rise"
                  style={{ animationDelay: "180ms" }}
                >
                  {project.summary}
                </p>
              )}

              {links.length > 0 && (
                <div
                  className="mt-7 flex flex-wrap gap-3 animate-rise"
                  style={{ animationDelay: "260ms" }}
                >
                  {links.map(([key, url]) => (
                    <Button
                      key={key}
                      href={url}
                      external
                      variant={key === "live" ? "ember" : "ghost"}
                    >
                      {LINK_LABELS[key] ?? key}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <dl
              className="lg:col-span-4 lg:col-start-9 animate-rise"
              style={{ animationDelay: "320ms" }}
            >
              {project.role && (
                <div className="border-b border-line pb-4">
                  <dt className="eyebrow">Role</dt>
                  <dd className="mt-1.5 text-small text-ink">{project.role}</dd>
                </div>
              )}
              {project.tech.length > 0 && (
                <div className="pt-4">
                  <dt className="eyebrow">Built with</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-surface-2 px-2.5 py-1 text-micro normal-case tracking-normal text-ink-soft"
                      >
                        {tech}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {project.cover_image && (
        <section className="shell pt-6 sm:pt-8">
          <Reveal>
            <div className="overflow-hidden rounded-[var(--r-lg)] shadow-card">
              <Parallax speed={0.05}>
                <img
                  src={project.cover_image.url}
                  srcSet={project.cover_image.srcset}
                  sizes="(min-width: 82rem) 76rem, 95vw"
                  alt={project.cover_image.alt_text}
                  width={project.cover_image.width}
                  height={project.cover_image.height}
                  className="w-full"
                />
              </Parallax>
            </div>
          </Reveal>
        </section>
      )}

      {project.body_md && (
        <section className="shell pt-14 sm:pt-20">
          <Reveal className="mx-auto max-w-3xl">
            <Markdown>{project.body_md}</Markdown>
          </Reveal>
        </section>
      )}

      {others.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <Reveal className="mb-8">
            <p className="eyebrow">Next</p>
            <h2 className="mt-2 text-h2 font-bold tracking-tight text-ink">More work.</h2>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-3">
            {others.map((other, index) => (
              <Reveal as="li" key={other.id} delay={index * 90}>
                <Link
                  href={`/work/${other.slug}`}
                  className="card card-lift group flex h-full flex-col justify-between gap-4 p-6"
                >
                  <span className="text-h4 font-bold tracking-tight text-ink">{other.title}</span>
                  <span className="inline-flex items-center gap-1.5 text-small font-semibold text-ember-deep">
                    View
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
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
    </article>
  );
}
