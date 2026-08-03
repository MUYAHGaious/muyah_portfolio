import Link from "next/link";

type Variant = "solid" | "ember" | "ghost";
type Size = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "transition-[transform,background-color,color,box-shadow] duration-200 ease-out " +
  "hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-ink text-surface hover:shadow-card",
  ember: "bg-ember text-white hover:bg-ember-deep hover:shadow-card",
  ghost: "border border-field text-ink hover:border-ink hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-small",
  md: "px-6 py-3 text-small",
};

function classesFor(variant: Variant, size: Size, extra = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

/** Pill button. Renders an <a> when `href` is set, a <button> otherwise. */
export function Button({
  href,
  variant = "solid",
  size = "md",
  className = "",
  external,
  children,
  ...props
}: {
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (href) {
    const classes = classesFor(variant, size, className);

    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    ) : (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={classesFor(variant, size, className)}>
      {children}
    </button>
  );
}
