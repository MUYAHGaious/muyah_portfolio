"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Checkbox,
  Field,
  ListInput,
  Notice,
  TextArea,
  TextInput,
} from "@/components/admin/fields";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { Post } from "@/lib/types";

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const loader = useCallback(() => api.get<Post>(`/admin/posts/${id}`), [id]);
  const { data, error, loading } = useAsync(loader);

  const [draft, setDraft] = useState<Post | null>(null);
  const [status, setStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(data), [data]);

  function update<K extends keyof Post>(key: K, value: Post[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setStatus("");
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setSaveError("");
    setStatus("");

    try {
      const saved = await api.patch<Post>(`/admin/posts/${id}`, {
        slug: draft.slug,
        title: draft.title,
        excerpt: draft.excerpt,
        body_md: draft.body_md,
        tags: draft.tags,
        published: draft.published,
      });
      setDraft(saved);
      setStatus("Saved.");
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !draft) return <p className="text-small text-muted">Loading…</p>;
  if (error) return <p className="text-small text-signal">{error}</p>;
  if (!draft) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href="/admin/posts"
          className="text-small text-muted hover:text-signal transition-colors duration-150"
        >
          ← Writing
        </Link>

        <div className="flex items-center gap-4">
          {status && <Notice kind="success">{status}</Notice>}
          {saveError && <Notice kind="error">{saveError}</Notice>}
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <Field label="Title">
          <TextInput
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </Field>

        <Field label="Slug" hint="Appears in the URL: /writing/your-slug">
          <TextInput
            value={draft.slug}
            onChange={(event) => update("slug", event.target.value)}
          />
        </Field>

        <Field label="Excerpt" hint="Shown on the writing index and in link previews.">
          <TextArea
            rows={2}
            maxLength={500}
            value={draft.excerpt}
            onChange={(event) => update("excerpt", event.target.value)}
          />
        </Field>

        <Field label="Tags" hint="Comma separated. Lowercased automatically.">
          <ListInput value={draft.tags} onChange={(value) => update("tags", value)} />
        </Field>

        <MarkdownEditor value={draft.body_md} onChange={(value) => update("body_md", value)} />

        <div className="rule-top flex flex-wrap items-center justify-between gap-4 pt-6">
          <Checkbox
            label="Published"
            checked={draft.published}
            onChange={(value) => update("published", value)}
          />
          {draft.published_at && (
            <p className="text-micro text-muted normal-case">
              First published {new Date(draft.published_at).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>

        <div className="rule-top flex items-center gap-4 pt-6">
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm(`Delete “${draft.title}”? This cannot be undone.`)) return;
              await api.delete(`/admin/posts/${id}`);
              router.push("/admin/posts");
            }}
          >
            Delete post
          </Button>

          {draft.published && (
            <a
              href={`/writing/${draft.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-small text-muted hover:text-signal transition-colors duration-150"
            >
              View on site ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
