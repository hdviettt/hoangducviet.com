import { markDef } from "@/components/home/logo-marks";
import type { ReactNode } from "react";

// A data-driven architecture diagram: soft neutral ground, blue cards for logic
// and agents, grey for data/infra, brand blue on the pivotal step. Each card
// carries a small line illustration and the truthful model/service logos it
// actually uses, and edges are labelled. Half technical, half doodle. Colours
// come from the `.work-diagram` CSS scope.

type IconKey =
  | "globe" | "download" | "index" | "bars" | "spark" | "doc" | "chat"
  | "gear" | "browser" | "cluster" | "lock" | "db" | "code" | "loop"
  | "check" | "grid" | "embed" | "reduce" | "pen" | "tag" | "receipt"
  | "plug" | "robot" | "folder" | "shield" | "brief";

interface ANode {
  title: string;
  sub?: string;
  icon?: IconKey;
  logos?: string[]; // truthful model / service mark keys
  variant?: "hub" | "neutral"; // default: soft blue
}
interface AZone {
  label: string;
  nodes: ANode[];
  stack?: boolean;
  note?: string;
  in?: string; // label on the edge entering this zone
}
export interface ArchSpec {
  zones: AZone[];
  note?: string;
}

const ICONS: Record<IconKey, ReactNode> = {
  globe: (<><circle cx="11" cy="11" r="10" /><ellipse cx="11" cy="11" rx="4" ry="10" /><path d="M1 11H21" /></>),
  download: (<><path d="M11 1V13M6 8l5 5 5-5" /><path d="M2 16v4a1 1 0 001 1h16a1 1 0 001-1v-4" /></>),
  index: (<><rect x="1" y="2" width="20" height="5" rx="1.5" /><rect x="1" y="9.5" width="20" height="5" rx="1.5" /><rect x="1" y="17" width="20" height="5" rx="1.5" /></>),
  bars: (<path d="M2 21V11M9 21V4M16 21V14" strokeWidth="2.4" />),
  spark: (<path d="M11 1.5l1.8 6L18.5 9l-5.7 1.5L11 16.5 9.2 10.5 3.5 9l5.7-1.5Z" />),
  doc: (<><path d="M4 1h9l5 5v14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1Z" /><path d="M13 1v5h5" /><path d="M7 11h7M7 15h5" /></>),
  chat: (<><path d="M2 3h18a1 1 0 011 1v11a1 1 0 01-1 1H8l-5 4v-4H2a1 1 0 01-1-1V4a1 1 0 011-1Z" /><path d="M6 8h11M6 12h7" /></>),
  gear: (<><circle cx="11" cy="11" r="3.6" /><path d="M11 1.5v3M11 17.5v3M1.5 11h3M17.5 11h3M4.4 4.4l2.1 2.1M15.5 15.5l2.1 2.1M17.6 4.4l-2.1 2.1M6.5 15.5l-2.1 2.1" /></>),
  browser: (<><rect x="1" y="3" width="20" height="16" rx="2.5" /><path d="M1 7.5h20" /><circle cx="4.2" cy="5.2" r="0.7" /><circle cx="6.6" cy="5.2" r="0.7" /><path d="M5 11h12M5 14.5h8" /></>),
  cluster: (<><circle cx="6" cy="7" r="2.2" /><circle cx="16" cy="6" r="2.2" /><circle cx="11" cy="16" r="2.2" /><path d="M7.6 8.6l2.4 5.4M14.4 7.6l-2.4 6" /></>),
  lock: (<><rect x="3" y="9.5" width="16" height="11.5" rx="2.5" /><path d="M6 9.5V6a5 5 0 0110 0v3.5" /></>),
  db: (<><ellipse cx="11" cy="4.5" rx="8" ry="3" /><path d="M3 4.5v12.5c0 1.6 3.6 3 8 3s8-1.4 8-3V4.5" /><path d="M3 10.7c0 1.6 3.6 3 8 3s8-1.4 8-3" /></>),
  code: (<path d="M7 6l-5 5 5 5M15 6l5 5-5 5M12.5 3.5l-3 15" />),
  loop: (<><path d="M3.5 11a7.5 7.5 0 0113-5.1" /><path d="M17 1.5v5h-5" /><path d="M18.5 11a7.5 7.5 0 01-13 5.1" /><path d="M5 20.5v-5h5" /></>),
  check: (<><rect x="2" y="2" width="18" height="18" rx="3.5" /><path d="M6 11l3.4 3.4L16 7.4" /></>),
  grid: (<><rect x="2" y="2" width="7.5" height="7.5" rx="1.6" /><rect x="12.5" y="2" width="7.5" height="7.5" rx="1.6" /><rect x="2" y="12.5" width="7.5" height="7.5" rx="1.6" /><rect x="12.5" y="12.5" width="7.5" height="7.5" rx="1.6" /></>),
  embed: (<><circle cx="4" cy="6" r="1.5" /><circle cx="11" cy="3.5" r="1.5" /><circle cx="18" cy="7" r="1.5" /><circle cx="7" cy="13" r="1.5" /><circle cx="15.5" cy="13.5" r="1.5" /><circle cx="10.5" cy="19" r="1.5" /></>),
  reduce: (<path d="M3 3l5.5 5.5M3 8.5V3h5.5M21 21l-5.5-5.5M21 15.5V21h-5.5" />),
  pen: (<path d="M14 2.5l5.5 5.5L8 19.5l-6 2 2-6L14 2.5Z" />),
  tag: (<><path d="M2 11V3.5a1.5 1.5 0 011.5-1.5H11l9.5 9.5a1.5 1.5 0 010 2.1l-7 7a1.5 1.5 0 01-2.1 0L2 11Z" /><circle cx="7" cy="7" r="1.6" /></>),
  receipt: (<><path d="M4 2h14v20l-3-1.8-2 1.8-2-1.8-2 1.8-2-1.8L4 22V2Z" /><path d="M8 7.5h6M8 11.5h6M8 15.5h4" /></>),
  plug: (<path d="M9 2v6M15 2v6M6 8h12v2.5a6 6 0 01-12 0V8ZM12 16.5V22" />),
  robot: (<><rect x="4" y="6.5" width="16" height="12" rx="3.5" /><circle cx="9" cy="12.5" r="1.4" /><circle cx="15" cy="12.5" r="1.4" /><path d="M12 2v4.5M8 18.5v3M16 18.5v3" /></>),
  folder: (<path d="M2 5.5a1.5 1.5 0 011.5-1.5h5l2 2.5h8a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 012 18V5.5Z" />),
  shield: (<><path d="M11 1.5l8 3.2v6c0 5-3.4 8.6-8 10.3-4.6-1.7-8-5.3-8-10.3v-6l8-3.2Z" /><path d="M7.5 11l2.5 2.5L15 8.5" /></>),
  brief: (<><rect x="2" y="6" width="18" height="14" rx="2.5" /><path d="M7.5 6V4a2 2 0 012-2h3a2 2 0 012 2v2M2 12h18" /></>),
};

// layout
const PAD = 20;
const GAP = 20;
const ZGAP = 30;
const ZY = 78;
const ZH = 220;
const CARD_W = 186;
const CARD_H = 82;
const CARD_Y = ZY + 69;
const OW = 186;
const OH = 74;
const OGAP = 18;
const MARGIN = 18;
const TILE = 30;

interface Placed {
  n: ANode;
  x: number;
  y: number;
  w: number;
  h: number;
  out: boolean;
  first: boolean;
  topRow: boolean;
}

function layout(spec: ArchSpec) {
  let x = MARGIN;
  const zones: { z: AZone; x: number; w: number; nodes: Placed[] }[] = [];
  spec.zones.forEach((zone) => {
    const placed: Placed[] = [];
    // Align a whole zone the same way: top-anchored (with room for a logo row)
    // when any card carries logos, otherwise vertically centred.
    const zoneHasLogos = zone.nodes.some((n) => (n.logos ?? []).some((k) => markDef(k)));
    let contentW: number;
    if (zone.stack) {
      contentW = OW;
      const total = zone.nodes.length * OH + (zone.nodes.length - 1) * OGAP;
      const sy = ZY + 44 + (ZH - 60 - total) / 2;
      zone.nodes.forEach((n, i) => {
        placed.push({ n, x: x + PAD, y: sy + i * (OH + OGAP), w: OW, h: OH, out: true, first: i === 0, topRow: false });
      });
    } else {
      contentW = zone.nodes.length * CARD_W + (zone.nodes.length - 1) * GAP;
      zone.nodes.forEach((n, i) => {
        placed.push({ n, x: x + PAD + i * (CARD_W + GAP), y: CARD_Y, w: CARD_W, h: CARD_H, out: false, first: i === 0, topRow: zoneHasLogos });
      });
    }
    const zw = contentW + 2 * PAD;
    zones.push({ z: zone, x, w: zw, nodes: placed });
    x += zw + ZGAP;
  });
  const W = x - ZGAP + MARGIN;
  const H = ZY + ZH + (spec.note ? 42 : 22);
  return { zones, W, H };
}

function Logos({ p }: { p: Placed }) {
  const logos = (p.n.logos ?? []).map((k) => ({ k, d: markDef(k) })).filter((m) => m.d);
  if (logos.length === 0) return null;
  const y = p.y + p.h - 17;
  return (
    <>
      {logos.map((m, i) => {
        const def = m.d!;
        const cx = p.x + 28 + i * 24;
        return (
          <g key={m.k}>
            <circle className="wd-chip" cx={cx} cy={y} r="9.5" />
            <svg x={cx - 6.5} y={y - 6.5} width="13" height="13" viewBox={def.vb}>
              <path className="wd-clogo" d={def.d} fillRule={def.evenodd ? "evenodd" : "nonzero"} />
            </svg>
          </g>
        );
      })}
    </>
  );
}

function Card({ p }: { p: Placed }) {
  const { n, x, y, w, h } = p;
  const variant = n.variant ?? "";
  const topRow = p.topRow;
  const tileY = topRow ? y + 14 : y + (h - TILE) / 2;
  const titleY = topRow ? y + 29 : y + h / 2 - 2;
  const textX = n.icon ? x + 15 + TILE + 9 : x + 18;
  return (
    <g className={variant}>
      <rect className={`wd-card ${variant}`} x={x} y={y} width={w} height={h} rx={13} />
      {n.icon && (
        <>
          <rect className="wd-tile" x={x + 15} y={tileY} width={TILE} height={TILE} rx={8} />
          <g className="wd-ic" transform={`translate(${x + 19}, ${tileY + 4})`}>{ICONS[n.icon]}</g>
        </>
      )}
      <text className="wd-title" x={textX} y={titleY}>{n.title}</text>
      {n.sub && <text className="wd-sub" x={textX} y={titleY + 16}>{n.sub}</text>}
      {topRow && <Logos p={p} />}
    </g>
  );
}

function Edge({ x1, y1, x2, y2, dash, label }: { x1: number; y1: number; x2: number; y2: number; dash?: boolean; label?: string }) {
  const midx = x1 + (x2 - x1) / 2;
  const d = y1 === y2 ? `M${x1} ${y1} H${x2 - 8}` : `M${x1} ${y1} H${midx} V${y2} H${x2 - 8}`;
  const ly = y1 === y2 ? y1 : y2;
  return (
    <g>
      <path className={`wd-edge${dash ? " dash" : ""}`} d={d} fill="none" />
      <path className="wd-edge" d={`M${x2 - 12} ${ly - 4} l5 4 -5 4`} fill="none" />
      {label && (
        <g className="wd-flab">
          <rect x={midx - label.length * 3 - 6} y={ly - 22} width={label.length * 6 + 12} height="17" rx="5" />
          <text className="wd-lab" x={midx} y={ly - 10.5} textAnchor="middle">{label}</text>
        </g>
      )}
    </g>
  );
}

export default function WorkDiagram({ spec }: { spec: ArchSpec }) {
  const { zones, W, H } = layout(spec);
  const all = zones.flatMap((z) => z.nodes);
  const main = all.filter((p) => !p.out);
  const outs = all.filter((p) => p.out);

  const edges: { x1: number; y1: number; x2: number; y2: number; label?: string }[] = [];
  for (let i = 0; i < main.length - 1; i++) {
    const a = main[i];
    const b = main[i + 1];
    // an edge that crosses into a new zone can carry that zone's `in` label
    const zoneOfB = zones.find((z) => z.nodes.includes(b));
    const label = b.first ? zoneOfB?.z.in : undefined;
    edges.push({ x1: a.x + a.w, y1: a.y + a.h / 2, x2: b.x, y2: b.y + b.h / 2, label });
  }
  if (outs.length > 0 && main.length > 0) {
    const src = main[main.length - 1];
    for (const o of outs) {
      edges.push({ x1: src.x + src.w, y1: src.y + src.h / 2, x2: o.x, y2: o.y + o.h / 2 });
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="work-diagram" role="img" aria-label="System architecture diagram">
      <rect className="wd-bg" x="0.5" y="0.5" width={W - 1} height={H - 1} rx="22" />

      {zones.map((z) => (
        <g key={z.z.label}>
          <rect className="wd-zone" x={z.x} y={ZY} width={z.w} height={ZH} rx="16" />
          <text className="wd-zone-t" x={z.x + z.w / 2} y={ZY + 28} textAnchor="middle">{z.z.label}</text>
          {z.z.note && (
            <text className="wd-note" x={z.x + z.w / 2} y={ZY + ZH - 14} textAnchor="middle">{z.z.note}</text>
          )}
        </g>
      ))}

      {edges.map((e, i) => (
        <Edge key={i} {...e} />
      ))}

      {all.map((p, i) => (
        <Card key={i} p={p} />
      ))}

      {spec.note && (
        <text className="wd-note" x={MARGIN + 4} y={ZY + ZH + 26}>{spec.note}</text>
      )}
    </svg>
  );
}
