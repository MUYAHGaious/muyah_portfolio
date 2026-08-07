import type { MetadataRoute } from "next";

import { getPosts, getProjects } from "@/lib/api";
import { absolute } from "@/lib/seo";

/**
 * Regenerated on a timer rather than frozen at build time, so anything
 * published from the admin panel appears here without a redeploy.
 */
export const revalidate = 600;

/**
 * Walks every page of the posts endpoint.
 *
 * `getPosts(1)` returns only the first page (10 items). Reading just that would
 * silently drop every post past the tenth from the sitemap as the blog grows —
 * the kind of bug that costs traffic without ever showing an error.
 */
async function allPosts() {
  const first = await getPosts(1);
  const perPage = first.per_page || 10;
  const pages = Math.max(1, Math.ceil(first.total / perPage));

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => getPosts(i + 2)),
  );

  return [first, ...rest].flatMap((page) => page.items);
}

type Freq = "weekly" | "monthly" | "yearly";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Freq }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/work", priority: 0.9, changeFrequency: "weekly" },
  // /services was missing entirely, which made it invisible to any crawler
  // following the sitemap rather than crawling links.
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/writing", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), allPosts()]);

  // The newest real content stands in for "when did this section last change".
  // A hardcoded `new Date()` claims every page changed on every crawl, which
  // search engines quickly learn to ignore.
  const stamps = [
    ...projects.map((p) => Date.parse(p.created_at)),
    ...posts.map((p) => (p.published_at ? Date.parse(p.published_at) : NaN)),
  ].filter(Number.isFinite);
  const lastModified = stamps.length > 0 ? new Date(Math.max(...stamps)) : new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absolute(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: absolute(`/work/${project.slug}`),
      lastModified: new Date(project.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absolute(`/writing/${post.slug}`),
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
