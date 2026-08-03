import Link from "next/link";

import { Markdown } from "@/components/Markdown";
import { WorkIndex } from "@/components/WorkIndex";
import { getPosts, getProjects, getSettings } from "@/lib/api";
import { fullDate } from "@/lib/format";

const FEATURED_COUNT = 4;

export default async function HomePage() {
  const [settings, projects, posts] = await Promise.all([
    getSettings(),
    getProjects(),
    getPosts(1),
  ]);

  const featured = projects.slice(0, FEATURED_COUNT);
  const recent = posts.items.slice(0, 3);

  return (
    <>
      {/* Hero. The name at poster scale is the thesis: this is a person, not a
          product. The colophon rule beneath it carries the only facts that
          matter above the fold. */}
      <section className="page-shell pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="animate-rise">
          <h1 className="text-h1 font-semibold max-w-[14ch]">
            {settings.name || "Your name"}
          </h1>

          {settings.tagline && (
            <p className="mt-6 text-lead max-w-[34ch] text-muted">{settings.tagline}</p>
          )}
        </div>

        {/* A colophon rule, not a stats row. Counts are only shown when they are
            non-zero — "Writing: 0" is not a fact worth leading with. */}
        <dl className="rule-top mt-12 grid-field py-4 text-small">
          {settings.location && (
            <div className="col-span-6 sm:col-span-3">
              <dt className="label-micro">Based in</dt>
              <dd className="mt-1">{settings.location}</dd>
            </div>
          )}
          {projects.length > 0 && (
            <div className="col-span-6 sm:col-span-3">
              <dt className="label-micro">Selected work</dt>
              <dd className="mt-1">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </dd>
            </div>
          )}
          {posts.total > 0 && (
            <div className="col-span-6 sm:col-span-3 mt-4 sm:mt-0">
              <dt className="label-micro">Writing</dt>
              <dd className="mt-1">
                {posts.total} {posts.total === 1 ? "post" : "posts"}
              </dd>
            </div>
          )}
          <div className="col-span-6 sm:col-span-3 mt-4 sm:mt-0">
            <dt className="label-micro">Contact</dt>
            <dd className="mt-1">
              <Link href="/contact" className="hover:text-signal transition-colors duration-150">
                Get in touch
              </Link>
            </dd>
          </div>
        </dl>
      </section>

      <section className="page-shell pb-20 sm:pb-28">
        <div className="grid-field mb-6">
          <h2 className="col-span-6 label-micro">Selected work</h2>
          <p className="col-span-6 text-right">
            <Link
              href="/work"
              className="text-small text-muted hover:text-signal transition-colors duration-150"
            >
              All work →
            </Link>
          </p>
        </div>

        <WorkIndex projects={featured} />
      </section>

      {settings.bio_md && (
        <section className="page-shell pb-20 sm:pb-28">
          <div className="grid-field">
            <h2 className="col-span-12 sm:col-span-3 label-micro">About</h2>
            <div className="col-span-12 sm:col-span-8 sm:col-start-5 mt-4 sm:mt-0">
              <Markdown>{settings.bio_md}</Markdown>
              <p className="mt-6">
                <Link
                  href="/about"
                  className="text-small text-muted hover:text-signal transition-colors duration-150"
                >
                  More about me →
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="page-shell pb-8">
          <div className="grid-field mb-6">
            <h2 className="col-span-6 label-micro">Recent writing</h2>
            <p className="col-span-6 text-right">
              <Link
                href="/writing"
                className="text-small text-muted hover:text-signal transition-colors duration-150"
              >
                All writing →
              </Link>
            </p>
          </div>

          <ul className="rule-top">
            {recent.map((post) => (
              <li key={post.id} className="rule-bottom">
                <Link
                  href={`/writing/${post.slug}`}
                  className="group grid grid-cols-12 items-baseline gap-x-4 py-5 transition-colors duration-150 hover:text-signal"
                >
                  <span className="col-span-3 sm:col-span-2 text-small text-muted group-hover:text-signal transition-colors duration-150">
                    {post.published_at ? fullDate(post.published_at) : "Draft"}
                  </span>
                  <span className="col-span-9 sm:col-span-10 text-h3 font-semibold">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
