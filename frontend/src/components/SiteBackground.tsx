/**
 * A faint grid of points behind the whole site.
 *
 * The home page draws a live neural network in its hero; inner pages get this
 * still echo of it: the same neuron-dot rhythm, no fibres, almost invisible.
 * Fixed so content moves over it, and a radial mask keeps it away from the
 * edges where it would compete with text.
 *
 * Pure CSS: no image request, no canvas, nothing to keep in sync with the
 * palette. The dot colour is the positive-weight cyan at very low alpha.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, color-mix(in srgb, var(--ember) 28%, transparent) 1px, transparent 1.5px)",
        backgroundSize: "28px 28px",
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(0,0,0,0.55) 0%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(0,0,0,0.55) 0%, transparent 100%)",
      }}
    />
  );
}
