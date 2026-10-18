"use client";

import { useEffect, useState } from "react";

/**
 * Section links in the rail. The one whose section is on screen is lit.
 * Plain anchors, so it works without JS; the observer only adds the highlight.
 */
export function RailNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost visible section wins.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sections">
      <ul className="space-y-1">
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "location" : undefined}
                className={`group flex min-h-9 items-center gap-3 text-small transition-colors ${
                  on ? "text-ink" : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-px bg-current transition-all duration-300 ${on ? "w-10" : "w-5 group-hover:w-8"}`}
                />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
