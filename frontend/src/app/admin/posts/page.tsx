"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/admin/fields";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import { fullDate } from "@/lib/format";
import type { Post } from "@/lib/types";

export default function PostsList() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const loader = useCallback(() => api.get<Post[]>("/admin/posts"), []);
  const { data: posts, error, loading, reload } = useAsync(loader);

  async function createDraft() {
    setCreating(true);
    try {
      const created = await api.post<Post>("/admin/posts", {
        title: `Untitled post ${Date.now().toString().slice(-5)}`,
      });
      router.push(`/admin/posts/${created.id}`);
    } catch {
      setCreating(false);
      await reload();
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-h3 font-semibold">Writing</h1>
        <Button variant="primary" onClick={createDraft} disabled={creating}>
          {creating ? "Creating…" : "New post"}
        </Button>
      </div>

      {error && <p className="mt-4 text-small text-ember-deep">{error}</p>}
      {loading && !posts && <p className="mt-4 text-small text-ink-soft">Loading…</p>}

      {posts && posts.length === 0 && (
        <p className="mt-8 text-small text-ink-soft">No posts yet.</p>
      )}

      {posts && posts.length > 0 && (
        <ul className="border-t border-line mt-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border-b border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
            >
              <span className="w-32 text-small text-ink-soft">
                {post.published_at ? fullDate(post.published_at) : "—"}
              </span>

              <Link
                href={`/admin/posts/${post.id}`}
                className="flex-1 min-w-40 text-small hover:text-ember-deep transition-colors duration-150"
              >
                {post.title}
              </Link>

              <span className="text-micro uppercase tracking-[0.08em] text-ink-soft">
                {post.published ? "Published" : "Draft"}
              </span>

              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
                  await api.delete(`/admin/posts/${post.id}`);
                  await reload();
                }}
                className="text-micro uppercase tracking-[0.08em] text-ink-soft hover:text-ember-deep transition-colors duration-150"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
