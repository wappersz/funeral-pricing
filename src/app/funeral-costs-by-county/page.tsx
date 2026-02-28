import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { getCountyAverages } from "@/lib/counties";
import CountyMap from "./county-map";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Average Funeral Costs by County | UK Funeral Price Map | Funeral Pricing",
  description:
    "Interactive map showing average funeral costs across UK counties. Compare direct cremation and standard funeral prices by region to find affordable options near you.",
};

export default async function CountyMapPage() {
  const countyData = await getCountyAverages();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-navy">
            Average Funeral Costs by County
          </h1>
          <p className="mb-8 leading-relaxed text-foreground/80">
            Funeral prices vary significantly across the UK. This map shows
            average costs for direct cremation and standard funerals in each
            county, based on prices published by local funeral directors. Hover
            over a county to see its average prices, or click to view all
            funeral directors in that area.
          </p>

          {/* Interactive map */}
          <CountyMap data={countyData} />

          {/* SEO table */}
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-navy">
              Funeral Prices by County
            </h2>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {countyData
                .filter(
                  (c) =>
                    c.avg_direct_cremation != null ||
                    c.avg_standard_funeral != null
                )
                .map((county) => (
                  <Link
                    key={county.slug}
                    href={`/funeral-costs-by-county/${county.slug}`}
                    className="rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <h3 className="text-sm font-semibold text-foreground">
                      {county.county}
                    </h3>
                    <div className="mt-2 flex gap-4 text-xs">
                      <div>
                        <p className="text-gray">Direct Cremation</p>
                        <p className="text-sm font-medium text-foreground">
                          {county.avg_direct_cremation != null
                            ? `£${county.avg_direct_cremation.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray">Standard Funeral</p>
                        <p className="text-sm font-medium text-foreground">
                          {county.avg_standard_funeral != null
                            ? `£${county.avg_standard_funeral.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray">Directors</p>
                        <p className="text-sm font-medium text-foreground">
                          {county.home_count}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border border-border md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="px-4 py-3 font-medium">County</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Avg Direct Cremation
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Avg Standard Funeral
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Directors
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {countyData
                    .filter(
                      (c) =>
                        c.avg_direct_cremation != null ||
                        c.avg_standard_funeral != null
                    )
                    .map((county, i) => (
                      <tr
                        key={county.slug}
                        className={
                          i % 2 === 0 ? "bg-white" : "bg-background"
                        }
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {county.county}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {county.avg_direct_cremation != null
                            ? `£${county.avg_direct_cremation.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {county.avg_standard_funeral != null
                            ? `£${county.avg_standard_funeral.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray">
                          {county.home_count}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/funeral-costs-by-county/${county.slug}`}
                            className="inline-block rounded bg-trusted px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

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
