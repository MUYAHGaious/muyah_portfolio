"use client";

import { useRef, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const FIELD_CLASS =
  "w-full bg-transparent border-b border-field py-2 text-base outline-none transition-colors duration-150 focus:border-signal";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // When the form was first rendered. The server rejects submissions that arrive
  // implausibly fast, which is the cheapest bot filter available.
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
          ? "You've sent several messages recently. Try again a bit later."
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
      <div className="rule-top pt-6" role="status">
        <p className="text-h3 font-semibold">Message sent.</p>
        <p className="mt-2 text-muted max-w-[40ch]">
          Thanks — it landed. I&apos;ll reply to the address you gave.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rule-top pt-8 space-y-8" noValidate>
      {/* Honeypot. Hidden from people, irresistible to bots. Not display:none —
          some bots skip those — and removed from the tab order and the a11y tree. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid-field">
        <div className="col-span-12 sm:col-span-6">
          <label htmlFor="name" className="label-micro block">
            Your name
          </label>
          <input id="name" name="name" type="text" required maxLength={200} className={FIELD_CLASS} />
        </div>

        <div className="col-span-12 sm:col-span-6 mt-6 sm:mt-0">
          <label htmlFor="email" className="label-micro block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={255}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="label-micro block">
          Subject <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input id="subject" name="subject" type="text" maxLength={300} className={FIELD_CLASS} />
      </div>

      <div>
        <label htmlFor="message" className="label-micro block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={10000}
          className={`${FIELD_CLASS} resize-y`}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="text-small text-signal">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="border border-ink px-6 py-3 text-small transition-colors duration-150 hover:bg-ink hover:text-paper disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
