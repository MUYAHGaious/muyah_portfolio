"use client";

import { useCallback, useEffect, useState } from "react";

import { Button, Field, Notice, TextArea, TextInput } from "@/components/admin/fields";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { SiteSettings, SocialLink } from "@/lib/types";

export default function SettingsPage() {
  const loader = useCallback(() => api.get<SiteSettings>("/admin/settings"), []);
  const { data, error, loading } = useAsync(loader);

  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(data), [data]);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setStatus("");
  }

  function updateSocial(index: number, patch: Partial<SocialLink>) {
    if (!draft) return;
    const socials = draft.socials.map((link, position) =>
      position === index ? { ...link, ...patch } : link,
    );
    update("socials", socials);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setSaveError("");
    setStatus("");

    try {
      await api.patch<SiteSettings>("/admin/settings", {
        name: draft.name,
        tagline: draft.tagline,
        bio_md: draft.bio_md,
        location: draft.location,
        email: draft.email,
        // Drop half-filled rows rather than saving a link with no destination.
        socials: draft.socials.filter((link) => link.label.trim() && link.url.trim()),
        resume_media_id: draft.resume_media?.id ?? null,
      });
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
        <h1 className="text-h3 font-semibold">Settings</h1>
        <div className="flex items-center gap-4">
          {status && <Notice kind="success">{status}</Notice>}
          {saveError && <Notice kind="error">{saveError}</Notice>}
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Name" hint="Shown in the header and as the page title.">
            <TextInput
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </Field>

          <Field label="Location">
            <TextInput
              value={draft.location}
              onChange={(event) => update("location", event.target.value)}
            />
          </Field>
        </div>

        <Field label="Tagline" hint="One line under your name on the home page.">
          <TextArea
            rows={2}
            maxLength={300}
            value={draft.tagline}
            onChange={(event) => update("tagline", event.target.value)}
          />
        </Field>

        <Field label="Public email" hint="Shown in the footer and on the contact page.">
          <TextInput
            type="email"
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </Field>

        <MarkdownEditor
          value={draft.bio_md}
          onChange={(value) => update("bio_md", value)}
          rows={10}
        />

        <MediaPicker
          label="CV / résumé (PDF)"
          accept="application/pdf"
          value={draft.resume_media?.id ?? null}
          onChange={(mediaId) =>
            update("resume_media", mediaId === null ? null : ({ id: mediaId } as never))
          }
        />

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="label-micro">Social links</span>
            <Button
              onClick={() => update("socials", [...draft.socials, { label: "", url: "" }])}
            >
              Add link
            </Button>
          </div>

          {draft.socials.length === 0 ? (
            <p className="text-small text-muted">No links yet.</p>
          ) : (
            <ul className="space-y-2">
              {draft.socials.map((link, index) => (
                <li key={index} className="flex gap-2">
                  <TextInput
                    value={link.label}
                    placeholder="GitHub"
                    aria-label={`Link ${index + 1} label`}
                    className="w-40"
                    onChange={(event) => updateSocial(index, { label: event.target.value })}
                  />
                  <TextInput
                    value={link.url}
                    placeholder="https://github.com/you"
                    aria-label={`Link ${index + 1} URL`}
                    onChange={(event) => updateSocial(index, { url: event.target.value })}
                  />
                  <Button
                    variant="danger"
                    aria-label={`Remove ${link.label || "link"}`}
                    onClick={() =>
                      update(
                        "socials",
                        draft.socials.filter((_, position) => position !== index),
                      )
                    }
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <PasswordSection />
    </div>
  );
}

function PasswordSection() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await api.post("/auth/password", {
        current_password: data.get("current_password"),
        new_password: data.get("new_password"),
      });
      setStatus("Password changed.");
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rule-top mt-12 pt-8">
      <h2 className="text-small font-semibold">Change password</h2>
      <p className="mt-1 text-micro text-muted normal-case">
        Do this now if you are still using the password from your .env file.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Current password">
          <TextInput name="current_password" type="password" required autoComplete="current-password" />
        </Field>
        <Field label="New password" hint="At least 12 characters.">
          <TextInput
            name="new_password"
            type="password"
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Button type="submit" disabled={busy}>
          {busy ? "Changing…" : "Change password"}
        </Button>
        {status && <Notice kind="success">{status}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
      </div>
    </form>
  );
}
