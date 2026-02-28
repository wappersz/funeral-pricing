import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { getTowns } from "@/lib/search";

export const metadata: Metadata = {
  title: "Browse Funeral Directors by Town & City | UK Coverage | Funeral Pricing",
  description:
    "Find and compare funeral directors in towns and cities across the UK. Browse our full directory to see local prices for direct cremation and standard funerals.",
};

export const dynamic = "force-dynamic";

export default async function AreasPage() {
  const towns = await getTowns();

  // Group by first letter
  const groups: Record<string, typeof towns> = {};
  for (const town of towns) {
    const letter = town.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(town);
  }
  const letters = Object.keys(groups).sort();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-navy">
            Browse Funeral Directors by Town &amp; City
          </h1>
          <p className="mb-10 text-gray">
            Find and compare funeral directors across the UK. Select your town or city to see local prices for direct cremation and standard funerals.
          </p>

          {/* Alphabet quick-jump */}
          <div className="mb-8 flex flex-wrap gap-2">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#${letter}`}
                className="flex h-8 w-8 items-center justify-center rounded border border-border bg-white text-sm font-medium text-navy hover:bg-navy hover:text-white transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>

          {letters.map((letter) => (
            <section key={letter} id={letter} className="mb-10 scroll-mt-6">
              <h2 className="mb-4 border-b border-border pb-2 text-xl font-bold text-navy">
                {letter}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groups[letter].map((town) => (
                  <Link
                    key={town.slug}
                    href={`/${town.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2.5 text-sm hover:border-navy hover:text-navy transition-colors"
                  >
                    <span className="font-medium">{town.name}</span>
                    <span className="ml-2 text-xs text-gray">{town.count}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
