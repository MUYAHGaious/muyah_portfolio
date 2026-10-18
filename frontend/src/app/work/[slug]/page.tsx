import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { ToConfirm } from "@/components/ToConfirm";
import { PipelineDiagram } from "@/components/casestudy/PipelineDiagram";
import { TalkbackReplay } from "@/components/demo/TalkbackReplay";
import { Button } from "@/components/ui/Button";
import { getProject, getProjects, getSettings } from "@/lib/api";
import { absolute, breadcrumbSchema, graph, projectSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

// No generateStaticParams: the root layout sets `dynamic = "force-dynamic"`, so
// nothing is prerendered and this would only run at build time, inside `docker
// build`, where the API container does not exist.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProject((await params).slug);
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
    : [{ url: absolute("/opengraph-image"), width: 1200, height: 630, alt: project.title }];

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
      images: images.map((image) => image.url),
    },
  };
}

const LINK_LABELS: Record<string, string> = {
  live: "Visit the product",
  repo: "Source code",
  app_store: "App Store",
  play_store: "Google Play",
};

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
  const header = [project.year, project.title, project.role].filter(Boolean).join(" · ");

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

      <section className="shell pt-8 sm:pt-14">
        <div className="border-b border-line pb-10 sm:pb-14">
          <p className="font-mono text-micro text-ink-soft animate-rise">
            {header}
            {project.status === "in_build" && <span className="ml-3 text-amber">in build</span>}
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1
                className="text-h1 font-bold tracking-tight text-ink animate-rise"
                style={{ animationDelay: "100ms" }}
              >
                {project.highlight || project.title}
              </h1>

              {project.tldr && (
                <p
                  className="mt-6 max-w-[60ch] text-lead text-ink-soft animate-rise"
                  style={{ animationDelay: "180ms" }}
                >
                  <ToConfirm text={project.tldr} />
                </p>
              )}

              {links.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: "260ms" }}>
                  {links.map(([key, url]) => (
                    <Button key={key} href={url} external variant={key === "live" ? "ember" : "ghost"}>
                      {LINK_LABELS[key] ?? key}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <dl
              className="space-y-5 lg:col-span-3 lg:col-start-10 animate-rise"
              style={{ animationDelay: "320ms" }}
            >
              {project.team_size && (
                <div>
                  <dt className="font-mono text-micro text-ink-faint">team</dt>
                  <dd className="mt-1 text-small text-ink">{project.team_size} people</dd>
                </div>
              )}
              {project.tech.length > 0 && (
                <div>
                  <dt className="font-mono text-micro text-ink-faint">built with</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-line px-2.5 py-1 font-mono text-micro text-ink-soft"
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

      {project.metrics.length > 0 && (
        <section className="shell pt-10 sm:pt-14">
          <div>
            <dl className="grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <dd className="text-h3 font-bold tracking-tight text-ink">
                    <ToConfirm text={metric.value} />
                  </dd>
                  <dt className="mt-1 text-small text-ink-soft">{metric.label}</dt>
                  {metric.note && (
                    <p className="mt-1 text-micro text-ink-faint">
                      <ToConfirm text={metric.note} />
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {project.slug === "malegado" && (
        <section className="shell pt-10 sm:pt-14">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-h3 font-bold tracking-tight text-ink">
                Speak, and be answered out loud.
              </h2>
              <p className="mt-3 text-small text-ink-soft">
                A replay of a real exchange. The stage indicator shows which part of the
                loop is active: speech in, speech to text, the text model, text to speech.
              </p>
            </div>
            <div className="lg:col-span-7">
              <TalkbackReplay />
            </div>
          </div>
        </section>
      )}

      {project.pipeline.length > 0 && (
        <section className="shell pt-14 sm:pt-20">
          <div>
            <h2 className="text-h3 font-bold tracking-tight text-ink">
              The pipeline, in {project.pipeline.length} stages.
            </h2>
            <div className="mt-6">
              <PipelineDiagram stages={project.pipeline} />
            </div>
          </div>
        </section>
      )}

      {project.cover_image && (
        <section className="shell pt-10 sm:pt-14">
          <div>
            <img
              src={project.cover_image.url}
              srcSet={project.cover_image.srcset}
              sizes="(min-width: 82rem) 76rem, 95vw"
              alt={project.cover_image.alt_text}
              width={project.cover_image.width}
              height={project.cover_image.height}
              className="w-full rounded-[var(--r-lg)] border border-line"
            />
          </div>
        </section>
      )}

      {project.body_md && (
        <section className="shell pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl">
            <Markdown>{project.body_md}</Markdown>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="shell pt-20 sm:pt-28">
          <h2 className="mb-5 text-h3 font-bold tracking-tight text-ink">More work.</h2>
          <ul className="divide-y divide-line border-y border-line">
            {others.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/work/${other.slug}`}
                  className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="min-w-0">
                    <span className="block text-h4 font-bold tracking-tight text-ink group-hover:text-ember-deep">
                      {other.title}
                    </span>
                    {other.highlight && (
                      <span className="mt-1 block text-small text-ink-soft">{other.highlight}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-micro text-ink-faint">
                    {other.year}
                    {other.status === "in_build" && " · in build"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
