"use client";

import { useCallback, useState } from "react";

import { Button, TextInput } from "@/components/admin/fields";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { Media } from "@/lib/types";

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const loader = useCallback(() => api.get<Media[]>("/admin/media"), []);
  const { data: media, error, loading, reload } = useAsync(loader);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");

    try {
      // Sequential rather than parallel: each upload re-encodes an image server
      // side, and a burst of them would tie up the API's thread pool.
      for (const file of Array.from(files)) {
        await api.upload<Media>("/admin/media", file);
      }
      await reload();
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-h3 font-semibold">Media</h1>
        <label className="text-small">
          <span className="sr-only">Upload files</span>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            disabled={uploading}
            onChange={(event) => upload(event.target.files)}
            className="text-small"
          />
        </label>
      </div>

      <p className="mt-2 text-micro text-muted normal-case">
        Images are converted to WebP and resized automatically. PDFs are stored as-is —
        upload your CV here, then select it in Settings.
      </p>

      {uploading && <p className="mt-4 text-small text-muted">Uploading…</p>}
      {uploadError && <p className="mt-4 text-small text-signal">{uploadError}</p>}
      {error && <p className="mt-4 text-small text-signal">{error}</p>}
      {loading && !media && <p className="mt-4 text-small text-muted">Loading…</p>}

      {media && media.length === 0 && (
        <p className="mt-8 text-small text-muted">Nothing uploaded yet.</p>
      )}

      {media && media.length > 0 && (
        <ul className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <MediaCard key={item.id} item={item} onChanged={reload} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MediaCard({ item, onChanged }: { item: Media; onChanged: () => Promise<void> }) {
  const [alt, setAlt] = useState(item.alt_text);
  const [saved, setSaved] = useState(false);

  return (
    <li>
      {item.mime === "application/pdf" ? (
        <div className="flex aspect-4/3 items-center justify-center border border-rule text-small text-muted">
          PDF
        </div>
      ) : (
        <img
          src={item.url}
          srcSet={item.srcset}
          sizes="(min-width: 64rem) 20rem, 50vw"
          alt={item.alt_text}
          className="aspect-4/3 w-full border border-rule object-cover"
        />
      )}

      <p className="mt-2 truncate text-small" title={item.original_name}>
        {item.original_name}
      </p>
      <p className="text-micro text-muted normal-case">
        {item.width > 0 && `${item.width}×${item.height} · `}
        {formatSize(item.size_bytes)}
      </p>

      {item.mime !== "application/pdf" && (
        <div className="mt-2">
          <TextInput
            value={alt}
            placeholder="Alt text"
            aria-label={`Alt text for ${item.original_name}`}
            onChange={(event) => {
              setAlt(event.target.value);
              setSaved(false);
            }}
            onBlur={async () => {
              if (alt === item.alt_text) return;
              await api.patch(`/admin/media/${item.id}`, { alt_text: alt });
              setSaved(true);
              await onChanged();
            }}
          />
          {saved && <p className="mt-1 text-micro text-muted normal-case">Saved.</p>}
        </div>
      )}

      <div className="mt-2 flex gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-micro uppercase tracking-[0.08em] text-muted hover:text-signal transition-colors duration-150"
        >
          Open
        </a>
        <button
          type="button"
          onClick={async () => {
            if (!confirm(`Delete ${item.original_name}? Anything using it will lose its image.`))
              return;
            await api.delete(`/admin/media/${item.id}`);
            await onChanged();
          }}
          className="text-micro uppercase tracking-[0.08em] text-muted hover:text-signal transition-colors duration-150"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
