import { markDef } from "@/components/home/logo-marks";
import type { ReactNode } from "react";

// Shared atoms for the bespoke /work architecture diagrams. Colours and type come
// from the `.work-diagram` CSS scope in globals.css. Each diagram composes these
// on its own hand-placed layout; this file only supplies the pieces, verified on
// the mini-search-engine diagram (SearchSystemDiagram.tsx).
//
// Node variants: "" (soft-blue process step), "neutral" (data/source/infra),
// "accent" (a learned model - soft-blue + a solid accent ring), "hub" (the one
// full-blue hero per diagram; white ink). Reserve "hub" for a single node.

// A line-art icon, drawn in a ~0-22 unit space, scaled into place.
export function Ic({ x, y, icon, s = 1 }: { x: number; y: number; icon: ReactNode; s?: number }) {
  return <g className="wd-ic" transform={`translate(${x}, ${y}) scale(${s})`}>{icon}</g>;
}

// A brand mark as a clean monochrome fill (from the logo-marks registry).
export function OLogo({ x, y, size, k }: { x: number; y: number; size: number; k: string }) {
  const def = markDef(k);
  if (!def) return null;
  return (
    <svg x={x} y={y} width={size} height={size} viewBox={def.vb ?? "0 0 24 24"}>
      <path className="wd-ologo" d={def.d} fillRule={def.evenodd ? "evenodd" : "nonzero"} />
    </svg>
  );
}

export const NW = 172;
export const NH = 90;

export function Node({
  x, y, w = NW, h = NH, icon, logo, title, sub, variant = "",
}: {
  x: number; y: number; w?: number; h?: number; icon?: ReactNode; logo?: string;
  title: string; sub?: string; variant?: "" | "hub" | "neutral" | "accent";
}) {
  const def = logo ? markDef(logo) : null;
  return (
    <g className={variant}>
      <rect className={`wd-card ${variant}`} x={x} y={y} width={w} height={h} rx={14} />
      {def ? <OLogo x={x + 18} y={y + 31} size={26} k={logo as string} /> : icon && <Ic x={x + 18} y={y + 32} icon={icon} s={1.1} />}
      <text className="wd-title" x={x + 52} y={y + 40}>{title}</text>
      {sub && <text className="wd-sub" x={x + 52} y={y + 58}>{sub}</text>}
    </g>
  );
}

// An arrowhead. `dir` points the head; `cls` matches the edge style it caps.
export function Head({ x, y, dir, cls = "wd-edge" }: { x: number; y: number; dir: "right" | "left" | "down" | "up"; cls?: string }) {
  const d = dir === "right" ? `M${x - 8} ${y - 4} l5 4 -5 4`
    : dir === "left" ? `M${x + 8} ${y - 4} l-5 4 5 4`
    : dir === "down" ? `M${x - 4} ${y - 8} l4 5 4 -5`
    : `M${x - 4} ${y + 8} l4 -5 4 5`;
  return <path className={cls} d={d} fill="none" />;
}

// A pill label centred on (x, y); its rounded rect masks the line it sits on.
export function ELabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect className="wd-flab-r" x={x - text.length * 3 - 7} y={y - 10} width={text.length * 6 + 14} height="20" rx="6" />
      <text className="wd-lab" x={x} y={y + 4} textAnchor="middle">{text}</text>
    </g>
  );
}

// A chat bubble (for the You panel). `me` = accent-tinted with a right tail.
export function Bubble({ x, y, w, h, text, me }: { x: number; y: number; w: number; h: number; text: string; me?: boolean }) {
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

// Line-art icons, ~0-22 unit space, single stroke (inherit .wd-ic colour).
export const I: Record<string, ReactNode> = {
  globe: (<><circle cx="11" cy="11" r="9.5" /><ellipse cx="11" cy="11" rx="3.8" ry="9.5" /><path d="M1.5 11H20.5" /></>),
  download: (<><path d="M11 1.5V13M6.5 8.5l4.5 4.5 4.5-4.5" /><path d="M2.5 16v3.5a1 1 0 001 1h15a1 1 0 001-1V16" /></>),
  upload: (<><path d="M11 20.5V8M6.5 12.5l4.5-4.5 4.5 4.5" /><path d="M2.5 6V3.5a1 1 0 011-1h15a1 1 0 011 1V6" /></>),
  code: (<path d="M7 6.5l-4.5 4.5L7 15.5M15 6.5l4.5 4.5L15 15.5M12.5 4l-3 14" />),
  index: (<><rect x="1.5" y="2.5" width="19" height="4.5" rx="1.5" /><rect x="1.5" y="9.5" width="19" height="4.5" rx="1.5" /><rect x="1.5" y="16.5" width="19" height="4.5" rx="1.5" /></>),
  bars: (<path d="M2.5 20V11M9 20V4.5M15.5 20V14" strokeWidth="2.4" />),
  loop: (<><path d="M3.5 11a7.5 7.5 0 0113-5.1" /><path d="M17 1.5v5h-5" /><path d="M18.5 11a7.5 7.5 0 01-13 5.1" /><path d="M5 20.5v-5h5" /></>),
  spark: (<path d="M11 2l1.8 6L18.5 9.5l-5.7 1.5L11 17l-1.8-6L3.5 9.5l5.7-1.5Z" />),
  chat: (<><path d="M2.5 3.5h17a1 1 0 011 1v10.5a1 1 0 01-1 1H8l-4.5 3.5v-3.5H2.5a1 1 0 01-1-1V4.5a1 1 0 011-1Z" /><path d="M6 8.5h11M6 12h7" /></>),
  clock: (<><circle cx="11" cy="11" r="9" /><path d="M11 5.5V11l4 2.4" strokeLinecap="round" /></>),
  stack: (<><rect x="2.5" y="7" width="13" height="13" rx="2.5" /><path d="M6.5 7V4.5a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2H16" /></>),
  search: (<><circle cx="9" cy="9" r="7" /><path d="M14 14l6.5 6.5" /></>),
  doc: (<><path d="M4.5 1.5h8.5l5 5v13.5a1 1 0 01-1 1H4.5a1 1 0 01-1-1V2.5a1 1 0 011-1Z" /><path d="M13 1.5v5h5" /><path d="M7.5 11.5h7M7.5 15.5h5" /></>),
  gear: (<><circle cx="11" cy="11" r="3.2" /><path d="M11 1.5v3M11 17.5v3M1.5 11h3M17.5 11h3M4.2 4.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 4.2l-2.1 2.1M6.3 15.7l-2.1 2.1" /></>),
  plug: (<><path d="M8 2v5M14 2v5" /><path d="M5.5 7h11v2.5a5.5 5.5 0 01-11 0z" /><path d="M11 15V21" /></>),
  shield: (<><path d="M11 1.5l8 3v6c0 5-3.5 8-8 9.5-4.5-1.5-8-4.5-8-9.5v-6z" /><path d="M7.5 11l2.5 2.5 5-5" /></>),
  check: (<><circle cx="11" cy="11" r="9" /><path d="M6.5 11l3 3 6-6.5" /></>),
  folder: (<path d="M2 5.5a1 1 0 011-1h5l2 2.5h8a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1z" />),
  pen: (<><path d="M14.5 3.5l4 4L8 18l-5 1 1-5z" /><path d="M12.5 5.5l4 4" /></>),
  tag: (<><path d="M2.5 2.5h8l9 9-8 8-9-9z" /><circle cx="6.5" cy="6.5" r="1.5" /></>),
  embed: (<><circle cx="4" cy="6" r="1.6" /><circle cx="11" cy="3.5" r="1.6" /><circle cx="18" cy="7" r="1.6" /><circle cx="7" cy="13" r="1.6" /><circle cx="15.5" cy="13.5" r="1.6" /><circle cx="10.5" cy="19" r="1.6" /></>),
  reduce: (<><path d="M2 2l6 6M20 2l-6 6M2 20l6-6M20 20l-6-6" /><circle cx="11" cy="11" r="2.6" /></>),
  cluster: (<><circle cx="6" cy="6" r="2.6" /><circle cx="16.5" cy="7" r="2" /><circle cx="7.5" cy="16" r="2" /><circle cx="16" cy="15.5" r="2.6" /></>),
  grid: (<><rect x="2.5" y="2.5" width="7" height="7" rx="1.5" /><rect x="12.5" y="2.5" width="7" height="7" rx="1.5" /><rect x="2.5" y="12.5" width="7" height="7" rx="1.5" /><rect x="12.5" y="12.5" width="7" height="7" rx="1.5" /></>),
  receipt: (<><path d="M4.5 1.5h13v19l-2.2-1.5-2.1 1.5-2.2-1.5-2.1 1.5-2.2-1.5-2.1 1.5z" /><path d="M8 6.5h6M8 10.5h6M8 14.5h4" /></>),
  lock: (<><rect x="4" y="9.5" width="14" height="10" rx="2" /><path d="M6.5 9.5V6.5a4.5 4.5 0 019 0v3" /></>),
  robot: (<><rect x="4" y="7" width="14" height="11" rx="2.5" /><circle cx="8.5" cy="12.5" r="1.2" /><circle cx="13.5" cy="12.5" r="1.2" /><path d="M11 3.5V7" /></>),
  db: (<><ellipse cx="11" cy="5" rx="7.5" ry="2.8" /><path d="M3.5 5v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V5M3.5 11c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" /></>),
  layers: (<><path d="M11 2.5l9 4.5-9 4.5-9-4.5z" /><path d="M2 12l9 4.5 9-4.5M2 16.5l9 4.5 9-4.5" /></>),
};
