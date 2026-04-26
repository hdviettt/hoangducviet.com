import { getGlobalMetadata } from "@/lib/global";
import { getPosts } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import { getSeriesList } from "@/lib/series";
import { db } from "@/db";
import { seriesPosts } from "@/db/schema";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

export const dynamic = "force-dynamic";

function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  try {
    const [globalRows, profileRows, allPosts, allSeries, allLinks] =
      await Promise.all([
        getGlobalMetadata(),
        getProfile(),
        getPosts({ limit: 1000 }),
        getSeriesList(),
        db
          .select({
            postSlug: seriesPosts.postSlug,
            seriesSlug: seriesPosts.seriesSlug,
          })
          .from(seriesPosts),
      ]);

    const postToSeries = new Map(
      allLinks.map((r) => [r.postSlug, r.seriesSlug]),
    );

    const site = globalRows[0] ?? { title: "Blog", tagline: "" };
    const profile = profileRows[0] ?? { name: "", description: "" };

    const lines: Array<string> = [];
    lines.push(`# ${site.title || "Blog"}`);
    lines.push("");
    if (site.tagline) {
      lines.push(`> ${site.tagline}`);
      lines.push("");
    }

    lines.push("## About");
    const about = stripHtml(profile.description);
    if (about) {
      lines.push(`- [Homepage](${BASE_URL}/) — ${about}`);
    } else {
      lines.push(`- [Homepage](${BASE_URL}/)`);
    }
    lines.push("");

    if (allPosts.length > 0) {
      lines.push("## Posts");
      for (const post of allPosts) {
        const seriesSlug = postToSeries.get(post.slug || "");
        const path = seriesSlug
          ? `/series/${seriesSlug}/${post.slug}`
          : `/posts/${post.slug}`;
        const desc = post.description ? `: ${post.description}` : "";
        lines.push(`- [${post.title}](${BASE_URL}${path})${desc}`);
      }
      lines.push("");
    }

    if (allSeries.length > 0) {
      lines.push("## Series");
      for (const s of allSeries) {
        const desc = s.summary ? `: ${s.summary}` : "";
        lines.push(`- [${s.title}](${BASE_URL}/series/${s.slug})${desc}`);
      }
      lines.push("");
    }

    lines.push("## Indices");
    lines.push(`- [Homepage](${BASE_URL}/) — full year-grouped writing list`);
    lines.push(`- [Sitemap](${BASE_URL}/sitemap.xml)`);
    lines.push("");

    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    const fallback = `# Blog

- [Homepage](${BASE_URL}/)
- [Sitemap](${BASE_URL}/sitemap.xml)
`;
    return new Response(fallback, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
