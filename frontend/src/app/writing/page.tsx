import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { getPosts } from "@/lib/api";
import { fullDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes and longer pieces.",
};

type Search = { searchParams: Promise<{ page?: string; tag?: string }> };

export default async function WritingPage({ searchParams }: Search) {
  const { page: pageParam, tag } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const posts = await getPosts(page, tag);
  const lastPage = Math.max(1, Math.ceil(posts.total / posts.per_page));

  return (
    <>
      <PageHero
        eyebrow="Writing"
        title="Notes and longer pieces."
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

      <section className="shell pt-12 sm:pt-16">
        {posts.items.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-h4 font-semibold text-ink">
              {tag ? "No posts with that tag" : "Nothing published yet"}
            </p>
            <p className="mt-2 text-small text-ink-soft">
              {tag ? "Try clearing the filter." : "Write your first post from the admin panel."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {posts.items.map((post, index) => (
              <Reveal as="li" key={post.id} delay={index * 70}>
                <Link
                  href={`/writing/${post.slug}`}
                  className="card card-lift group block p-6 sm:p-8"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-micro normal-case tracking-normal text-ink-faint">
                      {post.published_at ? fullDate(post.published_at) : "Draft"}
                    </span>
                    {post.tags.slice(0, 3).map((postTag) => (
                      <span
                        key={postTag}
                        className="rounded-full bg-surface-2 px-2.5 py-1 text-micro normal-case tracking-normal text-ink-soft"
                      >
                        {postTag}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-3 text-h3 font-bold tracking-tight text-ink">{post.title}</h2>

                  {post.excerpt && (
                    <p className="mt-2 max-w-[62ch] text-small text-ink-soft">{post.excerpt}</p>
                  )}

                  <span className="mt-5 inline-flex items-center gap-1.5 text-small font-semibold text-ember-deep">
                    Read
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
    </>
  );
}
