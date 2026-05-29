import { getPostBySlug, getSeriesForPost } from "@/lib/posts";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

export const dynamic = "force-dynamic";

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function frontmatter(fields: Record<string, string | undefined>): string {
  const lines: Array<string> = ["---"];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === "") continue;
    lines.push(`${key}: "${escapeYaml(value)}"`);
  }
  lines.push("---");
  return lines.join("\n");
}

export async function GET(
  _request: Request,
  { params }: { params: { postSlug: string } },
) {
  try {
    const [post, seriesAssoc] = await Promise.all([
      getPostBySlug(params.postSlug),
      getSeriesForPost(params.postSlug),
    ]);

    // Series posts canonicalize at /series/[s]/[p]; standalone posts at /posts/[p].
    const canonicalPath = seriesAssoc
      ? `/series/${seriesAssoc.slug}/${params.postSlug}`
      : `/posts/${params.postSlug}`;

    const head = frontmatter({
      title: post.title,
      description: post.description,
      date_created: post.date_created,
      date_updated: post.date_updated,
      canonical: `${BASE_URL}${canonicalPath}`,
    });

    const body = `${head}\n\n${post.content ?? ""}\n`;

    return new Response(body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "x-markdown-tokens": String(Math.ceil(body.length / 4)),
      },
    });
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
