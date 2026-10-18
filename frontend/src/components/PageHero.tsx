/**
 * Top of an inner page: the title, an optional lead, and room for one row
 * of controls. No label above it; the page starts with its words.
 */
export function PageHero({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line pb-8 sm:pb-10">
      <h1
        className="text-h1 font-bold tracking-tight text-ink animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        {title}
      </h1>
      {lead && (
        <p
          className="mt-4 max-w-[56ch] text-lead text-ink-soft animate-rise"
          style={{ animationDelay: "140ms" }}
        >
          {lead}
        </p>
      )}
      {children && (
        <div className="mt-6 animate-rise" style={{ animationDelay: "220ms" }}>
          {children}
        </div>
      )}
    </header>
  );
}
