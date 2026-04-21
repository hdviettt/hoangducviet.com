import TurndownService from "turndown";
import { getProjectBySlug } from "@/lib/projects";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

export const dynamic = "force-dynamic";

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function frontmatter(fields: Record<string, string | undefined | null>): string {
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
  { params }: { params: { projectSlug: string } },
) {
  try {
    const project = await getProjectBySlug(params.projectSlug);

    const head = frontmatter({
      title: project.title,
      summary: project.summary,
      url: project.url,
      group: project.group_title,
      date_created: project.date_created,
      date_updated: project.date_updated,
      canonical: `${BASE_URL}/projects/${params.projectSlug}`,
    });

    const body = htmlToMarkdown(project.description);

    let related = "";
    if (project.posts && project.posts.length > 0) {
      const items = project.posts
        .map((p) => {
          const desc = p.description ? `: ${p.description}` : "";
          return `- [${p.title}](${BASE_URL}/posts/${p.slug}.md)${desc}`;
        })
        .join("\n");
      related = `\n\n## Related posts\n\n${items}\n`;
    }

    const output = `${head}\n\n${body}${related}\n`;

    return new Response(output, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
