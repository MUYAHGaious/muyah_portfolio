import type { SiteSettings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    // No top margin: every page section already ends with its own bottom
    // padding, and stacking the two left a conspicuous void above the rule.
    <footer className="rule-top">
      <div className="page-shell grid-field py-10">
        <div className="col-span-12 sm:col-span-4">
          <p className="label-micro">Contact</p>
          {settings.email ? (
            <a
              href={`mailto:${settings.email}`}
              className="mt-2 block text-small hover:text-signal transition-colors duration-150"
            >
              {settings.email}
            </a>
          ) : (
            <p className="mt-2 text-small text-muted">Add an address in settings</p>
          )}
          {settings.location && (
            <p className="mt-1 text-small text-muted">{settings.location}</p>
          )}
        </div>

        <div className="col-span-12 sm:col-span-4 mt-8 sm:mt-0">
          <p className="label-micro">Elsewhere</p>
          <ul className="mt-2 space-y-1">
            {settings.socials.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <a
                  href={link.url}
                  className="text-small hover:text-signal transition-colors duration-150"
                  rel="me noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 sm:col-span-4 mt-8 sm:mt-0 sm:text-right">
          <p className="label-micro">© {year}</p>
          <p className="mt-2 text-small text-muted">{settings.name}</p>
        </div>
      </div>
    </footer>
  );
}
