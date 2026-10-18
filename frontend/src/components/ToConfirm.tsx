/**
 * Renders text that may contain the literal marker "[to confirm]" with the
 * marker visibly flagged. Placeholders should never pass as facts, and the
 * owner should be able to spot them at a glance.
 */
const MARKER = /\[to confirm[^\]]*\]/gi;

export function ToConfirm({ text }: { text: string }) {
  if (!MARKER.test(text)) return <>{text}</>;
  MARKER.lastIndex = 0;

  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKER)) {
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <span key={start} className="to-confirm" title="Placeholder: fill this in from the admin panel">
        {match[0]}
      </span>,
    );
    last = start + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
