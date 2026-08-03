import type { Metadata } from "next";
import localFont from "next/font/local";

import { PageViewTracker } from "@/components/PageViewTracker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { getSettings } from "@/lib/api";

import "./globals.css";

const archivo = localFont({
  src: "../fonts/Archivo-Variable.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings.name || "Portfolio";
  const description = settings.tagline || "Selected work, services, and writing.";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s — ${name}` },
    description,
    openGraph: { title: name, description, type: "website", url: SITE_URL },
    twitter: { card: "summary_large_image", title: name, description },
    robots: { index: true, follow: true },
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
      </head>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[110] focus:left-4 focus:top-4 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-small focus:text-surface"
        >
          Skip to content
        </a>

        <LoadingScreen name={settings.name} />

        <SiteHeader name={settings.name} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} />

        <PageViewTracker />
      </body>
    </html>
  );
}
