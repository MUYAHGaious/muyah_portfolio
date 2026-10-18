import Link from "next/link";

import { RailNav } from "@/components/home/RailNav";
import type { Project, SiteSettings } from "@/lib/types";

/**
 * The left column of the bench: who this is, in a handful of facts with
 * chips, the section index, and where else to find him. Sticky on desktop
 * so the person stays on screen while the work scrolls past.
 */
export function IdentityRail({
  settings,
  featured,
  sections,
  compact = false,
}: {
  settings: SiteSettings;
  featured: Project[];
  sections?: { id: string; label: string }[];
  /** Inner pages: name and title only, smaller. */
  compact?: boolean;
}) {
  // Inner pages have their own h1, so the rail name is a plain paragraph there.
  const Name = compact ? "p" : "h1";
  const education = settings.education ?? [];
  const current = education.find((e) => /progress|current/i.test(e.status)) ?? education[0];
  const title = settings.title ? settings.title.split(/\s*·\s*/) : [];
  const hasEmailLink = settings.socials.some((s) => /^mailto:|email/i.test(`${s.url} ${s.label}`));

  return (
    <aside className="rail">
      <div className={compact ? "" : "lg:min-h-[60vh] lg:flex lg:flex-col"}>
        <div>
          <Name
            className="font-bold tracking-tight text-ink"
            style={{
              fontSize: compact ? "clamp(1.75rem, 2.2vw + 0.8rem, 2.5rem)" : "clamp(2.4rem, 3.4vw + 0.8rem, 3.6rem)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
            }}
          >
            {settings.name}
          </Name>
          {title.length > 0 && (
            <p className="mt-4 max-w-[28ch] text-lead text-ink">
              {title.map((part, i) => (
                <span key={part} className="block">
                  {part}
                  {i === title.length - 1 ? "." : ","}
                </span>
              ))}
            </p>
          )}
        </div>

        {!compact && (
          <dl className="mt-8 space-y-3 text-small text-ink-soft">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <dt>Leading AI at</dt>
              <dd>
                <Link href="/about" className="chip">
                  Skye8
                </Link>
              </dd>
            </div>
            {featured.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <dt>Building</dt>
                {featured.map((project) => (
                  <dd key={project.id}>
                    <Link href={`/work/${project.slug}`} className="chip">
                      {project.title}
                    </Link>
                  </dd>
                ))}
              </div>
            )}
            {current && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <dt>Studying</dt>
                <dd>
                  <Link href="/about" className="chip">
                    {current.degree}
                  </Link>
                </dd>
                <dd className="text-ink-faint">{current.school.split(",")[0]}</dd>
              </div>
            )}
            {settings.location && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <dt>From</dt>
                <dd className="text-ink">{settings.location}</dd>
              </div>
            )}
          </dl>
        )}

        {sections && sections.length > 0 && (
          <div className="mt-10 hidden lg:block">
            <RailNav items={sections} />
          </div>
        )}

        {!compact && (
          <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-small lg:mt-auto lg:pt-10">
            {settings.socials.map((social) => (
              <li key={social.url}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                >
                  {social.label}
                </a>
              </li>
            ))}
            {settings.email && !hasEmailLink && (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                >
                  Email
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    </aside>
  );
}
