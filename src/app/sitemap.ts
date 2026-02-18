import type { MetadataRoute } from "next";
import { posts } from "@/data/posts";
import { getTowns } from "@/lib/search";
import { getCounties } from "@/lib/counties";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString().split("T")[0];
  const blogPosts = posts.filter((post) => post.date <= today).map((post) => ({
    url: `https://www.funeralpricing.co.uk/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const towns = await getTowns();
  const counties = await getCounties();

  return [
    {
      url: "https://www.funeralpricing.co.uk",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.funeralpricing.co.uk/search",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://www.funeralpricing.co.uk/funeral-costs-by-county",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://www.funeralpricing.co.uk/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts,
    ...towns.map((town) => ({
      url: `https://www.funeralpricing.co.uk/${town.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...counties.map((county) => ({
      url: `https://www.funeralpricing.co.uk/funeral-costs-by-county/${county.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
