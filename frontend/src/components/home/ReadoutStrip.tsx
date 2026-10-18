import { Reveal } from "@/components/motion/Reveal";
import { ToConfirm } from "@/components/ToConfirm";
import type { Stat } from "@/lib/types";

/**
 * A single row of facts under the hero. Values are what they are; a "[to
 * confirm]" marker shows up amber rather than pretending to be a number.
 */
export function ReadoutStrip({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="shell">
      <Reveal>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--r-lg)] border border-line bg-line lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface/90 px-5 py-5 sm:px-6">
              <dt className="order-2 text-small text-ink-soft">{stat.label}</dt>
              <dd className="text-h3 font-bold tracking-tight text-ink">
                <ToConfirm text={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
