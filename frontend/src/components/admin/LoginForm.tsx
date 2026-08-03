"use client";

import { useState } from "react";

import { Button, Field, Notice, TextInput } from "@/components/admin/fields";
import { api } from "@/lib/admin-api";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      await api.post("/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
      });
      onSuccess();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed");
      setBusy(false);
    }
  }

  return (
    <div className="shell flex min-h-dvh items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-h3 font-semibold">Sign in</h1>

        <div className="mt-8 space-y-5">
          <Field label="Email">
            <TextInput name="email" type="email" required autoComplete="username" autoFocus />
          </Field>

          <Field label="Password">
            <TextInput
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </Field>

          {error && <Notice kind="error">{error}</Notice>}

          <Button type="submit" variant="primary" disabled={busy} className="w-full">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}
