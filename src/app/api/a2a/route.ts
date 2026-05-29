import { randomUUID } from "node:crypto";
import { buildAgentCard, runAgentSkill } from "@/lib/agent";

// A2A (Agent2Agent) JSON-RPC 2.0 endpoint. Discovered via the Agent Card at
// /.well-known/agent-card.json. Implements the synchronous `message/send`
// method, returning a completed Task whose artifact holds the answer drawn
// from the blog's published content.
export const dynamic = "force-dynamic";

interface JsonRpcError {
  code: number;
  message: string;
}

function rpcError(id: unknown, error: JsonRpcError, status = 200) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error }, { status });
}

function rpcResult(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function extractText(message: unknown): string {
  const parts =
    (message as { parts?: Array<unknown> } | undefined)?.parts ?? [];
  return parts
    .map((p) => {
      const part = p as { kind?: string; type?: string; text?: string };
      if ((part.kind === "text" || part.type === "text") && part.text) {
        return part.text;
      }
      return "";
    })
    .join(" ")
    .trim();
}

// GET is a courtesy: agents that fetch the endpoint directly get pointed at
// the card. Discovery proper happens via /.well-known/agent-card.json.
export async function GET() {
  const card = await buildAgentCard();
  return Response.json({
    service: "A2A JSON-RPC endpoint",
    transport: "JSONRPC",
    method: "message/send",
    agentCard: card.url,
    name: card.name,
  });
}

export async function POST(request: Request) {
  let body: {
    jsonrpc?: string;
    id?: unknown;
    method?: string;
    params?: { message?: unknown; [k: string]: unknown };
  };

  try {
    body = await request.json();
  } catch {
    return rpcError(null, { code: -32700, message: "Parse error" });
  }

  const { id = null, method, params } = body ?? {};

  if (body?.jsonrpc !== "2.0" || typeof method !== "string") {
    return rpcError(id, { code: -32600, message: "Invalid Request" });
  }

  if (method !== "message/send") {
    return rpcError(id, {
      code: -32601,
      message: `Method not found: ${method}. Supported: message/send.`,
    });
  }

  const incoming = params?.message as
    | { messageId?: string; contextId?: string }
    | undefined;
  const userText = extractText(incoming);
  if (!userText) {
    return rpcError(id, {
      code: -32602,
      message: "Invalid params: message.parts must contain a text part.",
    });
  }

  let answer: string;
  try {
    answer = await runAgentSkill(userText);
  } catch {
    return rpcError(id, { code: -32603, message: "Internal error" });
  }

  const now = new Date().toISOString();
  const contextId = incoming?.contextId || randomUUID();
  const taskId = randomUUID();

  const task = {
    id: taskId,
    contextId,
    kind: "task",
    status: {
      state: "completed",
      timestamp: now,
    },
    artifacts: [
      {
        artifactId: randomUUID(),
        name: "answer",
        parts: [{ kind: "text", text: answer }],
      },
    ],
    history: incoming ? [{ ...incoming, role: "user", kind: "message" }] : [],
  };

  return rpcResult(id, task);
}
