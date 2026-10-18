import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders Markdown authored in the admin panel.
 *
 * Raw HTML is not enabled, so react-markdown escapes any that appears in the
 * source. That matters even though only the owner can author content: if the
 * admin account is ever compromised, stored markdown must not become stored XSS.
 *
 * "[to confirm]" markers in the copy are wrapped as inline code before
 * rendering and then drawn as amber flags, so a placeholder is never mistaken
 * for a fact by a reader and never missed by the owner.
 */
const MARKER = /\[to confirm[^\]]*\]/gi;

export function Markdown({ children }: { children: string }) {
  if (!children.trim()) return null;

  const source = children.replace(MARKER, (match) => `\`${match}\``);

  return (
    <div className="prose-warm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: content }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {content}
              </a>
            );
          },
          code: ({ children: content, className }) => {
            const text = String(content ?? "");
            if (/^\[to confirm/i.test(text)) {
              return (
                <span className="to-confirm" title="Placeholder: fill this in from the admin panel">
                  {text}
                </span>
              );
            }
            return <code className={className}>{content}</code>;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
