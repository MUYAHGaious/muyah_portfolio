"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Fixed bottom navigation, mobile only.
 *
 * Thumbs reach the bottom of a phone far more easily than the top, so the five
 * primary destinations live here. The burger menu in the header stays as the
 * full index — the bottom bar is the shortcut, not a replacement.
 *
 * Hidden on the admin panel: that is a dense editing tool, and covering 4rem of
 * a small screen with site navigation while someone is writing a post is a cost
 * with no benefit.
 *
 * Icons are inline SVG rather than an icon package — five glyphs do not justify
 * a dependency, and inlining keeps them themable with currentColor.
 */

const ITEMS = [
  {
    href: "/",
    label: "Home",
    path: "M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5",
  },
  {
    href: "/work",
    label: "Work",
    path: "M3.5 8.5h17v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-11ZM9 8.5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3.5",
  },
  {
    href: "/services",
    label: "Services",
    path: "M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5Z",
  },
  {
    href: "/writing",
    label: "Writing",
    path: "M5 20.5h14M6.5 16.5l1-4L16 4a1.8 1.8 0 0 1 2.5 2.5l-8.5 8.5-4 1.5Z",
  },
  {
    href: "/contact",
    label: "Contact",
    path: "M3.5 6.5h17v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-11Zm0 .5 8.5 6 8.5-6",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      // Keeps the bar clear of the iPhone home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-3 mb-3 flex items-stretch justify-between gap-1 rounded-full bg-surface/90 p-1.5 shadow-float backdrop-blur-md">
        {ITEMS.map((item) => {
          const current = isCurrent(item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                // 3.25rem tall: comfortably past the 44px minimum touch target.
                className={`flex h-[3.25rem] flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200 ${
                  current ? "bg-ember/15 text-ember-deep" : "text-ink-soft"
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[1.15rem] w-[1.15rem]"
                >
                  <path d={item.path} />
                </svg>
                <span className="text-[0.625rem] font-medium leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
