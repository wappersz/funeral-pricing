"use client";

import { useState } from "react";

const TABS = ["Standard Funeral", "Direct Cremation", "Woodland Burial"] as const;

export default function SearchForm() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
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
    </>
  );
}
