"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LoginForm } from "@/components/admin/LoginForm";
import { api } from "@/lib/admin-api";
import type { AdminUser } from "@/lib/types";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/posts", label: "Writing" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

type AuthState = "checking" | "signed-out" | "signed-in";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("checking");
  const [user, setUser] = useState<AdminUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const check = useCallback(async () => {
    try {
      setUser(await api.get<AdminUser>("/auth/me"));
      setState("signed-in");
    } catch {
      setState("signed-out");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  async function signOut() {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    setState("signed-out");
    router.push("/admin");
  }

  if (state === "checking") {
    return (
      <div className="shell py-24">
        <p className="text-small text-ink-soft">Checking your session…</p>
      </div>
    );
  }

  // Guarding here rather than per-page means a deep link such as
  // /admin/posts/3 shows the login form and lands on that page afterwards.
  if (state === "signed-out") {
    return <LoginForm onSuccess={check} />;
  }

  return (
    <div className="shell py-10">
      <header className="border-b border-line flex flex-wrap items-baseline justify-between gap-4 pb-4">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          {NAV.map((item) => {
            const isCurrent =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`text-small transition-colors duration-150 hover:text-ember-deep ${
                  isCurrent ? "text-ember-deep" : "text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-baseline gap-4 text-small text-ink-soft">
          <Link href="/" className="hover:text-ember-deep transition-colors duration-150">
            View site ↗
          </Link>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="hover:text-ember-deep transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="pt-8">{children}</div>
    </div>
  );
}
