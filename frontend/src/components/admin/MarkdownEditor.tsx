"use client";

import { useState } from "react";

import { Markdown } from "@/components/Markdown";

/**
 * A plain textarea with a preview toggle.
 *
 * Deliberately not a rich-text editor: the content is stored as Markdown, and a
 * WYSIWYG layer would add a large dependency plus a class of bugs where what you
 * see is not what gets stored.
 */
export function MarkdownEditor({
  value,
  onChange,
  rows = 18,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="label-micro">Body (Markdown)</span>
        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          className="text-micro uppercase tracking-[0.08em] text-muted hover:text-signal transition-colors duration-150"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div className="border border-rule px-4 py-3 min-h-[20rem]">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-small text-muted">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          spellCheck
          className="w-full border border-rule bg-transparent px-3 py-2 font-mono text-small leading-relaxed outline-none transition-colors duration-150 focus:border-signal resize-y"
        />
      )}
    </div>
  );
}
