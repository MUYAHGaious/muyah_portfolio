"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

/**
 * Header: wordmark, four text links, one call to action. The bar gains a
 * surface once the page scrolls so it reads as floating over the network.
 */
export function SiteHeader({ name }: { name: string; location?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const wordmark = name.trim().split(/\s+/)[0] || "Portfolio";

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4">
      <div className="shell">
        <div
          className={`relative flex items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5 transition-[background-color,box-shadow,border-color] duration-300 border ${
            scrolled ? "border-line bg-ground/85 shadow-card backdrop-blur-md" : "border-transparent bg-transparent"
          }`}
        >
          <Link
            href="/"
            className="inline-flex min-h-11 md:min-h-9 shrink-0 items-center text-h4 font-bold tracking-tight text-ink transition-opacity hover:opacity-70"
          >
            {wordmark}
            <span className="text-ember">.</span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex md:items-center md:gap-1">
            {NAV.map((item) => {
              const current = isCurrent(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`relative inline-flex min-h-9 items-center rounded-full px-3.5 text-small font-medium transition-colors duration-200 ${
                    current ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                  {current && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ember"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button href="/contact" variant="ember" size="sm" className="hidden sm:inline-flex">
              Contact
            </Button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-full border border-field text-ink"
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
          <nav id="mobile-nav" aria-label="Mobile" className="md:hidden mt-2 panel animate-pop p-3">
            {[{ href: "/", label: "Home" }, ...NAV].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={(item.href === "/" ? pathname === "/" : isCurrent(item.href)) ? "page" : undefined}
                className={`block rounded-[var(--r-sm)] px-4 py-3 text-small font-medium transition-colors ${
                  (item.href === "/" ? pathname === "/" : isCurrent(item.href))
                    ? "bg-surface-2 text-ink"
                    : "text-ink-soft hover:bg-surface-2"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="p-1 pt-2">
              <Button href="/contact" variant="ember" size="sm" className="w-full">
                Contact
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
