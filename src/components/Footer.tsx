import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8 text-center text-sm text-gray">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-6 gap-y-1">
        <Link href="/search" className="transition-colors hover:text-navy">
          Search Prices
        </Link>
        <Link href="/areas" className="transition-colors hover:text-navy">
          Browse by Town
        </Link>
        <Link href="/funeral-costs-by-county" className="transition-colors hover:text-navy">
          Costs by County
        </Link>
        <Link href="/blog" className="transition-colors hover:text-navy">
          Blog &amp; Guides
        </Link>
      </nav>
      <p className="text-xs text-gray/70">
        &copy; {new Date().getFullYear()} funeralpricing.co.uk. All rights reserved.
      </p>
    </footer>
  );
}
