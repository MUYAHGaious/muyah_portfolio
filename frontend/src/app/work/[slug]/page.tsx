import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/Markdown";
import { getProject, getProjects } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return { title: "Not found" };

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.cover_image ? [project.cover_image.url] : undefined,
    },
  };
}

/** Only the link kinds the design accounts for, in a fixed order. */
const LINK_LABELS: Record<string, string> = {
  live: "Visit site",
  repo: "Source code",
};

export default async function ProjectPage({ params }: Params) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  const links = Object.entries(project.links).filter(([, url]) => url);

  return (
    <article className="page-shell pt-16 pb-20 sm:pt-24">
      <header className="grid-field">
        <div className="col-span-12 sm:col-span-8">
          <p className="label-micro">{project.year ?? "Undated"}</p>
          <h1 className="mt-3 text-h2 font-semibold">{project.title}</h1>
          {project.summary && (
            <p className="mt-4 text-lead text-muted max-w-[42ch]">{project.summary}</p>
          )}
        </div>

        <dl className="col-span-12 sm:col-span-3 sm:col-start-10 mt-8 sm:mt-0 text-small">
          {project.role && (
            <>
              <dt className="label-micro">Role</dt>
              <dd className="mt-1 mb-4">{project.role}</dd>
            </>
          )}
          {project.tech.length > 0 && (
            <>
              <dt className="label-micro">Built with</dt>
              <dd className="mt-1 mb-4">{project.tech.join(", ")}</dd>
            </>
          )}
          {links.length > 0 && (
            <>
              <dt className="label-micro">Links</dt>
              <dd className="mt-1 flex flex-col gap-1">
                {links.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-signal transition-colors duration-150"
                  >
                    {LINK_LABELS[key] ?? key}
                  </a>
                ))}
              </dd>
            </>
          )}
        </dl>
      </header>

      {project.cover_image && (
        <figure className="mt-12">
          <img
            src={project.cover_image.url}
            srcSet={project.cover_image.srcset}
            sizes="(min-width: 80rem) 78rem, 100vw"
            alt={project.cover_image.alt_text}
            width={project.cover_image.width}
            height={project.cover_image.height}
            className="w-full h-auto"
          />
        </figure>
      )}

      <div className="rule-top mt-12 pt-12 grid-field">
        <div className="col-span-12 sm:col-span-8 sm:col-start-4">
          <Markdown>{project.body_md}</Markdown>
        </div>
      </div>

      <p className="rule-top mt-16 pt-6">
        <Link
          href="/work"
          className="text-small text-muted hover:text-signal transition-colors duration-150"
        >
          ← All work
        </Link>
      </p>
    </article>
  );
}
