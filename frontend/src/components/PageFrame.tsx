import { IdentityRail } from "@/components/home/IdentityRail";
import type { Project, SiteSettings } from "@/lib/types";

/**
 * The bench grid for inner pages: the compact identity rail on the left,
 * the page on the right, so every page lines up on the same columns as the
 * home page.
 */
export function PageFrame({
  settings,
  featured = [],
  children,
}: {
  settings: SiteSettings;
  featured?: Project[];
  children: React.ReactNode;
}) {
  return (
    <div className="shell pt-8 sm:pt-12">
      <div className="bench">
        <IdentityRail settings={settings} featured={featured} compact />
        <div className="bench-main">{children}</div>
      </div>
    </div>
  );
}
