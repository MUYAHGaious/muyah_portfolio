import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { getSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about work or collaboration.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <section className="page-shell pt-16 pb-20 sm:pt-24">
      <div className="grid-field">
        <h1 className="col-span-12 sm:col-span-4 text-h2 font-semibold">Contact</h1>

        <div className="col-span-12 sm:col-span-7 sm:col-start-6 mt-6 sm:mt-0">
          <p className="text-lead text-muted max-w-[38ch]">
            Tell me what you&apos;re working on and what you need. I read everything
            that comes through here.
          </p>

          {settings.email && (
            <p className="mt-6 text-small text-muted">
              Prefer email?{" "}
              <a
                href={`mailto:${settings.email}`}
                className="text-ink underline underline-offset-4 hover:text-signal transition-colors duration-150"
              >
                {settings.email}
              </a>
            </p>
          )}

          <div className="mt-12">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
