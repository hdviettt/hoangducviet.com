"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Range = "7d" | "30d" | "90d";

interface PostHogData {
  configured: boolean;
  pageviews?: number;
  uniqueVisitors?: number;
  topPages?: Array<{ path: string; views: number }>;
  daily?: Array<{ date: string; views: number; visitors: number }>;
}

interface CloudflareData {
  configured: boolean;
  totalRequests?: number;
  uniqueVisitors?: number;
  bandwidth?: number;
  cachedRequests?: number;
  cachedBytes?: number;
  daily?: Array<{
    date: string;
    requests: number;
    bytes: number;
    cachedRequests: number;
    uniques: number;
  }>;
}

interface AnalyticsData {
  posthog: PostHogData;
  cloudflare: CloudflareData;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824)
    return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

const BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

function Sparkline({
  data,
  dates,
  label,
}: {
  data: number[];
  dates?: string[];
  label: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const sparkline = data
    .map((v) => BLOCKS[Math.round((v / max) * (BLOCKS.length - 1))])
    .join("");

  const firstDate = dates?.[0];
  const lastDate = dates?.[dates.length - 1];

  return (
    <div className="mb-4 p-3 rounded-xl border border-md-outline-variant bg-md-surface-container-low">
      <div className="md-body-small text-md-on-surface-variant mb-1.5">{label}</div>
      <div className="text-md-primary text-lg tracking-[0.15em] font-mono overflow-hidden">
        {sparkline}
      </div>
      {firstDate && lastDate && (
        <div className="flex justify-between md-label-small text-md-on-surface-variant mt-1.5">
          <span>{firstDate}</span>
          <span>{lastDate}</span>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-low p-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-medium text-md-primary tabular-nums">{value}</div>
          <div className="md-body-small text-md-on-surface-variant mt-1">{label}</div>
        </div>
        <Icon name={icon} size={20} className="text-md-outline-variant" />
      </div>
    </div>
  );
}

function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 mb-4"
      style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-md-outline-variant bg-md-surface-container-low p-4">
          <div className="h-8 bg-md-surface-container animate-pulse w-16 mb-2 rounded" />
          <div className="h-3 bg-md-surface-container animate-pulse w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [range]);

  const posthog = data?.posthog;
  const cloudflare = data?.cloudflare;
  const cacheRate =
    cloudflare?.totalRequests && cloudflare.cachedRequests
      ? Math.round((cloudflare.cachedRequests / cloudflare.totalRequests) * 100)
      : 0;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-md-outline-variant">
        <h2 className="md-label-medium text-md-on-surface-variant uppercase tracking-wider">
          analytics
        </h2>
        {/* M3 segmented button */}
        <div className="inline-flex rounded-full border border-md-outline overflow-hidden">
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-4 h-9 md-label-medium transition-colors duration-200 ease-md-standard ${
                range === r
                  ? "bg-md-secondary-container text-md-on-secondary-container"
                  : "text-md-on-surface hover:bg-md-on-surface/8"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-md-error/40 bg-md-error/10 p-3 mb-4 md-body-medium text-md-error">
          {error}
        </div>
      )}

      {/* PostHog Section */}
      <div className="mb-6">
        <div className="md-body-small text-md-on-surface-variant mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-md-primary" />
          posthog · site analytics
        </div>

        {loading ? (
          <>
            <SkeletonCards count={3} />
            <div className="h-16 bg-md-surface-container animate-pulse mb-4 rounded-xl border border-md-outline-variant" />
          </>
        ) : posthog?.configured && posthog.daily ? (
          <div className="stagger-list">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatCard
                label="pageviews"
                value={formatNumber(posthog.pageviews || 0)}
                icon="visibility"
              />
              <StatCard
                label="unique visitors"
                value={formatNumber(posthog.uniqueVisitors || 0)}
                icon="group"
              />
              <StatCard
                label="pages tracked"
                value={String(posthog.topPages?.length || 0)}
                icon="description"
              />
            </div>

            <Sparkline
              data={posthog.daily.map((d) => d.views)}
              dates={posthog.daily.map((d) => d.date)}
              label="daily pageviews"
            />

            {posthog.topPages && posthog.topPages.length > 0 && (
              <div className="rounded-xl border border-md-outline-variant divide-y divide-md-outline-variant bg-md-surface-container-low mb-4 overflow-hidden">
                <div className="px-4 py-2 md-label-medium text-md-on-surface-variant uppercase tracking-wider bg-md-surface-container">
                  top pages
                </div>
                {posthog.topPages.map((page, i) => (
                  <div
                    key={page.path}
                    className="flex items-center gap-3 py-1.5 px-3 row-hover"
                  >
                    <span className="md-body-small text-md-on-surface-variant w-5 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <span className="md-body-medium flex-1 truncate">
                      {page.path}
                    </span>
                    <span className="md-body-small text-md-on-surface-variant tabular-nums">
                      {formatNumber(page.views)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-md-outline-variant p-4 mb-4 md-body-medium text-md-on-surface-variant">
            PostHog not configured. Set{" "}
            <code className="text-xs">POSTHOG_PERSONAL_API_KEY</code> and{" "}
            <code className="text-xs">POSTHOG_PROJECT_ID</code> to enable.
          </div>
        )}
      </div>

      {/* Cloudflare Section */}
      <div>
        <div className="md-body-small text-md-on-surface-variant mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-md-tertiary" />
          cloudflare · edge analytics
        </div>

        {loading ? (
          <>
            <SkeletonCards count={4} />
            <div className="h-16 bg-md-surface-container animate-pulse mb-4 rounded-xl border border-md-outline-variant" />
          </>
        ) : cloudflare?.configured && cloudflare.daily ? (
          <div className="stagger-list">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatCard
                label="requests"
                value={formatNumber(cloudflare.totalRequests || 0)}
                icon="public"
              />
              <StatCard
                label="visitors"
                value={formatNumber(cloudflare.uniqueVisitors || 0)}
                icon="group"
              />
              <StatCard
                label="bandwidth"
                value={formatBytes(cloudflare.bandwidth || 0)}
                icon="hard_drive"
              />
              <StatCard
                label="cache rate"
                value={`${cacheRate}%`}
                icon="bolt"
              />
            </div>

            <Sparkline
              data={cloudflare.daily.map((d) => d.requests)}
              dates={cloudflare.daily.map((d) => d.date)}
              label="daily requests"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-md-outline-variant p-4 md-body-medium text-md-on-surface-variant">
            Cloudflare not configured. Set{" "}
            <code className="text-xs">CLOUDFLARE_API_TOKEN</code> and{" "}
            <code className="text-xs">CLOUDFLARE_ZONE_ID</code> to enable.
          </div>
        )}
      </div>
    </section>
  );
}
