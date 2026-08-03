"use client";

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
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { Experience } from "@/lib/types";

/**
 * Experience entries are short enough to edit inline, so this page is a list of
 * expandable rows rather than a list plus a separate editor route.
 */
export default function ExperiencePage() {
  const loader = useCallback(() => api.get<Experience[]>("/admin/experience"), []);
  const { data: entries, error, loading, reload } = useAsync(loader);
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    try {
      await api.post<Experience>("/admin/experience", {
        role: "New role",
        company: "Company",
        start_date: new Date().toISOString().slice(0, 10),
      });
      await reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-h3 font-semibold">Experience</h1>
        <Button variant="primary" onClick={create} disabled={creating}>
          {creating ? "Adding…" : "Add entry"}
        </Button>
      </div>

      {error && <p className="mt-4 text-small text-signal">{error}</p>}
      {loading && !entries && <p className="mt-4 text-small text-muted">Loading…</p>}

      {entries && entries.length === 0 && (
        <p className="mt-8 text-small text-muted">No entries yet.</p>
      )}

      <div className="mt-6 space-y-3">
        {entries?.map((entry) => (
          <EntryRow key={entry.id} entry={entry} onChanged={reload} />
        ))}
      </div>
    </div>
  );
}

function EntryRow({ entry, onChanged }: { entry: Experience; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(entry);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Re-sync when the list reloads, so a save elsewhere doesn't leave stale text.
  useEffect(() => setDraft(entry), [entry]);

  function update<K extends keyof Experience>(key: K, value: Experience[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus("");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await api.patch(`/admin/experience/${entry.id}`, {
        role: draft.role,
        company: draft.company,
        location: draft.location,
        start_date: draft.start_date,
        end_date: draft.end_date || null,
        summary: draft.summary,
        highlights: draft.highlights,
        sort_order: draft.sort_order,
        published: draft.published,
      });
      setStatus("Saved.");
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-rule">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left transition-colors duration-150 hover:text-signal"
      >
        <span className="text-small">
          {draft.role} <span className="text-muted">· {draft.company}</span>
        </span>
        <span className="text-micro uppercase tracking-[0.08em] text-muted">
          {draft.published ? "Visible" : "Hidden"} {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-rule px-4 py-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Role">
              <TextInput
                value={draft.role}
                onChange={(event) => update("role", event.target.value)}
              />
            </Field>
            <Field label="Company">
              <TextInput
                value={draft.company}
                onChange={(event) => update("company", event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Location">
              <TextInput
                value={draft.location}
                onChange={(event) => update("location", event.target.value)}
              />
            </Field>
            <Field label="Start date">
              <TextInput
                type="date"
                value={draft.start_date}
                onChange={(event) => update("start_date", event.target.value)}
              />
            </Field>
            <Field label="End date" hint="Leave empty if this is your current role.">
              <TextInput
                type="date"
                value={draft.end_date ?? ""}
                onChange={(event) => update("end_date", event.target.value || null)}
              />
            </Field>
          </div>

          <Field label="Summary">
            <TextArea
              rows={2}
              value={draft.summary}
              onChange={(event) => update("summary", event.target.value)}
            />
          </Field>

          <Field label="Highlights" hint="Comma separated. One concrete thing each.">
            <ListInput
              value={draft.highlights}
              onChange={(value) => update("highlights", value)}
            />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Checkbox
              label="Visible on the site"
              checked={draft.published}
              onChange={(value) => update("published", value)}
            />

            <div className="flex items-center gap-3">
              {status && <Notice kind="success">{status}</Notice>}
              {error && <Notice kind="error">{error}</Notice>}
              <Button
                variant="danger"
                onClick={async () => {
                  if (!confirm(`Delete “${draft.role} at ${draft.company}”?`)) return;
                  await api.delete(`/admin/experience/${entry.id}`);
                  await onChanged();
                }}
              >
                Delete
              </Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
