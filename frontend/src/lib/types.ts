/** Mirrors the Pydantic response schemas in backend/app/schemas. */

export interface Media {
  id: number;
  filename: string;
  original_name: string;
  alt_text: string;
  mime: string;
  width: number;
  height: number;
  size_bytes: number;
  variants: Record<string, string>;
  created_at: string;
  url: string;
  srcset: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body_md: string;
  year: number | null;
  role: string;
  category: string;
  tech: string[];
  links: Record<string, string>;
  cover_image: Media | null;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  summary: string;
  highlights: string[];
  sort_order: number;
  published: boolean;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  updated_at: string;
}

export type PostSummary = Omit<Post, "body_md" | "updated_at">;

export interface PostList {
  items: PostSummary[];
  total: number;
  page: number;
  per_page: number;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  name: string;
  greeting: string;
  tagline: string;
  bio_md: string;
  location: string;
  email: string;
  socials: SocialLink[];
  resume_media: Media | null;
  avatar: Media | null;
}

export interface Service {
  id: number;
  title: string;
  blurb: string;
  body_md: string;
  points: string[];
  image: Media | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  avatar: Media | null;
  sort_order: number;
  published: boolean;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface MessageList {
  items: ContactMessage[];
  total: number;
  unread: number;
}

export interface DailyCount {
  day: string;
  views: number;
  visitors: number;
}

export interface LabelCount {
  label: string;
  count: number;
}

export interface AnalyticsSummary {
  range_days: number;
  total_views: number;
  total_visitors: number;
  daily: DailyCount[];
  top_paths: LabelCount[];
  top_referrers: LabelCount[];
  devices: LabelCount[];
}

export interface AdminUser {
  id: number;
  email: string;
}
