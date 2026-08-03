"""Generate the search engine series covers in one visual language.

Every cover is the same object seen the same way: a data figure lying on a
plane tilted away from the viewer, lifted off a very light diagonal wash, drawn
in one hue with a single warm accent used exactly once. No title and no
description, because both already appear on the card and at the top of the
post; the only text is what a figure needs to be readable.

Each figure is true to its own post rather than decorative. The inverted index
cover is a real sparse posting matrix, the BM25 cover is the actual saturation
curve at three values of k1, the reranking cover is a slope chart of an order
changing. A reader who understands the picture has learned the post's subject.

The projection is genuine. Every mark's coordinates go through the same
perspective transform, so the far edge is narrower than the near one and the
grid converges the way a surface does. A CSS skew keeps rows parallel and reads
as a distorted rectangle instead of a receding plane.

Deterministic: every pattern comes from a formula or a literal, never a random
number, so rerunning reproduces the same images.

    python scripts/make-covers.py [slug ...]
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "covers"

W, H = 1200, 630
BLUE, WARM = "#004aef", "#c2410c"
INK, MUTED, RULE = "#1f2124", "#5f656d", "#dfe4ec"
FONT = ("-apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', Roboto, sans-serif")

TILT = math.radians(34)
DIST = 3000.0


class Plane:
    """A tilted surface that plane coordinates are projected onto.

    `u` runs right, `v` runs away from the viewer. Both are in the figure's own
    units; `scale` maps them to canvas pixels before the tilt is applied.
    """

    def __init__(self, cx: float, cy: float, w: float, h: float,
                 umax: float = 1.0, vmax: float = 1.0):
        self.cx, self.cy, self.w, self.h = cx, cy, w, h
        self.umax, self.vmax = umax, vmax

    def __call__(self, u: float, v: float) -> tuple[float, float]:
        x = (u / self.umax - 0.5) * self.w
        y0 = (v / self.vmax - 0.5) * self.h
        y, z = y0 * math.cos(TILT), y0 * math.sin(TILT)
        s = DIST / (DIST + z)
        return self.cx + x * s, self.cy + y * s

    def quad(self, u0: float, v0: float, u1: float, v1: float) -> str:
        pts = [self(u0, v0), self(u1, v0), self(u1, v1), self(u0, v1)]
        return " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)

    def path(self, points) -> str:
        out = []
        for i, (u, v) in enumerate(points):
            x, y = self(u, v)
            out.append(("M" if i == 0 else "L") + f"{x:.1f} {y:.1f}")
        return " ".join(out)


def text(p: Plane | None, u, v, s, size=13, fill=MUTED, anchor="middle", weight="400", dy=0.0):
    x, y = p(u, v) if p else (u, v)
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (f'<text x="{x:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}" font-size="{size}" '
            f'fill="{fill}" font-weight="{weight}">{s}</text>')


def note(x: float, y: float, lines: list[str]) -> str:
    """The one warm annotation. Flat, not on the plane, so it sits in front."""
    out = [f'<line x1="{x - 42:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y:.1f}" '
           f'stroke="{WARM}" stroke-width="1.2"/>']
    for i, ln in enumerate(lines):
        out.append(f'<text x="{x + 10:.1f}" y="{y + 5 + i * 22 - (len(lines) - 1) * 11:.1f}" '
                   f'font-size="17" fill="{WARM}">{ln}</text>')
    return '<g class="mark">' + "".join(out) + "</g>"


def wrap(body: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="{FONT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="#fafbfe"/>
      <stop offset="1" stop-color="#edf1fa"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.47" cy="0.4" r="0.6">
      <stop offset="0" stop-color="{BLUE}" stop-opacity="0.06"/>
      <stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
    </radialGradient>
    <filter id="lift" x="-25%" y="-25%" width="150%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#0b1a3a" flood-opacity="0.11"/>
    </filter>
  </defs>
  <style>
    /* 14s loop: the figure resolves on a sweep, the one annotation arrives,
       then it rests. Reduced motion paints the finished frame, which is also
       what the og:image renderer captures. */
    .c {{ opacity: 0; animation: fill 14s ease-in-out infinite; }}
    @keyframes fill {{ 0% {{ opacity: 0 }} 22%, 88% {{ opacity: var(--o, 1) }} 100% {{ opacity: 0 }} }}
    .draw {{ stroke-dasharray: var(--len, 2000); stroke-dashoffset: var(--len, 2000);
             animation: draw 14s ease-in-out infinite; }}
    @keyframes draw {{ 0% {{ stroke-dashoffset: var(--len, 2000) }}
                      26%, 88% {{ stroke-dashoffset: 0 }}
                      100% {{ stroke-dashoffset: var(--len, 2000) }} }}
    .mark {{ opacity: 0; animation: mark 14s ease infinite; }}
    @keyframes mark {{ 0%, 34% {{ opacity: 0 }} 46%, 86% {{ opacity: 1 }} 96%, 100% {{ opacity: 0 }} }}
    @media (prefers-reduced-motion: reduce) {{
      .c {{ opacity: var(--o, 1); animation: none }}
      .draw {{ stroke-dashoffset: 0; animation: none }}
      .mark {{ opacity: 1; animation: none }}
    }}
  </style>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>
{body}
</svg>
"""


def lifted(marks: str) -> str:
    return f'  <g filter="url(#lift)">{marks}</g>'


# ------------------------------------------------------------------ figures

def crawling() -> str:
    """#1 — the frontier. Pages found, ringed by how many hops from the seed."""
    p = Plane(516, 318, 640, 470, 1, 1)
    seed = (0.5, 0.5)
    out = []
    for ring, (count, r) in enumerate([(1, 0.0), (6, 0.11), (13, 0.23), (22, 0.35), (30, 0.47)]):
        for k in range(count):
            a = 2 * math.pi * k / count + ring * 0.7
            u, v = seed[0] + r * math.cos(a), seed[1] + r * math.sin(a) * 1.02
            if not (0.02 < u < 0.98 and 0.02 < v < 0.98):
                continue
            x, y = p(u, v)
            rad = 9.5 - ring * 1.35
            o = 0.9 - ring * 0.15
            out.append(f'<circle class="c" cx="{x:.1f}" cy="{y:.1f}" r="{rad:.1f}" fill="{BLUE}" '
                       f'style="--o:{o:.2f};animation-delay:{ring * 0.5 + k * 0.02:.2f}s"/>')
            if ring:
                px, py = p(seed[0] + (r - 0.115) * math.cos(a), seed[1] + (r - 0.115) * math.sin(a) * 1.02)
                out.append(f'<line class="c" x1="{px:.1f}" y1="{py:.1f}" x2="{x:.1f}" y2="{y:.1f}" '
                           f'stroke="{BLUE}" stroke-width="1" style="--o:0.2;'
                           f'animation-delay:{ring * 0.5:.2f}s"/>')
    nx, ny = p(0.5 + 0.47, 0.5)
    return wrap(lifted("".join(out))
                + note(nx + 26, ny, ["the frontier, five", "hops from the seed"])
                + text(None, 200, 96, "pages discovered", 14, MUTED, "start"))


def crawler_design() -> str:
    """#2 — politeness. Requests to one host, spaced by a delay the crawler keeps."""
    p = Plane(516, 322, 660, 440, 12, 5)
    out = []
    for host in range(5):
        for t in range(12):
            if (t + host * 2) % 3:
                continue
            out.append(f'<polygon class="c" points="{p.quad(t + 0.12, host + 0.18, t + 0.88, host + 0.82)}" '
                       f'fill="{BLUE}" style="--o:0.82;animation-delay:{t * 0.09 + host * 0.05:.2f}s"/>')
    for host in range(5):
        x0, y0 = p(0, host + 0.5)
        x1, y1 = p(12, host + 0.5)
        out.insert(0, f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
                      f'stroke="{RULE}" stroke-width="1"/>')
    nx, ny = p(12, 1.5)
    return wrap(lifted("".join(out))
                + note(nx + 30, ny, ["one request per host,", "then wait"])
                + text(None, 190, 100, "five hosts, twelve slots", 14, MUTED, "start"))


def inverted_index() -> str:
    """#3 — the posting lists themselves. Terms down, documents across, sparse.

    Rows are ordered by document frequency, which is what an index is sorted by
    and what makes the shape legible: a few terms in almost everything, a long
    tail in almost nothing. Unsorted it reads as noise.
    """
    p = Plane(516, 320, 640, 450, 30, 18)
    out = []
    for term in range(18):
        density = 0.92 * math.exp(-term / 4.2) + 0.04
        for doc in range(30):
            h = (math.sin(term * 12.9898 + doc * 78.233) * 43758.5453) % 1
            if h > density:
                continue
            out.append(f'<polygon class="c" points="{p.quad(doc + 0.14, term + 0.14, doc + 0.86, term + 0.86)}" '
                       f'fill="{BLUE}" style="--o:{0.30 + 0.5 * density:.2f};'
                       f'animation-delay:{(term + doc) * 0.012:.2f}s"/>')
    nx, ny = p(30, 0.5)
    return wrap(lifted("".join(out))
                + note(nx + 26, ny, ['"the" is in almost', "every document"])
                + text(None, 176, 96, "documents", 14, MUTED, "start")
                + f'<text x="150" y="330" font-size="14" fill="{MUTED}" text-anchor="middle" '
                  f'transform="rotate(-90 150 330)">terms, ordered by document frequency</text>')


def bm25() -> str:
    """#4 — saturation. More of the same word stops helping, and k1 sets how fast."""
    p = Plane(516, 322, 620, 420, 12, 1)
    # One denominator for all three curves. Normalising each by its own maximum
    # made them end at the same point, which erases the only thing k1 changes.
    ceiling = max(12 * (k + 1) / (12 + k) for k in (0.6, 1.2, 2.4))
    out = []
    for idx, (k1, o, wt) in enumerate([(0.6, 0.4, 1.6), (1.2, 1.0, 2.6), (2.4, 0.4, 1.6)]):
        pts = [(tf, 1 - (tf * (k1 + 1)) / (tf + k1) / ceiling)
               for tf in [i * 0.25 for i in range(49)]]
        out.append(f'<path class="draw" d="{p.path(pts)}" fill="none" stroke="{BLUE}" '
                   f'stroke-width="{wt}" opacity="{o}" '
                   f'style="--len:900;animation-delay:{idx * 0.25:.2f}s"/>')
        lx, ly = p(12, pts[-1][1])
        out.append(text(None, lx + 14, ly + 4, f"k1 = {k1}", 13, MUTED, "start"))
    x0, y0 = p(0, 1)
    x1, y1 = p(12, 1)
    xt, yt = p(0, 0)
    out.insert(0, f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{RULE}"/>'
                  f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{xt:.1f}" y2="{yt:.1f}" stroke="{RULE}"/>')
    # Anchored on the k1 = 1.2 curve at tf = 10, which is the sentence it makes.
    ny_v = 1 - (10 * 2.2) / (10 + 1.2) / ceiling
    nx, ny = p(10, ny_v)
    return wrap(lifted("".join(out))
                + note(nx + 52, ny - 74, ["the tenth occurrence", "is worth almost nothing"])
                + text(None, 196, 104, "score contribution", 14, MUTED, "start")
                + text(None, 806, 566, "times the word appears", 14, MUTED, "start"))


def pagerank() -> str:
    """#5 — authority. A link graph where a node's size is the rank it receives."""
    p = Plane(516, 318, 640, 460, 1, 1)
    nodes = [(0.50, 0.46, 1.00), (0.24, 0.28, 0.42), (0.74, 0.22, 0.50), (0.18, 0.68, 0.34),
             (0.80, 0.66, 0.46), (0.42, 0.14, 0.26), (0.62, 0.82, 0.30), (0.10, 0.46, 0.22),
             (0.90, 0.44, 0.24), (0.34, 0.80, 0.22), (0.68, 0.50, 0.30), (0.44, 0.62, 0.26)]
    edges = [(1, 0), (2, 0), (3, 0), (4, 0), (5, 1), (5, 2), (6, 4), (7, 3), (8, 4),
             (9, 3), (10, 0), (11, 0), (2, 10), (4, 10), (1, 7), (6, 9)]
    out = []
    for i, (a, b) in enumerate(edges):
        x0, y0 = p(nodes[a][0], nodes[a][1])
        x1, y1 = p(nodes[b][0], nodes[b][1])
        out.append(f'<line class="c" x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
                   f'stroke="{BLUE}" stroke-width="1.1" style="--o:0.26;animation-delay:{i * 0.05:.2f}s"/>')
    for i, (u, v, r) in enumerate(nodes):
        x, y = p(u, v)
        out.append(f'<circle class="c" cx="{x:.1f}" cy="{y:.1f}" r="{7 + r * 22:.1f}" fill="{BLUE}" '
                   f'style="--o:{0.32 + r * 0.55:.2f};animation-delay:{0.3 + i * 0.06:.2f}s"/>')
    nx, ny = p(0.50, 0.46)
    return wrap(lifted("".join(out))
                + note(nx + 58, ny, ["rank is what other", "pages give you"])
                + text(None, 190, 100, "pages, sized by the authority they collect", 14, MUTED, "start"))


def ai_overviews() -> str:
    """#6 — retrieval into generation. Many chunks narrow into one answer."""
    p = Plane(516, 322, 660, 450, 3, 12)
    out = []
    for i in range(12):
        out.append(f'<polygon class="c" points="{p.quad(0.05, i + 0.15, 0.95, i + 0.85)}" '
                   f'fill="{BLUE}" style="--o:{0.30 + 0.05 * (i % 4):.2f};animation-delay:{i * 0.05:.2f}s"/>')
    for i in range(5):
        out.append(f'<polygon class="c" points="{p.quad(1.15, i * 2 + 1.15, 1.95, i * 2 + 2.85)}" '
                   f'fill="{BLUE}" style="--o:0.62;animation-delay:{0.7 + i * 0.07:.2f}s"/>')
    out.append(f'<polygon class="c" points="{p.quad(2.15, 4.15, 2.95, 7.85)}" fill="{BLUE}" '
               f'style="--o:0.95;animation-delay:1.15s"/>')
    for a, b in ((0.98, 1.13), (1.98, 2.13)):
        for i in range(4):
            x0, y0 = p(a, 1.5 + i * 3)
            x1, y1 = p(b, 1.5 + i * 3)
            out.append(f'<line class="c" x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
                       f'stroke="{BLUE}" stroke-width="1" style="--o:0.25;animation-delay:0.9s"/>')
    nx, ny = p(2.95, 6)
    return wrap(lifted("".join(out))
                + note(nx + 34, ny, ["one answer, and every", "sentence has a source"])
                + text(None, 170, 96, "chunks retrieved", 14, MUTED, "start")
                + text(None, 470, 96, "kept", 14, MUTED, "start")
                + text(None, 700, 96, "written", 14, MUTED, "start"))


def reranking() -> str:
    """#7 — the reordering itself. Ranks before, ranks after, and the lines cross."""
    p = Plane(516, 318, 560, 460, 1, 10)
    after = [3, 0, 6, 1, 8, 2, 9, 4, 7, 5]
    out = []
    for before, a in enumerate(after):
        o = 0.9 if abs(a - before) >= 3 else 0.4
        col = WARM if (before, a) == (1, 0) else BLUE
        out.append(f'<path class="draw" d="{p.path([(0.06, before + 0.5), (0.36, before + 0.5), (0.64, a + 0.5), (0.94, a + 0.5)])}" '
                   f'fill="none" stroke="{col}" stroke-width="{2.2 if col == WARM else 1.6}" '
                   f'opacity="{o}" style="--len:800;animation-delay:{before * 0.06:.2f}s"/>')
        for u, row in ((0.06, before), (0.94, a)):
            x, y = p(u, row + 0.5)
            out.append(f'<circle class="c" cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{col}" '
                       f'style="--o:{o:.2f};animation-delay:{before * 0.06:.2f}s"/>')
    nx, ny = p(0.94, 0.5)
    return wrap(lifted("".join(out))
                + note(nx + 34, ny, ["the cross-encoder", "moved this to first"])
                + text(None, 190, 96, "BM25 order", 14, MUTED, "start")
                + text(None, 790, 96, "after reranking", 14, MUTED, "start"))


def ai_mode() -> str:
    """#8 — fan-out. One question becomes several searches, then one answer."""
    p = Plane(516, 320, 620, 450, 1, 1)
    subs = [0.14, 0.31, 0.5, 0.69, 0.86]
    out = []
    for i, s in enumerate(subs):
        out.append(f'<path class="draw" d="{p.path([(0.5, 0.06), (0.5, 0.2), (s, 0.34), (s, 0.5)])}" '
                   f'fill="none" stroke="{BLUE}" stroke-width="1.5" opacity="0.45" '
                   f'style="--len:400;animation-delay:{i * 0.07:.2f}s"/>')
        out.append(f'<path class="draw" d="{p.path([(s, 0.66), (s, 0.8), (0.5, 0.9), (0.5, 0.96)])}" '
                   f'fill="none" stroke="{BLUE}" stroke-width="1.5" opacity="0.45" '
                   f'style="--len:400;animation-delay:{0.5 + i * 0.07:.2f}s"/>')
        for k in range(3):
            x, y = p(s + (k - 1) * 0.035, 0.58)
            out.append(f'<circle class="c" cx="{x:.1f}" cy="{y:.1f}" r="6" fill="{BLUE}" '
                       f'style="--o:{0.8 - k * 0.2:.2f};animation-delay:{0.35 + i * 0.07:.2f}s"/>')
    for u, v, r, o in ((0.5, 0.06, 13, 0.95), (0.5, 0.96, 15, 1.0)):
        x, y = p(u, v)
        out.append(f'<circle class="c" cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{BLUE}" '
                   f'style="--o:{o};animation-delay:0.1s"/>')
    nx, ny = p(0.86, 0.58)
    return wrap(lifted("".join(out))
                + note(nx + 40, ny, ["five searches the user", "never typed"])
                + text(None, 176, 108, "one question", 14, MUTED, "start")
                + text(None, 176, 560, "one answer", 14, MUTED, "start"))


def measuring() -> str:
    """#9 — the scoreboard, by intent, which is what the post is about."""
    p = Plane(516, 322, 640, 430, 1, 6)
    rows = [("stopword heavy", 0.960), ("multi-term", 0.817), ("entity", 0.753),
            ("informational", 0.722), ("navigational", 0.640), ("misspelled", 0.622)]
    out = []
    for i, (name, val) in enumerate(rows):
        weak = val < 0.7
        out.append(f'<polygon class="c" points="{p.quad(0.0, i + 0.2, val, i + 0.8)}" '
                   f'fill="{WARM if weak else BLUE}" style="--o:{0.55 if weak else 0.9};'
                   f'animation-delay:{i * 0.09:.2f}s"/>')
        lx, ly = p(0, i + 0.5)
        out.append(text(None, lx - 14, ly + 5, name, 14, MUTED, "end"))
        vx, vy = p(val, i + 0.5)
        out.append(text(None, vx + 12, vy + 5, f"{val:.3f}", 14, INK, "start", "500"))
    nx, ny = p(0.640, 4.5)
    return wrap(lifted("".join(out))
                + note(nx + 92, ny, ["a name it cannot", "match on words"])
                + text(None, 480, 566, "nDCG@10 across fifty labelled queries", 14, MUTED, "start"))


COVERS = {
    "web-crawling-in-search-engines": crawling,
    "designing-the-web-crawler": crawler_design,
    "inverted-index": inverted_index,
    "ranking-with-bm25": bm25,
    "ranking-with-pagerank": pagerank,
    "ai-overviews": ai_overviews,
    "neural-reranking-with-bert": reranking,
    "ai-mode": ai_mode,
    "measuring-search-quality": measuring,
}


def main() -> int:
    wanted = sys.argv[1:] or list(COVERS)
    unknown = [s for s in wanted if s not in COVERS]
    if unknown:
        print(f"unknown: {', '.join(unknown)}", file=sys.stderr)
        return 2
    OUT.mkdir(parents=True, exist_ok=True)
    for slug in wanted:
        path = OUT / f"{slug}.svg"
        path.write_text(COVERS[slug](), encoding="utf-8")
        print(f"  {path.name:<42} {path.stat().st_size / 1024:5.1f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
