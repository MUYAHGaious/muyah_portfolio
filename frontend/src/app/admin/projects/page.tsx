"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/admin/fields";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { Project } from "@/lib/types";

export default function ProjectsList() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const loader = useCallback(() => api.get<Project[]>("/admin/projects"), []);
  const { data: projects, error, loading, reload } = useAsync(loader);

  async function createDraft() {
    setCreating(true);
    try {
      const created = await api.post<Project>("/admin/projects", {
        title: `Untitled project ${Date.now().toString().slice(-5)}`,
      });
      router.push(`/admin/projects/${created.id}`);
    } catch {
      setCreating(false);
      await reload();
    }
  }

  async function remove(project: Project) {
    if (!confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    await api.delete(`/admin/projects/${project.id}`);
    await reload();
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-h3 font-semibold">Projects</h1>
        <Button variant="primary" onClick={createDraft} disabled={creating}>
          {creating ? "Creating…" : "New project"}
        </Button>
      </div>

      {error && <p className="mt-4 text-small text-ember-deep">{error}</p>}
      {loading && !projects && <p className="mt-4 text-small text-ink-soft">Loading…</p>}

      {projects && projects.length === 0 && (
        <p className="mt-8 text-small text-ink-soft">
          No projects yet. Create one to get started.
        </p>
      )}

      {projects && projects.length > 0 && (
        <ul className="border-t border-line mt-6">
          {projects.map((project) => (
            <li
              key={project.id}
              className="border-b border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
            >
              <span className="w-12 text-small text-ink-soft">{project.year ?? "—"}</span>

              <Link
                href={`/admin/projects/${project.id}`}
                className="flex-1 min-w-40 text-small hover:text-ember-deep transition-colors duration-150"
              >
                {project.title}
              </Link>

              <span className="text-micro uppercase tracking-[0.08em] text-ink-soft">
                {project.published ? "Published" : "Draft"}
              </span>

              <button
                type="button"
                onClick={() => remove(project)}
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
