import { getGlobalMetadata } from "@/lib/global";
import { getPosts } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import { getProjects } from "@/lib/projects";
import { getSeriesList } from "@/lib/series";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

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
    const [globalRows, profileRows, allPosts, allSeries, allProjects] =
      await Promise.all([
        getGlobalMetadata(),
        getProfile(),
        getPosts({ limit: 1000 }),
        getSeriesList(),
        getProjects(),
      ]);

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
    lines.push(`- [About](${BASE_URL}/about)${about ? ` — ${about}` : ""}`);
    lines.push(`- [Homepage](${BASE_URL}/)`);
    lines.push("");

    if (allPosts.length > 0) {
      lines.push("## Posts");
      for (const post of allPosts) {
        const desc = post.description ? `: ${post.description}` : "";
        lines.push(`- [${post.title}](${BASE_URL}/posts/${post.slug})${desc}`);
      }
      lines.push("");
    }

    // Work truoc day khong co trong llms.txt: agent doc file nay se khong bao
    // gio biet phan portfolio ton tai. Dat truoc Series vi day la thu duoc
    // nguoi doc tim den nhieu nhat.
    if (allProjects.length > 0) {
      lines.push("## Work");
      lines.push(
        `- [All work](${BASE_URL}/work) — every project, newest first`,
      );
      for (const p of allProjects) {
        const desc = p.description ? `: ${p.description}` : "";
        lines.push(`- [${p.title}](${BASE_URL}/work/${p.slug})${desc}`);
      }
      lines.push("");
    }

    if (allSeries.length > 0) {
      lines.push("## Series");
      for (const s of allSeries) {
        const desc = s.summary ? `: ${s.summary}` : "";
        lines.push(`- [${s.title}](${BASE_URL}/collection/${s.slug})${desc}`);
      }
      lines.push("");
    }

    lines.push("## Indices");
    lines.push(`- [Homepage](${BASE_URL}/) — full year-grouped writing list`);
    lines.push(`- [Sitemap](${BASE_URL}/sitemap.xml)`);
    lines.push("");

    const body = lines.join("\n");
    return new Response(body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "x-markdown-tokens": String(Math.ceil(body.length / 4)),
      },
    });
  } catch {
    const fallback = `# Blog

- [Homepage](${BASE_URL}/)
- [Sitemap](${BASE_URL}/sitemap.xml)
`;
    return new Response(fallback, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "x-markdown-tokens": String(Math.ceil(fallback.length / 4)),
      },
    });
  }
}
