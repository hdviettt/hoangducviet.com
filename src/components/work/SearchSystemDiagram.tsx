import { markDef } from "@/components/home/logo-marks";
import type { ReactNode } from "react";

// A bespoke system + interaction diagram for the mini search engine, told through
// one real query. Left: the user searches "kylian mbappe" (Explore) and gets an
// AI Overview + ranked results, then asks a grounded follow-up in AI Mode. Right:
// the engine in four sections - an offline index (set apart), per-query retrieve
// & rank, RAG generation, and a conversational AI Mode that re-retrieves in
// context. Copy is checked against the real repo (BM25+PageRank sum, voyage-3-
// lite, ms-marco MiniLM, Llama 3.3 70B via Groq, 7-site football allowlist).

type IconKey =
  | "search" | "globe" | "download" | "code" | "index" | "bars"
  | "loop" | "spark" | "chat" | "clock" | "stack";

const ICONS: Record<IconKey, ReactNode> = {
  search: (<><circle cx="9" cy="9" r="7" /><path d="M14 14l6.5 6.5" /></>),
  globe: (<><circle cx="11" cy="11" r="9.5" /><ellipse cx="11" cy="11" rx="3.8" ry="9.5" /><path d="M1.5 11H20.5" /></>),
  download: (<><path d="M11 1.5V13M6.5 8.5l4.5 4.5 4.5-4.5" /><path d="M2.5 16v3.5a1 1 0 001 1h15a1 1 0 001-1V16" /></>),
  code: (<path d="M7 6.5l-4.5 4.5L7 15.5M15 6.5l4.5 4.5L15 15.5M12.5 4l-3 14" />),
  index: (<><rect x="1.5" y="2.5" width="19" height="4.5" rx="1.5" /><rect x="1.5" y="9.5" width="19" height="4.5" rx="1.5" /><rect x="1.5" y="16.5" width="19" height="4.5" rx="1.5" /></>),
  bars: (<path d="M2.5 20V11M9 20V4.5M15.5 20V14" strokeWidth="2.4" />),
  loop: (<><path d="M3.5 11a7.5 7.5 0 0113-5.1" /><path d="M17 1.5v5h-5" /><path d="M18.5 11a7.5 7.5 0 01-13 5.1" /><path d="M5 20.5v-5h5" /></>),
  spark: (<path d="M11 2l1.8 6L18.5 9.5l-5.7 1.5L11 17l-1.8-6L3.5 9.5l5.7-1.5Z" />),
  chat: (<><path d="M2.5 3.5h17a1 1 0 011 1v10.5a1 1 0 01-1 1H8l-4.5 3.5v-3.5H2.5a1 1 0 01-1-1V4.5a1 1 0 011-1Z" /><path d="M6 8.5h11M6 12h7" /></>),
  clock: (<><circle cx="11" cy="11" r="9" /><path d="M11 5.5V11l4 2.4" strokeLinecap="round" /></>),
  stack: (<><rect x="2.5" y="7" width="13" height="13" rx="2.5" /><path d="M6.5 7V4.5a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2H16" /></>),
};

function Ic({ x, y, k, s = 1 }: { x: number; y: number; k: IconKey; s?: number }) {
  return <g className="wd-ic" transform={`translate(${x}, ${y}) scale(${s})`}>{ICONS[k]}</g>;
}

function OLogo({ x, y, size, k }: { x: number; y: number; size: number; k: string }) {
  const def = markDef(k);
  if (!def) return null;
  return (
    <svg x={x} y={y} width={size} height={size} viewBox={def.vb ?? "0 0 24 24"}>
      <path className="wd-ologo" d={def.d} fillRule={def.evenodd ? "evenodd" : "nonzero"} />
    </svg>
  );
}

const NW = 172, NH = 90;

function Node({
  x, y, icon, logo, title, sub, variant = "",
}: {
  x: number; y: number; icon?: IconKey; logo?: string;
  title: string; sub?: string; variant?: "" | "hub" | "neutral" | "accent";
}) {
  const def = logo ? markDef(logo) : null;
  return (
    <g className={variant}>
      <rect className={`wd-card ${variant}`} x={x} y={y} width={NW} height={NH} rx={14} />
      {def ? <OLogo x={x + 18} y={y + 31} size={26} k={logo as string} /> : icon && <Ic x={x + 18} y={y + 32} k={icon} s={1.1} />}
      <text className="wd-title" x={x + 52} y={y + 40}>{title}</text>
      {sub && <text className="wd-sub" x={x + 52} y={y + 58}>{sub}</text>}
    </g>
  );
}

function Head({ x, y, dir, cls = "wd-edge" }: { x: number; y: number; dir: "right" | "left" | "down" | "up"; cls?: string }) {
  const d = dir === "right" ? `M${x - 8} ${y - 4} l5 4 -5 4`
    : dir === "left" ? `M${x + 8} ${y - 4} l-5 4 5 4`
    : dir === "down" ? `M${x - 4} ${y - 8} l4 5 4 -5`
    : `M${x - 4} ${y + 8} l4 -5 4 5`;
  return <path className={cls} d={d} fill="none" />;
}

function ELabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect className="wd-flab-r" x={x - text.length * 3 - 7} y={y - 10} width={text.length * 6 + 14} height="20" rx="6" />
      <text className="wd-lab" x={x} y={y + 4} textAnchor="middle">{text}</text>
    </g>
  );
}

function Bubble({ x, y, w, h, text, me }: { x: number; y: number; w: number; h: number; text: string; me?: boolean }) {
  const cls = me ? "wd-qbub" : "wd-abub";
  const tail = me
    ? `M${x + w - 28} ${y + h - 1} L${x + w - 12} ${y + h - 1} L${x + w - 12} ${y + h + 9} Z`
    : `M${x + 12} ${y + h - 1} L${x + 28} ${y + h - 1} L${x + 12} ${y + h + 9} Z`;
  return (
    <g>
      <rect className={cls} x={x} y={y} width={w} height={h} rx={14} />
      <path className={cls} d={tail} />
      <text className={me ? "wd-qbub-t" : "wd-abub-t"} x={x + 16} y={y + h / 2 + 4.5}>{text}</text>
    </g>
  );
}

const C1 = 448, C2 = 656, C3 = 864, C4 = 1072;
const cx = (col: number) => col + NW / 2;
const R = (col: number) => col + NW;
const SA = 122, SB = 292, SC = 462, SD = 632;
const SH = 120;
const AY = SA + 15, BY = SB + 15, CY = SC + 15, DY = SD + 15;
const mid = (top: number) => top + NH / 2;

export default function SearchSystemDiagram() {
  return (
    <svg viewBox="0 0 1360 812" className="work-diagram" role="img" aria-label="One query through the search engine: an offline index, per-query retrieve and rank, RAG generation, and a conversational AI Mode follow-up.">
      <rect className="wd-bg" x="0.5" y="0.5" width="1359" height="811" rx="28" />

      {/* ================= You panel ================= */}
      <rect className="wd-panel" x="20" y="44" width="344" height="716" rx="24" />
      <text className="wd-panel-t" x="44" y="90">You</text>

      <rect className="wd-input" x="40" y="112" width="296" height="50" rx="13" />
      <Ic x={58} y={129} k="search" s={0.86} />
      <text className="wd-inputtext" x="90" y="144">kylian mbappe</text>

      <rect className="wd-tab" x="40" y="180" width="84" height="30" rx="15" />
      <text className="wd-tab-t" x="82" y="199" textAnchor="middle">Explore</text>
      <rect className="wd-tab-out" x="134" y="180" width="96" height="30" rx="15" />
      <text className="wd-tab-out-t" x="182" y="199" textAnchor="middle">AI Mode</text>

      <path className="wd-hr" d="M40 234 H336" />
      <text className="wd-subzone-t" x="40" y="260">What comes back</text>

      {/* AI Overview with real, cited text */}
      <rect className="wd-card" x="40" y="276" width="296" height="106" rx="14" />
      <Ic x={58} y={298} k="spark" s={0.86} />
      <text className="wd-title" x="92" y="306">AI Overview</text>
      <text className="wd-real" x="92" y="329">Real Madrid forward, France captain.</text>
      <text className="wd-real" x="92" y="347">Joined 2024, won the 2018 World Cup.</text>
      <text className="wd-cite" x="92" y="371">cited &#183; wikipedia, transfermarkt</text>

      {/* ranked results */}
      {[0, 1].map((r) => {
        const y = 410 + r * 30;
        return (
          <g key={r}>
            <circle className={r === 0 ? "wd-bar-a" : "wd-bar"} cx="62" cy={y + 3} r="6.5" />
            <rect className="wd-bar" x="82" y={y} width={232 - r * 30} height="8" rx="4" />
            <rect className="wd-bar" x="82" y={y + 13} width={140 - r * 16} height="5" rx="2.5" opacity="0.55" />
          </g>
        );
      })}

      {/* the follow-up conversation (AI Mode) */}
      <path className="wd-hr" d="M40 486 H336" />
      <text className="wd-subzone-t" x="40" y="512">Then, in AI Mode</text>
      <Bubble x={90} y={528} w={246} h={46} me text="how tall is he?" />
      <Bubble x={40} y={596} w={252} h={50} text="1.78 m, per Wikipedia." />

      <text className="wd-note" x="40" y="720">one query, then a conversation</text>

      {/* ================= System panel ================= */}
      <rect className="wd-panel" x="376" y="44" width="964" height="716" rx="24" />
      <text className="wd-panel-t" x="410" y="90">Search engine</text>

      {/* --- Index (offline, set apart: solid block) --- */}
      <text className="wd-band-t" x="410" y={SA - 10}>Index &#183; built offline</text>
      <rect className="wd-offline" x="396" y={SA} width="862" height={SH} rx="18" />
      <Node x={C1} y={AY} icon="globe" title="Web" sub="7 football sites" variant="neutral" />
      <Node x={C2} y={AY} icon="download" title="Crawler" sub="polite BFS" variant="neutral" />
      <Node x={C3} y={AY} icon="index" title="Index" sub="145,736 terms" variant="neutral" />
      <path className="wd-edge" d={`M${R(C1)} ${mid(AY)} H${C2}`} fill="none" /><Head x={C2} y={mid(AY)} dir="right" />
      <path className="wd-edge" d={`M${R(C2)} ${mid(AY)} H${C3}`} fill="none" /><Head x={C3} y={mid(AY)} dir="right" />
      <rect className="wd-tag" x="1058" y={mid(AY) - 13} width="184" height="26" rx="13" />
      <Ic x={1070} y={mid(AY) - 8} k="clock" s={0.68} />
      <text className="wd-offline-t" x="1094" y={mid(AY) + 4}>Postgres &#183; incremental</text>

      {/* --- Retrieve & rank (per query) --- */}
      <text className="wd-band-t" x="410" y={SB - 10}>Retrieve &amp; rank &#183; per query</text>
      <rect className="wd-subzone" x="396" y={SB} width="862" height={SH} rx="18" />
      <Node x={C1} y={BY} icon="code" title="Tokenize" sub="stem, stop" variant="neutral" />
      <Node x={C2} y={BY} icon="index" title="Retrieve" sub="top candidates" variant="neutral" />
      <Node x={C3} y={BY} icon="bars" title="Rank" sub="BM25 + PageRank" variant="neutral" />
      <Node x={C4} y={BY} icon="spark" title="Rerank" sub="ms-marco MiniLM" variant="accent" />
      <path className="wd-edge" d={`M${R(C1)} ${mid(BY)} H${C2}`} fill="none" /><Head x={C2} y={mid(BY)} dir="right" />
      <path className="wd-edge" d={`M${R(C2)} ${mid(BY)} H${C3}`} fill="none" /><Head x={C3} y={mid(BY)} dir="right" />
      <path className="wd-edge" d={`M${R(C3)} ${mid(BY)} H${C4}`} fill="none" /><Head x={C4} y={mid(BY)} dir="right" />

      {/* query enters from You */}
      <path className="wd-edge" d={`M364 ${mid(BY)} H${C1}`} fill="none" /><Head x={C1} y={mid(BY)} dir="right" />
      <ELabel x={406} y={mid(BY)} text="query" />

      {/* offline index feeds retrieve (precomputed: solid hairline) */}
      <path className="wd-feed" d={`M${cx(C3)} ${AY + NH} V${SB - 18} H${cx(C2)} V${BY}`} fill="none" /><Head x={cx(C2)} y={BY} dir="down" cls="wd-feed" />
      <ELabel x={(cx(C2) + cx(C3)) / 2} y={SB - 18} text="postings" />

      {/* --- Generate (RAG); box left margin matches other sections (52px) --- */}
      <text className="wd-band-t" x={C2 - 38} y={SC - 10}>Generate &#183; RAG</text>
      <rect className="wd-subzone" x={C2 - 52} y={SC} width={R(C4) + 14 - (C2 - 52)} height={SH} rx="18" />
      <Node x={C2} y={CY} icon="loop" title="Fan-out" sub="term expansion" variant="neutral" />
      <Node x={C3} y={CY} logo="voyageai" title="Vector search" sub="voyage-3-lite" variant="accent" />
      <Node x={C4} y={CY} logo="meta" title="Synthesis" sub="Llama 3.3 70B" variant="accent" />
      <path className="wd-edge" d={`M${R(C2)} ${mid(CY)} H${C3}`} fill="none" /><Head x={C3} y={mid(CY)} dir="right" />
      <path className="wd-edge" d={`M${R(C3)} ${mid(CY)} H${C4}`} fill="none" /><Head x={C4} y={mid(CY)} dir="right" />

      {/* retrieve branches into RAG */}
      <path className="wd-edge" d={`M${cx(C2)} ${BY + NH} V${CY}`} fill="none" /><Head x={cx(C2)} y={CY} dir="down" />
      <ELabel x={cx(C2)} y={(BY + NH + CY) / 2} text="chunks" />

      {/* --- Converse (AI Mode); box brackets only its columns --- */}
      <text className="wd-band-t" x="410" y={SD - 10}>Converse &#183; AI Mode</text>
      <rect className="wd-subzone" x="396" y={SD} width={R(C2) + 14 - 396} height={SH} rx="18" />
      <Node x={C1} y={DY} icon="chat" title="AI Mode" sub="conversational" variant="hub" />
      <Node x={C2} y={DY} icon="stack" title="Chat history" sub="client-sent" variant="neutral" />

      {/* follow-up question enters AI Mode from You */}
      <path className="wd-edge" d={`M336 549 H400 V${mid(DY)} H${C1}`} fill="none" /><Head x={C1} y={mid(DY)} dir="right" />
      <ELabel x={370} y={549} text="follow-up" />

      {/* AI Mode reads the client-sent history */}
      <path className="wd-edge" d={`M${C2} ${mid(DY)} H${R(C1)}`} fill="none" /><Head x={R(C1)} y={mid(DY)} dir="left" />

      {/* AI Mode re-retrieves (hybrid) in context — accent dashed loop into vector search */}
      <path className="wd-loop" d={`M${cx(C1)} ${DY} V${SC + SH + 15} H${cx(C3)} V${CY + NH}`} fill="none" /><Head x={cx(C3)} y={CY + NH} dir="up" cls="wd-loop" />
      <ELabel x={(cx(C1) + cx(C3)) / 2} y={SC + SH + 15} text="re-retrieves" />

      {/* return bus: the three things come back to You (taps Rerank, Synthesis, AI Mode) */}
      <path className="wd-ret" d={`M${R(C4)} ${mid(BY)} H1292`} fill="none" />
      <path className="wd-ret" d={`M${R(C4)} ${mid(CY)} H1292`} fill="none" />
      <path className="wd-ret" d={`M${cx(C1)} ${DY + NH} V786`} fill="none" />
      <path className="wd-ret" d="M1292 352 V786 H180 V764" fill="none" />
      <path className="wd-ret" d="M176 770 l4 -6 4 6" fill="none" />
      <g>
        <rect x="512" y="777" width="368" height="20" rx="7" fill="var(--wd-bg)" />
        <text className="wd-ret-t" x="696" y="791" textAnchor="middle">ranked results &#183; AI Overview &#183; follow-up answer</text>
      </g>
    </svg>
  );
}
