import { Head, Ic, Node, I } from "@/components/work/WorkDiagramKit";

// The agentic AI platform (blog slug agentic-ai-platform) is LAYERED
// INFRASTRUCTURE serving a whole company, not one request/response app. So the
// diagram is a layer cake, top to bottom: many agents -> one shared runtime ->
// what an agent is composed of -> the shared rails every run sits on. This
// corrects the earlier framing, which shrank a company platform into one
// teammate publishing a few docs. Verified against seongon agent-platform:
// 19 agents, one Claude Agent SDK runtime, an agent = a markdown file + skills
// (63, deterministic), 22 MCP connectors, Postgres run history, credential vault,
// a 5-of-5 eval gate, company-email SSO. Of 103 parts, 52 never touch a model.

// Layer label at the far left of a band.
function LayerLabel({ y, text, sub }: { y: number; text: string; sub?: string }) {
  return (
    <>
      <text className="wd-band-t" x="40" y={y}>{text}</text>
      {sub && <text className="wd-note" x="40" y={y + 18}>{sub}</text>}
    </>
  );
}

// A small agent pill (what people actually reach for).
function Agent({ x, w, label }: { x: number; w: number; label: string }) {
  return (
    <g>
      <rect className="wd-tab-out" x={x} y={118} width={w} height={32} rx={16} />
      <text className="wd-tab-out-t" x={x + w / 2} y={138} textAnchor="middle">{label}</text>
    </g>
  );
}

export default function AgenticPlatformDiagram() {
  return (
    <svg viewBox="0 0 1360 600" className="work-diagram" role="img" aria-label="The agentic AI platform as a layer cake: many agents on top run on one shared Claude Agent SDK runtime; each agent is composed of skills, connectors and at most one model step; everything sits on shared rails - company sign-in, a credential vault, Postgres run history, and an eval gate.">
      <rect className="wd-bg" x="0.5" y="0.5" width="1359" height="599" rx="28" />

      <text className="wd-band-t" x="40" y="52">One platform for a whole company: one runtime, many agents, shared rails</text>
      <text className="wd-note" x="40" y="72">procedures over prompts: an agent is a written procedure, not a clever prompt</text>

      {/* Layer 1 -- the agents (what people use) */}
      <LayerLabel y={139} text="Agents" />
      <Agent x={200} w={94} label="publishing" />
      <Agent x={306} w={74} label="quoting" />
      <Agent x={392} w={94} label="clustering" />
      <Agent x={498} w={74} label="writing" />
      <text className="wd-note" x="590" y="139">+ 15 more</text>
      <rect className="wd-tag" x="1150" y="118" width="170" height="32" rx="16" />
      <text className="wd-tag-t" x="1235" y="138" textAnchor="middle">19 agents &#183; 117 people</text>

      {/* each agent runs on the one runtime below */}
      {[247, 343, 439, 535].map((cx) => (
        <g key={cx}>
          <path className="wd-edge" d={`M${cx} 152 V180`} fill="none" />
          <Head x={cx} y={180} dir="down" />
        </g>
      ))}

      {/* Layer 2 -- the one shared runtime (the hub of the whole platform) */}
      <LayerLabel y={218} text="Runtime" />
      <g className="hub">
        <rect className="wd-card hub" x="200" y="180" width="1120" height="64" rx="16" />
        <Ic x={222} y={200} icon={I.layers} s={1.1} />
        <text className="wd-title" x="258" y="210">One runtime &#183; Claude Agent SDK</text>
        <text className="wd-sub" x="258" y="229">an agent = one markdown file + skills, loaded whole</text>
        <text className="wd-sub" x="1300" y="219" textAnchor="end">every agent, the same runtime</text>
      </g>

      {/* runtime assembles each agent from these */}
      {[370, 760, 1150].map((cx) => (
        <g key={cx}>
          <path className="wd-edge" d={`M${cx} 244 V296`} fill="none" />
          <Head x={cx} y={296} dir="down" />
        </g>
      ))}

      {/* Layer 3 -- what an agent is composed of */}
      <LayerLabel y={346} text="Composed of" />
      <Node x={200} y={296} w={340} h={88} icon={I.folder} title="Skills" sub="loaded whole" variant="neutral" />
      <text x="516" y="363" textAnchor="end" style={{ fontSize: "32px", fontWeight: 700, fill: "var(--wd-neutral-ink)", opacity: 0.4 }}>63</text>
      <Node x={590} y={296} w={340} h={88} icon={I.plug} title="Connectors" sub="MCP to outside systems" variant="neutral" />
      <text x="906" y="363" textAnchor="end" style={{ fontSize: "32px", fontWeight: 700, fill: "var(--wd-neutral-ink)", opacity: 0.4 }}>22</text>
      <Node x={980} y={296} w={340} h={88} icon={I.spark} title="Model" sub="one step, often zero" variant="accent" />
      <text x="1296" y="363" textAnchor="end" style={{ fontSize: "32px", fontWeight: 700, fill: "var(--wd-blue-ink)", opacity: 0.5 }}>&#8804;1</text>
      <text className="wd-band-n" x="980" y="402">52 of 103 parts run with no model at all</text>

      {/* Layer 4 -- the shared rails every run sits on */}
      <LayerLabel y={478} text="Shared rails" sub="every agent, every run" />
      <Node x={200} y={434} w={248} h={80} icon={I.globe} title="SSO gateway" sub="company sign-in" variant="neutral" />
      <Node x={490} y={434} w={248} h={80} icon={I.lock} title="Credentials" sub="hidden from model" variant="neutral" />
      <Node x={780} y={434} w={248} h={80} icon={I.db} title="Run history" sub="Postgres &#183; per run" variant="neutral" />
      <Node x={1070} y={434} w={248} h={80} icon={I.shield} title="Eval gate" sub="5 of 5 to ship" variant="neutral" />

      <text className="wd-note" x="40" y="560">Encodings are disposable: an agent often needs a model in just one step, so the rest collapses into deterministic code; some became a single button.</text>
    </svg>
  );
}
