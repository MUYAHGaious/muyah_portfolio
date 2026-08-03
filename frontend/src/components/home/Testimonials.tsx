import { Reveal } from "@/components/motion/Reveal";
import type { Testimonial } from "@/lib/types";

/**
 * Renders nothing when there are no testimonials.
 *
 * Deliberate: an empty "what people say" section is worse than no section, and
 * filling it with invented praise is worse still.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial, index) => (
        <Reveal as="li" key={testimonial.id} delay={index * 90}>
          <figure className="card h-full p-6">
            <span aria-hidden="true" className="text-h2 font-bold leading-none text-ember/40">
              &ldquo;
            </span>

            <blockquote className="mt-2 text-small leading-relaxed text-ink-soft">
              {testimonial.quote}
            </blockquote>

            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-5">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar.url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ember/15 text-small font-bold text-ember-deep">
                  {testimonial.author.charAt(0).toUpperCase()}
                </span>
              )}

              <span>
                <span className="block text-small font-semibold text-ink">
                  {testimonial.author}
                </span>
                {testimonial.role && (
                  <span className="block text-micro normal-case tracking-normal text-ink-soft">
                    {testimonial.role}
                  </span>
                )}
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}
