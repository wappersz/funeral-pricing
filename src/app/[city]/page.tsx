import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getTownBySlug, searchNearby, type SearchResult } from "@/lib/search";
import { getTownContent } from "@/data/town-content";

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const town = await getTownBySlug(slug);
  if (!town) return {};

  return {
    title: `Funeral Prices in ${town.name} | Compare Funeral Directors | Funeral Pricing`,
    description: `Compare funeral costs from directors near ${town.name}. See up-to-date prices for direct cremation and standard funerals so you can make an informed choice.`,
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: slug } = await params;
  const town = await getTownBySlug(slug);
  if (!town) notFound();

  const results: SearchResult[] = await searchNearby(town.lat, town.lng);
  const seoContent = getTownContent(town.name, town.count);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/">
          <Image
            src="/logo.jpg"
            alt="Funeral Pricing"
            width={160}
            height={40}
            priority
          />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-navy">
            Funeral Prices in {town.name}
          </h1>
          <p className="mb-8 leading-relaxed text-foreground/80">
            {seoContent}
          </p>

          {/* Results */}
          {results.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-navy text-white">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">City</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Distance
                      </th>
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
                    {results.map((home, i) => (
                      <tr
                        key={home.id}
                        className={
                          i % 2 === 0 ? "bg-white" : "bg-background"
                        }
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {home.name}
                        </td>
                        <td className="px-4 py-3 text-gray">{home.city}</td>
                        <td className="px-4 py-3 text-right text-gray">
                          {Number(home.distance_miles).toFixed(1)} mi
                        </td>
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
                              className="inline-block rounded bg-green px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
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
                Showing {results.length} funeral director
                {results.length !== 1 ? "s" : ""} within 30 miles of{" "}
                {town.name}
              </p>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-white px-6 py-10 text-center">
              <p className="font-medium text-foreground">No results found</p>
              <p className="mt-1 text-sm text-gray">
                No funeral directors found within 30 miles of {town.name}. Try
                searching by your postcode instead.
              </p>
            </div>
          )}

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

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-gray">
        <Link href="/blog" className="transition-colors hover:text-navy">
          Latest Blog Posts
        </Link>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} funeralpricing.co.uk. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
