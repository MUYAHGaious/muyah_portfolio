/**
 * Top of an inner page: a mono readout, the title, an optional lead, and room
 * for one row of controls. No panel, no glow: the page starts with its words.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  /** Readout text, e.g. "work · 10 projects". */
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="shell pt-8 sm:pt-14">
      <div className="max-w-3xl border-b border-line pb-10 sm:pb-14">
        <p className="readout animate-rise" style={{ animationDelay: "40ms" }}>
          {eyebrow}
        </p>
        <h1
          className="mt-5 text-h1 font-bold tracking-tight text-ink animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        {lead && (
          <p
            className="mt-5 max-w-[56ch] text-lead text-ink-soft animate-rise"
            style={{ animationDelay: "200ms" }}
          >
            {lead}
          </p>
        )}
        {children && (
          <div className="mt-7 animate-rise" style={{ animationDelay: "280ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
