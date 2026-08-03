"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // The bar gains a surface and shadow once the page moves, so it reads as
  // floating over the content rather than pinned to it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A route change should always close the mobile menu.
  useEffect(() => setMenuOpen(false), [pathname]);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // A full legal name crowds the bar and wraps on small screens; the first name
  // is enough for a wordmark, and the full name still leads the hero.
  const wordmark = name.trim().split(/\s+/)[0] || "Portfolio";

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4">
      <div className="shell">
        <div
          className={`flex items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
            scrolled ? "bg-surface/85 shadow-card backdrop-blur-md" : "bg-transparent"
          }`}
        >
          <Link
            href="/"
            className="text-h4 font-bold tracking-tight text-ink shrink-0 transition-opacity hover:opacity-70"
          >
            {wordmark}
            <span className="text-ember">.</span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-1.5 text-small font-medium transition-colors duration-200 ${
                  isCurrent(item.href)
                    ? "text-ink"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
                {isCurrent(item.href) && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-ember"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button href="/contact" variant="ember" size="sm" className="hidden sm:inline-flex">
              Let&apos;s talk
            </Button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-field text-ink"
            >
              <span aria-hidden="true" className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-all duration-200 ${
                    menuOpen ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-0.5 w-4 rounded bg-current transition-opacity duration-200 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-all duration-200 ${
                    menuOpen ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="md:hidden mt-2 panel animate-pop p-3"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className={`block rounded-[var(--r-sm)] px-4 py-3 text-small font-medium transition-colors ${
                  isCurrent(item.href) ? "bg-surface-2 text-ink" : "text-ink-soft hover:bg-surface-2"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="p-1 pt-2">
              <Button href="/contact" variant="ember" size="sm" className="w-full">
                Let&apos;s talk
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
