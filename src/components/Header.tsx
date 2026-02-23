import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center flex-shrink-0">
            <svg className="h-8 w-8 text-[#48B693] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-bold text-2xl text-[#1A365D] tracking-tight">Funeral Pricing</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/search" className="text-gray-600 hover:text-[#48B693] font-medium transition-colors">Search</Link>
            <Link href="/about" className="text-gray-600 hover:text-[#48B693] font-medium transition-colors">About</Link>
            <Link href="/blog" className="text-gray-600 hover:text-[#48B693] font-medium transition-colors">Blog</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
