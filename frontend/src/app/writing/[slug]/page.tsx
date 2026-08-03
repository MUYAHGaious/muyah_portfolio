import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/Markdown";
import { getPost, getPosts } from "@/lib/api";
import { fullDate } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts(1);
  return posts.items.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="page-shell pt-16 pb-20 sm:pt-24">
      <header className="grid-field">
        <div className="col-span-12 sm:col-span-8 sm:col-start-4">
          <p className="label-micro">
            {post.published_at ? fullDate(post.published_at) : "Unpublished"}
          </p>
          <h1 className="mt-3 text-h2 font-semibold max-w-[20ch]">{post.title}</h1>

          {post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/writing?tag=${encodeURIComponent(tag)}`}
                    className="text-small text-muted hover:text-signal transition-colors duration-150"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="rule-top mt-10 pt-10 grid-field">
        <div className="col-span-12 sm:col-span-8 sm:col-start-4">
          <Markdown>{post.body_md}</Markdown>
        </div>
      </div>

      <p className="rule-top mt-16 pt-6">
        <Link
          href="/writing"
          className="text-small text-muted hover:text-signal transition-colors duration-150"
        >
          ← All writing
        </Link>
      </p>
    </article>
  );
}
