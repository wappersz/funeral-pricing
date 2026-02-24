"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const TABS = ["Standard Funeral", "Direct Cremation", "Woodland Burial"] as const;

const BLOG_POSTS = [
  {
    date: "17 February 2026",
    title: "Getting Help With Funeral Costs: A Guide to Funeral Expenses Payment",
    excerpt:
      "Arranging a funeral is one of the hardest things any of us will ever have to do. If you are on certain benefits, you may be able to get financial support...",
    href: "/blog/getting-help-with-funeral-costs",
  },
  {
    date: "10 February 2026",
    title: "What is a Direct Cremation and How Much Does it Cost?",
    excerpt:
      "An increasingly popular option in the UK, direct cremations offer a simpler, unattended alternative to traditional services. Learn what's included and average local prices.",
    href: "/blog/what-is-a-direct-cremation",
  },
  {
    date: "3 February 2026",
    title: "Questions to Ask When Choosing a Funeral Director",
    excerpt:
      "Finding a funeral director you feel comfortable with is vital. Here is a checklist of important questions to ask to ensure you get transparent pricing and care.",
    href: "/blog/choosing-a-funeral-director",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-gray-800 antialiased">

      {/* Header */}
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

      {/* Hero */}
      <section className="relative bg-gray-900 h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/hero-bg.png"
            alt="Peaceful park scene"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gray-900/55" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Find trusted funeral directors near you
            </h1>
            <p className="text-xl text-gray-100 font-medium">
              Transparent pricing to help you make the right choice.
            </p>
          </div>

          {/* Tabs */}
          <div className="rounded-t-lg overflow-hidden flex">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-3 px-4 text-center cursor-pointer transition-colors ${
                  activeTab === i
                    ? "bg-white text-[#1A365D] border-t-4 border-[#48B693] font-semibold"
                    : "bg-white/85 text-gray-600 border-t-4 border-transparent hover:bg-white/95"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search form */}
          <div className="bg-white p-6 rounded-b-lg rounded-tr-lg shadow-xl">
            <form action="/search" method="GET" className="flex flex-col md:flex-row gap-4">
              <input type="hidden" name="type" value={TABS[activeTab]} />
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="q"
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#48B693] focus:border-[#48B693] sm:text-lg"
                  placeholder="Enter your postcode or town (e.g. SW1A 1AA or Leeds)"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 text-lg font-medium rounded-md text-white bg-[#48B693] hover:bg-[#3A9D7E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#48B693] transition-all hover:scale-[1.02]"
              >
                Search prices
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Blog section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A365D] mb-4">Helpful Guides &amp; Advice</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Arranging a funeral can be overwhelming. We have put together resources to help you understand your options and manage costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                <h3 className="text-xl font-bold text-[#1A365D] mb-3 line-clamp-2">
                  <Link href={post.href} className="hover:text-[#48B693] transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-6 flex-grow line-clamp-3">{post.excerpt}</p>
                <Link
                  href={post.href}
                  className="text-[#48B693] font-semibold hover:text-[#1A365D] transition-colors inline-flex items-center"
                >
                  Read more
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-block px-6 py-3 border-2 border-[#48B693] text-[#48B693] font-medium rounded-md hover:bg-[#48B693] hover:text-white transition-colors"
          >
            View all articles
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A365D] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-[#48B693] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold text-xl tracking-tight">Funeral Pricing</span>
              </div>
              <p className="text-gray-300 text-sm max-w-sm">
                Helping families across the UK find trusted local funeral directors and compare prices transparently during difficult times.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/search" className="hover:text-[#48B693] transition-colors">Search Prices</Link></li>
                <li><Link href="/about" className="hover:text-[#48B693] transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-[#48B693] transition-colors">Blog &amp; Guides</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/submit-funeral-home" className="hover:text-[#48B693] transition-colors">Submit your funeral home</Link></li>
                <li><Link href="/partner" className="hover:text-[#48B693] transition-colors">Partner with us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2026 Funeral Pricing. All rights reserved.</p>
            <div className="space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
