/**
 * Renders schema.org data as a JSON-LD script tag.
 *
 * `<` is escaped because the payload contains admin-authored content: a project
 * summary containing "</script>" would otherwise close the tag early and inject
 * markup into the page.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
