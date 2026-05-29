import { getSeriesBySlug } from "@/lib/series";
import TurndownService from "turndown";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

export const dynamic = "force-dynamic";

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function frontmatter(
  fields: Record<string, string | undefined | null>,
): string {
  const lines: Array<string> = ["---"];
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    lines.push(`${key}: "${escapeYaml(value)}"`);
  }
  lines.push("---");
  return lines.join("\n");
}

function htmlToMarkdown(html: string | undefined): string {
  if (!html) return "";
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  return service.turndown(html);
}

export async function GET(
  _request: Request,
  { params }: { params: { seriesSlug: string } },
) {
  try {
    const seriesItem = await getSeriesBySlug(params.seriesSlug);

    const head = frontmatter({
      title: seriesItem.title,
      summary: seriesItem.summary,
      url: seriesItem.url,
      group: seriesItem.group_title,
      date_created: seriesItem.date_created,
      date_updated: seriesItem.date_updated,
      canonical: `${BASE_URL}/series/${params.seriesSlug}`,
    });

    const body = htmlToMarkdown(seriesItem.description);

    let related = "";
    if (seriesItem.posts && seriesItem.posts.length > 0) {
      const items = seriesItem.posts
        .map((p) => {
          const desc = p.description ? `: ${p.description}` : "";
          return `- [${p.title}](${BASE_URL}/posts/${p.slug})${desc}`;
        })
        .join("\n");
      related = `\n\n## Parts in this series\n\n${items}\n`;
    }

    const output = `${head}\n\n${body}${related}\n`;

    return new Response(output, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "x-markdown-tokens": String(Math.ceil(output.length / 4)),
      },
    });
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
