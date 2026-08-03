"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { useAsync } from "@/components/admin/useAsync";
import { api } from "@/lib/admin-api";
import type { AnalyticsSummary, MessageList, Post, Project } from "@/lib/types";

const RANGES = [7, 30, 90] as const;

export default function AdminOverview() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);

  const loadStats = useCallback(
    () =>
      Promise.all([
        api.get<AnalyticsSummary>(`/admin/analytics?range=${range}`),
        api.get<MessageList>("/admin/messages"),
        api.get<Project[]>("/admin/projects"),
        api.get<Post[]>("/admin/posts"),
      ]),
    [range],
  );

  const { data, loading, error } = useAsync(loadStats);

  if (loading && !data) return <p className="text-small text-ink-soft">Loading…</p>;
  if (error) return <p className="text-small text-ember-deep">{error}</p>;
  if (!data) return null;

  const [analytics, messages, projects, posts] = data;

  const tiles = [
    { label: "Views", value: analytics.total_views, hint: `last ${range} days` },
    { label: "Visitors", value: analytics.total_visitors, hint: `last ${range} days` },
    { label: "Unread messages", value: messages.unread, href: "/admin/messages" },
    {
      label: "Published projects",
      value: projects.filter((p) => p.published).length,
      hint: `${projects.length} total`,
      href: "/admin/projects",
    },
    {
      label: "Published posts",
      value: posts.filter((p) => p.published).length,
      hint: `${posts.length} total`,
      href: "/admin/posts",
    },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-h3 font-semibold">Overview</h1>
        <div className="flex gap-3">
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`text-small transition-colors duration-150 hover:text-ember-deep ${
                option === range ? "text-ember-deep" : "text-ink-soft"
              }`}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>

      <dl className="border-t border-line mt-6 grid grid-cols-2 sm:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="border-b border-line border-r border-line px-4 py-5 last:border-r-0">
            <dt className="eyebrow">{tile.label}</dt>
            <dd className="mt-2 text-h3 font-semibold">
              {tile.href ? (
                <Link href={tile.href} className="hover:text-ember-deep transition-colors duration-150">
                  {tile.value}
                </Link>
              ) : (
                tile.value
              )}
            </dd>
            {tile.hint && <p className="mt-1 text-micro text-ink-soft normal-case">{tile.hint}</p>}
          </div>
        ))}
      </dl>

      <TrafficChart daily={analytics.daily} />

      <div className="mt-12 grid gap-10 sm:grid-cols-3">
        <TopList title="Top pages" items={analytics.top_paths} />
        <TopList title="Referrers" items={analytics.top_referrers} />
        <TopList title="Devices" items={analytics.devices} />
      </div>
    </div>
  );
}

/**
 * A bar chart drawn with divs.
 *
 * A charting library would be several hundred kilobytes to render one series of
 * daily counts. Height percentages do the same job.
 */
function TrafficChart({ daily }: { daily: AnalyticsSummary["daily"] }) {
  const peak = Math.max(1, ...daily.map((day) => day.views));

  return (
    <section className="mt-12">
      <h2 className="eyebrow">Views per day</h2>

      <div className="border-b border-line mt-4 flex h-40 items-end gap-px" role="img" aria-label={`Daily views, peak ${peak}`}>
        {daily.map((day) => (
          <div
            key={day.day}
            className="group relative flex-1 bg-rule transition-colors duration-150 hover:bg-ember"
            style={{ height: `${Math.max(2, (day.views / peak) * 100)}%` }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap bg-ink px-2 py-1 text-micro normal-case text-surface group-hover:block">
              {day.day}: {day.views} views · {day.visitors} visitors
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-micro text-ink-soft normal-case">
        <span>{daily[0]?.day}</span>
        <span>{daily.at(-1)?.day}</span>
      </div>
    </section>
  );
}

function TopList({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  return (
    <section>
      <h2 className="eyebrow">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-small text-ink-soft">No data yet.</p>
      ) : (
        <ul className="border-t border-line mt-3">
          {items.map((item) => (
            <li key={item.label} className="border-b border-line flex justify-between gap-4 py-2 text-small">
              <span className="truncate">{item.label}</span>
              <span className="text-ink-soft tabular-nums">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
