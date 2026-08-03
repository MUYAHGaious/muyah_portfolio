"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="rule-bottom sticky top-0 z-40 bg-paper/92 backdrop-blur-sm">
      <div className="page-shell flex items-baseline justify-between gap-6 py-4">
        <Link
          href="/"
          className="text-small font-semibold tracking-tight hover:text-signal transition-colors duration-150"
        >
          {name || "Portfolio"}
        </Link>

        <nav aria-label="Main" className="flex items-baseline gap-5 sm:gap-7">
          {NAV.map((item) => {
            // A nested route such as /work/some-project should still mark Work as current.
            const isCurrent =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`text-small transition-colors duration-150 hover:text-signal ${
                  isCurrent ? "text-signal" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
