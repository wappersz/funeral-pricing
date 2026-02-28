import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { getCountyHomes, getCountyAverages } from "@/lib/counties";
import { slugToCounty } from "@/data/county-slugs";

interface CountyPageProps {
  params: Promise<{ county: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CountyPageProps): Promise<Metadata> {
  const { county: slug } = await params;
  const countyName = slugToCounty(slug);
  if (!countyName) return {};

  return {
    title: `Funeral Prices in ${countyName} | Compare Funeral Directors | Funeral Pricing`,
    description: `Compare funeral costs from directors in ${countyName}. See prices for direct cremation and standard funerals to make an informed choice.`,
  };
}

export default async function CountyDetailPage({ params }: CountyPageProps) {
  const { county: slug } = await params;
  const countyName = slugToCounty(slug);
  if (!countyName) notFound();

  const homes = await getCountyHomes(countyName);
  if (homes.length === 0) notFound();

  // Get averages for this county
  const allAverages = await getCountyAverages();
  const avg = allAverages.find((a) => a.county === countyName);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/funeral-costs-by-county"
            className="mb-4 inline-block text-sm text-navy underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            Back to county map
          </Link>

          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-navy">
            Funeral Prices in {countyName}
          </h1>

          {/* Summary stats */}
          {avg && (
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-xs text-gray">Avg Direct Cremation</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {avg.avg_direct_cremation != null
                    ? `£${avg.avg_direct_cremation.toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-xs text-gray">Avg Standard Funeral</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {avg.avg_standard_funeral != null
                    ? `£${avg.avg_standard_funeral.toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-xs text-gray">Funeral Directors</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {avg.home_count}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-xs text-gray">With Published Prices</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {avg.priced_count}
                </p>
              </div>
            </div>
          )}

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {homes.map((home) => (
              <div
                key={home.id}
                className="rounded-lg border border-border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {home.name}
                  </h3>
                  {home.website_url ? (
                    <a
                      href={home.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded bg-trusted px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    >
                      View
                    </a>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-gray">{home.city}</p>
                <div className="mt-3 flex gap-4">
                  <div>
                    <p className="text-xs text-gray">Direct Cremation</p>
                    <p className="text-sm font-medium text-foreground">
                      {home.price_direct_cremation != null
                        ? `£${home.price_direct_cremation.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray">Standard Funeral</p>
                    <p className="text-sm font-medium text-foreground">
                      {home.price_standard_funeral != null
                        ? `£${home.price_standard_funeral.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Direct Cremation
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Standard Funeral
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {homes.map((home, i) => (
                  <tr
                    key={home.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-background"}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {home.name}
                    </td>
                    <td className="px-4 py-3 text-gray">{home.city}</td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {home.price_direct_cremation != null
                        ? `£${home.price_direct_cremation.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {home.price_standard_funeral != null
                        ? `£${home.price_standard_funeral.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {home.website_url ? (
                        <a
                          href={home.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded bg-trusted px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-gray">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray">
            Showing {homes.length} funeral director
            {homes.length !== 1 ? "s" : ""} in {countyName}
          </p>

          {/* Towns in this county */}
          {(() => {
            const cities = Array.from(
              new Map(
                homes.map((h) => [h.city, h.city.replace(/ /g, "-")])
              ).entries()
            ).sort((a, b) => a[0].localeCompare(b[0]));
            return cities.length > 0 ? (
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-semibold text-navy">
                  Towns and cities in {countyName}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cities.map(([name, slug]) => (
                    <Link
                      key={slug}
                      href={`/${slug}`}
                      className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-navy hover:text-navy"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null;
          })()}

          <div className="mt-8">
            <Link
              href="/search"
              className="text-sm font-medium text-navy underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              Search by your postcode instead
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
