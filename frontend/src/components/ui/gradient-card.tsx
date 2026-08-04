import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Gradient feature card.
 *
 * Adapted from the shadcn-style original to this site's tokens: the stock
 * purple/emerald/slate palettes were replaced with warm tints drawn from the
 * ember accent, so the card belongs to the same system as everything around it
 * rather than importing a second one.
 *
 * The hover motion is CSS rather than framer-motion. It is a scale and a lift —
 * roughly 50KB of JavaScript for something the compositor already does for free,
 * and it means the whole card still animates with no runtime cost.
 */
const cardVariants = cva(
  "relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[var(--r-lg)] p-7 sm:p-8 " +
    "shadow-soft transition-[transform,box-shadow] duration-300 ease-out " +
    "hover:-translate-y-1 hover:shadow-card motion-reduce:hover:translate-y-0",
  {
    variants: {
      gradient: {
        ember: "bg-gradient-to-br from-[#FFE6D4] to-[#FFCDAE]/60",
        sand: "bg-gradient-to-br from-[#F6EFE4] to-[#EADFCC]/70",
        clay: "bg-gradient-to-br from-[#F7E3DA] to-[#E9C6B6]/60",
        moss: "bg-gradient-to-br from-[#E8EEE2] to-[#D2DFC8]/70",
      },
    },
    defaultVariants: { gradient: "sand" },
  },
);

export interface GradientCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  badgeText: string;
  /** Hex colour for the badge dot, e.g. "#E8541A". */
  badgeColor: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  /** Optional decorative graphic bled into the bottom-right corner. */
  imageUrl?: string;
  points?: string[];
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  (
    {
      className,
      gradient,
      badgeText,
      badgeColor,
      title,
      description,
      ctaText,
      ctaHref,
      imageUrl,
      points,
      ...props
    },
    ref,
  ) => {
    // The gradients are light by design, so text on them is always the dark ink
    // rather than the theme's foreground — which inverts in dark mode and would
    // otherwise become unreadable here.
    return (
      <div ref={ref} className={cn(cardVariants({ gradient }), "group", className)} {...props}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute -bottom-1/4 -right-1/4 w-3/4 opacity-70 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0"
          />
        )}

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-micro font-semibold normal-case tracking-normal text-[#46190f] backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: badgeColor }}
            />
            {badgeText}
          </div>

          <div className="flex-grow">
            <h3 className="text-h3 font-bold tracking-tight text-[#46190f]">{title}</h3>
            <p className="mt-2 max-w-[34ch] text-small text-[#46190f]/75">{description}</p>

            {points && points.length > 0 && (
              <ul className="mt-5 space-y-2">
                {points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-small text-[#46190f]/75"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8541A]"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href={ctaHref}
            className="mt-7 inline-flex min-h-9 w-fit items-center gap-2 text-small font-semibold text-[#46190f]"
          >
            {ctaText}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        </div>
      </div>
    );
  },
);
GradientCard.displayName = "GradientCard";

export { GradientCard, cardVariants };
