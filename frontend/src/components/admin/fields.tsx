"use client";

import { useState } from "react";

/**
 * Form primitives for the admin panel.
 *
 * The admin uses the same tokens as the public site but a denser scale — it is a
 * tool, not a page. Every control is a real form element so keyboard and screen
 * reader behaviour comes for free.
 */

const INPUT =
  "w-full bg-transparent border border-field px-3 py-2 text-small outline-none transition-colors duration-150 focus:border-ember";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-micro text-ink-soft normal-case">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${INPUT} resize-y ${props.className ?? ""}`} />;
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-small cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--signal)]"
      />
      {label}
    </label>
  );
}

/** Comma-separated text in, trimmed array out. Used for tech lists and tags. */
export function ListInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  // Held as raw text while editing so typing a comma doesn't reorder the field.
  const [draft, setDraft] = useState(value.join(", "));

  return (
    <TextInput
      value={draft}
      placeholder={placeholder}
      onChange={(event) => {
        setDraft(event.target.value);
        onChange(
          event.target.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select {...props} className={`${INPUT} ${props.className ?? ""}`}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * A small editable table for JSON list fields (metrics, pipeline stages,
 * stats, education). Every row is the same shape; columns say which keys to
 * show. Rows with nothing filled in are dropped by the caller on save.
 */
export function RowsInput<T extends Record<string, string>>({
  value,
  onChange,
  columns,
  empty,
  max,
}: {
  value: T[];
  onChange: (value: T[]) => void;
  columns: { key: keyof T & string; label: string; width?: string }[];
  empty: T;
  max: number;
}) {
  function setCell(index: number, key: keyof T & string, cell: string) {
    onChange(value.map((row, i) => (i === index ? { ...row, [key]: cell } : row)));
  }

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-micro text-ink-faint">Nothing yet. Add a row to start.</p>
      )}
      {value.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          {columns.map((column) => (
            <input
              key={column.key}
              value={row[column.key] ?? ""}
              placeholder={column.label}
              aria-label={`${column.label}, row ${index + 1}`}
              onChange={(event) => setCell(index, column.key, event.target.value)}
              className={`${INPUT} ${column.width ?? "flex-1"}`}
            />
          ))}
          <button
            type="button"
            aria-label={`Remove row ${index + 1}`}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="shrink-0 border border-field px-3 py-2 text-small text-ink-soft hover:border-ink hover:text-ink"
          >
            ×
          </button>
        </div>
      ))}
      {value.length < max && (
        <button
          type="button"
          onClick={() => onChange([...value, { ...empty }])}
          className="border border-field px-3 py-1.5 text-small text-ink-soft hover:border-ink hover:text-ink"
        >
          Add row
        </button>
      )}
    </div>
  );
}

export function Button({
  variant = "secondary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  // Button outlines use --field, not --rule: a control's boundary has to meet
  // 3:1 non-text contrast, which the hairline divider colour does not.
  const styles = {
    primary: "border-ink bg-ink text-surface hover:opacity-85",
    secondary: "border-field hover:border-ink",
    danger: "border-field text-ember-deep hover:border-ember",
  }[variant];

  return (
    <button
      {...props}
      className={`border px-4 py-2 text-small transition-all duration-150 disabled:opacity-50 ${styles} ${props.className ?? ""}`}
    />
  );
}

export function Notice({ kind, children }: { kind: "error" | "success"; children: string }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`text-small ${kind === "error" ? "text-ember-deep" : "text-ink-soft"}`}
    >
      {children}
    </p>
  );
}
