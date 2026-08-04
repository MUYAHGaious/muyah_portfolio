"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  fetchSimpleIcons,
  renderSimpleIcon,
  type ICloud,
  type SimpleIcon,
} from "react-icon-cloud";

/**
 * Rotating 3D cloud of technology icons.
 *
 * Two changes from the supplied component:
 *
 *  - It read the theme from `next-themes`, which this project does not use. The
 *    theme lives in a `data-theme` attribute on <html>, so it is read from there
 *    and watched with a MutationObserver — otherwise toggling to dark would
 *    leave the icons tinted for a light background.
 *  - `fetchSimpleIcons` rejects the whole batch if any slug is unknown, and
 *    simple-icons renames slugs between releases. A failed fetch would leave a
 *    permanently empty box, so slugs are fetched individually and the ones that
 *    resolve are rendered.
 */

export const cloudProps: Omit<ICloud, "children"> = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingTop: 24,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: "grab",
    tooltip: "native",
    initial: [0.08, -0.08],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#0000",
    maxSpeed: 0.035,
    minSpeed: 0.018,
  },
};

function useTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function renderIcon(icon: SimpleIcon, theme: "light" | "dark") {
  // Matched to the site's surface tokens so the icons sit on the card rather
  // than on the library's default near-black.
  const bgHex = theme === "light" ? "#fbf8f3" : "#1b1613";
  const fallbackHex = theme === "light" ? "#8a6355" : "#b9a596";

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio: theme === "dark" ? 2 : 1.2,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (event: React.MouseEvent) => event.preventDefault(),
    },
  });
}

export function IconCloud({ iconSlugs }: { iconSlugs: string[] }) {
  const [icons, setIcons] = useState<SimpleIcon[] | null>(null);
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;

    // One request per slug: a single batch rejects entirely when any slug has
    // been renamed upstream, which would empty the cloud with no way to tell why.
    Promise.all(
      iconSlugs.map((slug) =>
        fetchSimpleIcons({ slugs: [slug] })
          .then((data) => Object.values(data.simpleIcons)[0])
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      setIcons(results.filter((icon): icon is SimpleIcon => Boolean(icon)));
    });

    return () => {
      cancelled = true;
    };
  }, [iconSlugs]);

  const rendered = useMemo(
    () => icons?.map((icon) => renderIcon(icon, theme)) ?? null,
    [icons, theme],
  );

  if (!rendered) {
    return (
      <div
        role="status"
        aria-label="Loading technology icons"
        className="skeleton mx-auto aspect-square w-full max-w-sm rounded-full"
      />
    );
  }

  return (
    <Cloud {...cloudProps}>
      <>{rendered}</>
    </Cloud>
  );
}
