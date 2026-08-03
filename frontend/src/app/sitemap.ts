import type { MetadataRoute } from "next";

import { getPosts, getProjects } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts(1)]);

  const staticRoutes = ["", "/work", "/about", "/writing", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified: new Date(project.created_at),
      priority: 0.7,
    })),
    ...posts.items.map((post) => ({
      url: `${SITE_URL}/writing/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      priority: 0.6,
    })),
  ];
}
