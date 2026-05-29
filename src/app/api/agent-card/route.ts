import { buildAgentCard } from "@/lib/agent";

// Served at the canonical A2A path /.well-known/agent-card.json via a rewrite
// in next.config.mjs. DNS-AID (_a2a._agents.<domain>) points discovering
// agents here.
export const dynamic = "force-dynamic";

export async function GET() {
  const card = await buildAgentCard();
  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
