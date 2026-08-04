import { Reveal } from "@/components/motion/Reveal";
import { GradientCard } from "@/components/ui/gradient-card";
import type { Service } from "@/lib/types";

/**
 * Services as gradient feature cards.
 *
 * The gradient and badge dot cycle through the warm palette so a row of cards
 * reads as a set rather than a repetition, and the assignment is by index so it
 * stays stable as services are reordered in the admin panel.
 */
const PALETTE = [
  { gradient: "ember" as const, dot: "#E8541A" },
  { gradient: "sand" as const, dot: "#B08968" },
  { gradient: "clay" as const, dot: "#C2694A" },
  { gradient: "moss" as const, dot: "#6E8B5B" },
];

export function ServicesSection({
  services,
  showPoints = true,
}: {
  services: Service[];
  showPoints?: boolean;
}) {
  if (services.length === 0) return null;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:gap-6">
      {services.map((service, index) => {
        const theme = PALETTE[index % PALETTE.length];

        return (
          <Reveal as="li" key={service.id} delay={index * 90}>
            <GradientCard
              gradient={theme.gradient}
              badgeColor={theme.dot}
              badgeText={`0${index + 1} — Service`}
              title={service.title}
              description={service.blurb}
              points={showPoints ? service.points : undefined}
              ctaText="Start a conversation"
              ctaHref="/contact"
            />
          </Reveal>
        );
      })}
    </ul>
  );
}
