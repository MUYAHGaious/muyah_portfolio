"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/admin/fields";
import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import { fullDate } from "@/lib/format";
import type { ContactMessage, MessageList } from "@/lib/types";

export default function MessagesPage() {
  const loader = useCallback(() => api.get<MessageList>("/admin/messages"), []);
  const { data, error, loading, reload } = useAsync(loader);

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-h3 font-semibold">Messages</h1>
        {data && (
          <p className="text-small text-muted">
            {data.unread} unread of {data.total}
          </p>
        )}
      </div>

      {error && <p className="mt-4 text-small text-signal">{error}</p>}
      {loading && !data && <p className="mt-4 text-small text-muted">Loading…</p>}

      {data?.items.length === 0 && (
        <p className="mt-8 text-small text-muted">
          No messages yet. Submissions from the contact form land here.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {data?.items.map((message) => (
          <MessageRow key={message.id} message={message} onChanged={reload} />
        ))}
      </div>
    </div>
  );
}

function MessageRow({
  message,
  onChanged,
}: {
  message: ContactMessage;
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);

    // Opening an unread message marks it read — no separate button needed.
    if (next && !message.read_at) {
      await api.patch(`/admin/messages/${message.id}/read`, {}).catch(() => {});
      await onChanged();
    }
  }

  return (
    <article className={`border ${message.read_at ? "border-rule" : "border-signal"}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors duration-150 hover:text-signal"
      >
        <span className="text-small">
          {message.name} <span className="text-muted">· {message.email}</span>
        </span>
        <span className="text-micro uppercase tracking-[0.08em] text-muted">
          {fullDate(message.created_at)} {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t border-rule px-4 py-4">
          {message.subject && <p className="text-small font-semibold">{message.subject}</p>}
          <p className="mt-2 whitespace-pre-wrap text-small">{message.body}</p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(
                message.subject ? `Re: ${message.subject}` : "Re: your message",
              )}`}
              className="border border-ink bg-ink px-4 py-2 text-small text-paper transition-opacity duration-150 hover:opacity-85"
            >
              Reply by email
            </a>

            <Button
              variant="danger"
              onClick={async () => {
                if (!confirm(`Delete the message from ${message.name}?`)) return;
                await api.delete(`/admin/messages/${message.id}`);
                await onChanged();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
