/** Standard top-of-page banner for inner pages. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="shell pt-3">
      <div className="panel relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="glow -top-24 right-0 h-72 w-72 sm:h-96 sm:w-96"
        />

        <div className="relative max-w-3xl">
          <p className="eyebrow animate-rise" style={{ animationDelay: "60ms" }}>
            {eyebrow}
          </p>
          <h1
            className="mt-2 text-h2 font-bold tracking-tight text-ink animate-rise"
            style={{ animationDelay: "140ms" }}
          >
            {title}
          </h1>
          {lead && (
            <p
              className="mt-4 max-w-[56ch] text-lead text-ink-soft animate-rise"
              style={{ animationDelay: "220ms" }}
            >
              {lead}
            </p>
          )}
          {children && (
            <div className="mt-7 animate-rise" style={{ animationDelay: "300ms" }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
