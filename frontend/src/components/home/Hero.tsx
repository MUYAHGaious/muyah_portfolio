import { Button } from "@/components/ui/Button";
import { AnimatedLetterText } from "@/components/ui/animated-letter-text";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { shortName } from "@/lib/format";
import type { Service, SiteSettings } from "@/lib/types";

/**
 * The hero: greeting and name on the left, portrait in the centre against a
 * large arc, and floating capability cards on the right.
 *
 * The entrance is a staged fade-up rather than everything appearing at once —
 * each element animates on a delay so the eye is led down the column. These are
 * CSS animations on server-rendered markup, so the content is in the HTML and
 * the sequence costs no JavaScript.
 */
export function Hero({
  settings,
  services,
  projectCount,
}: {
  settings: SiteSettings;
  services: Service[];
  projectCount: number;
}) {
  const cards = services.filter((service) => service.featured).slice(0, 3);
  const initials =
    settings.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "—";

  return (
    <section className="shell pt-3">
      <div className="panel relative overflow-hidden px-5 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        {/* Warm light bleeding through the panel — the reference's signature. */}
        <div aria-hidden="true" className="glow left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/3" />
        <div aria-hidden="true" className="glow -bottom-32 -left-24 h-72 w-72 opacity-40" />

        <div className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
          {/* ---------------------------------------------------------- copy */}
          <div className="lg:col-span-5">
            <p
              className="eyebrow animate-rise"
              style={{ animationDelay: "80ms" }}
            >
              {settings.greeting || "Hello, I'm"}
            </p>

            <h1
              className="mt-2 text-h1 font-bold text-ink animate-rise"
              style={{ animationDelay: "160ms" }}
            >
              {/* Shortened so a three-part name doesn't stack over three lines.
                  The full name still carries the page title and metadata.
                  The first "o" becomes a rotating gem; AnimatedLetterText keeps
                  the plain text available to screen readers. */}
              <AnimatedLetterText
                text={shortName(settings.name) || "Your name"}
                letterToReplace="o"
                id="hero-name"
              />
            </h1>

            {settings.tagline && (
              <p
                className="mt-5 max-w-[46ch] text-lead text-ink-soft animate-rise"
                style={{ animationDelay: "260ms" }}
              >
                {settings.tagline}
              </p>
            )}

            {/* The primary call to action, deliberately oversized — it is the
                one thing this page most wants a visitor to do. */}
            <div className="mt-8 animate-rise" style={{ animationDelay: "360ms" }}>
              <LiquidButton
                label="Contact me"
                href="/contact"
                className="w-full sm:w-auto min-h-[4.5rem] rounded-full bg-ember px-12 text-[1.375rem] font-bold text-white shadow-float transition-transform duration-200 hover:-translate-y-1 sm:min-h-[5rem] sm:px-16 sm:text-[1.75rem]"
              />
            </div>

            <div
              className="mt-5 flex flex-wrap items-center gap-3 animate-rise"
              style={{ animationDelay: "420ms" }}
            >
              <Button href="/work" variant="ghost">
                View my work
              </Button>
              {settings.resume_media && (
                <Button href={settings.resume_media.url} variant="ghost" external>
                  Download CV
                </Button>
              )}
            </div>

            {settings.socials.length > 0 && (
              <div
                className="mt-8 flex flex-wrap items-center gap-2.5 animate-rise"
                style={{ animationDelay: "440ms" }}
              >
                {settings.socials.map((social) => (
                  <a
                    key={`${social.label}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="rounded-full border border-field px-4 py-2 text-small text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-ember hover:text-ember-deep"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------------------------------- portrait */}
          <div className="lg:col-span-4 flex justify-center">
            <div
              className="relative flex aspect-square w-full max-w-[19rem] items-end justify-center animate-pop"
              style={{ animationDelay: "300ms" }}
            >
              {/* The arc the subject stands against. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-surface-2"
              />
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-full border border-line"
              />

              {settings.avatar ? (
                <img
                  src={settings.avatar.url}
                  srcSet={settings.avatar.srcset}
                  sizes="(min-width: 64rem) 19rem, 60vw"
                  alt={settings.name ? `Portrait of ${settings.name}` : "Portrait"}
                  className="relative h-[95%] w-auto max-w-full object-contain"
                />
              ) : (
                /* Honest empty state: says what to do rather than faking a face. */
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 text-center">
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-ember/15 text-h2 font-bold text-ember-deep">
                    {initials}
                  </span>
                  <span className="max-w-[18ch] text-micro text-ink-faint normal-case tracking-normal">
                    Add a photo in Settings → Portrait
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------------------- floating capabilities */}
          <div className="lg:col-span-3">
            {cards.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {cards.map((service, index) => (
                  <li
                    key={service.id}
                    className="card card-lift animate-rise p-4 lg:animate-drift"
                    style={{
                      animationDelay: `${480 + index * 120}ms`,
                      // Offset each card so the column reads as scattered, not stacked.
                      ...(index === 1 ? { marginInlineStart: "auto" } : {}),
                    }}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember/15 text-small font-bold text-ember-deep">
                      {index + 1}
                    </span>
                    <p className="mt-3 text-small font-semibold text-ink">{service.title}</p>
                    {service.blurb && (
                      <p className="mt-1 text-micro normal-case tracking-normal text-ink-soft line-clamp-2">
                        {service.blurb}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="card animate-rise p-5 text-center"
                style={{ animationDelay: "480ms" }}
              >
                <p className="text-small font-semibold text-ink">No services yet</p>
                <p className="mt-1 text-micro normal-case tracking-normal text-ink-soft">
                  Add them in the admin panel to fill this space.
                </p>
              </div>
            )}

            <div
              className="mt-3 card p-4 animate-rise"
              style={{ animationDelay: "840ms" }}
            >
              <p className="text-h3 font-bold text-ink">{projectCount}</p>
              <p className="text-micro normal-case tracking-normal text-ink-soft">
                {projectCount === 1 ? "project published" : "projects published"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
