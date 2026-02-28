import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Funeral Pricing | Independent UK Funeral Cost Comparison",
  description:
    "Funeral Pricing is an independent service helping UK families compare funeral director prices. Find out how we collect our data and why we built this site.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-2xl">

          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-navy">
            About Funeral Pricing
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-foreground/80">
            An independent service helping families across the UK compare funeral costs honestly and without pressure.
          </p>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-navy">Why we built this</h2>
            <p className="mb-4 leading-relaxed text-foreground">
              Arranging a funeral is one of the most difficult things a family can face. Decisions that would normally take weeks of research have to be made within days, often while grieving. For a long time, funeral pricing in the UK was opaque, with families frequently paying more than they needed to simply because they had no way to compare.
            </p>
            <p className="leading-relaxed text-foreground">
              Funeral Pricing exists to change that. Our goal is simple: give families clear, accurate pricing information so they can make informed decisions at an incredibly difficult time.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-navy">How our data works</h2>
            <p className="mb-4 leading-relaxed text-foreground">
              Since 2021, all funeral directors in the UK have been required by the Competition and Markets Authority to publish a Standardised Price List on their website. This covers core services including direct cremation, attended funerals, and the individual fees that make up the total cost.
            </p>
            <p className="mb-4 leading-relaxed text-foreground">
              We collect and index those published prices, making them searchable in one place. Every price on this site comes directly from the funeral director's own published information. We do not estimate or adjust figures.
            </p>
            <p className="leading-relaxed text-foreground">
              Prices change, and we work to keep our data as current as possible. If you notice a discrepancy between what we show and what a funeral director currently publishes, the funeral director's own website should always be treated as the definitive source.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-navy">We are independent</h2>
            <p className="mb-4 leading-relaxed text-foreground">
              Funeral Pricing is not affiliated with any funeral director, group, or trade body. We do not accept payment for placement or prominence in our results. The funeral directors you see listed have not paid to appear, and we do not earn commission if you contact or use them.
            </p>
            <p className="leading-relaxed text-foreground">
              Our only interest is in making funeral pricing more transparent for families.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-3 text-xl font-semibold text-navy">Get in touch</h2>
            <p className="leading-relaxed text-foreground">
              If you have a question, notice an error in our data, or represent a funeral director and want to update your listing, please contact us at{" "}
              <a
                href="mailto:hello@funeralpricing.co.uk"
                className="text-navy underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                hello@funeralpricing.co.uk
              </a>
              .
            </p>
          </section>

          <div className="rounded-xl border border-border bg-white p-6">
            <p className="mb-4 text-sm font-medium text-foreground">
              Ready to compare funeral directors near you?
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/search"
                className="rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Search by postcode
              </Link>
              <Link
                href="/areas"
                className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-navy hover:text-navy"
              >
                Browse by town
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
