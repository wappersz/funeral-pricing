"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);

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
        {/* <nav className="flex items-center gap-6 text-sm font-medium text-gray">
          <Link href="/search" className="transition-colors hover:text-navy">
            Search
          </Link>
          <span>About</span>
          <span>Contact</span>
        </nav> */}
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gray">
            Coming Soon
          </p>

          <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-navy sm:text-5xl">
            Transparent funeral pricing for families across the UK
          </h1>

          <p className="mb-10 text-lg leading-relaxed text-gray">
            We&rsquo;re building a service to help you compare funeral costs
            with clarity and compassion &mdash; so you can focus on what matters
            most during a difficult time.
          </p>

          <div className="mx-auto max-w-sm">
            {submitted ? (
              <div className="rounded-lg border border-green-border bg-green-light px-6 py-4">
                <p className="font-medium text-green">
                  Thank you! We&rsquo;ll be in touch.
                </p>
                <p className="mt-1 text-sm text-gray">
                  You&rsquo;ll be the first to know when we launch.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm font-medium text-navy">
                  Be the first to know when we launch
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const email = new FormData(form).get("email") as string;
                    try {
                      const res = await fetch("/api/signup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      if (!res.ok) throw new Error();
                      form.reset();
                      setSubmitted(true);
                    } catch {
                      alert("Something went wrong. Please try again.");
                    }
                  }}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Your email address"
                    className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-navy/30"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-navy px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Notify Me
                  </button>
                </form>
              </>
            )}
          </div>
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
