import { markDef } from "@/components/home/logo-marks";
import { Head, Ic, I } from "@/components/work/WorkDiagramKit";

// The presentation agent (blog slug agentic-presentation-system). Facts per
// PresentationDiagram.SOURCE.md. One flat style: filled cards (blue = an agent,
// solid blue = the Orchestrator, grey = deterministic code) and white paper for the
// deck and the library. A vertical spine - Orchestrator, Outline agent, a human in
// the loop, Slide agent, then the coded Draw stage. The Data analyst and SEO agent
// flank the outline as optional consults; the Component library and Brand kit flank
// the slide agent as what it draws from. Each agent carries its model/service logos.

const ACC = "hsl(var(--md-sys-color-primary))";
const DSK = "#4d6bfe";
// Paper surfaces are theme-aware (see --wd-paper* in globals.css): a light slide
// in light mode, an elevated dark card in dark mode.
const PAPER = "var(--wd-paper)";
const PAPER_B = "var(--wd-paper-b)";
const RULE = "var(--wd-paper-rule)";
const INK = "var(--wd-paper-ink)";
const INK2 = "var(--wd-paper-ink2)";
const FAINT = "var(--wd-paper-faint)";
const G1 = "var(--wd-paper-g1)";
const G2 = "var(--wd-paper-g2)";
const person = (<><circle cx="11" cy="7.5" r="4" /><path d="M3.5 20.5a7.5 7.5 0 0 1 15 0" /></>);

function Mark({ x, y, s, k }: { x: number; y: number; s: number; k: string }) {
  const def = markDef(k);
  if (!def) return null;
  return <svg x={x} y={y} width={s} height={s} viewBox={def.vb ?? "0 0 24 24"}><path d={def.d} fill={k === "deepseek" ? DSK : "#525a6e"} fillRule={def.evenodd ? "evenodd" : "nonzero"} /></svg>;
}

function Tile({ x, y, k, s = 17 }: { x: number; y: number; k: string; s?: number }) {
  return (<g><rect x={x} y={y} width={s} height={s} rx={5} fill="var(--wd-tile)" /><Mark x={x + s * 0.22} y={y + s * 0.22} s={s * 0.56} k={k} /></g>);
}

function Eyebrow({ x, y, text }: { x: number; y: number; text: string }) {
  return <text x={x} y={y} style={{ fill: "var(--wd-faint)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em" }}>{text}</text>;
}

// One card style, name only. tone: agent (flat blue), hub (solid blue), code (flat grey).
function Node({ x, y, w, h, icon, name, tone, logos }: { x: number; y: number; w: number; h: number; icon: React.ReactNode; name: string; tone: "agent" | "hub" | "code"; logos?: string[] }) {
  const cls = tone === "hub" ? "wd-card hub" : tone === "code" ? "wd-card neutral" : "wd-card";
  return (
    <g className={tone === "hub" ? "hub" : tone === "code" ? "neutral" : ""}>
      <rect className={cls} x={x} y={y} width={w} height={h} rx={15} />
      <Ic x={x + 18} y={y + 17} icon={icon} s={0.78} />
      <text className="wd-title" x={x + 50} y={y + 32} style={{ fontSize: "13.5px", ...(tone === "hub" ? { fill: "#fff" } : {}) }}>{name}</text>
      {logos?.map((k, i) => <Tile key={k} x={x + 18 + i * 22} y={y + h - 27} k={k} />)}
    </g>
  );
}

function Chip({ x, y, w, icon, label }: { x: number; y: number; w: number; icon: React.ReactNode; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx={9} fill="var(--wd-field)" stroke="var(--wd-zone-b)" strokeWidth={1} />
      <g className="wd-ic" transform={`translate(${x + 10}, ${y + 8}) scale(0.6)`}>{icon}</g>
      <text x={x + 27} y={y + 19} style={{ fill: "var(--wd-muted)", fontSize: "11px", fontWeight: 500 }}>{label}</text>
    </g>
  );
}

const SC = 862; // spine centre

export default function PresentationDiagram() {
  return (
    <svg viewBox="0 0 1360 616" className="work-diagram" role="img" aria-label="The presentation agent as a You panel and an Engine panel. You: a prompt, Pitch Q3 to the board, with a template, brand and Q3.xlsx, and the editable deck that comes back. The Engine is a vertical flow: an Orchestrator you talk to, an Outline agent, a human in the loop, a Slide agent, then a deterministic coded Draw stage of a Layout engine, a Linter and Render. A Data analyst on E2B and an SEO agent on Tavily and DataForSEO flank the outline as optional consults; a Component library and a Brand kit flank the slide agent as what it draws from. Every agent carries its model and service logos.">
      <rect className="wd-bg" x="0.5" y="0.5" width="1359" height="615" rx="26" />

      {/* ============================ You ============================ */}
      <rect className="wd-panel" x="32" y="36" width="344" height="544" rx="22" />
      <Eyebrow x={56} y={72} text="YOU" />
      <rect className="wd-input" x="52" y="86" width="304" height="48" rx="13" />
      <g className="wd-ic" transform="translate(70, 102) scale(0.66)">{I.chat}</g>
      <text className="wd-inputtext" x="98" y="114" style={{ fontSize: "13px" }}>Pitch Q3 to the board</text>
      <Chip x={52} y={150} w={94} icon={I.doc} label="Q3.xlsx" />
      <Chip x={154} y={150} w={98} icon={I.grid} label="Template" />
      <Chip x={260} y={150} w={78} icon={I.tag} label="Brand" />

      <path className="wd-hr" d="M52 200 H356" />
      <Eyebrow x={56} y={228} text="WHAT COMES BACK" />
      <rect x="52" y="242" width="304" height="296" rx="14" fill={PAPER} stroke={PAPER_B} strokeWidth="1.3" />
      <text x="80" y="278" style={{ fill: FAINT, fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.16em" }}>Q3 BUSINESS REVIEW</text>
      <text x="80" y="308" style={{ fill: INK, fontSize: "17px", fontWeight: 700, letterSpacing: "-0.01em" }}>Q3 landed 12% over plan</text>
      <line x1="80" y1="324" x2="328" y2="324" stroke={RULE} strokeWidth="1" />
      <g>{[32, 46, 58, 84].map((bh, i) => <rect key={i} x={82 + i * 27} y={470 - bh} width={21} height={bh} rx={3} fill={i === 3 ? ACC : G2} />)}</g>
      <text x="82" y="488" style={{ fill: FAINT, fontSize: "8px", fontFamily: "var(--font-mono), monospace" }}>Q1    Q2    Q3    Q4</text>
      <text x="218" y="404" style={{ fill: ACC, fontSize: "33px", fontWeight: 800, letterSpacing: "-0.02em" }}>+12%</text>
      <text x="220" y="427" style={{ fill: INK2, fontSize: "11px" }}>vs plan</text>
      <text x="218" y="458" style={{ fill: INK, fontSize: "12.5px", fontWeight: 600 }}>on renewals</text>
      <text x="80" y="520" style={{ fill: FAINT, fontSize: "8.5px", fontFamily: "var(--font-mono), monospace" }}>Source &#183; sales.csv</text>
      <text x="328" y="520" textAnchor="end" style={{ fill: FAINT, fontSize: "8.5px", fontFamily: "var(--font-mono), monospace" }}>03 / 14</text>

      {/* brief crosses into the engine */}
      <path className="wd-edge" d="M376 110 H540 V124 H750" fill="none" /><Head x={750} y={124} dir="right" />

      {/* ============================ The Engine ============================ */}
      <rect className="wd-panel" x="400" y="36" width="928" height="544" rx="22" />
      <Eyebrow x={424} y={72} text="THE ENGINE" />

      {/* the spine */}
      <Node x={750} y={92} w={224} h={66} icon={I.chat} name="Orchestrator" tone="hub" logos={["deepseek"]} />
      <path className="wd-edge" d={`M${SC} 158 V198`} fill="none" /><Head x={SC} y={198} dir="down" />
      <Node x={750} y={198} w={224} h={76} icon={I.pen} name="Outline agent" tone="agent" logos={["deepseek"]} />
      <Node x={750} y={344} w={224} h={76} icon={I.layers} name="Slide agent" tone="agent" logos={["deepseek"]} />

      {/* human in the loop - the one human checkpoint, cutting the outline -> slide arrow.
          Its own tonal-accent treatment (not the white paper of the artifacts, not the
          solid blue of the agents), so the single human moment reads at a glance. */}
      <path className="wd-edge" d={`M${SC} 274 V290`} fill="none" /><Head x={SC} y={290} dir="down" />
      <rect x="766" y="290" width="192" height="38" rx="19" fill="hsl(var(--md-sys-color-primary) / 0.12)" stroke={ACC} strokeOpacity={0.55} strokeWidth="1.5" />
      <circle cx="796" cy="309" r="12" fill={ACC} />
      <g transform="translate(788.1, 300.4) scale(0.72)" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{person}</g>
      <text x="818" y="313.5" style={{ fill: ACC, fontSize: "12px", fontWeight: 600 }}>Human in the loop</text>
      <path className="wd-edge" d={`M${SC} 328 V344`} fill="none" /><Head x={SC} y={344} dir="down" />

      {/* optional consults flank the outline */}
      <Eyebrow x={456} y={192} text="OPTIONAL" />
      <Eyebrow x={1082} y={192} text="OPTIONAL" />
      <Node x={444} y={204} w={206} h={72} icon={I.bars} name="Data analyst" tone="agent" logos={["deepseek", "e2b"]} />
      <Node x={1078} y={204} w={210} h={72} icon={I.globe} name="SEO agent" tone="agent" logos={["deepseek", "tavily", "dataforseo"]} />
      <path className="wd-edge dash" d="M650 240 H750" fill="none" /><Head x={750} y={240} dir="right" />
      <path className="wd-edge dash" d="M1078 240 H974" fill="none" /><Head x={974} y={240} dir="left" />

      {/* the library it draws from flanks the slide agent */}
      <Eyebrow x={456} y={338} text="DRAWS FROM" />
      <rect x="444" y="350" width="206" height="72" rx="14" fill={PAPER} stroke={PAPER_B} strokeWidth="1.1" />
      <text x="464" y="374" style={{ fill: INK, fontSize: "11.5px", fontWeight: 600 }}>Components</text>
      <circle cx="480" cy="402" r="12" fill={G2} /><path d="M480 402 L480 390 A12 12 0 0 1 490 408 Z" fill={ACC} />
      <g>{[9, 14, 20, 12].map((bh, i) => <rect key={i} x={516 + i * 10} y={410 - bh} width={6} height={bh} rx={1.5} fill={i === 2 ? ACC : G1} />)}</g>
      <rect x="570" y="394" width="24" height="13" rx={3} fill="none" stroke={ACC} strokeWidth="1.5" />
      <rect x="614" y="394" width="24" height="13" rx={3} fill="none" stroke={G1} strokeWidth="1.5" />
      <path className="wd-edge" d="M650 386 H750" fill="none" /><Head x={750} y={386} dir="right" />

      <rect x="1078" y="350" width="210" height="72" rx="14" fill={PAPER} stroke={PAPER_B} strokeWidth="1.1" />
      <text x="1098" y="374" style={{ fill: INK, fontSize: "11.5px", fontWeight: 600 }}>Brand</text>
      {[ACC, "#12a67a", "#f4a63a", INK].map((c, i) => <rect key={i} x={1098 + i * 18} y={388} width={13} height={13} rx={3} fill={c} />)}
      <text x="1180" y="384" style={{ fill: INK, fontSize: "16px", fontWeight: 700 }}>Aa</text>
      <g transform="translate(1244, 397)"><circle cx="0" cy="0" r="11" fill="none" stroke={INK} strokeWidth="2" /><circle cx="0" cy="0" r="3.6" fill={ACC} /></g>
      <path className="wd-edge" d="M1078 386 H974" fill="none" /><Head x={974} y={386} dir="left" />

      {/* the coded Draw stage */}
      <Eyebrow x={476} y={462} text="DRAW" />
      <path className="wd-edge" d={`M${SC} 420 V444 H638 V474`} fill="none" /><Head x={638} y={474} dir="down" />
      <Node x={538} y={474} w={200} h={62} icon={I.gear} name="Layout engine" tone="code" />
      <Node x={762} y={474} w={200} h={62} icon={I.check} name="Linter" tone="code" />
      <Node x={986} y={474} w={200} h={62} icon={I.code} name="Render" tone="code" />
      <path className="wd-edge" d="M738 505 H762" fill="none" /><Head x={762} y={505} dir="right" />
      <path className="wd-edge" d="M962 505 H986" fill="none" /><Head x={986} y={505} dir="right" />

      {/* the finished deck loops back to you - lands on the deck under WHAT COMES BACK */}
      <path className="wd-ret" d="M1086 536 V598 H204 V538" fill="none" />
      <path className="wd-ret" d="M200 544 l4 -6 4 6" fill="none" />
    </svg>
  );
}
