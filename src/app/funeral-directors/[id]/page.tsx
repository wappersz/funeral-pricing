import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { getFuneralHomeById, searchNearby } from "@/lib/search";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const home = await getFuneralHomeById(Number(id));
  if (!home) return {};

  return {
    title: `${home.name} | Funeral Director in ${home.city} | Funeral Pricing`,
    description: `See prices for ${home.name} in ${home.city}. Compare direct cremation and standard funeral costs transparently.`,
  };
}

export default async function FuneralDirectorPage({ params }: Props) {
  const { id } = await params;
  const home = await getFuneralHomeById(Number(id));
  if (!home) notFound();

  const nearby = await searchNearby(home.latitude, home.longitude, 10);
  const nearbyOthers = nearby.filter((h) => h.id !== home.id).slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">

          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy transition-colors">Home</Link>
            <span className="mx-2 text-gray/50">/</span>
            <Link
              href={`/${home.city.replace(/ /g, "-")}`}
              className="hover:text-navy transition-colors"
            >
              {home.city}
            </Link>
            <span className="mx-2 text-gray/50">/</span>
            <span className="text-foreground">{home.name}</span>
          </nav>

          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-navy">
            {home.name}
          </h1>
          <p className="mb-8 text-gray">
            {home.address}{home.postcode ? `, ${home.postcode}` : ""}
          </p>

          {/* Price cards */}
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray mb-2">Direct Cremation</p>
              {home.price_direct_cremation != null ? (
                <p className="text-3xl font-bold text-navy">
                  £{home.price_direct_cremation.toLocaleString()}
                </p>
              ) : (
                <p className="text-lg font-medium text-gray/60">Price not listed</p>
              )}
            </div>
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray mb-2">Standard Funeral</p>
              {home.price_standard_funeral != null ? (
                <p className="text-3xl font-bold text-navy">
                  £{home.price_standard_funeral.toLocaleString()}
                </p>
              ) : (
                <p className="text-lg font-medium text-gray/60">Price not listed</p>
              )}
            </div>
          </div>

          {/* Contact + CTA */}
          {(home.phone_number || home.website_url) && (
            <div className="rounded-xl border border-border bg-white p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {home.phone_number && (
                <div>
                  <p className="text-xs text-gray mb-0.5">Phone</p>
                  <a
                    href={`tel:${home.phone_number}`}
                    className="text-base font-medium text-navy hover:underline"
                  >
                    {home.phone_number}
                  </a>
                </div>
              )}
              {home.website_url && (
                <a
                  href={home.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:ml-auto inline-block rounded-lg bg-[#48B693] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Visit their website
                </a>
              )}
            </div>
          )}

          {/* Nearby funeral directors */}
          {nearbyOthers.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-navy">
                Nearby funeral directors
              </h2>

              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-lg border border-border md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-navy text-white">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">City</th>
                      <th className="px-4 py-3 font-medium text-right">Distance</th>
                      <th className="px-4 py-3 font-medium text-right">Direct Cremation</th>
                      <th className="px-4 py-3 font-medium text-right">Standard Funeral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearbyOthers.map((h, i) => (
                      <tr key={h.id} className={i % 2 === 0 ? "bg-white" : "bg-background"}>
                        <td className="px-4 py-3 font-medium text-foreground">
                          <Link
                            href={`/funeral-directors/${h.id}`}
                            className="hover:text-navy hover:underline"
                          >
                            {h.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray">{h.city}</td>
                        <td className="px-4 py-3 text-right text-gray">
                          {Number(h.distance_miles).toFixed(1)} mi
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {h.price_direct_cremation != null
                            ? `£${h.price_direct_cremation.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {h.price_standard_funeral != null
                            ? `£${h.price_standard_funeral.toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {nearbyOthers.map((h) => (
                  <div key={h.id} className="rounded-lg border border-border bg-white p-4">
                    <Link
                      href={`/funeral-directors/${h.id}`}
                      className="text-sm font-semibold text-foreground hover:text-navy hover:underline"
                    >
                      {h.name}
                    </Link>
                    <p className="mt-1 text-xs text-gray">
                      {h.city} &middot; {Number(h.distance_miles).toFixed(1)} mi
                    </p>
                    <div className="mt-3 flex gap-4">
                      <div>
                        <p className="text-xs text-gray">Direct Cremation</p>
                        <p className="text-sm font-medium text-foreground">
                          {h.price_direct_cremation != null
                            ? `£${h.price_direct_cremation.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray">Standard Funeral</p>
                        <p className="text-sm font-medium text-foreground">
                          {h.price_standard_funeral != null
                            ? `£${h.price_standard_funeral.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8">
            <Link
              href={`/${home.city.replace(/ /g, "-")}`}
              className="text-sm font-medium text-navy underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              See all funeral directors in {home.city}
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
