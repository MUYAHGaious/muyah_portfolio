import type { Metadata } from "next";
import Link from "next/link";

import { PageFrame } from "@/components/PageFrame";
import { PageHero } from "@/components/PageHero";
import { getPosts, getProjects, getSettings } from "@/lib/api";
import { fullDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes and longer pieces.",
  // Points ?page=2 and ?tag=x back at the clean URL. Without this, every tag
  // filter is a near-duplicate of the index competing against it in search.
  alternates: { canonical: "/writing" },
  openGraph: {
    title: "Writing",
    description: "Notes and longer pieces.",
    type: "website",
    url: "/writing",
  },
};

type Search = { searchParams: Promise<{ page?: string; tag?: string }> };

export default async function WritingPage({ searchParams }: Search) {
  const { page: pageParam, tag } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [posts, settings, projects] = await Promise.all([getPosts(page, tag), getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);
  const lastPage = Math.max(1, Math.ceil(posts.total / posts.per_page));

  return (
    <PageFrame settings={settings} featured={featured}>
      <PageHero
        title="Writing."
        lead={tag ? undefined : "Things worth writing down as I work through them."}
      >
        {tag && (
          <p className="flex flex-wrap items-center gap-3 text-small text-ink-soft">
            Tagged
            <span className="rounded-full bg-ember/15 px-3 py-1 text-micro font-semibold text-ember-deep">
              {tag}
            </span>
            <Link href="/writing" className="font-semibold text-ember-deep hover:opacity-70">
              Clear
            </Link>
          </p>
        )}
      </PageHero>

      <section className="pt-10 sm:pt-14">
        {posts.items.length === 0 ? (
          <p className="border-y border-line py-8 text-small text-ink-soft">
            {tag
              ? "No posts with that tag. Try clearing the filter."
              : "Nothing published yet. Write the first post from the admin panel."}
          </p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {posts.items.map((post) => (
              <li key={post.id}>
                <Link href={`/writing/${post.slug}`} className="group grid gap-2 py-6 sm:grid-cols-12 sm:gap-6">
                  <span className="font-mono text-micro text-ink-faint sm:col-span-3 sm:pt-1.5">
                    {post.published_at ? fullDate(post.published_at) : "Draft"}
                  </span>
                  <span className="min-w-0 sm:col-span-9">
                    <span className="block text-h3 font-bold tracking-tight text-ink transition-colors group-hover:text-ember-deep">
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <span className="mt-2 block max-w-[62ch] text-small text-ink-soft">{post.excerpt}</span>
                    )}
                    {post.tags.length > 0 && (
                      <span className="mt-3 block font-mono text-micro text-ink-faint">
                        {post.tags.slice(0, 3).join(" · ")}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {lastPage > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
            {page > 1 && (
              <Link
                href={`/writing?page=${page - 1}${tag ? `&tag=${tag}` : ""}`}
                className="rounded-full border border-field px-5 py-2.5 text-small text-ink transition-colors hover:border-ink"
              >
                ← Newer
              </Link>
            )}
            <span className="text-small text-ink-soft">
              {page} / {lastPage}
            </span>
            {page < lastPage && (
              <Link
                href={`/writing?page=${page + 1}${tag ? `&tag=${tag}` : ""}`}
                className="rounded-full border border-field px-5 py-2.5 text-small text-ink transition-colors hover:border-ink"
              >
                Older →
              </Link>
            )}
          </nav>
        )}
      </section>
    </PageFrame>
  );
}
