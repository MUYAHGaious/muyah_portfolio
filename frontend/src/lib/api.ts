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
 * Fetch that distinguishes "this record does not exist" from "the API is down".
 *
 * Only a 404 becomes null — the caller turns that into notFound(). Every other
 * failure propagates.
 *
 * This used to swallow all errors and return null, so an unreachable backend was
 * indistinguishable from having no content: the site rendered a placeholder name
 * and silently dropped every card section. Letting the error through means the
 * page fails visibly instead of quietly showing something untrue, and — because
 * these routes render per request — a brief outage shows an error page rather
 * than being cached as emptiness.
 */
async function apiGetOrNotFound<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getProjects(category?: string): Promise<Project[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiGet<Project[]>(`/api/projects${query}`);
}

export async function getProject(slug: string): Promise<Project | null> {
  return apiGetOrNotFound<Project>(`/api/projects/${encodeURIComponent(slug)}`);
}

export async function getExperience(): Promise<Experience[]> {
  return apiGet<Experience[]>("/api/experience");
}

export async function getPosts(page = 1, tag?: string): Promise<PostList> {
  const params = new URLSearchParams({ page: String(page) });
  if (tag) params.set("tag", tag);

  return apiGet<PostList>(`/api/posts?${params}`);
}

export async function getPost(slug: string): Promise<Post | null> {
  return apiGetOrNotFound<Post>(`/api/posts/${encodeURIComponent(slug)}`);
}

export async function getSettings(): Promise<SiteSettings> {
  return apiGet<SiteSettings>("/api/settings");
}

export async function getServices(): Promise<Service[]> {
  return apiGet<Service[]>("/api/services");
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return apiGet<Testimonial[]>("/api/testimonials");
}
