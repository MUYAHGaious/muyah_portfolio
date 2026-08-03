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
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { SkeletonRows } from "@/components/motion/Skeleton";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { Service, Testimonial } from "@/lib/types";

export default function ServicesAdmin() {
  return (
    <div className="max-w-3xl space-y-16">
      <ServicesPanel />
      <TestimonialsPanel />
    </div>
  );
}

// ------------------------------------------------------------------ services

function ServicesPanel() {
  const loader = useCallback(() => api.get<Service[]>("/admin/services"), []);
  const { data, error, loading, reload } = useAsync(loader);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      await api.post<Service>("/admin/services", { title: "New service" });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-h3 font-semibold">Services</h1>
          <p className="mt-1 text-micro text-ink-soft normal-case">
            The first three featured services also appear as cards in the hero.
          </p>
        </div>
        <Button variant="primary" onClick={create} disabled={busy}>
          {busy ? "Adding…" : "Add service"}
        </Button>
      </div>

      {error && <p className="mt-4 text-small text-ember-deep">{error}</p>}
      {loading && !data && (
        <div className="mt-6">
          <SkeletonRows count={3} />
        </div>
      )}
      {data?.length === 0 && <p className="mt-6 text-small text-ink-soft">No services yet.</p>}

      <div className="mt-6 space-y-3">
        {data?.map((service) => (
          <ServiceRow key={service.id} service={service} onChanged={reload} />
        ))}
      </div>
    </section>
  );
}

function ServiceRow({ service, onChanged }: { service: Service; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(service);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setDraft(service), [service]);

  function update<K extends keyof Service>(key: K, value: Service[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus("");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await api.patch(`/admin/services/${service.id}`, {
        title: draft.title,
        blurb: draft.blurb,
        body_md: draft.body_md,
        points: draft.points,
        featured: draft.featured,
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
    <div className="border border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left transition-colors hover:text-ember-deep"
      >
        <span className="text-small">{draft.title}</span>
        <span className="text-micro uppercase tracking-[0.08em] text-ink-soft">
          {draft.published ? "Live" : "Hidden"}
          {draft.featured ? " · Hero" : ""} {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-line px-4 py-5">
          <Field label="Title">
            <TextInput
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>

          <Field label="Blurb" hint="One line, shown on the card.">
            <TextArea
              rows={2}
              maxLength={300}
              value={draft.blurb}
              onChange={(event) => update("blurb", event.target.value)}
            />
          </Field>

          <Field label="What's included" hint="Comma separated.">
            <ListInput value={draft.points} onChange={(value) => update("points", value)} />
          </Field>

          <MarkdownEditor
            value={draft.body_md}
            onChange={(value) => update("body_md", value)}
            rows={8}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-5">
              <Checkbox
                label="Published"
                checked={draft.published}
                onChange={(value) => update("published", value)}
              />
              <Checkbox
                label="Show in hero"
                checked={draft.featured}
                onChange={(value) => update("featured", value)}
              />
            </div>

            <div className="flex items-center gap-3">
              {status && <Notice kind="success">{status}</Notice>}
              {error && <Notice kind="error">{error}</Notice>}
              <Button
                variant="danger"
                onClick={async () => {
                  if (!confirm(`Delete “${draft.title}”?`)) return;
                  await api.delete(`/admin/services/${service.id}`);
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

// -------------------------------------------------------------- testimonials

function TestimonialsPanel() {
  const loader = useCallback(() => api.get<Testimonial[]>("/admin/testimonials"), []);
  const { data, error, loading, reload } = useAsync(loader);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      await api.post<Testimonial>("/admin/testimonials", {
        quote: "Their words here.",
        author: "Their name",
      });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-h3 font-semibold">Testimonials</h2>
          <p className="mt-1 text-micro text-ink-soft normal-case">
            Only add quotes someone actually gave you. The section stays hidden while this is
            empty.
          </p>
        </div>
        <Button variant="primary" onClick={create} disabled={busy}>
          {busy ? "Adding…" : "Add quote"}
        </Button>
      </div>

      {error && <p className="mt-4 text-small text-ember-deep">{error}</p>}
      {loading && !data && (
        <div className="mt-6">
          <SkeletonRows count={2} />
        </div>
      )}
      {data?.length === 0 && (
        <p className="mt-6 text-small text-ink-soft">None yet — the section is hidden.</p>
      )}

      <div className="mt-6 space-y-3">
        {data?.map((testimonial) => (
          <TestimonialRow key={testimonial.id} testimonial={testimonial} onChanged={reload} />
        ))}
      </div>
    </section>
  );
}

function TestimonialRow({
  testimonial,
  onChanged,
}: {
  testimonial: Testimonial;
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(testimonial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => setDraft(testimonial), [testimonial]);

  function update<K extends keyof Testimonial>(key: K, value: Testimonial[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus("");
  }

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/admin/testimonials/${testimonial.id}`, {
        quote: draft.quote,
        author: draft.author,
        role: draft.role,
        sort_order: draft.sort_order,
        published: draft.published,
      });
      setStatus("Saved.");
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left transition-colors hover:text-ember-deep"
      >
        <span className="text-small">{draft.author}</span>
        <span className="text-micro uppercase tracking-[0.08em] text-ink-soft">
          {draft.published ? "Live" : "Hidden"} {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-line px-4 py-5">
          <Field label="Quote">
            <TextArea
              rows={4}
              value={draft.quote}
              onChange={(event) => update("quote", event.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Author">
              <TextInput
                value={draft.author}
                onChange={(event) => update("author", event.target.value)}
              />
            </Field>
            <Field label="Role / company">
              <TextInput
                value={draft.role}
                onChange={(event) => update("role", event.target.value)}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Checkbox
              label="Published"
              checked={draft.published}
              onChange={(value) => update("published", value)}
            />

            <div className="flex items-center gap-3">
              {status && <Notice kind="success">{status}</Notice>}
              <Button
                variant="danger"
                onClick={async () => {
                  if (!confirm(`Delete the quote from ${draft.author}?`)) return;
                  await api.delete(`/admin/testimonials/${testimonial.id}`);
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
