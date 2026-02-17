import Link from "next/link";
import Image from "next/image";
import { posts } from "@/data/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Funeral Pricing",
  description:
    "Guides and articles about funeral costs, planning, and making informed decisions for your family.",
};

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-3xl font-semibold text-navy">Blog</h1>
        <p className="mb-10 text-gray">
          Guides and articles to help you understand funeral costs in the UK.
        </p>

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-lg border border-border p-6 transition-colors hover:border-navy/30"
            >
              <p className="mb-2 text-xs font-medium text-gray">
                {new Date(post.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h2 className="mb-2 text-xl font-semibold text-navy group-hover:underline">
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-gray">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-gray">
        <Link href="/blog" className="transition-colors hover:text-navy">
          Blog
        </Link>
        <span className="mx-2">&middot;</span>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} funeralpricing.co.uk. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
