import { Reveal } from "@/components/motion/Reveal";
import type { Service } from "@/lib/types";

/**
 * Services as three plain columns. No cards, no gradients: a title, a line,
 * and the points. The hairline between columns is the only structure.
 */
export function ServicesSection({
  services,
  showPoints = true,
}: {
  services: Service[];
  showPoints?: boolean;
}) {
  if (services.length === 0) return null;

  return (
    <ul className="grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <Reveal as="li" key={service.id} delay={index * 80} className="bg-surface/90 p-6 sm:p-7">
          <h3 className="text-h4 font-bold tracking-tight text-ink">{service.title}</h3>
          {service.blurb && <p className="mt-2 text-small text-ink-soft">{service.blurb}</p>}
          {showPoints && service.points.length > 0 && (
            <ul className="mt-5 space-y-2">
              {service.points.map((point) => (
                <li key={point} className="flex gap-2.5 text-small text-ink-soft">
                  <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      ))}
    </ul>
  );
}
