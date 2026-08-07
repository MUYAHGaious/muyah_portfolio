import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getPost, getPosts, getSettings } from "@/lib/api";
import { fullDate } from "@/lib/format";
import { absolute, breadcrumbSchema, graph, postSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts(1);
  return posts.items.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Not found", robots: { index: false, follow: false } };

  const path = `/writing/${post.slug}`;
  const settings = await getSettings();

  return {
    title: post.title,
    description: post.excerpt,
    ...(post.tags.length > 0 && { keywords: post.tags }),
    alternates: { canonical: path },
    // An unpublished draft reachable by URL should never enter the index.
    ...(!post.published && { robots: { index: false, follow: false } }),
    authors: [{ name: settings.name, url: absolute("/about") }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: absolute(path),
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: [settings.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: Params) {
  const [post, settings] = await Promise.all([getPost((await params).slug), getSettings()]);
  if (!post) notFound();

  return (
    <article>
      <JsonLd
        data={graph(
          postSchema(post, settings),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Writing", path: "/writing" },
            { name: post.title, path: `/writing/${post.slug}` },
          ]),
        )}
      />
      <section className="shell pt-3">
        <div className="panel relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
          <div aria-hidden="true" className="glow -top-24 left-1/3 h-72 w-72" />

          <div className="relative mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 animate-rise">
              <span className="text-micro normal-case tracking-normal text-ink-faint">
                {post.published_at ? fullDate(post.published_at) : "Unpublished"}
              </span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/writing?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-ember/15 px-3 py-1 text-micro font-semibold text-ember-deep transition-opacity hover:opacity-75"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <h1
              className="mt-4 text-h2 font-bold tracking-tight text-ink animate-rise"
              style={{ animationDelay: "100ms" }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p
                className="mt-4 text-lead text-ink-soft animate-rise"
                style={{ animationDelay: "180ms" }}
              >
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="shell pt-12 sm:pt-16">
        <Reveal className="mx-auto max-w-3xl">
          <Markdown>{post.body_md}</Markdown>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl border-t border-line pt-8">
          <Button href="/writing" variant="ghost">
            ← All writing
          </Button>
        </div>
      </section>
    </article>
  );
}
