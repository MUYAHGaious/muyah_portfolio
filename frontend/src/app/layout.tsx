import type { Metadata } from "next";
import localFont from "next/font/local";

import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { LiveChat } from "@/components/LiveChat";
import { SiteBackground } from "@/components/SiteBackground";
import { PageViewTracker } from "@/components/PageViewTracker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { getSettings } from "@/lib/api";
import { SITE_URL, graph, personSchema, websiteSchema } from "@/lib/seo";

import "./globals.css";

const archivo = localFont({
  src: "../fonts/Archivo-Variable.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

/**
 * Render every page per request rather than prerendering at build time.
 *
 * Segment config in the root layout cascades to all routes beneath it, so this
 * one line covers the whole public site.
 *
 * The build runs inside `docker build`, where the API container does not exist.
 * Prerendering there captured a site with no content and baked it into the
 * image, which was then served until the first revalidation — the "my name is
 * missing and the cards are gone" state. Fetches still set `next.revalidate`,
 * so responses are cached for a minute; only the render moves to request time.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings.name || "Portfolio";
  const description = settings.tagline || "Selected work, services, and writing.";

  // A Twitter/X profile in the admin socials becomes the attribution on shared
  // links, which is what makes a card say "by @handle" instead of nothing.
  const x = (settings.socials ?? []).find((s) => /twitter\.com|x\.com/i.test(s.url ?? ""));
  const handle = x?.url.replace(/\/+$/, "").split("/").pop();

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s — ${name}` },
    description,
    applicationName: name,
    authors: [{ name, url: SITE_URL }],
    creator: name,
    publisher: name,
    alternates: { canonical: "/" },
    openGraph: {
      title: name,
      description,
      type: "website",
      url: SITE_URL,
      siteName: name,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      ...(handle && { creator: `@${handle}`, site: `@${handle}` }),
    },
    // `max-image-preview: large` is the difference between a thumbnail and a
    // full-width image in Google results — the single highest-leverage robots
    // directive for a visual portfolio.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    // Stops iOS Safari turning numbers in project copy into phone links.
    formatDetection: { telephone: false, address: false, email: false },
  };
}

/**
 * Runs before first paint.
 *
 * Applies a stored dark preference only — the site defaults to light and never
 * follows the system setting. Also swaps the `no-js` class, which is what makes
 * scroll-reveal content visible when JS is unavailable.
 */
const BOOTSTRAP = `
(function () {
  var el = document.documentElement;
  el.classList.remove("no-js");
  try {
    if (localStorage.getItem("theme") === "dark") el.setAttribute("data-theme", "dark");
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${archivo.variable} no-js`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
        {/*
          One Person and one WebSite node, emitted on every page with the same
          @id. Repeating identical identifiers is what lets search engines merge
          them into a single authoritative entity rather than treating each page
          as describing a different person.
        */}
        <JsonLd data={graph(personSchema(settings), websiteSchema(settings))} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <SiteBackground />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[110] focus:left-4 focus:top-4 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-small focus:text-surface"
        >
          Skip to content
        </a>

        <LoadingScreen name={settings.name} />

        <SiteHeader name={settings.name} location={settings.location} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} />

        {/* Clears the fixed bottom bar so the footer is never trapped beneath it. */}
        <div aria-hidden="true" className="h-20 md:hidden" />

        <BottomNav />
        <PageViewTracker />
        <LiveChat />
      </body>
    </html>
  );
}
