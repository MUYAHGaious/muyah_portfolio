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
import { MediaPicker } from "@/components/admin/MediaPicker";
import { EditorSkeleton } from "@/components/admin/EditorSkeleton";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { Project } from "@/lib/types";

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const loader = useCallback(() => api.get<Project>(`/admin/projects/${id}`), [id]);
  const { data, error, loading } = useAsync(loader);

  const [draft, setDraft] = useState<Project | null>(null);
  const [status, setStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(data), [data]);

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setStatus("");
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setSaveError("");
    setStatus("");

    try {
      await api.patch<Project>(`/admin/projects/${id}`, {
        slug: draft.slug,
        title: draft.title,
        summary: draft.summary,
        body_md: draft.body_md,
        year: draft.year,
        role: draft.role,
        category: draft.category,
        tech: draft.tech,
        links: draft.links,
        cover_image_id: draft.cover_image?.id ?? null,
        sort_order: draft.sort_order,
        published: draft.published,
      });
      setStatus("Saved.");
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !draft) return <EditorSkeleton />;
  if (error) return <p className="text-small text-ember-deep">{error}</p>;
  if (!draft) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href="/admin/projects"
          className="text-small text-ink-soft hover:text-ember-deep transition-colors duration-150"
        >
          ← Projects
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

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Slug" hint="Appears in the URL: /work/your-slug">
            <TextInput
              value={draft.slug}
              onChange={(event) => update("slug", event.target.value)}
            />
          </Field>

          <Field label="Year">
            <TextInput
              type="number"
              value={draft.year ?? ""}
              onChange={(event) =>
                update("year", event.target.value ? Number(event.target.value) : null)
              }
            />
          </Field>
        </div>

        <Field label="Summary" hint="One sentence, shown on the work index and in link previews.">
          <TextArea
            rows={2}
            maxLength={500}
            value={draft.summary}
            onChange={(event) => update("summary", event.target.value)}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Your role">
            <TextInput
              value={draft.role}
              onChange={(event) => update("role", event.target.value)}
            />
          </Field>

          <Field label="Category" hint="Groups projects on the work page, e.g. web, data.">
            <TextInput
              value={draft.category}
              onChange={(event) => update("category", event.target.value)}
            />
          </Field>
        </div>

        <Field label="Built with" hint="Comma separated.">
          <ListInput
            value={draft.tech}
            onChange={(value) => update("tech", value)}
            placeholder="React, Postgres, Docker"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Live URL">
            <TextInput
              value={draft.links.live ?? ""}
              onChange={(event) => update("links", { ...draft.links, live: event.target.value })}
            />
          </Field>

          <Field label="Repository URL">
            <TextInput
              value={draft.links.repo ?? ""}
              onChange={(event) => update("links", { ...draft.links, repo: event.target.value })}
            />
          </Field>
        </div>

        <MediaPicker
          value={draft.cover_image?.id ?? null}
          onChange={(mediaId) =>
            // The editor only needs the id; the full object comes back on reload.
            update("cover_image", mediaId === null ? null : ({ id: mediaId } as never))
          }
        />

        <MarkdownEditor
          value={draft.body_md}
          onChange={(value) => update("body_md", value)}
        />

        <div className="border-t border-line flex flex-wrap items-center justify-between gap-4 pt-6">
          <Checkbox
            label="Published"
            checked={draft.published}
            onChange={(value) => update("published", value)}
          />

          <Field label="Sort order">
            <TextInput
              type="number"
              className="w-24"
              value={draft.sort_order}
              onChange={(event) => update("sort_order", Number(event.target.value))}
            />
          </Field>
        </div>

        <div className="border-t border-line flex items-center gap-4 pt-6">
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm(`Delete “${draft.title}”? This cannot be undone.`)) return;
              await api.delete(`/admin/projects/${id}`);
              router.push("/admin/projects");
            }}
          >
            Delete project
          </Button>

          {draft.published && (
            <a
              href={`/work/${draft.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-small text-ink-soft hover:text-ember-deep transition-colors duration-150"
            >
              View on site ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
