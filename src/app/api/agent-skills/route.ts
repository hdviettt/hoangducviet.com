import { createHash } from "node:crypto";
import { SKILLS, buildSkillMarkdown } from "@/lib/agent";

// Agent Skills Discovery index — served at /.well-known/agent-skills/index.json
// via a rewrite in next.config.mjs (App Router doesn't reliably route
// leading-dot folders). Spec: https://schemas.agentskills.io/discovery/0.2.0
//
// Each entry's `digest` is the SHA-256 of the exact bytes the matching
// /.well-known/agent-skills/<name>/SKILL.md route serves — both derive from
// buildSkillMarkdown(), so they can't drift.
export const dynamic = "force-dynamic";

export async function GET() {
  const skills = SKILLS.map((s) => {
    const md = buildSkillMarkdown(s);
    const digest = `sha256:${createHash("sha256").update(md, "utf8").digest("hex")}`;
    return {
      name: s.name,
      type: "skill-md",
      description: s.description,
      url: `/.well-known/agent-skills/${s.name}/SKILL.md`,
      digest,
    };
  });

  const body = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
