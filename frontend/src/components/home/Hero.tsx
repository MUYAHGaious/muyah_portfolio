import { NetworkHero } from "@/components/network/NetworkHero";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/types";

/**
 * The hero: a live neural network, with the claim beside it.
 *
 * Server-rendered copy first, so the headline is in the HTML; the network and
 * the text field hydrate on the client. The network is the one loud thing on
 * the page, so the copy is set plainly and kept short.
 */
export function Hero({ settings }: { settings: SiteSettings }) {
  const github = settings.socials.find((s) => /github\.com/i.test(s.url));
  const education = settings.education ?? [];

  return (
    <section className="relative -mt-[4.5rem] pt-[4.5rem] sm:-mt-[5rem] sm:pt-[5rem]">
      <NetworkHero>
        <div className="max-w-4xl">
          <h1
            className="font-bold text-ink"
            style={{
              fontSize: "clamp(2.5rem, 5.6vw + 0.9rem, 6rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
            }}
          >
            {settings.name}
          </h1>

          <p className="mt-5 max-w-[46ch] text-lead text-ink">
            {settings.title ? (
              <>
                <span className="font-semibold">{settings.title.replace(/\s*·\s*/g, ", ")}</span>
                {". "}
              </>
            ) : null}
            I lead the AI department at Skye8 and build the models myself
            {settings.location ? `, from ${settings.location}` : ""}.
          </p>

          <p className="mt-3 max-w-[52ch] text-small text-ink-soft">
            Text and speech models and real-time voice talk-back behind Malegado&apos;s 590
            languages. Now building Scholar AI.
            {education.length > 0 && ` ${education[0].degree}, ${education[0].school}.`}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href="/work" variant="ember">
              See the work
            </Button>
            {github && (
              <Button href={github.url} variant="ghost" external>
                GitHub
              </Button>
            )}
            <Button href="/contact" variant="ghost">
              Contact
            </Button>
          </div>
        </div>
      </NetworkHero>
    </section>
  );
}
