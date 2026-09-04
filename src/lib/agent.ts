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

export interface BlogSkill {
  name: string; // lowercase alphanumeric + hyphens (agent-skills discovery id)
  title: string;
  description: string;
  tags: Array<string>;
  examples: Array<string>;
  // Free-text message that triggers this skill at the A2A endpoint.
  sampleMessage: string;
  // One-line usage note rendered into the SKILL.md body.
  usage: string;
}

// Single source of truth for the agent's skills. Drives the A2A Agent Card,
// the agent-skills discovery index (/.well-known/agent-skills/index.json), and
// each published SKILL.md — all three stay in sync because they derive from here.
export const SKILLS: Array<BlogSkill> = [
  {
    name: "search-posts",
    title: "Search posts",
    description:
      "Search published posts by keyword. Returns matching titles, summaries, and canonical + markdown URLs.",
    tags: ["search", "content", "blog"],
    examples: ["embeddings", "context windows"],
    sampleMessage: "embeddings",
    usage:
      "Send a free-text keyword as the message; returns up to 10 matching posts with their canonical and markdown URLs.",
  },
  {
    name: "get-post",
    title: "Get post",
    description:
      "Fetch the full markdown of a published post by its slug. Use 'get: <slug>'.",
    tags: ["content", "markdown", "retrieval"],
    examples: ["get: agentic-keyword-clustering"],
    sampleMessage: "get: agentic-keyword-clustering",
    usage:
      "Send `get: <slug>` to retrieve a post's full markdown (frontmatter + body).",
  },
  {
    name: "list-series",
    title: "List series",
    description:
      "List the published series (multi-part writing) available on the site.",
    tags: ["index", "series", "navigation"],
    examples: ["list series"],
    sampleMessage: "list series",
    usage:
      "Send `list series` to list every published series with its URL and summary.",
  },
];

// Render a spec-compliant SKILL.md (YAML frontmatter + Markdown) for a skill.
// The bytes returned here are exactly what
// /.well-known/agent-skills/<name>/SKILL.md serves, and exactly what the
// discovery index hashes for its `digest` — so the two never drift.
export function buildSkillMarkdown(skill: BlogSkill): string {
  const endpoint = `${BASE_URL}/api/a2a`;
  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "message/send",
    params: {
      message: {
        role: "user",
        kind: "message",
        messageId: "m1",
        parts: [{ kind: "text", text: skill.sampleMessage }],
      },
    },
  });
  return `---
name: ${skill.name}
description: ${skill.description}
---

# ${skill.title}

${skill.description}

## Invocation

This skill is served by the A2A agent at \`${endpoint}\` (JSON-RPC 2.0, method \`message/send\`). ${skill.usage}

## Example

\`\`\`bash
curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '${payload}'
\`\`\`
`;
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

  const agentName =
    ownerName && ownerName.toLowerCase() !== siteTitle.toLowerCase()
      ? `${ownerName} — ${siteTitle}`
      : ownerName || siteTitle;
  const description =
    tagline ||
    about ||
    "Read-only content agent exposing this site's published writing to other agents.";

  const skills: Array<AgentSkill> = SKILLS.map((s) => ({
    id: s.name,
    name: s.title,
    description: s.description,
    tags: s.tags,
    examples: s.examples,
    inputModes: ["text/plain"],
    outputModes: ["text/markdown"],
  }));

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
          `- **${s.title ?? s.slug}** — ${BASE_URL}/collection/${s.slug}${
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
