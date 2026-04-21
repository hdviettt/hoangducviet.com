import { getPostBySlug } from "@/lib/posts";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

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
    const post = await getPostBySlug(params.postSlug);

    const head = frontmatter({
      title: post.title,
      description: post.description,
      date_created: post.date_created,
      date_updated: post.date_updated,
      canonical: `${BASE_URL}/posts/${params.postSlug}`,
    });

    const body = `${head}\n\n${post.content ?? ""}\n`;

    return new Response(body, {
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
