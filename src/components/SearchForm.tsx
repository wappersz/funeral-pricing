"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PlaceInput from "./PlaceInput";

const TABS = ["Standard Funeral", "Direct Cremation", "Woodland Burial"] as const;

export default function SearchForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function navigate(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(
      `/search?q=${encodeURIComponent(trimmed)}&type=${encodeURIComponent(TABS[activeTab])}`
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(query);
  }

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
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <PlaceInput
            value={query}
            onChange={setQuery}
            onSelect={navigate}
            inputClassName="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#48B693] focus:border-[#48B693] sm:text-lg"
          />
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
