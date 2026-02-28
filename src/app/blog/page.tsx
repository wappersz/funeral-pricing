import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { posts } from "@/data/posts";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Funeral Pricing",
  description:
    "Guides and articles about funeral costs, planning, and making informed decisions for your family.",
};

export default function BlogPage() {
  const today = new Date().toISOString().split("T")[0];
  const publishedPosts = posts
    .filter((post) => post.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-3xl font-semibold text-navy">Blog</h1>
        <p className="mb-10 text-gray">
          Guides and articles to help you understand funeral costs in the UK.
        </p>

        <div className="flex flex-col gap-8">
          {publishedPosts.map((post) => (
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

      <Footer />
    </div>
  );
}
