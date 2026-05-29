import { getPosts } from "@/lib/posts";
import { getGlobalMetadata } from "@/lib/global";
import { db } from "@/db";
import { seriesPosts } from "@/db/schema";

export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

  let siteTitle = "Blog";
  let siteDescription = "";

  try {
    const global = await getGlobalMetadata();
    if (global && global.length > 0) {
      siteTitle = global[0].title || siteTitle;
      siteDescription = global[0].tagline || siteDescription;
    }
  } catch {}

  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let postToSeries = new Map<string, string>();
  try {
    posts = await getPosts({ limit: 50 });
    const links = await db
      .select({
        postSlug: seriesPosts.postSlug,
        seriesSlug: seriesPosts.seriesSlug,
      })
      .from(seriesPosts);
    postToSeries = new Map(links.map((r) => [r.postSlug, r.seriesSlug]));
  } catch {}

  const items = posts
    .map((post) => {
      const seriesSlug = postToSeries.get(post.slug || "");
      const link = seriesSlug
        ? `${baseUrl}/series/${seriesSlug}/${post.slug}`
        : `${baseUrl}/posts/${post.slug}`;
      const pubDate = post.date_created
        ? new Date(post.date_created).toUTCString()
        : "";
      return `    <item>
      <title>${escapeXml(post.title || "")}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.description || "")}</description>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>vi</language>
    <atom:link href="${escapeXml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
