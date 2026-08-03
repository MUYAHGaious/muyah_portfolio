import type { Metadata } from "next";
import localFont from "next/font/local";

import { PageViewTracker } from "@/components/PageViewTracker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSettings } from "@/lib/api";

import "./globals.css";

/**
 * One grotesque, many weights — the Swiss convention.
 *
 * The variable font file is committed to the repo rather than pulled from Google
 * Fonts at build time. That keeps the build hermetic (no network dependency when
 * the image is built on the VPS) and means no request ever leaves the visitor's
 * browser for a third-party CDN.
 */
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
  const description = settings.tagline || "Selected work and writing.";

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
 * Applies the stored theme before first paint. Without this the page renders in
 * the system theme and then snaps to the chosen one.
 */
const THEME_BOOTSTRAP = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:bg-ink focus:text-paper focus:px-3 focus:py-2 focus:text-small"
        >
          Skip to content
        </a>

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
