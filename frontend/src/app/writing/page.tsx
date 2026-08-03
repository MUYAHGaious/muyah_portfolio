import type { Metadata } from "next";
import Link from "next/link";

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
    <section className="page-shell pt-16 pb-20 sm:pt-24">
      <div className="grid-field">
        <h1 className="col-span-12 sm:col-span-5 text-h2 font-semibold">Writing</h1>
        {tag && (
          <p className="col-span-12 sm:col-span-5 sm:col-start-8 mt-3 sm:mt-2 text-small text-muted">
            Tagged “{tag}” ·{" "}
            <Link href="/writing" className="underline underline-offset-4 hover:text-signal">
              Clear
            </Link>
          </p>
        )}
      </div>

      {posts.items.length === 0 ? (
        <p className="mt-12 text-muted text-small">
          {tag ? "No posts with that tag." : "No posts published yet."}
        </p>
      ) : (
        <ul className="rule-top mt-12">
          {posts.items.map((post) => (
            <li key={post.id} className="rule-bottom">
              <Link
                href={`/writing/${post.slug}`}
                className="group block py-6 transition-colors duration-150 hover:text-signal"
              >
                <div className="grid-field">
                  <p className="col-span-12 sm:col-span-2 text-small text-muted group-hover:text-signal transition-colors duration-150">
                    {post.published_at ? fullDate(post.published_at) : "Draft"}
                  </p>
                  <div className="col-span-12 sm:col-span-8 sm:col-start-4 mt-1 sm:mt-0">
                    <h2 className="text-h3 font-semibold">{post.title}</h2>
                    {post.excerpt && (
                      <p className="mt-2 text-muted max-w-[52ch]">{post.excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {lastPage > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex gap-6 text-small">
          {page > 1 && (
            <Link
              href={`/writing?page=${page - 1}${tag ? `&tag=${tag}` : ""}`}
              className="text-muted hover:text-signal transition-colors duration-150"
            >
              ← Newer
            </Link>
          )}
          <span className="text-muted">
            Page {page} of {lastPage}
          </span>
          {page < lastPage && (
            <Link
              href={`/writing?page=${page + 1}${tag ? `&tag=${tag}` : ""}`}
              className="text-muted hover:text-signal transition-colors duration-150"
            >
              Older →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
