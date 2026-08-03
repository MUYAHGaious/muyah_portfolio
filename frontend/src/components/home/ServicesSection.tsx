import { Reveal } from "@/components/motion/Reveal";
import type { Service } from "@/lib/types";

export function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <Reveal as="li" key={service.id} delay={index * 90}>
          <article className="card card-lift relative h-full overflow-hidden p-6">
            <div
              aria-hidden="true"
              className="glow -right-16 -top-16 h-40 w-40 opacity-0 transition-opacity duration-500 group-hover:opacity-40"
            />

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ember/15 text-small font-bold text-ember-deep">
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="mt-4 text-h4 font-bold tracking-tight text-ink">{service.title}</h3>

            {service.blurb && <p className="mt-2 text-small text-ink-soft">{service.blurb}</p>}

            {service.points.length > 0 && (
              <ul className="mt-5 space-y-2 border-t border-line pt-5">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-small text-ink-soft">
                    <span
                      aria-hidden="true"
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
