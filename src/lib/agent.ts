import { getGlobalMetadata } from "@/lib/global";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import { getSeriesList } from "@/lib/series";

// A2A (Agent2Agent) protocol surface for the blog. The blog exposes itself as
// a read-only content agent: validating agents discover the card at
// /.well-known/agent-card.json (DNS-AID points _a2a._agents.<domain> here),
// then call the JSON-RPC endpoint at /api/a2a to query published writing.
//
// Spec: https://a2a-protocol.org — AgentCard schema + message/send method.
// The skills below are backed by the same data-access functions the public
// site uses, so the advertised capabilities are real, not aspirational.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

export const A2A_PROTOCOL_VERSION = "0.3.0";

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  tags: Array<string>;
  examples?: Array<string>;
  inputModes?: Array<string>;
  outputModes?: Array<string>;
}

function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build the A2A Agent Card. Values come from the live profile/global tables so
 * the card reflects the actual site identity. DB failures fall back to safe
 * defaults — this must never throw at build/prerender time (see CLAUDE.md).
 */
export async function buildAgentCard(): Promise<Record<string, unknown>> {
  let siteTitle = "Blog";
  let tagline = "";
  let ownerName = "";
  let about = "";

  try {
    const [globalRows, profileRows] = await Promise.all([
      getGlobalMetadata(),
      getProfile(),
    ]);
    const site = globalRows[0] as
      | { title?: string; tagline?: string }
      | undefined;
    const profile = profileRows[0] as
      | { name?: string; description?: string }
      | undefined;
    siteTitle = site?.title || siteTitle;
    tagline = site?.tagline || "";
    ownerName = profile?.name || "";
    about = stripHtml(profile?.description);
  } catch {
    // keep defaults
  }

  const agentName = ownerName ? `${ownerName} — ${siteTitle}` : siteTitle;
  const description =
    tagline ||
    about ||
    "Read-only content agent exposing this site's published writing to other agents.";

  const skills: Array<AgentSkill> = [
    {
      id: "search_posts",
      name: "Search posts",
      description:
        "Search published posts by keyword. Returns matching titles, summaries, and canonical + markdown URLs.",
      tags: ["search", "content", "blog"],
      examples: ["Find posts about embeddings", "context windows"],
      inputModes: ["text/plain"],
      outputModes: ["text/markdown"],
    },
    {
      id: "get_post",
      name: "Get post",
      description:
        "Fetch the full markdown of a published post by its slug. Use 'get: <slug>'.",
      tags: ["content", "markdown", "retrieval"],
      examples: ["get: how-embeddings-work"],
      inputModes: ["text/plain"],
      outputModes: ["text/markdown"],
    },
    {
      id: "list_series",
      name: "List series",
      description:
        "List the published series (multi-part writing) available on the site.",
      tags: ["index", "series", "navigation"],
      examples: ["list series", "what series are there?"],
      inputModes: ["text/plain"],
      outputModes: ["text/markdown"],
    },
  ];

  return {
    protocolVersion: A2A_PROTOCOL_VERSION,
    name: agentName,
    description,
    url: `${BASE_URL}/api/a2a`,
    preferredTransport: "JSONRPC",
    provider: {
      organization: ownerName || siteTitle,
      url: BASE_URL,
    },
    version: "1.0.0",
    documentationUrl: `${BASE_URL}/llms.txt`,
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain", "text/markdown"],
    skills,
  };
}

/**
 * Skill router. Takes the user's free-text message and answers it from real
 * blog data. Returns markdown. Intentionally simple keyword routing — the
 * point is that every advertised skill resolves to actual content.
 */
export async function runAgentSkill(rawText: string): Promise<string> {
  const text = (rawText || "").trim();
  if (!text) {
    return "Send a query: search by keyword, `get: <slug>` to fetch a post, or `list series`.";
  }

  // get: <slug>  /  post: <slug>
  const getMatch = text.match(
    /^(?:get|post|fetch)\s*[:\s]\s*([a-z0-9][a-z0-9-]*)\s*$/i,
  );
  if (getMatch) {
    const slug = getMatch[1].toLowerCase();
    try {
      const post = await getPostBySlug(slug);
      const header = [
        `# ${post.title ?? slug}`,
        post.description ? `\n> ${post.description}` : "",
        `\nCanonical: ${BASE_URL}/posts/${slug}`,
        `Markdown: ${BASE_URL}/posts/${slug}/md`,
      ]
        .filter(Boolean)
        .join("\n");
      return `${header}\n\n---\n\n${post.content ?? ""}`.trim();
    } catch {
      return `No published post found with slug \`${slug}\`. Try a keyword search instead.`;
    }
  }

  // list series
  if (/^(list\s+series|series|what\s+series)/i.test(text)) {
    try {
      const list = await getSeriesList();
      if (!list.length) return "No published series yet.";
      const lines = list.map(
        (s) =>
          `- **${s.title ?? s.slug}** — ${BASE_URL}/series/${s.slug}${
            s.summary ? `\n  ${stripHtml(s.summary)}` : ""
          }`,
      );
      return `## Series (${list.length})\n\n${lines.join("\n")}`;
    } catch {
      return "Series are temporarily unavailable.";
    }
  }

  // default: keyword search across published posts
  try {
    const all = await getPosts({ limit: 1000 });
    const needle = text.toLowerCase();
    const matches = all
      .filter((p) => {
        const hay = `${p.title ?? ""} ${p.description ?? ""}`.toLowerCase();
        return hay.includes(needle);
      })
      .slice(0, 10);

    if (!matches.length) {
      return `No published posts match "${text}". Try \`list series\` or a broader keyword.`;
    }

    const lines = matches.map((p) => {
      const desc = p.description ? ` — ${p.description}` : "";
      return `- **${p.title ?? p.slug}**${desc}\n  ${BASE_URL}/posts/${p.slug} · md: ${BASE_URL}/posts/${p.slug}/md`;
    });
    return `## ${matches.length} result(s) for "${text}"\n\n${lines.join("\n")}`;
  } catch {
    return "Search is temporarily unavailable.";
  }
}
