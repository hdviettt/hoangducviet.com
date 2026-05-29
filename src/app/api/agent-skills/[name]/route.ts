import { SKILLS, buildSkillMarkdown } from "@/lib/agent";

// Per-skill SKILL.md — served at /.well-known/agent-skills/<name>/SKILL.md via
// a rewrite in next.config.mjs. The body must be byte-identical to what the
// discovery index hashed for this skill's `digest` (both use buildSkillMarkdown).
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { name: string } },
) {
  const skill = SKILLS.find((s) => s.name === params.name);
  if (!skill) {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(buildSkillMarkdown(skill), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
