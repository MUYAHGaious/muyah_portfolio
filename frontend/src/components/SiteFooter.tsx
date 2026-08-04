import { Globe, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/types";

/**
 * Footer with an oversized wordmark bleeding out of the bottom.
 *
 * Adapted from the supplied component: the shadcn tokens (`bg-background`,
 * `text-muted-foreground`, `border-border`) are mapped onto this site's set, and
 * the giant background text uses the first name only — the full three-part name
 * at 10rem would overflow narrow screens, which the mobile audit checks for.
 *
 * The wordmark is `aria-hidden`: it is a decorative repetition of the brand,
 * and having a screen reader announce "MUYAH" again at the end of every page
 * adds nothing.
 */

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * lucide-react removed its brand icons, so the marks are inlined. They are
 * single paths — cheaper than adding an icon package for three glyphs.
 */
const MARKS: Record<string, string> = {
  github:
    "M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z",
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  x: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.3 19.5h2.04L6.49 3.24H4.3l13.3 17.41Z",
};

function BrandMark({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={path} />
    </svg>
  );
}

/** Picks an icon from the link's label, falling back to a sensible generic. */
function socialIcon(label: string) {
  const key = label.toLowerCase();
  const shared = "h-5 w-5";

  if (key.includes("github")) return <BrandMark path={MARKS.github} className={shared} />;
  if (key.includes("linkedin")) return <BrandMark path={MARKS.linkedin} className={shared} />;
  if (key.includes("twitter") || key.includes("x.com") || key === "x")
    return <BrandMark path={MARKS.x} className={shared} />;
  if (key.includes("mail") || key.includes("email"))
    return <Mail aria-hidden="true" className={shared} />;
  return <Globe aria-hidden="true" className={shared} />;
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const wordmark = (settings.name.trim().split(/\s+/)[0] || "Portfolio").toUpperCase();

  return (
    <footer className="relative mt-20 w-full overflow-hidden border-t border-line">
      {/* Call to action, kept above the decorative block. */}
      <div className="shell relative z-10 pt-16">
        <div className="panel relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-14">
          <div aria-hidden="true" className="glow -top-24 left-1/2 h-72 w-72 -translate-x-1/2" />

          <div className="relative">
            <p className="eyebrow">Got something in mind?</p>
            <h2 className="mx-auto mt-3 max-w-[18ch] text-h2 font-bold tracking-tight text-ink">
              Let&apos;s build it together.
            </h2>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
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
        </div>
      </div>

      <div className="shell relative z-10 flex min-h-[22rem] flex-col justify-between pb-10 pt-14 sm:min-h-[26rem]">
        <div className="flex flex-col items-center">
          <span className="text-h3 font-bold tracking-tight text-ink">
            {settings.name || "Portfolio"}
          </span>

          {settings.tagline && (
            <p className="mt-2 max-w-sm px-4 text-center text-small font-medium text-ink-soft">
              {settings.tagline}
            </p>
          )}

          {settings.socials.length > 0 && (
            <div className="mb-8 mt-5 flex gap-2">
              {settings.socials.map((social) => (
                <a
                  key={`${social.label}-${social.url}`}
                  href={social.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-ember hover:text-ember-deep motion-reduce:hover:translate-y-0"
                >
                  {socialIcon(social.label)}
                </a>
              ))}
            </div>
          )}

          <nav
            aria-label="Footer"
            className="flex max-w-full flex-wrap justify-center gap-x-5 gap-y-1 px-4"
          >
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-9 items-center text-small font-medium text-ink-soft transition-colors duration-300 hover:text-ember-deep"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col items-center justify-center gap-1 px-4 text-center md:mt-24 md:flex-row md:justify-between md:px-0 md:text-left">
          <p className="text-small text-ink-soft">
            © {year} {settings.name}. All rights reserved.
          </p>
          {settings.location && <p className="text-small text-ink-soft">{settings.location}</p>}
        </div>
      </div>

      {/* Oversized wordmark, fading upward out of the baseline. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 left-1/2 z-0 -translate-x-1/2 select-none bg-gradient-to-b from-ink/20 via-ink/10 to-transparent bg-clip-text text-center font-extrabold leading-none tracking-tighter text-transparent sm:bottom-12"
        style={{ fontSize: "clamp(3rem, 13vw, 10rem)", maxWidth: "95vw" }}
      >
        {wordmark}
      </span>

      {/* Hairline that the wordmark appears to sit on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-24 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-line to-transparent sm:bottom-20"
      />
    </footer>
  );
}
