import Link from "next/link";

import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/types";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="shell pb-6 pt-16 sm:pt-24">
      <div className="panel relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="glow -right-24 -top-24 h-72 w-72 sm:h-96 sm:w-96"
        />

        <div className="relative">
          <div className="flex flex-col gap-8 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Got something in mind?</p>
              <p className="mt-3 max-w-[16ch] text-h2 font-bold tracking-tight text-ink">
                Let&apos;s build it together.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href="/contact" variant="ember">
                Start a conversation
              </Button>
              {settings.email && (
                <Button href={`mailto:${settings.email}`} variant="ghost" external>
                  {settings.email}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-small text-ink-soft transition-colors hover:text-ember-deep"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {settings.socials.map((social) => (
                <a
                  key={`${social.label}-${social.url}`}
                  href={social.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="text-small text-ink-soft transition-colors hover:text-ember-deep"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <p className="mt-8 text-micro text-ink-faint">
            © {year} {settings.name}
            {settings.location && ` · ${settings.location}`}
          </p>
        </div>
      </div>
    </footer>
  );
}
