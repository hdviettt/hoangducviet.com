// Hand-drawn "rough" SVG doodle library — the SEONGON-blue cover art used on
// the homepage. Each cover is generated from a topic key, not hand-authored per
// post, so a new post gets a fitting cover for free. Strokes use
// `currentColor` and every group is filtered through `#rough` (see
// `RoughFilter`), so the art inherits the M3 primary token and stays crisp in
// both themes. Pure string builders — rendered inline via dangerouslySetInnerHTML.

const A =
  'stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const Fl = 'fill="currentColor" stroke="none"';

function d(inner: string): string {
  return `<svg viewBox="0 0 240 180" preserveAspectRatio="xMidYMid meet" ${A}><g filter="url(#rough)">${inner}</g></svg>`;
}
function dw(inner: string): string {
  return `<svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet" ${A}><g filter="url(#rough)">${inner}</g></svg>`;
}

function star(x: number, y: number, s: number): string {
  return `<path ${Fl} d="M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z"/>`;
}
function face(x: number, y: number, r: number): string {
  return `<circle cx="${x - r * 0.32}" cy="${y - r * 0.1}" r="${r * 0.13}" ${Fl}/><circle cx="${x + r * 0.32}" cy="${y - r * 0.1}" r="${r * 0.13}" ${Fl}/><path d="M${x - r * 0.34} ${y + r * 0.28} q${r * 0.34} ${r * 0.36} ${r * 0.68} 0"/>`;
}

// --- isometric 3D helpers ---
const Rx = 0.866;
const Ry = 0.5;
function iso(
  ox: number,
  oy: number,
  x: number,
  y: number,
  z: number,
): number[] {
  return [ox + Rx * x - Rx * y, oy + Ry * x + Ry * y - z];
}
function pstr(a: number[]): string {
  return `${a[0].toFixed(1)},${a[1].toFixed(1)}`;
}
function edge(a: number[], b: number[], o?: number): string {
  return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"${o ? ` stroke-opacity="${o}"` : ""}/>`;
}
function isoBox(
  ox: number,
  oy: number,
  sx: number,
  sy: number,
  sz: number,
  topOp?: number,
): string {
  const P = (x: number, y: number, z: number) => iso(ox, oy, x, y, z);
  const TF = P(0, 0, sz);
  const TR = P(sx, 0, sz);
  const TL = P(0, sy, sz);
  const TB = P(sx, sy, sz);
  const BR = P(sx, 0, 0);
  const BL = P(0, sy, 0);
  const BB = P(sx, sy, 0);
  const top = `<polygon points="${pstr(TF)} ${pstr(TR)} ${pstr(TB)} ${pstr(TL)}" fill="currentColor" fill-opacity="${topOp || 0.09}" stroke="none"/>`;
  const rightF = `<polygon points="${pstr(BR)} ${pstr(BB)} ${pstr(TB)} ${pstr(TR)}" fill="currentColor" fill-opacity=".13" stroke="none"/>`;
  const leftF = `<polygon points="${pstr(BL)} ${pstr(BB)} ${pstr(TB)} ${pstr(TL)}" fill="currentColor" fill-opacity=".22" stroke="none"/>`;
  const e =
    edge(TF, TR) +
    edge(TR, TB) +
    edge(TB, TL) +
    edge(TL, TF) +
    edge(TB, BB) +
    edge(TR, BR) +
    edge(TL, BL) +
    edge(BB, BR) +
    edge(BB, BL);
  return top + rightF + leftF + e;
}
function isoArrow(
  ox: number,
  oy: number,
  x: number,
  y: number,
  z: number,
  len: number,
): string {
  const a = iso(ox, oy, x, y, z);
  const b = iso(ox, oy, x + len, y, z);
  return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke-opacity=".8"/><path d="M${b[0].toFixed(1)} ${b[1].toFixed(1)} l-6 -5 M${b[0].toFixed(1)} ${b[1].toFixed(1)} l-6 3" stroke-opacity=".8"/>`;
}
function gearTop(cx: number, cy: number, r: number): string {
  let t = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    t += `<line x1="${(cx + Math.cos(a) * r * Rx).toFixed(1)}" y1="${(cy + Math.sin(a) * r * Ry).toFixed(1)}" x2="${(cx + Math.cos(a) * (r + 3) * Rx).toFixed(1)}" y2="${(cy + Math.sin(a) * (r + 3) * Ry).toFixed(1)}"/>`;
  }
  return `<ellipse cx="${cx}" cy="${cy}" rx="${(r * Rx).toFixed(1)}" ry="${(r * Ry).toFixed(1)}"/>${t}`;
}
function checkTop(cx: number, cy: number): string {
  return `<path d="M${cx - 6} ${cy} l4 3 8 -6" stroke-width="2"/>`;
}
function wire(x1: number, y1: number, x2: number, y2: number): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-opacity=".4"/>`;
}
function idxRows(
  ox: number,
  oy: number,
  sx: number,
  sy: number,
  sz: number,
): string {
  let t = "";
  for (let i = 1; i <= 3; i++) {
    const yy = (i * sy) / 4;
    t += edge(iso(ox, oy, 12, yy, sz), iso(ox, oy, sx - 16, yy, sz), 0.5);
  }
  t += `<circle cx="${iso(ox, oy, sx * 0.6, sy * 0.3, sz)[0].toFixed(1)}" cy="${iso(ox, oy, sx * 0.6, sy * 0.3, sz)[1].toFixed(1)}" r="2.2" ${Fl}/>`;
  t += `<circle cx="${iso(ox, oy, sx * 0.45, sy * 0.6, sz)[0].toFixed(1)}" cy="${iso(ox, oy, sx * 0.45, sy * 0.6, sz)[1].toFixed(1)}" r="2.2" ${Fl}/>`;
  return t;
}
function pins(
  ox: number,
  oy: number,
  sx: number,
  sy: number,
  _sz: number,
): string {
  let t = "";
  for (let i = 1; i <= 3; i++) {
    const f = i / 4;
    t += edge(iso(ox, oy, sx, sy * f, 0), iso(ox, oy, sx + 7, sy * f, 0), 0.55);
    t += edge(iso(ox, oy, sx * f, sy, 0), iso(ox, oy, sx * f, sy + 7, 0), 0.55);
  }
  return t;
}
function arrowInto(
  sx: number,
  sy: number,
  cx: number,
  cy: number,
  cr: number,
): string {
  const dx = cx - sx;
  const dy = cy - sy;
  const n = Math.hypot(dx, dy);
  const ux = dx / n;
  const uy = dy / n;
  const ex = cx - ux * cr;
  const ey = cy - uy * cr;
  const px = -uy;
  const py = ux;
  return `<line x1="${sx}" y1="${sy}" x2="${ex - ux * 4}" y2="${ey - uy * 4}" stroke-opacity=".4"/><path d="M${ex} ${ey} L${ex - ux * 8 + px * 4} ${ey - uy * 8 + py * 4} M${ex} ${ey} L${ex - ux * 8 - px * 4} ${ey - uy * 8 - py * 4}" stroke-opacity=".55"/>`;
}
function gear2(cx: number, cy: number, r: number, n: number): string {
  let t = "";
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    const x1 = cx + Math.cos(a) * r;
    const y1 = cy + Math.sin(a) * r;
    const x2 = cx + Math.cos(a) * (r + 5);
    const y2 = cy + Math.sin(a) * (r + 5);
    t += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" fill-opacity=".07"/><circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${(r * 0.28).toFixed(1)}"/>${t}`;
}
function tick(cx: number, cy: number, r: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  const x1 = cx + Math.cos(a) * (r - 8);
  const y1 = cy + Math.sin(a) * (r - 8);
  const x2 = cx + Math.cos(a) * r;
  const y2 = cy + Math.sin(a) * r;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-opacity=".55"/>`;
}
function clusterBlob(cx: number, cy: number, op: string): string {
  let o = `<circle cx="${cx}" cy="${cy}" r="30" fill="currentColor" fill-opacity="${op}" stroke="none"/>`;
  const pts = [
    [0, -14],
    [-16, -2],
    [14, -4],
    [-8, 12],
    [10, 10],
    [0, 0],
  ];
  for (const p of pts) {
    o += `<circle cx="${cx + p[0]}" cy="${cy + p[1]}" r="4" ${Fl}/>`;
  }
  return o;
}

const art: Record<string, string> = {
  agent: d(
    `<rect x="30" y="52" width="96" height="94" rx="16" fill="currentColor" fill-opacity=".06"/><rect x="30" y="52" width="96" height="94" rx="16"/><circle cx="44" cy="68" r="2.6" ${Fl}/><path d="M54 68 q26 -4 50 0"/><path d="M44 88 q22 -3 40 0 M44 104 q18 -3 34 0"/><rect x="40" y="118" width="76" height="16" rx="8" fill="currentColor" fill-opacity=".16" stroke="none"/><path d="M50 126 q20 -2 34 0" stroke-width="2.4"/><line x1="182" y1="52" x2="182" y2="40"/>${star(182, 34, 5)}<rect x="150" y="56" width="66" height="60" rx="22" fill="currentColor" fill-opacity=".07"/><rect x="150" y="56" width="66" height="60" rx="22"/>${face(183, 84, 15)}<path d="M150 82 q-8 4 0 12 M216 82 q8 4 0 12"/>`,
  ),
  search: dw(
    `<rect x="92" y="40" width="126" height="76" rx="10" fill="currentColor" fill-opacity=".04"/><rect x="92" y="40" width="126" height="76" rx="10"/><rect x="104" y="52" width="70" height="8" rx="4" fill="currentColor" fill-opacity=".26" stroke="none"/><path d="M104 68 q46 -2 100 0 M104 78 q40 -2 84 0" stroke-opacity=".45"/><path d="M104 96 q40 -2 84 0 M104 106 q30 -2 66 0" stroke-opacity=".3"/><circle cx="70" cy="58" r="26" fill="currentColor" fill-opacity=".05"/><circle cx="70" cy="58" r="26"/><path d="M89 77 q10 10 18 18" stroke-width="5"/><rect x="58" y="52" width="24" height="4" rx="2" fill="currentColor" fill-opacity=".5" stroke="none"/><path d="M58 62 q12 -2 20 0" stroke-opacity=".5"/>${star(200, 44, 4.5)}`,
  ),
  crawler: dw(
    `<path d="M40 56 q80 -10 158 4 M38 100 q82 8 162 -4 M64 34 q-6 62 4 100 M172 36 q8 58 -4 98" stroke-opacity=".3"/><circle cx="118" cy="76" r="9" ${Fl} fill-opacity=".16"/><circle cx="118" cy="76" r="18" fill="currentColor" fill-opacity=".07"/><circle cx="118" cy="76" r="18"/><circle cx="112" cy="72" r="2.2" ${Fl}/><circle cx="124" cy="72" r="2.2" ${Fl}/><path d="M100 68 q-16 -6 -22 -16 M100 78 q-18 2 -24 12 M100 84 q-16 8 -20 20 M136 68 q16 -6 22 -16 M136 78 q18 2 24 12 M136 84 q16 8 20 20" stroke-opacity=".8"/><path d="M118 58 l-4 -8 M118 58 l4 -8"/>${star(186, 48, 4.5)}`,
  ),
  rank: dw(
    `${isoBox(60, 118, 20, 20, 66, 0.14)}${isoBox(96, 124, 20, 20, 46)}${isoBox(132, 130, 20, 20, 30)}${isoBox(168, 136, 20, 20, 20)}${star(70, 44, 6)}<path d="M92 54 q10 -6 18 -2" stroke-opacity=".5"/>`,
  ),
  neural: d(
    `<rect x="64" y="50" width="112" height="84" rx="16" fill="currentColor" fill-opacity=".05"/><rect x="64" y="50" width="112" height="84" rx="16"/><path d="M101 50 q2 42 0 84 M138 50 q-2 42 0 84 M64 78 q56 -2 112 0 M64 106 q56 2 112 0" stroke-opacity=".85"/><rect x="101" y="78" width="37" height="28" rx="7" fill="currentColor" fill-opacity=".26" stroke="none"/>${star(119, 92, 6)}<circle cx="46" cy="66" r="4.5" ${Fl}/><circle cx="46" cy="120" r="4.5"/><circle cx="194" cy="66" r="4.5"/><circle cx="194" cy="120" r="4.5" ${Fl}/><path d="M50 66 q9 2 14 12 M50 120 q9 -2 14 -12 M190 66 q-9 2 -14 12 M190 120 q-9 -2 -14 -12" stroke-opacity=".45"/>`,
  ),
  platform: dw(
    `${isoBox(70, 116, 64, 60, 8, 0.06)}${isoBox(104, 96, 20, 20, 26, 0.14)}${isoBox(72, 104, 14, 14, 16)}${isoBox(150, 90, 14, 14, 16)}${isoBox(96, 132, 14, 14, 14)}${isoBox(168, 118, 14, 14, 14)}${wire(86, 111, 114, 101)}${wire(157, 97, 124, 101)}${wire(103, 139, 114, 109)}${wire(175, 125, 124, 105)}${star(120, 44, 5)}`,
  ),
  pipeline: dw(
    `${isoBox(28, 96, 20, 22, 30)}${isoArrow(28, 96, 20, 11, 30, 10)}${isoBox(84, 102, 22, 22, 34)}${isoArrow(84, 102, 22, 11, 34, 10)}${isoBox(142, 108, 22, 22, 34)}${isoArrow(142, 108, 22, 11, 34, 10)}${isoBox(198, 114, 12, 14, 24, 0.16)}${gearTop(107, 71, 7)}${checkTop(165, 76)}${star(120, 40, 5)}`,
  ),
  content: d(
    `<rect x="40" y="34" width="108" height="112" rx="16" fill="currentColor" fill-opacity=".05"/><rect x="40" y="34" width="108" height="112" rx="16"/><path d="M56 56 q40 -5 78 0" stroke-width="2.4"/><path d="M56 74 q40 -4 72 0 M56 90 q36 -4 66 0" stroke-opacity=".5"/><path d="M56 112 q22 -14 44 0 t40 -6" stroke-opacity=".9"/><path d="M150 152 l40 -42 12 12 -40 42 z" fill="currentColor" fill-opacity=".08"/><path d="M150 152 l40 -42 12 12 -40 42 z"/><path d="M150 152 l7 7"/><path d="M190 110 l12 12" stroke-width="2.4"/>${star(60, 132, 4.5)}${star(206, 64, 4)}`,
  ),
  postmortem: d(
    `<path d="M40 140 q80 3 160 -1"/><path d="M40 140 q-2 -48 -1 -96" stroke-opacity=".6"/><path d="M46 92 q16 -18 30 -18 t26 20"/><path d="M102 94 q10 24 18 40" stroke-dasharray="2 7"/><circle cx="140" cy="104" r="22" fill="currentColor" fill-opacity=".06"/><circle cx="140" cy="104" r="22"/><path d="M157 120 q10 10 18 18" stroke-width="5"/><circle cx="138" cy="104" r="8" fill="currentColor" fill-opacity=".14"/><circle cx="138" cy="104" r="8"/><path d="M130 100 l-6 -3 M130 108 l-6 3 M146 100 l6 -3 M146 108 l6 3"/><path d="M133 90 l-3 -5 M143 90 l3 -5"/><path d="M135 103 l2 2 M141 103 l-2 2" stroke-width="1.4"/>${star(70, 58, 4.5)}`,
  ),
  rush: dw(
    `<rect x="28" y="58" width="98" height="76" rx="12" fill="currentColor" fill-opacity=".06"/><rect x="28" y="58" width="98" height="76" rx="12"/><path d="M28 74 h98" stroke-opacity=".4"/><circle cx="38" cy="66" r="2" ${Fl}/><circle cx="46" cy="66" r="2" ${Fl}/><path d="M46 90 l-8 8 8 8 M108 90 l8 8 -8 8 M64 112 l24 -22" stroke-opacity=".7"/><path d="M170 118 q-14 -22 6 -46 q20 24 6 46 z" fill="currentColor" fill-opacity=".1"/><path d="M170 118 q-14 -22 6 -46 q20 24 6 46 z"/><circle cx="176" cy="86" r="3.4"/><path d="M164 112 q-8 4 -6 16 M188 112 q8 4 6 16" /><path d="M170 120 q-4 8 -3 16 M176 120 q4 8 3 16" stroke-dasharray="2 5" stroke-opacity=".6"/><path d="M150 76 l-8 -8 M206 72 l8 -8" stroke-opacity=".55"/>${star(206, 46, 5)}${star(150, 50, 4)}`,
  ),
  integration: dw(
    `${gear2(92, 80, 26, 10)}${gear2(150, 68, 18, 8)}<path d="M118 78 q6 6 14 4" stroke-opacity=".5"/>${star(190, 50, 5)}${star(56, 52, 4)}`,
  ),
  measure: dw(
    `<path d="M52 116 a68 68 0 0 1 136 0" fill="currentColor" fill-opacity=".05"/><path d="M52 116 a68 68 0 0 1 136 0"/>${tick(120, 116, 68, -180)}${tick(120, 116, 68, -140)}${tick(120, 116, 68, -100)}${tick(120, 116, 68, -80)}${tick(120, 116, 68, -40)}${tick(120, 116, 68, 0)}<line x1="120" y1="116" x2="162" y2="72" stroke-width="2.4"/><circle cx="120" cy="116" r="5" fill="currentColor" fill-opacity=".2"/><circle cx="120" cy="116" r="5"/><path d="M150 108 l6 6 12 -14" stroke-width="2.2"/>${star(70, 64, 4.5)}`,
  ),
  train: dw(
    `${isoBox(40, 110, 44, 44, 16, 0.1)}${pins(40, 110, 44, 44, 16)}<path d="M150 60 l0 60 62 0" stroke-opacity=".5"/><path d="M156 66 q22 44 42 50 t16 4" stroke-width="2.2"/><circle cx="214" cy="120" r="3" ${Fl}/>${star(120, 44, 5)}`,
  ),
  blueprint: d(
    `<rect x="40" y="40" width="120" height="100" rx="12" fill="currentColor" fill-opacity=".06"/><rect x="40" y="40" width="120" height="100" rx="12"/><path d="M40 66 q60 -2 120 0 M40 92 q60 -2 120 0 M40 118 q60 -2 120 0 M66 40 q-2 50 0 100 M100 40 q2 50 0 100 M134 40 q-2 50 0 100" stroke-opacity=".3"/><rect x="86" y="82" width="42" height="34" rx="6" fill="currentColor" fill-opacity=".16"/><rect x="86" y="82" width="42" height="34" rx="6"/>${star(150, 58, 5)}<path d="M150 152 l38 -40 12 12 -38 40 z" fill="currentColor" fill-opacity=".08"/><path d="M150 152 l38 -40 12 12 -38 40 z"/><path d="M188 112 l12 12" stroke-width="2.4"/>`,
  ),
  answer: d(
    `<path d="M40 52 h130 a16 16 0 0 1 16 16 v46 a16 16 0 0 1 -16 16 h-92 l-24 22 v-22 h-14 a16 16 0 0 1 -16 -16 v-46 a16 16 0 0 1 16 -16 z" fill="currentColor" fill-opacity=".06"/><path d="M40 52 h130 a16 16 0 0 1 16 16 v46 a16 16 0 0 1 -16 16 h-92 l-24 22 v-22 h-14 a16 16 0 0 1 -16 -16 v-46 a16 16 0 0 1 16 -16 z"/><path d="M58 74 q40 -4 76 0 M58 92 q32 -4 60 0" stroke-opacity=".55"/>${star(150, 80, 6)}${star(198, 52, 4.5)}<circle cx="150" cy="150" r="2.4" ${Fl}/>`,
  ),
  graph: dw(
    `${arrowInto(48, 44, 120, 80, 22)}${arrowInto(198, 50, 120, 80, 22)}${arrowInto(50, 120, 120, 80, 22)}${arrowInto(196, 120, 120, 80, 22)}${arrowInto(112, 132, 120, 80, 22)}<circle cx="120" cy="80" r="22" fill="currentColor" fill-opacity=".18"/><circle cx="120" cy="80" r="22"/><circle cx="120" cy="80" r="3" ${Fl}/><circle cx="48" cy="44" r="10" fill="currentColor" fill-opacity=".06"/><circle cx="48" cy="44" r="10"/><circle cx="198" cy="50" r="8"/><circle cx="50" cy="120" r="7"/><circle cx="196" cy="120" r="12" fill="currentColor" fill-opacity=".06"/><circle cx="196" cy="120" r="12"/><circle cx="112" cy="132" r="6"/>${star(92, 38, 4.5)}`,
  ),
  index: dw(
    `${isoBox(64, 120, 94, 62, 7, 0.05)}${isoBox(64, 107, 94, 62, 7, 0.05)}${isoBox(64, 94, 94, 62, 7, 0.09)}${idxRows(64, 94, 94, 62, 7)}${star(202, 52, 5)}`,
  ),
  cluster: d(
    `${clusterBlob(74, 74, ".16")}${clusterBlob(158, 66, ".08")}${clusterBlob(120, 128, ".08")}<circle cx="200" cy="128" r="4"/><path d="M200 128 l-6 -4" stroke-opacity=".4"/>${star(60, 48, 4.5)}<path d="M198 124 l-3 -3 M200 124 l3 -3" stroke-width="1.4" stroke-opacity=".6"/>`,
  ),
  globe: d(
    `<circle cx="118" cy="94" r="52" fill="currentColor" fill-opacity=".06"/><circle cx="118" cy="94" r="52"/><path d="M118 42 q-30 52 0 104 M118 42 q30 52 0 104 M66 94 q52 -22 104 0 M72 66 q46 14 92 0 M72 122 q46 -14 92 0" stroke-opacity=".45"/>${star(184, 48, 5)}<path d="M150 150 q6 6 14 6 M164 150 l0 12 M172 150 q-6 6 -14 6" stroke-opacity=".5"/><circle cx="98" cy="80" r="3" ${Fl}/><circle cx="140" cy="104" r="3" ${Fl}/>`,
  ),
};

// The SVG filter that gives every doodle its hand-drawn wobble. Render once per
// page (see RoughFilter) — the art references it by id.
export const ROUGH_FILTER = `<filter id="rough" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency="0.022" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>`;

// Ordered keyword → doodle rules. First match wins; a slug/title hash picks a
// stable fallback so covers stay varied and never change between renders.
const RULES: Array<[RegExp, string]> = [
  [/cross-encoder|\btrain(ing)?\b|fine-?tun/i, "train"],
  [/crawl/i, "crawler"],
  [/inverted index|\bindex(ing)?\b/i, "index"],
  [/pagerank|page rank/i, "graph"],
  [/bert|rerank|neural|embedding model|transformer/i, "neural"],
  [/bm25|ranking|\brank\b/i, "rank"],
  [/keyword cluster|\bcluster/i, "cluster"],
  [/ai overview|overview|snippet/i, "search"],
  [/ai mode|answer|chat|assistant/i, "answer"],
  [/measur|evaluat|quality|metric|benchmark/i, "measure"],
  [/quoting|\bagent\b/i, "agent"],
  [/pipeline|cms|publish/i, "pipeline"],
  [/content|writ(e|ing)|draft/i, "content"],
  [/blueprint|plan|roadmap|artifact/i, "blueprint"],
  [/postmortem|fail|broke|stall|retro/i, "postmortem"],
  [/platform|orchestrat|infra/i, "platform"],
  [/vibe|rush/i, "rush"],
  [/china|chinese|integration/i, "integration"],
  [/global|sovereign|arabic|language/i, "globe"],
  [/search engine|search/i, "search"],
];

const FALLBACK_POOL = [
  "content",
  "blueprint",
  "agent",
  "search",
  "graph",
  "index",
  "neural",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Map a post/series title (with optional series title for context) to a
 * doodle key. Deterministic: the same title always gets the same cover. */
export function doodleKeyFor(title: string, seriesTitle?: string): string {
  const hay = `${title} ${seriesTitle ?? ""}`;
  for (const [re, key] of RULES) {
    if (re.test(hay)) return key;
  }
  return FALLBACK_POOL[hash(title) % FALLBACK_POOL.length];
}

/** The `<svg>` markup for a doodle key (falls back to a neutral cover). */
export function doodleSvg(key: string): string {
  return art[key] ?? art.content;
}
