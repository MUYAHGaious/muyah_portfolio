"use client";

import { Briefcase, Home, PenLine, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/work", label: "Work", icon: Briefcase },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/about", label: "About", icon: User },
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
          className={`relative flex items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
            scrolled ? "bg-surface/85 shadow-card backdrop-blur-md" : "bg-transparent"
          }`}
        >
          <Link
            href="/"
            className="inline-flex min-h-11 md:min-h-9 shrink-0 items-center text-h4 font-bold tracking-tight text-ink transition-opacity hover:opacity-70"
          >
            {wordmark}
            <span className="text-ember">.</span>
          </Link>

          {/* Desktop: a magnifying dock. The label appears on hover and on
              keyboard focus, so tabbing never lands on an unlabelled icon.

              Absolutely centred so that items growing under the pointer expand
              symmetrically about the middle instead of reflowing the bar and
              nudging the wordmark and the CTA sideways. */}
          <nav
            aria-label="Main"
            className="hidden md:block md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <Dock className="items-center" panelHeight={44} magnification={64} distance={130}>
              {NAV.map((item) => {
                const current = isCurrent(item.href);
                const Icon = item.icon;

                return (
                  <DockItem key={item.href}>
                    <DockLabel>{item.label}</DockLabel>
                    <DockIcon>
                      <Link
                        href={item.href}
                        aria-label={item.label}
                        aria-current={current ? "page" : undefined}
                        className={`relative flex h-10 w-full items-center justify-center rounded-full transition-colors duration-200 ${
                          current ? "text-ember-deep" : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        <Icon aria-hidden="true" className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.8} />
                        {current && (
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-1 h-1 w-1 rounded-full bg-ember"
                          />
                        )}
                      </Link>
                    </DockIcon>
                  </DockItem>
                );
              })}
            </Dock>
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
