/**
 * Canonical URLs and schema.org structured data.
 *
 * Everything here produces absolute URLs. Google treats http://host/x and
 * https://host/x as different pages, and relative URLs inside JSON-LD are not
 * resolved at all — so a relative `@id` silently produces an unlinkable entity.
 */

import type { Post, Project, Service, SiteSettings } from "./types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

/** Turns "/work/foo" or "foo.webp" into a full https:// URL. Passes through absolutes. */
export function absolute(path?: string | null): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}

/**
 * Stable @id values. Using one identifier per entity across every page lets
 * search engines merge them into a single node instead of treating each page's
 * copy as a separate person/site.
 */
export const ID = {
  person: `${SITE_URL}/#person`,
  website: `${SITE_URL}/#website`,
  organization: `${SITE_URL}/#organization`,
} as const;

type Json = Record<string, unknown>;

/** The author entity. Reused by every page, which is what makes it authoritative. */
export function personSchema(settings: SiteSettings): Json {
  const sameAs = (settings.socials ?? [])
    .map((s) => s.url)
    .filter((url): url is string => Boolean(url && /^https?:\/\//i.test(url)));

  return {
    "@type": "Person",
    "@id": ID.person,
    name: settings.name,
    url: SITE_URL,
    ...(settings.tagline && { jobTitle: settings.tagline, description: settings.tagline }),
    ...(settings.email && { email: `mailto:${settings.email}` }),
    ...(settings.location && {
      address: { "@type": "PostalAddress", addressLocality: settings.location },
    }),
    ...(settings.avatar && {
      image: {
        "@type": "ImageObject",
        url: absolute(settings.avatar.url),
        width: settings.avatar.width,
        height: settings.avatar.height,
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function websiteSchema(settings: SiteSettings): Json {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: SITE_URL,
    name: settings.name,
    ...(settings.tagline && { description: settings.tagline }),
    inLanguage: "en",
    publisher: { "@id": ID.person },
  };
}

/**
 * Breadcrumbs are what turn the ugly green URL in a search result into a
 * readable "muyah.dev › Work › Project" trail.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function projectSchema(project: Project, settings: SiteSettings): Json {
  return {
    "@type": "CreativeWork",
    "@id": absolute(`/work/${project.slug}#creativework`),
    name: project.title,
    headline: project.title,
    url: absolute(`/work/${project.slug}`),
    ...(project.summary && { description: project.summary }),
    ...(project.category && { genre: project.category }),
    ...(project.tech.length > 0 && { keywords: project.tech.join(", ") }),
    ...(project.year && { dateCreated: String(project.year) }),
    datePublished: project.created_at,
    author: { "@id": ID.person },
    creator: { "@id": ID.person },
    ...(project.cover_image && {
      image: {
        "@type": "ImageObject",
        url: absolute(project.cover_image.url),
        width: project.cover_image.width,
        height: project.cover_image.height,
        ...(project.cover_image.alt_text && { caption: project.cover_image.alt_text }),
      },
    }),
    isPartOf: { "@id": ID.website },
  };
}

export function postSchema(post: Post, settings: SiteSettings): Json {
  const url = absolute(`/writing/${post.slug}`);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#blogposting`,
    headline: post.title,
    name: post.title,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.excerpt && { description: post.excerpt, abstract: post.excerpt }),
    ...(post.published_at && { datePublished: post.published_at }),
    dateModified: post.updated_at || post.published_at || undefined,
    ...(post.tags.length > 0 && { keywords: post.tags.join(", ") }),
    author: { "@id": ID.person },
    publisher: { "@id": ID.person },
    inLanguage: "en",
    isPartOf: { "@id": ID.website },
  };
}

export function servicesSchema(services: Service[], settings: SiteSettings): Json {
  return {
    "@type": "ItemList",
    name: "Services",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        ...(service.blurb && { description: service.blurb }),
        provider: { "@id": ID.person },
        ...(settings.location && { areaServed: settings.location }),
      },
    })),
  };
}

/** Wraps entities in the @graph envelope so one script tag describes the whole page. */
export function graph(...nodes: (Json | null | undefined)[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) as Json[] };
}
