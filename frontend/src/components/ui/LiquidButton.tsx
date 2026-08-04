import Link from "next/link";

/**
 * Oversized glass call-to-action.
 *
 * Originally wired to @avenra/liquid-glass, which initialised without error but
 * left an empty, zero-height element with no label node — a blank button. The
 * refraction is rebuilt here in CSS instead: a tinted gradient body, a bright
 * inner bevel, a specular highlight that sweeps on hover, and a soft cast
 * shadow. It renders identically on the server, cannot fail at runtime, and
 * takes its colour from the same tokens as everything else.
 *
 * It is a real link, so it works with middle-click, "open in new tab", and
 * keyboard navigation.
 */
export function LiquidButton({
  label,
  href,
  className = "",
}: {
  label: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full
        bg-gradient-to-br from-[#FF9A5C] via-ember to-ember-deep
        px-10 py-5 text-[1.375rem] font-bold tracking-tight text-white
        shadow-[0_18px_44px_-12px_rgba(232,84,26,0.55)]
        transition-[transform,box-shadow] duration-300 ease-out
        hover:-translate-y-1 hover:shadow-[0_26px_60px_-14px_rgba(232,84,26,0.65)]
        active:translate-y-0
        motion-reduce:transition-none motion-reduce:hover:translate-y-0
        sm:px-14 sm:py-6 sm:text-[1.75rem]
        ${className}`}
    >
      {/* Bevel: a bright inner edge along the top, dark along the bottom, which
          is what reads as thickness rather than a flat fill. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_2px_6px_rgba(255,255,255,0.55),inset_0_-3px_8px_rgba(120,40,10,0.35)]"
      />

      {/* Specular sweep on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/25 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[400%] motion-reduce:hidden"
      />

      <span className="relative z-10 drop-shadow-[0_2px_10px_rgba(120,40,10,0.45)]">{label}</span>

      <span
        aria-hidden="true"
        className="relative z-10 ml-3 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
      >
        →
      </span>
    </Link>
  );
}
