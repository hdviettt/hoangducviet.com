"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Users,
  FileText,
  Globe,
  HardDrive,
  Zap,
} from "lucide-react";

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
    <div className="mb-4 p-3 border border-border bg-card">
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <div className="text-primary text-lg tracking-[0.15em] font-mono overflow-hidden">
        {sparkline}
      </div>
      {firstDate && lastDate && (
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
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
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="border border-border p-4 stat-card relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-medium text-primary">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
        <Icon className="w-5 h-5 text-muted-foreground/30" />
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
        <div key={i} className="border border-border p-4">
          <div className="h-8 bg-muted animate-pulse w-16 mb-2" />
          <div className="h-3 bg-muted animate-pulse w-20" />
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
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider">
          analytics
        </h2>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs transition-colors btn-press ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border border-destructive/30 bg-destructive/5 p-3 mb-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* PostHog Section */}
      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          posthog · site analytics
        </div>

        {loading ? (
          <>
            <SkeletonCards count={3} />
            <div className="h-16 bg-muted animate-pulse mb-4 border border-border" />
          </>
        ) : posthog?.configured && posthog.daily ? (
          <div className="stagger-list">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatCard
                label="pageviews"
                value={formatNumber(posthog.pageviews || 0)}
                icon={Eye}
              />
              <StatCard
                label="unique visitors"
                value={formatNumber(posthog.uniqueVisitors || 0)}
                icon={Users}
              />
              <StatCard
                label="pages tracked"
                value={String(posthog.topPages?.length || 0)}
                icon={FileText}
              />
            </div>

            <Sparkline
              data={posthog.daily.map((d) => d.views)}
              dates={posthog.daily.map((d) => d.date)}
              label="daily pageviews"
            />

            {posthog.topPages && posthog.topPages.length > 0 && (
              <div className="border border-border divide-y divide-border mb-4">
                <div className="px-3 py-1.5 text-xs text-muted-foreground bg-card">
                  top pages
                </div>
                {posthog.topPages.map((page, i) => (
                  <div
                    key={page.path}
                    className="flex items-center gap-3 py-1.5 px-3 row-hover"
                  >
                    <span className="text-xs text-muted-foreground w-5 text-right">
                      {i + 1}
                    </span>
                    <span className="text-sm flex-1 truncate">
                      {page.path}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(page.views)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-border p-4 mb-4 text-sm text-muted-foreground">
            PostHog not configured. Set{" "}
            <code className="text-xs">POSTHOG_PERSONAL_API_KEY</code> and{" "}
            <code className="text-xs">POSTHOG_PROJECT_ID</code> to enable.
          </div>
        )}
      </div>

      {/* Cloudflare Section */}
      <div>
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          cloudflare · edge analytics
        </div>

        {loading ? (
          <>
            <SkeletonCards count={4} />
            <div className="h-16 bg-muted animate-pulse mb-4 border border-border" />
          </>
        ) : cloudflare?.configured && cloudflare.daily ? (
          <div className="stagger-list">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatCard
                label="requests"
                value={formatNumber(cloudflare.totalRequests || 0)}
                icon={Globe}
              />
              <StatCard
                label="visitors"
                value={formatNumber(cloudflare.uniqueVisitors || 0)}
                icon={Users}
              />
              <StatCard
                label="bandwidth"
                value={formatBytes(cloudflare.bandwidth || 0)}
                icon={HardDrive}
              />
              <StatCard
                label="cache rate"
                value={`${cacheRate}%`}
                icon={Zap}
              />
            </div>

            <Sparkline
              data={cloudflare.daily.map((d) => d.requests)}
              dates={cloudflare.daily.map((d) => d.date)}
              label="daily requests"
            />
          </div>
        ) : (
          <div className="border border-dashed border-border p-4 text-sm text-muted-foreground">
            Cloudflare not configured. Set{" "}
            <code className="text-xs">CLOUDFLARE_API_TOKEN</code> and{" "}
            <code className="text-xs">CLOUDFLARE_ZONE_ID</code> to enable.
          </div>
        )}
      </div>
    </section>
  );
}
