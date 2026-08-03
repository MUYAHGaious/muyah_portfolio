import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell pt-24 pb-32">
      <p className="label-micro">404</p>
      <h1 className="mt-3 text-h2 font-semibold">This page doesn&apos;t exist.</h1>
      <p className="mt-4 text-muted max-w-[42ch]">
        The link may be out of date, or the page may have been renamed.
      </p>

      <nav aria-label="Suggested pages" className="rule-top mt-10 pt-6 flex gap-6 text-small">
        <Link href="/" className="text-muted hover:text-signal transition-colors duration-150">
          Home
        </Link>
        <Link href="/work" className="text-muted hover:text-signal transition-colors duration-150">
          Work
        </Link>
        <Link
          href="/contact"
          className="text-muted hover:text-signal transition-colors duration-150"
        >
          Contact
        </Link>
      </nav>
    </section>
  );
}
