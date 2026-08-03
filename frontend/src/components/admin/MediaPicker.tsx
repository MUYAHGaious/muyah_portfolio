"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/admin/fields";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { Media } from "@/lib/types";

/** Choose an existing image, upload a new one, or clear the selection. */
export function MediaPicker({
  value,
  onChange,
  label = "Cover image",
  accept = "image/*",
}: {
  value: number | null;
  onChange: (mediaId: number | null) => void;
  label?: string;
  accept?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loader = useCallback(() => api.get<Media[]>("/admin/media"), []);
  const { data: media, reload } = useAsync(loader);

  const selected = media?.find((item) => item.id === value) ?? null;

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const uploaded = await api.upload<Media>("/admin/media", file);
      await reload();
      onChange(uploaded.id);
      setOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="label-micro block mb-1.5">{label}</span>

      <div className="flex items-start gap-4">
        {selected ? (
          selected.mime === "application/pdf" ? (
            <p className="text-small">{selected.original_name}</p>
          ) : (
            <img
              src={selected.url}
              alt=""
              className="h-20 w-20 object-cover border border-rule"
            />
          )
        ) : (
          <div className="flex h-20 w-20 items-center justify-center border border-dashed border-field text-micro text-muted">
            None
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button type="button" onClick={() => setOpen((current) => !current)}>
            {open ? "Close" : "Choose"}
          </Button>
          {value !== null && (
            <Button type="button" variant="danger" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 border border-rule p-4">
          <label className="text-small">
            <span className="label-micro block mb-1.5">Upload new</span>
            <input
              type="file"
              accept={accept}
              disabled={uploading}
              onChange={(event) => handleUpload(event.target.files?.[0])}
              className="text-small"
            />
          </label>

          {uploading && <p className="mt-2 text-small text-muted">Uploading…</p>}
          {error && (
            <p role="alert" className="mt-2 text-small text-signal">
              {error}
            </p>
          )}

          {media && media.length > 0 && (
            <>
              <p className="label-micro mt-5 mb-2">Library</p>
              <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {media.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                      }}
                      className={`block w-full border transition-colors duration-150 hover:border-signal ${
                        item.id === value ? "border-signal" : "border-rule"
                      }`}
                      title={item.original_name}
                    >
                      {item.mime === "application/pdf" ? (
                        <span className="flex aspect-square items-center justify-center text-micro">
                          PDF
                        </span>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.alt_text || item.original_name}
                          className="aspect-square w-full object-cover"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
