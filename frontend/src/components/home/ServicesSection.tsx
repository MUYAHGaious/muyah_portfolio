import type { Service } from "@/lib/types";

/**
 * Services as text columns separated by hairlines. No boxes.
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
    <ul className="grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {services.map((service) => (
        <li key={service.id} className="py-6 sm:px-6 sm:py-2 sm:first:pl-0 sm:last:pr-0">
          <h3 className="text-h4 font-bold tracking-tight text-ink">{service.title}</h3>
          {service.blurb && <p className="mt-2 text-small text-ink-soft">{service.blurb}</p>}
          {showPoints && service.points.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {service.points.map((point) => (
                <li key={point} className="text-small text-ink-soft">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
