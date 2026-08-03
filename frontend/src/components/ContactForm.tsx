"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

type Status = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full rounded-[var(--r-sm)] border border-field bg-surface px-4 py-3 text-base text-ink " +
  "outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-ember";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Submissions arriving implausibly fast are rejected server-side as bots.
  const renderedAt = useRef(Date.now());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
          website: form.get("website"),
          elapsed_ms: Date.now() - renderedAt.current,
        }),
      });

      if (response.ok) {
        setStatus("sent");
        return;
      }

      const body = await response.json().catch(() => null);
      setError(
        response.status === 429
          ? "You've sent a few messages recently. Try again a little later."
          : typeof body?.detail === "string"
            ? body.detail
            : "Something went wrong. Try again, or email me directly.",
      );
      setStatus("error");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card animate-pop p-8 text-center sm:p-12" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ember/15 text-h3 text-ember-deep">
          ✓
        </span>
        <p className="mt-5 text-h3 font-bold tracking-tight text-ink">Message sent.</p>
        <p className="mx-auto mt-2 max-w-[38ch] text-small text-ink-soft">
          Thanks — it landed. I&apos;ll reply to the address you gave.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-9" noValidate>
      {/* Honeypot: invisible to people, irresistible to bots, out of the tab order. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow mb-2 block">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={200}
            placeholder="Ada Lovelace"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="email" className="eyebrow mb-2 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={255}
            placeholder="you@example.com"
            className={FIELD}
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="subject" className="eyebrow mb-2 block">
          Subject <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          maxLength={300}
          placeholder="What's this about?"
          className={FIELD}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="eyebrow mb-2 block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={10000}
          placeholder="Tell me what you're working on…"
          className={`${FIELD} resize-y`}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="mt-5 text-small font-medium text-ember-deep">
          {error}
        </p>
      )}

      <div className="mt-7">
        <Button type="submit" variant="ember" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
