"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

interface SearchResult {
  id: number;
  name: string;
  address: string;
  postcode: string;
  city: string;
  price_direct_cremation: number | null;
  price_standard_funeral: number | null;
  website_url: string | null;
  phone_number: string | null;
  distance_miles: number;
}

interface SearchResponse {
  postcode: string;
  results: SearchResult[];
  error?: string;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [postcode, setPostcode] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedPostcode, setSearchedPostcode] = useState<string | null>(null);

  async function runSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}`
      );
      const data: SearchResponse = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResults(data.results);
      setSearchedPostcode(data.postcode);
    } catch {
      setError("Unable to connect. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    await runSearch(postcode);
  }

  useEffect(() => {
    const fromUrl = searchParams.get("q");
    if (fromUrl) {
      setPostcode(fromUrl);
      runSearch(fromUrl);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-navy">
            Compare Funeral Prices
          </h1>
          <p className="mb-8 text-gray">
            Enter your postcode to find and compare funeral directors near you.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-8 flex gap-3">
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Enter your postcode or town (e.g. SW1A 1AA or Leeds)"
              className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-navy px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-lg border border-border bg-white px-6 py-10 text-center">
              <p className="text-sm text-gray">Searching for funeral directors near you...</p>
            </div>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <>
              {/* Mobile: card layout */}
              <div className="flex flex-col gap-3 md:hidden">
                {results.map((home) => (
                  <div
                    key={home.id}
                    className="rounded-lg border border-border bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        <Link href={`/funeral-directors/${home.id}`} className="hover:underline hover:text-navy">
                          {home.name}
                        </Link>
                      </h3>
                      {home.website_url ? (
                        <a
                          href={home.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded bg-green px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        >
                          View
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray">
                      {home.city} &middot; {Number(home.distance_miles).toFixed(1)} mi
                    </p>
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

              {/* Desktop: table layout */}
              <div className="hidden overflow-hidden rounded-lg border border-border md:block">
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
                          <Link href={`/funeral-directors/${home.id}`} className="hover:underline hover:text-navy">
                            {home.name}
                          </Link>
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
                Showing {results.length} funeral director{results.length !== 1 ? "s" : ""} within
                30 miles of {searchedPostcode}
              </p>
            </>
          )}

          {/* No results */}
          {results && results.length === 0 && (
            <div className="rounded-lg border border-border bg-white px-6 py-10 text-center">
              <p className="font-medium text-foreground">No results found</p>
              <p className="mt-1 text-sm text-gray">
                No funeral directors found within 30 miles of {searchedPostcode}.
                Try a different postcode.
              </p>
            </div>
          )}
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

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
