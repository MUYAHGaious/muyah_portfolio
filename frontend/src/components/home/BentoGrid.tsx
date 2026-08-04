import { ArrowUpRight, FileText, Mail, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import type { SiteSettings } from "@/lib/types";

/**
 * Bento grid of everything worth exploring.
 *
 * Adapted from the "colorful bento" pattern. The original headlines borrowed
 * social proof — "+1,000 Downloads", "Rated 5/5 by 100 Founders", "10,000 uses".
 * Those belong to whoever wrote it. Every figure here is counted from the
 * database at render time, so the tiles cannot drift out of step with reality or
 * claim something untrue.
 *
 * The slight rotations are the pattern's charm; they are applied on hover only,
 * so nothing sits crooked at rest and the type stays easy to read.
 */

const TILT =
  "transition-[transform,box-shadow] duration-300 ease-out hover:shadow-card motion-reduce:transition-none motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100";

/** lucide-react dropped its brand icons, so the GitHub mark is inlined. */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

export function BentoGrid({
  settings,
  projectCount,
  postCount,
  serviceCount,
}: {
  settings: SiteSettings;
  projectCount: number;
  postCount: number;
  serviceCount: number;
}) {
  const github = settings.socials.find((social) => /github/i.test(social.label));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Wide tile — the work index. */}
      <Reveal className="md:col-span-2">
        <Link
          href="/work"
          className={`relative flex h-[19rem] flex-col justify-between overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-br from-[#FFE0CB] to-[#FFC0A0] p-6 sm:p-8 hover:rotate-1 hover:scale-[1.01] ${TILT}`}
        >
          <div aria-hidden="true" className="glow -right-16 -top-16 h-56 w-56 opacity-50" />

          <div className="relative flex items-start justify-between">
            <span className="rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
              {projectCount} {projectCount === 1 ? "project" : "projects"}
            </span>
            <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-[#46190f]" />
          </div>

          <div className="relative">
            <h3 className="max-w-[14ch] text-h2 font-bold leading-[1.02] tracking-tight text-[#46190f]">
              Case studies, written up properly.
            </h3>
            <p className="mt-3 max-w-[42ch] text-small text-[#46190f]/75">
              The problem, the approach, and the decisions worth explaining.
            </p>
          </div>
        </Link>
      </Reveal>

      {/* GitHub — deliberately no follower or star count; those numbers would go
          stale the moment they were written down. */}
      <Reveal delay={90}>
        <a
          href={github?.url ?? "https://github.com/MUYAHGaious"}
          target="_blank"
          rel="me noopener noreferrer"
          className={`relative flex h-[19rem] flex-col items-center justify-between overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-br from-[#EFE8DC] to-[#DED3BF] p-6 hover:-rotate-2 hover:scale-[1.03] ${TILT}`}
        >
          <span className="rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
            Open source
          </span>

          <GithubMark className="h-14 w-14 text-[#46190f]" />

          <h3 className="rounded-full bg-[#46190f]/90 px-6 py-2 text-center text-h4 font-semibold text-white">
            GitHub
          </h3>
        </a>
      </Reveal>

      <Reveal delay={140}>
        <Link
          href="/services"
          className={`relative flex h-[19rem] flex-col items-center justify-between overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-br from-[#F7E1D6] to-[#E9C0AC] p-6 hover:rotate-2 hover:scale-[1.03] ${TILT}`}
        >
          <span className="rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
            {serviceCount} {serviceCount === 1 ? "service" : "services"}
          </span>

          <Wrench aria-hidden="true" className="h-12 w-12 text-[#46190f]" strokeWidth={1.5} />

          <h3 className="rounded-full bg-[#46190f]/90 px-6 py-2 text-center text-h4 font-semibold text-white">
            How I help
          </h3>
        </Link>
      </Reveal>

      <Reveal delay={190}>
        <Link
          href="/writing"
          className={`relative flex h-[19rem] flex-col items-center justify-between overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-br from-[#E7EDE1] to-[#CFDDC3] p-6 hover:-rotate-2 hover:scale-[1.03] ${TILT}`}
        >
          <span className="rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
            {postCount > 0 ? `${postCount} published` : "In progress"}
          </span>

          <Sparkles aria-hidden="true" className="h-12 w-12 text-[#46190f]" strokeWidth={1.5} />

          <h3 className="rounded-full bg-[#46190f]/90 px-6 py-2 text-center text-h4 font-semibold text-white">
            Writing
          </h3>
        </Link>
      </Reveal>

      {/* CV tile, only when one has actually been uploaded. */}
      {settings.resume_media ? (
        <Reveal delay={240}>
          <a
            href={settings.resume_media.url}
            download
            className={`relative flex h-[19rem] flex-col items-center justify-between overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-br from-[#E4E9F2] to-[#CBD5E6] p-6 hover:rotate-2 hover:scale-[1.03] ${TILT}`}
          >
            <span className="rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
              PDF
            </span>
            <FileText aria-hidden="true" className="h-12 w-12 text-[#46190f]" strokeWidth={1.5} />
            <h3 className="rounded-full bg-[#46190f]/90 px-6 py-2 text-center text-h4 font-semibold text-white">
              Download CV
            </h3>
          </a>
        </Reveal>
      ) : null}

      <Reveal delay={290} className={settings.resume_media ? "" : "md:col-span-1"}>
        <Link
          href="/contact"
          className={`relative flex h-[19rem] flex-col items-center justify-between overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-br from-[#FFD9C2] to-[#FFB68D] p-6 hover:-rotate-1 hover:scale-[1.03] ${TILT}`}
        >
          <span className="rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
            Open to roles
          </span>

          <Mail aria-hidden="true" className="h-12 w-12 text-[#46190f]" strokeWidth={1.5} />

          <h3 className="rounded-full bg-[#46190f]/90 px-6 py-2 text-center text-h4 font-semibold text-white">
            Get in touch
          </h3>
        </Link>
      </Reveal>
    </div>
  );
}
