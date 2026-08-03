/**
 * Server-side API access.
 *
 * Public pages render on the server and reach the API over the internal Docker
 * network, so requests never cross the public internet. Responses are cached and
 * revalidated on a timer rather than fetched per-request.
 *
 * The admin panel does NOT use this module — it talks to /api/* from the browser
 * so the session cookie is sent (see lib/admin-api.ts).
 */

import type {
  Experience,
  PostList,
  Post,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "@/lib/types";

const API_BASE = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

/** Seconds before cached content is refetched. Short enough that a CMS edit shows up quickly. */
const REVALIDATE_SECONDS = 60;

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`API ${status} for ${path}`);
  }
}

async function apiGet<T>(path: string, revalidate = REVALIDATE_SECONDS): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    next: { revalidate },
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(response.status, path);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetch that treats an unreachable API as empty content rather than a crash.
 *
 * A portfolio should still render its shell if the backend is briefly down —
 * a blank work section is a better failure than a 500 page. A 404 for a specific
 * slug is different and is left to the caller, which turns it into notFound().
 */
async function apiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error(`Failed to load ${path}:`, error);
    return null;
  }
}

export async function getProjects(category?: string): Promise<Project[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return (await apiGetOrNull<Project[]>(`/api/projects${query}`)) ?? [];
}

export async function getProject(slug: string): Promise<Project | null> {
  return apiGetOrNull<Project>(`/api/projects/${encodeURIComponent(slug)}`);
}

export async function getExperience(): Promise<Experience[]> {
  return (await apiGetOrNull<Experience[]>("/api/experience")) ?? [];
}

export async function getPosts(page = 1, tag?: string): Promise<PostList> {
  const params = new URLSearchParams({ page: String(page) });
  if (tag) params.set("tag", tag);

  return (
    (await apiGetOrNull<PostList>(`/api/posts?${params}`)) ?? {
      items: [],
      total: 0,
      page,
      per_page: 10,
    }
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  return apiGetOrNull<Post>(`/api/posts/${encodeURIComponent(slug)}`);
}

const FALLBACK_SETTINGS: SiteSettings = {
  name: "",
  greeting: "Hello, I'm",
  tagline: "",
  bio_md: "",
  location: "",
  email: "",
  socials: [],
  resume_media: null,
  avatar: null,
};

export async function getSettings(): Promise<SiteSettings> {
  return (await apiGetOrNull<SiteSettings>("/api/settings")) ?? FALLBACK_SETTINGS;
}

export async function getServices(): Promise<Service[]> {
  return (await apiGetOrNull<Service[]>("/api/services")) ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await apiGetOrNull<Testimonial[]>("/api/testimonials")) ?? [];
}
