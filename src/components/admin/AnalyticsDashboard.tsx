"use client";

import { Icon } from "@/components/ui/Icon";
import { useEffect, useRef, useState } from "react";

type Range = "7d" | "30d" | "90d";

interface DailyPoint {
  date: string;
  views: number;
  visitors: number;
}

interface PostHogData {
  configured: boolean;
  pageviews?: number;
  uniqueVisitors?: number;
  topPages?: Array<{ path: string; views: number }>;
  daily?: DailyPoint[];
}

interface CloudflareData {
  configured: boolean;
  totalRequests?: number;
  uniqueVisitors?: number;
  bandwidth?: number;
  cachedRequests?: number;
  cachedBytes?: number;
  daily?: Array<{ date: string; requests: number }>;
}

interface AnalyticsData {
  posthog: PostHogData;
  cloudflare: CloudflareData;
}

const SERIES = [
  { key: "views" as const, label: "pageviews", color: "var(--chart-1)" },
  { key: "visitors" as const, label: "visitors", color: "var(--chart-2)" },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Round a max up to a readable tick value.
function niceMax(v: number): number {
  if (v <= 5) return 5;
  const mag = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / (mag / 2)) * (mag / 2);
}

// ---- Stat tile ----------------------------------------------------------

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-md-outline-variant p-4">
      {/* Proportional figures on standalone values (tabular-nums only in tables/ticks) */}
      <div className="text-[28px] leading-none font-medium text-md-on-surface">
        {value}
      </div>
      <div className="text-[13px] leading-[18px] text-md-on-surface-variant mt-1.5">
        {label}
      </div>
      {hint && (
        <div className="text-[12px] leading-4 text-md-on-surface-variant/70 mt-0.5">
          {hint}
        </div>
      )}
    </div>
  );
}

// ---- Trend chart --------------------------------------------------------

function TrendChart({ daily }: { daily: DailyPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const H = 200;
  const padL = 44;
  const padR = 52; // room for endpoint direct labels
  const padT = 14;
  const padB = 26; // x-axis band lives inside the box — never clipped
  const plotW = Math.max(w - padL - padR, 10);
  const plotH = H - padT - padB;

  const n = daily.length;
  const rawMax = Math.max(...daily.flatMap((d) => [d.views, d.visitors]), 1);
  const max = niceMax(rawMax);

  const x = (i: number) =>
    n <= 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW;
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  const path = (key: "views" | "visitors") =>
    daily.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[key])}`).join(" ");

  const ticks = [0, max / 2, max];
  const active = hover !== null ? daily[hover] : null;

  // Endpoint direct labels: nudge apart when the two series end close together,
  // so neither label is drawn on top of the other.
  const last = daily[n - 1];
  const endOffsets: Record<"views" | "visitors", number> = {
    views: 4,
    visitors: 4,
  };
  if (last && Math.abs(y(last.views) - y(last.visitors)) < 12) {
    const viewsOnTop = y(last.views) <= y(last.visitors);
    endOffsets.views = viewsOnTop ? -2 : 12;
    endOffsets.visitors = viewsOnTop ? 12 : -2;
  }

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    if (n <= 1) return setHover(0);
    const step = plotW / (n - 1);
    const idx = Math.round((mx - padL) / step);
    setHover(Math.min(Math.max(idx, 0), n - 1));
  };

  return (
    <div className="rounded-2xl border border-md-outline-variant p-4">
      <div className="flex items-center justify-between gap-4 mb-1">
        <h3 className="text-[15px] leading-[22px] font-medium text-md-on-surface">
          Traffic over time
        </h3>
        <div className="flex items-center gap-4">
          {/* Legend — always present for >= 2 series; identity never colour-alone */}
          <div className="flex items-center gap-3">
            {SERIES.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-[12px] leading-4 text-md-on-surface-variant">
                  {s.label}
                </span>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="text-[12px] leading-4 text-md-on-surface-variant hover:text-md-primary transition-colors"
          >
            {showTable ? "chart" : "table"}
          </button>
        </div>
      </div>

      {showTable ? (
        // Table-view twin — every value reachable without colour or hover.
        <div className="max-h-[220px] overflow-y-auto mt-3">
          <table className="w-full text-[13px] leading-[18px]">
            <thead className="sticky top-0 bg-transparent">
              <tr className="text-md-on-surface-variant text-left">
                <th className="font-medium py-1.5">Date</th>
                <th className="font-medium py-1.5 text-right">Pageviews</th>
                <th className="font-medium py-1.5 text-right">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date} className="border-t border-md-outline-variant">
                  <td className="py-1.5 text-md-on-surface-variant">
                    {shortDate(d.date)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{d.views}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {d.visitors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={wrapRef} className="relative mt-2">
          <svg
            width="100%"
            height={H}
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
            role="img"
            aria-label="Daily pageviews and unique visitors"
          >
            {/* Recessive hairline grid — solid, one shade off the surface */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={padL}
                  x2={padL + plotW}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--chart-grid)"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={y(t) + 4}
                  textAnchor="end"
                  className="fill-md-on-surface-variant tabular-nums"
                  style={{ fontSize: 11 }}
                >
                  {formatNumber(t)}
                </text>
              </g>
            ))}

            {/* Crosshair */}
            {active && (
              <line
                x1={x(hover!)}
                x2={x(hover!)}
                y1={padT}
                y2={padT + plotH}
                stroke="var(--chart-grid)"
                strokeWidth="1"
              />
            )}

            {/* Series — 2px lines, thin marks */}
            {SERIES.map((s) => (
              <path
                key={s.key}
                d={path(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Hover markers — 2px surface ring on overlapping marks */}
            {active &&
              SERIES.map((s) => (
                <circle
                  key={s.key}
                  cx={x(hover!)}
                  cy={y(active[s.key])}
                  r="4.5"
                  fill={s.color}
                  stroke="hsl(var(--md-sys-color-surface-container-low))"
                  strokeWidth="2"
                />
              ))}

            {/* Selective direct labels — endpoint only, never every point */}
            {n > 0 &&
              SERIES.map((s) => (
                <text
                  key={s.key}
                  x={x(n - 1) + 8}
                  y={y(last[s.key]) + endOffsets[s.key]}
                  className="tabular-nums"
                  style={{ fontSize: 11, fill: s.color }}
                >
                  {formatNumber(last[s.key])}
                </text>
              ))}

            {/* X axis band */}
            <text
              x={padL}
              y={H - 6}
              className="fill-md-on-surface-variant"
              style={{ fontSize: 11 }}
            >
              {shortDate(daily[0].date)}
            </text>
            <text
              x={padL + plotW}
              y={H - 6}
              textAnchor="end"
              className="fill-md-on-surface-variant"
              style={{ fontSize: 11 }}
            >
              {shortDate(daily[n - 1].date)}
            </text>
          </svg>

          {/* Tooltip — enhances, never gates (values also in table view) */}
          {active && (
            <div
              className="pointer-events-none absolute top-0 rounded-lg border border-md-outline-variant bg-md-surface-container-high shadow-md-3 px-3 py-2"
              style={{
                left: Math.min(
                  Math.max(x(hover!) - 60, 0),
                  Math.max(w - 130, 0),
                ),
              }}
            >
              <div className="text-[12px] leading-4 text-md-on-surface-variant mb-1">
                {shortDate(active.date)}
              </div>
              {SERIES.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center gap-2 text-[13px] leading-[18px]"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <span className="text-md-on-surface-variant">{s.label}</span>
                  <span className="ml-auto tabular-nums text-md-on-surface">
                    {active[s.key]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Top pages ----------------------------------------------------------

function TopPages({
  pages,
}: { pages: Array<{ path: string; views: number }> }) {
  const max = Math.max(...pages.map((p) => p.views), 1);
  return (
    <div className="rounded-2xl border border-md-outline-variant p-4">
      <h3 className="text-[15px] leading-[22px] font-medium text-md-on-surface mb-3">
        Top pages
      </h3>
      <div className="space-y-1.5">
        {pages.map((p) => (
          <div key={p.path} className="group flex items-center gap-3">
            <span className="text-[13px] leading-[18px] text-md-on-surface truncate w-1/2 shrink-0">
              {p.path}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-md-surface-container overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-md-standard"
                style={{
                  width: `${Math.max((p.views / max) * 100, 2)}%`,
                  background: "var(--chart-1)",
                }}
              />
            </div>
            <span className="text-[13px] leading-[18px] tabular-nums text-md-on-surface-variant w-10 text-right shrink-0">
              {formatNumber(p.views)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main ---------------------------------------------------------------

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
  const daily = posthog?.daily?.filter(Boolean) ?? [];
  const hasTraffic = daily.length > 0 && daily.some((d) => d.views > 0);

  const pageviews = posthog?.pageviews ?? 0;
  const visitors = posthog?.uniqueVisitors ?? 0;
  const perVisitor = visitors > 0 ? (pageviews / visitors).toFixed(1) : "—";

  const cfRequests = cloudflare?.totalRequests ?? 0;
  const cacheRate =
    cfRequests > 0 && cloudflare?.cachedRequests
      ? Math.round((cloudflare.cachedRequests / cfRequests) * 100)
      : 0;

  return (
    <section>
      {/* One filter row above everything it scopes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant">
          analytics
        </h2>
        <div className="inline-flex rounded-full border border-md-outline overflow-hidden">
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-4 h-9 text-[13px] leading-[18px] transition-colors duration-200 ease-md-standard ${
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
        <div className="rounded-xl border border-md-error/40 bg-md-error/10 p-3 mb-4 text-[15px] leading-[22px] text-md-error">
          {error}
        </div>
      )}

      {!posthog?.configured && !loading ? (
        <div className="rounded-xl border border-dashed border-md-outline-variant p-6 text-center text-[15px] leading-[22px] text-md-on-surface-variant">
          PostHog not configured. Set <code>POSTHOG_PERSONAL_API_KEY</code> and{" "}
          <code>POSTHOG_PROJECT_ID</code> to enable.
        </div>
      ) : (
        // Hold the previous render at reduced opacity on refetch — no skeleton flash
        <div
          className={`space-y-3 transition-opacity duration-200 ${
            loading && data ? "opacity-50" : "opacity-100"
          }`}
        >
          {loading && !data ? (
            <div className="h-[420px] rounded-2xl border border-md-outline-variant animate-pulse" />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Pageviews" value={formatNumber(pageviews)} />
                <StatTile
                  label="Unique visitors"
                  value={formatNumber(visitors)}
                />
                <StatTile
                  label="Pages per visitor"
                  value={perVisitor}
                  hint={`last ${range}`}
                />
              </div>

              {hasTraffic ? (
                <TrendChart daily={daily} />
              ) : (
                <div className="rounded-2xl border border-md-outline-variant p-8 text-center">
                  <Icon
                    name="show_chart"
                    size={32}
                    className="text-md-on-surface-variant/40"
                  />
                  <p className="text-[15px] leading-[22px] text-md-on-surface-variant mt-2">
                    No traffic recorded in this range.
                  </p>
                </div>
              )}

              {posthog?.topPages && posthog.topPages.length > 0 && (
                <TopPages pages={posthog.topPages} />
              )}

              {/* Edge — a compact strip, not a row of zeros */}
              {cloudflare?.configured && (
                <div className="rounded-2xl border border-md-outline-variant p-4">
                  <h3 className="text-[15px] leading-[22px] font-medium text-md-on-surface mb-3">
                    Edge (Cloudflare)
                  </h3>
                  {cfRequests === 0 ? (
                    <p className="text-[13px] leading-[18px] text-md-on-surface-variant">
                      No edge data for this range.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                      <div>
                        <div className="text-[17px] leading-6 font-medium tracking-tight text-md-on-surface">
                          {formatNumber(cfRequests)}
                        </div>
                        <div className="text-[12px] leading-4 text-md-on-surface-variant">
                          requests
                        </div>
                      </div>
                      <div>
                        <div className="text-[17px] leading-6 font-medium tracking-tight text-md-on-surface">
                          {formatBytes(cloudflare.bandwidth ?? 0)}
                        </div>
                        <div className="text-[12px] leading-4 text-md-on-surface-variant">
                          bandwidth
                        </div>
                      </div>
                      {/* A ratio against a limit — a meter, not a chart */}
                      <div className="flex-1 min-w-[160px]">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-[12px] leading-4 text-md-on-surface-variant">
                            cache hit rate
                          </span>
                          <span className="text-[12px] leading-4 tabular-nums text-md-on-surface">
                            {cacheRate}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-md-surface-container overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${cacheRate}%`,
                              background: "var(--chart-1)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
