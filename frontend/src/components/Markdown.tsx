import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders Markdown authored in the admin panel.
 *
 * Raw HTML is not enabled, so react-markdown escapes any that appears in the
 * source. That matters even though only the owner can author content — if the
 * admin account is ever compromised, stored markdown must not become stored XSS.
 */
export function Markdown({ children }: { children: string }) {
  if (!children.trim()) return null;

  return (
    <div className="prose-swiss">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: content }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {content}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
