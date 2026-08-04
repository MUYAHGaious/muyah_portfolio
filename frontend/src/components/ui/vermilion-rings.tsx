/**
 * "Vermilion Rings" — concentric gradient bands, pure CSS, no dependencies.
 *
 * Kept as authored: a single element filling its parent, sized in container
 * query units so the rings scale with the box rather than the viewport.
 *
 * Two notes on using it:
 *  - At full strength this is extremely loud. It is applied behind panels at low
 *    opacity, where it reads as warm depth rather than a bullseye.
 *  - `containerType: size` requires the parent to be positioned and sized, so it
 *    is always given `absolute inset-0` inside a `relative` container.
 */
export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-1.4cqmin",
          filter: "blur(0.7cqmin)",
          backgroundColor: "#EB6101",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #eb6101 0%, #eb6101 10%, #ed7118 10%, #ed7118 20%, #ef812f 20%, #ef812f 30%, #f29146 30%, #f29146 40%, #f4a15d 40%, #f4a15d 50%, #f6b173 50%, #f6b173 60%, #f8c18a 60%, #f8c18a 70%, #fbd1a1 70%, #fbd1a1 80%, #fde1b8 80%, #fde1b8 90%, #fff1cf 90%, #fff1cf 100%)",
        }}
      />
    </div>
  );
}
