import { requireAuth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const VALID_RANGES = ["7d", "30d", "90d"] as const;
type Range = (typeof VALID_RANGES)[number];

function rangeToDays(range: Range): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
  }
}

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

async function fetchPostHogData(days: number) {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY!;
  const projectId = process.env.POSTHOG_PROJECT_ID!;
  const baseUrl = "https://us.i.posthog.com";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const queryUrl = `${baseUrl}/api/projects/${projectId}/query/`;

  const [dailyRes, topPagesRes] = await Promise.all([
    fetch(queryUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query: `SELECT toDate(timestamp) as date, count() as pageviews, count(DISTINCT distinct_id) as visitors FROM events WHERE event = '$pageview' AND timestamp >= now() - interval ${days} day GROUP BY date ORDER BY date`,
        },
      }),
    }),
    fetch(queryUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query: `SELECT properties.$pathname as path, count() as views FROM events WHERE event = '$pageview' AND timestamp >= now() - interval ${days} day GROUP BY path ORDER BY views DESC LIMIT 10`,
        },
      }),
    }),
  ]);

  if (!dailyRes.ok || !topPagesRes.ok) {
    throw new Error(
      `PostHog API error: daily=${dailyRes.status} topPages=${topPagesRes.status}`,
    );
  }

  const dailyData = await dailyRes.json();
  const topPagesData = await topPagesRes.json();

  const daily = (dailyData.results || []).map((row: any[]) => ({
    date: row[0],
    views: Number(row[1]) || 0,
    visitors: Number(row[2]) || 0,
  }));

  const topPages = (topPagesData.results || []).map((row: any[]) => ({
    path: String(row[0] || "/"),
    views: Number(row[1]) || 0,
  }));

  let pageviews = 0;
  let uniqueVisitors = 0;
  for (const d of daily) {
    pageviews += d.views;
    uniqueVisitors += d.visitors;
  }

  return { pageviews, uniqueVisitors, topPages, daily };
}

async function fetchCloudflareData(startDate: string, endDate: string) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN!;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!;

  const query = `query {
    viewer {
      zones(filter: { zoneTag: "${zoneId}" }) {
        httpRequests1dGroups(
          limit: 100
          filter: { date_geq: "${startDate}", date_leq: "${endDate}" }
          orderBy: [date_ASC]
        ) {
          dimensions { date }
          sum { requests bytes cachedRequests cachedBytes }
          uniq { uniques }
        }
      }
    }
  }`;

  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Cloudflare API error: ${res.status}`);
  }

  const json = await res.json();
  const groups =
    json.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];

  const daily = groups.map((g: any) => ({
    date: g.dimensions.date,
    requests: g.sum.requests,
    bytes: g.sum.bytes,
    cachedRequests: g.sum.cachedRequests,
    uniques: g.uniq.uniques,
  }));

  let totalRequests = 0;
  let uniqueVisitors = 0;
  let bandwidth = 0;
  let cachedRequests = 0;
  let cachedBytes = 0;
  for (const d of daily) {
    totalRequests += d.requests;
    uniqueVisitors += d.uniques;
    bandwidth += d.bytes;
    cachedRequests += d.cachedRequests;
  }
  for (const g of groups) {
    cachedBytes += g.sum.cachedBytes;
  }

  return {
    totalRequests,
    uniqueVisitors,
    bandwidth,
    cachedRequests,
    cachedBytes,
    daily,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const rangeParam = request.nextUrl.searchParams.get("range") || "7d";
    const range = VALID_RANGES.includes(rangeParam as Range)
      ? (rangeParam as Range)
      : "7d";
    const days = rangeToDays(range);
    const { startDate, endDate } = getDateRange(days);

    const posthogConfigured = !!(
      process.env.POSTHOG_PERSONAL_API_KEY &&
      process.env.POSTHOG_PROJECT_ID
    );
    const cloudflareConfigured = !!(
      process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID
    );

    const [posthogResult, cloudflareResult] = await Promise.allSettled([
      posthogConfigured ? fetchPostHogData(days) : Promise.resolve(null),
      cloudflareConfigured
        ? fetchCloudflareData(startDate, endDate)
        : Promise.resolve(null),
    ]);

    const posthog =
      posthogResult.status === "fulfilled" ? posthogResult.value : null;
    const cloudflare =
      cloudflareResult.status === "fulfilled"
        ? cloudflareResult.value
        : null;

    if (posthogResult.status === "rejected") {
      console.error("PostHog analytics error:", posthogResult.reason);
    }
    if (cloudflareResult.status === "rejected") {
      console.error("Cloudflare analytics error:", cloudflareResult.reason);
    }

    return NextResponse.json({
      posthog: posthog
        ? { configured: true, ...posthog }
        : { configured: posthogConfigured },
      cloudflare: cloudflare
        ? { configured: true, ...cloudflare }
        : { configured: cloudflareConfigured },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
