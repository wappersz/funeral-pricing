"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { funeralHomes } from "@/data/homes";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered = funeralHomes.filter((home) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      home.city.toLowerCase().includes(q) ||
      home.postcode.toLowerCase().includes(q)
    );
  });

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
        <nav className="flex items-center gap-6 text-sm font-medium text-gray">
          <Link href="/search" className="text-navy">
            Search
          </Link>
          <span>About</span>
          <span>Contact</span>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-navy">
            Compare Funeral Prices
          </h1>
          <p className="mb-8 text-gray">
            Search by city or postcode to find funeral directors near you.
          </p>

          {/* Search input */}
          <div className="mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a city or postcode (e.g. London, M1, B16)"
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
          </div>

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border">
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
                  {filtered.map((home, i) => (
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
                      <td className="px-4 py-3 text-right text-foreground">
                        £{home.prices.directCremation.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        £{home.prices.standardFuneral.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={home.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded bg-green px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-white px-6 py-10 text-center">
              <p className="font-medium text-foreground">No results found</p>
              <p className="mt-1 text-sm text-gray">
                Try a different city or postcode.
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-gray">
            Showing {filtered.length} of {funeralHomes.length} funeral
            directors
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-gray">
        <p>
          &copy; {new Date().getFullYear()} funeralpricing.co.uk. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
