import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { posts } from "@/data/posts";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Funeral Pricing`,
    description: post.excerpt,
  };
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Match bold links [**text**](/url), plain links [text](/url), or **bold**
  const regex = /\[(\*\*(.+?)\*\*)\]\((.+?)\)|\[(.+?)\]\((.+?)\)|\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    if (match[2] && match[3]) {
      // Bold link: [**text**](/url)
      tokens.push(
        <Link key={`${keyPrefix}-${match.index}`} href={match[3]} className="font-bold text-navy underline">
          {match[2]}
        </Link>
      );
    } else if (match[4] && match[5]) {
      // Plain link: [text](/url)
      tokens.push(
        <Link key={`${keyPrefix}-${match.index}`} href={match[5]} className="text-navy underline">
          {match[4]}
        </Link>
      );
    } else if (match[6]) {
      // Bold: **text**
      tokens.push(<strong key={`${keyPrefix}-${match.index}`}>{match[6]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listIndex = 0;

  function flushList() {
    if (listItems.length > 0) {
      const isOrdered = /^\d+\./.test(listItems[0]);
      const items = listItems.map((item, i) => {
        const text = item.replace(/^[-\d.]+\s*/, "");
        return <li key={i}>{renderInline(text, `li-${listIndex}-${i}`)}</li>;
      });
      if (isOrdered) {
        elements.push(
          <ol key={`list-${listIndex}`} className="mb-4 list-decimal space-y-1 pl-6 text-foreground">
            {items}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${listIndex}`} className="mb-4 list-disc space-y-1 pl-6 text-foreground">
            {items}
          </ul>
        );
      }
      listItems = [];
      listIndex++;
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={i} className="mb-3 mt-8 text-xl font-semibold text-navy">
          {trimmed.replace("## ", "")}
        </h2>
      );
    } else if (trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed);
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={i} className="mb-4 leading-relaxed text-foreground">
          {renderInline(trimmed, `p-${i}`)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) notFound();

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

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link
          href="/blog"
          className="mb-6 inline-block text-sm text-gray transition-colors hover:text-navy"
        >
          &larr; Back to blog
        </Link>

        <p className="mb-2 text-xs font-medium text-gray">
          {new Date(post.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mb-8 text-3xl font-semibold leading-tight text-navy">
          {post.title}
        </h1>

        <article>{renderContent(post.content)}</article>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-gray">
        <Link href="/blog" className="transition-colors hover:text-navy">
          Latest Blog Posts
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
