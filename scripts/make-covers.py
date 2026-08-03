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
BLUE = "#004aef"            # SEONGON Prosperous Blue
# SEONGON Future Green. At 1.52:1 on white it can fill a shape and nothing else,
# so text and hairlines use a darker step of the same hue at 4.89:1. The two
# brand colours sit 4.29:1 apart in luminance, which is what keeps them
# separable for a colour-blind reader even though both are cool.
ACCENT = "#07ef9c"
ACCENT_TEXT = "#04815a"
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
           f'stroke="{ACCENT_TEXT}" stroke-width="1.4"/>']
    for i, ln in enumerate(lines):
        out.append(f'<text x="{x + 10:.1f}" y="{y + 5 + i * 22 - (len(lines) - 1) * 11:.1f}" '
                   f'font-size="17" fill="{ACCENT_TEXT}">{ln}</text>')
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
    /* 14s loop. Each class is a different kind of arrival, because the figures
       are about different kinds of event: text is typed, a result appears, a
       panel expands and pushes what is under it away, a curve is drawn.
       `transform-box: fill-box` is what makes transform-origin mean the shape's
       own box rather than the whole canvas.

       Every animation rests on the finished figure, and reduced motion paints
       that frame directly. The og:image renderer runs with reduced motion
       forced, so the still it captures is always the completed drawing. */
    .c, .type, .pop, .rise, .expandy {{ transform-box: fill-box; }}

    .c {{ opacity: 0; animation: fade 14s ease-in-out infinite; }}
    @keyframes fade {{ 0% {{ opacity: 0 }} 20%, 88% {{ opacity: var(--o, 1) }} 100% {{ opacity: 0 }} }}

    /* a caret running left to right */
    .type {{ opacity: 0; transform-origin: left center;
             animation: type 14s cubic-bezier(0.25, 0.9, 0.3, 1) infinite; }}
    @keyframes type {{ 0% {{ opacity: 0; transform: scaleX(0) }}
                      6% {{ opacity: var(--o, 1); transform: scaleX(0) }}
                      22%, 88% {{ opacity: var(--o, 1); transform: scaleX(1) }}
                      100% {{ opacity: 0; transform: scaleX(1) }} }}

    /* lands with a little overshoot, the way a result appears */
    .pop {{ opacity: 0; transform-origin: center;
            animation: pop 14s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }}
    @keyframes pop {{ 0% {{ opacity: 0; transform: scale(0.6) }}
                     18%, 88% {{ opacity: var(--o, 1); transform: scale(1) }}
                     100% {{ opacity: 0; transform: scale(0.6) }} }}

    .rise {{ opacity: 0; animation: rise 14s cubic-bezier(0.2, 0.9, 0.3, 1) infinite; }}
    @keyframes rise {{ 0% {{ opacity: 0; transform: translateY(22px) }}
                      20%, 88% {{ opacity: var(--o, 1); transform: translateY(0) }}
                      100% {{ opacity: 0; transform: translateY(22px) }} }}

    /* a panel opening downward, which is what pushes the links off the frame */
    .expandy {{ opacity: 0; transform-origin: top center;
                animation: expandy 14s cubic-bezier(0.2, 0.9, 0.25, 1) infinite; }}
    @keyframes expandy {{ 0% {{ opacity: 0; transform: scaleY(0) }}
                         6% {{ opacity: var(--o, 1); transform: scaleY(0) }}
                         24%, 88% {{ opacity: var(--o, 1); transform: scaleY(1) }}
                         100% {{ opacity: 0; transform: scaleY(0) }} }}

    .draw {{ stroke-dasharray: var(--len, 2000); stroke-dashoffset: var(--len, 2000);
             animation: draw 14s ease-in-out infinite; }}
    @keyframes draw {{ 0% {{ stroke-dashoffset: var(--len, 2000) }}
                      26%, 88% {{ stroke-dashoffset: 0 }}
                      100% {{ stroke-dashoffset: var(--len, 2000) }} }}

    .mark {{ opacity: 0; animation: mark 14s ease infinite; }}
    @keyframes mark {{ 0%, 40% {{ opacity: 0 }} 52%, 86% {{ opacity: 1 }} 96%, 100% {{ opacity: 0 }} }}

    @media (prefers-reduced-motion: reduce) {{
      .c, .type, .pop, .rise, .expandy {{ opacity: var(--o, 1); transform: none; animation: none }}
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


# --------------------------------------------------- interface primitives
#
# A bar chart is the right figure when the subject is a quantity. For most of
# these posts the subject is a screen, and a reader who has used Google knows
# what one looks like, so drawing it says more in less ink than any bar could.
# Rounded corners are unavailable on a projected quadrilateral, so these are
# plain polygons; at this scale nobody reads the corner.

def slab(p, u0, v0, u1, v1, fill=None, o=1.0, delay=0.0, stroke=None, cls="c"):
    f = fill or BLUE
    extra = f' stroke="{stroke}" stroke-width="1.2"' if stroke else ""
    return (f'<polygon class="{cls}" points="{p.quad(u0, v0, u1, v1)}" fill="{f}"{extra} '
            f'style="--o:{o};animation-delay:{delay:.2f}s"/>')


def textline(p, u0, u1, v, h=0.055, o=0.22, delay=0.0, fill=None, cls="c"):
    """A line of body text, the way a wireframe draws one."""
    return slab(p, u0, v - h / 2, u1, v + h / 2, fill or MUTED, o, delay, cls=cls)


def searchbox(p, u0, u1, v, query=0.42, delay=0.0):
    """The box itself: a field, the typed query, and the button."""
    out = [slab(p, u0, v - 0.075, u1, v + 0.075, "#ffffff", 1, delay, RULE)]
    # The query is typed, not faded in. It is the first thing that happens.
    out.append(textline(p, u0 + 0.03, u0 + 0.03 + query, v, 0.05, 0.9, delay + 0.1, BLUE, "type"))
    out.append(slab(p, u1 - 0.075, v - 0.048, u1 - 0.02, v + 0.048, BLUE, 0.95, delay + 0.15, cls="pop"))
    return "".join(out)


def result(p, u0, v, w=0.62, delay=0.0, title_o=0.95):
    """One organic result: url, blue title, two lines of snippet.

    The whole block rises together, because a result appears as a unit rather
    than assembling itself line by line.
    """
    return "".join([
        textline(p, u0, u0 + w * 0.34, v, 0.035, 0.35, delay, cls="rise"),
        textline(p, u0, u0 + w, v + 0.055, 0.052, title_o, delay + 0.02, BLUE, "rise"),
        textline(p, u0, u0 + w * 0.96, v + 0.115, 0.033, 0.20, delay + 0.04, cls="rise"),
        textline(p, u0, u0 + w * 0.72, v + 0.158, 0.033, 0.20, delay + 0.06, cls="rise"),
    ])


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
            out.append(f'<circle class="pop" cx="{x:.1f}" cy="{y:.1f}" r="{rad:.1f}" fill="{BLUE}" '
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
        out.append(f'<circle class="pop" cx="{x:.1f}" cy="{y:.1f}" r="{7 + r * 22:.1f}" fill="{BLUE}" '
                   f'style="--o:{0.32 + r * 0.55:.2f};animation-delay:{0.3 + i * 0.06:.2f}s"/>')
    nx, ny = p(0.50, 0.46)
    return wrap(lifted("".join(out))
                + note(nx + 58, ny, ["rank is what other", "pages give you"])
                + text(None, 190, 100, "pages, sized by the authority they collect", 14, MUTED, "start"))


def ai_overviews() -> str:
    """#6 — what the page looks like once the answer arrives above the links."""
    p = Plane(516, 314, 690, 470, 1, 1)
    out = [slab(p, 0.02, 0.02, 0.98, 0.98, "#ffffff", 1, 0, RULE)]
    out.append(searchbox(p, 0.08, 0.92, 0.13, 0.50, 0.1))
    out.append(slab(p, 0.06, 0.24, 0.94, 0.56, ACCENT, 0.10, 0.35, cls="expandy"))
    for i, w in enumerate([0.74, 0.80, 0.66, 0.44]):
        out.append(textline(p, 0.10, 0.10 + w, 0.30 + i * 0.055, 0.036, 0.42, 0.45 + i * 0.06, BLUE, "type"))
    for k in range(4):
        out.append(slab(p, 0.10 + k * 0.075, 0.505, 0.155 + k * 0.075, 0.535, BLUE, 0.55, 0.75 + k * 0.05, cls="pop"))
    for i in range(2):
        out.append(result(p, 0.08, 0.63 + i * 0.20, 0.62, 0.95 + i * 0.1, 0.45))
    nx, ny = p(0.94, 0.40)
    return wrap(lifted("".join(out))
                + note(nx + 28, ny, ["the answer, with a", "source under each claim"])
                + text(None, 176, 556, "the links, now below the fold", 14, MUTED, "start"))


def reranking() -> str:
    """#7 — the reordering itself. Ranks before, ranks after, and the lines cross."""
    p = Plane(516, 318, 560, 460, 1, 10)
    after = [3, 0, 6, 1, 8, 2, 9, 4, 7, 5]
    out = []
    for before, a in enumerate(after):
        o = 0.9 if abs(a - before) >= 3 else 0.4
        col = ACCENT_TEXT if (before, a) == (1, 0) else BLUE
        out.append(f'<path class="draw" d="{p.path([(0.06, before + 0.5), (0.36, before + 0.5), (0.64, a + 0.5), (0.94, a + 0.5)])}" '
                   f'fill="none" stroke="{col}" stroke-width="{2.2 if col == ACCENT_TEXT else 1.6}" '
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
    """#8 — one question becomes several searches, and one answer comes back."""
    p = Plane(516, 314, 700, 470, 1, 1)
    out = [slab(p, 0.02, 0.02, 0.98, 0.98, "#ffffff", 1, 0, RULE)]
    out.append(searchbox(p, 0.08, 0.92, 0.12, 0.56, 0.1))
    chips = [(0.09, 0.24), (0.35, 0.20), (0.60, 0.26), (0.09, 0.19), (0.31, 0.23), (0.57, 0.21)]
    for k, (u, w) in enumerate(chips):
        v = 0.29 if k < 3 else 0.375
        out.append(slab(p, u, v - 0.032, u + w, v + 0.032, BLUE, 0.13, 0.4 + k * 0.06, cls="pop"))
        out.append(textline(p, u + 0.02, u + w - 0.03, v, 0.03, 0.45, 0.45 + k * 0.06, BLUE, "pop"))
    for k, (u, w) in enumerate(chips):
        v = 0.29 if k < 3 else 0.375
        sx, sy = p(u + w / 2, v + 0.04)
        ex, ey = p(0.5, 0.52)
        out.append(f'<line class="c" x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" '
                   f'stroke="{BLUE}" stroke-width="1" style="--o:0.18;animation-delay:0.85s"/>')
    out.append(slab(p, 0.06, 0.55, 0.94, 0.93, ACCENT, 0.10, 0.95, cls="expandy"))
    for i, w in enumerate([0.78, 0.82, 0.70, 0.76, 0.50]):
        out.append(textline(p, 0.10, 0.10 + w, 0.61 + i * 0.062, 0.036, 0.40, 1.05 + i * 0.05, BLUE, "type"))
    nx, ny = p(0.83, 0.33)
    return wrap(lifted("".join(out))
                + note(nx + 30, ny, ["six searches the user", "never typed"]))


def measuring() -> str:
    """#9 — the scoreboard, by intent, which is what the post is about."""
    p = Plane(516, 322, 640, 430, 1, 6)
    rows = [("stopword heavy", 0.960), ("multi-term", 0.817), ("entity", 0.753),
            ("informational", 0.722), ("navigational", 0.640), ("misspelled", 0.622)]
    out = []
    for i, (name, val) in enumerate(rows):
        weak = val < 0.7
        out.append(f'<polygon class="c" points="{p.quad(0.0, i + 0.2, val, i + 0.8)}" '
                   f'fill="{ACCENT if weak else BLUE}" style="--o:{0.55 if weak else 0.9};'
                   f'animation-delay:{i * 0.09:.2f}s"/>')
        lx, ly = p(0, i + 0.5)
        out.append(text(None, lx - 14, ly + 5, name, 14, MUTED, "end"))
        vx, vy = p(val, i + 0.5)
        out.append(text(None, vx + 12, vy + 5, f"{val:.3f}", 14, INK, "start", "500"))
    nx, ny = p(0.640, 4.5)
    return wrap(lifted("".join(out))
                + note(nx + 92, ny, ["a name it cannot", "match on words"])
                + text(None, 480, 566, "nDCG@10 across fifty labelled queries", 14, MUTED, "start"))


# ------------------------------------------------- the standalone essays

def chinese_wisdom() -> str:
    """A destination nobody opens, against a function inside the app they live in."""
    p = Plane(516, 314, 720, 450, 2, 1)
    out = []
    out.append(slab(p, 0.20, 0.30, 0.62, 0.70, "#ffffff", 1, 0.1, RULE))
    out.append(slab(p, 0.34, 0.40, 0.48, 0.53, BLUE, 0.85, 0.2))
    out.append(textline(p, 0.28, 0.54, 0.60, 0.035, 0.28, 0.25))
    out.append(slab(p, 1.10, 0.06, 1.92, 0.94, "#ffffff", 1, 0.45, RULE))
    out.append(textline(p, 1.18, 1.62, 0.14, 0.045, 0.30, 0.5))
    for r in range(3):
        for c in range(4):
            u = 1.18 + c * 0.18
            v = 0.26 + r * 0.19
            embedded = (r, c) == (1, 2)
            out.append(slab(p, u, v, u + 0.13, v + 0.13,
                            ACCENT if embedded else BLUE,
                            0.9 if embedded else 0.20, 0.55 + (r * 4 + c) * 0.04, cls="pop"))
    out.append(slab(p, 1.18, 0.84, 1.84, 0.90, BLUE, 0.14, 0.95))
    nx, ny = p(1.62, 0.45)
    return wrap(lifted("".join(out))
                + note(nx + 40, ny, ["the same feature, where", "they already spend the day"])
                + text(None, 210, 96, "an app to open", 14, MUTED, "start")
                + text(None, 620, 96, "an app they never close", 14, MUTED, "start"))


def vibe_code_rush() -> str:
    """Products shipping, and the gap between them collapsing.

    Drawn as the things themselves - little app windows on a timeline - because
    a bar chart of elapsed time says nothing to a reader who has not already
    read the post.
    """
    p = Plane(516, 312, 700, 400, 1, 1)
    ships = [(0.02, "30 days"), (0.30, "15 days"), (0.545, "4 hours"), (0.715, "1 hour"),
             (0.845, ""), (0.915, "")]
    w, h = 0.115, 0.44
    out = []
    x0, y0 = p(-0.01, 0.74)
    x1, y1 = p(0.99, 0.74)
    out.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{RULE}"/>')
    for k, (u, label) in enumerate(ships):
        late = k >= 3
        top = 0.74 - h
        out.append(slab(p, u, top, u + w, 0.74, "#ffffff", 1, k * 0.13, RULE, cls="rise"))
        out.append(slab(p, u, top, u + w, top + 0.052, ACCENT if late else BLUE,
                        0.9, k * 0.13 + 0.04, cls="rise"))
        for i, ww in enumerate([0.72, 0.86, 0.54, 0.80, 0.46]):
            out.append(textline(p, u + 0.014, u + 0.014 + (w - 0.028) * ww,
                                top + 0.11 + i * 0.062, 0.030, 0.22, k * 0.13 + 0.07 + i * 0.02, cls="rise"))
        tick_x, tick_y = p(u + w / 2, 0.74)
        out.append(f'<line x1="{tick_x:.1f}" y1="{tick_y:.1f}" x2="{tick_x:.1f}" '
                   f'y2="{tick_y + 8:.1f}" stroke="{MUTED}" stroke-width="1.1"/>')
        if label:
            out.append(text(None, tick_x, tick_y + 30, label, 14, MUTED))
    nx, ny = p(0.915 + w, 0.50)
    return wrap(lifted("".join(out))
                + note(nx + 30, ny, ["same builder, and the", "gap keeps closing"])
                + text(None, 176, 104, "each product, and how long it took", 14, MUTED, "start"))


def keyword_clustering() -> str:
    """HDBSCAN over embedded keywords: dense groups, and the outliers it refuses
    to force into one."""
    p = Plane(516, 318, 640, 450, 1, 1)
    centres = [(0.24, 0.30, 22), (0.58, 0.22, 17), (0.76, 0.55, 20), (0.34, 0.68, 18), (0.62, 0.80, 12)]
    out = []
    n = 0
    for ci, (cu, cv, count) in enumerate(centres):
        for k in range(count):
            a = 2.399963 * n
            r = 0.052 * math.sqrt(k + 1) / math.sqrt(count) * 2.4
            u, v = cu + r * math.cos(a), cv + r * math.sin(a)
            n += 1
            if not (0.03 < u < 0.97 and 0.03 < v < 0.97):
                continue
            x, y = p(u, v)
            out.append(f'<circle class="pop" cx="{x:.1f}" cy="{y:.1f}" r="5.5" fill="{BLUE}" '
                       f'style="--o:{0.45 + 0.1 * (ci % 3):.2f};animation-delay:{ci * 0.12 + k * 0.01:.2f}s"/>')
    for u, v in [(0.10, 0.52), (0.46, 0.46), (0.90, 0.28), (0.20, 0.88), (0.88, 0.84), (0.50, 0.06)]:
        x, y = p(u, v)
        out.append(f'<circle class="pop" cx="{x:.1f}" cy="{y:.1f}" r="5.5" fill="{ACCENT}" '
                   f'style="--o:0.9;animation-delay:1.3s"/>')
    nx, ny = p(0.90, 0.28)
    return wrap(lifted("".join(out))
                + note(nx + 30, ny, ["outliers, left out", "rather than forced in"])
                + text(None, 180, 96, "keywords, embedded and grouped", 14, MUTED, "start"))


def team_failed() -> str:
    """Five things owned, five things short of where they needed to be."""
    p = Plane(516, 322, 600, 420, 1, 5)
    rows = [("a blueprint for the org", 0.42), ("infrastructure that fits", 0.30),
            ("documented competencies", 0.24), ("individual capability", 0.55),
            ("middle management", 0.18)]
    out = []
    for i, (name, v) in enumerate(rows):
        out.append(f'<polygon class="c" points="{p.quad(0, i + 0.24, v, i + 0.76)}" '
                   f'fill="{BLUE}" style="--o:0.7;animation-delay:{i * 0.1:.2f}s"/>')
        out.append(f'<polygon class="c" points="{p.quad(v, i + 0.24, 1.0, i + 0.76)}" '
                   f'fill="{BLUE}" style="--o:0.08;animation-delay:{i * 0.1:.2f}s"/>')
        lx, ly = p(0, i + 0.5)
        out.append(text(None, lx - 14, ly + 5, name, 14, MUTED, "end"))
    x0, y0 = p(1.0, 0)
    x1, y1 = p(1.0, 5)
    out.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
               f'stroke="{ACCENT_TEXT}" stroke-width="1.6"/>')
    return wrap(lifted("".join(out))
                + note(x1 + 46, (y0 + y1) / 2, ["where each of them", "needed to be"])
                + text(None, 330, 566, "five things I owned", 14, MUTED, "start"))


def blueprint() -> str:
    """55 agents mapped across operations, and the reality check two months on."""
    p = Plane(516, 318, 620, 440, 11, 5)
    out = []
    survived = {0, 1, 2, 5, 6, 11, 12, 13, 17, 22, 23, 24, 28, 33, 34, 39, 44, 45, 50}
    for k in range(55):
        r, c = divmod(k, 11)
        alive = k in survived
        out.append(f'<polygon class="c" points="{p.quad(c + 0.16, r + 0.16, c + 0.84, r + 0.84)}" '
                   f'fill="{BLUE}" style="--o:{0.9 if alive else 0.13};'
                   f'animation-delay:{k * 0.018:.2f}s"/>')
    nx, ny = p(11, 2.5)
    return wrap(lifted("".join(out))
                + note(nx + 30, ny, ["what was still running", "two months later"])
                + text(None, 240, 100, "55 agents mapped across operations", 14, MUTED, "start"))


def cms_pipeline() -> str:
    """A draft, the rules it has to pass, and the page that comes out."""
    p = Plane(516, 314, 730, 440, 3, 1)
    out = []
    out.append(slab(p, 0.05, 0.06, 0.92, 0.94, "#ffffff", 1, 0, RULE))
    for i, w in enumerate([0.62, 0.70, 0.55, 0.68, 0.44, 0.66, 0.38]):
        out.append(textline(p, 0.12, 0.12 + w * 0.9, 0.17 + i * 0.105, 0.045, 0.24, 0.1 + i * 0.04, cls="type"))
    out.append(slab(p, 1.06, 0.06, 1.93, 0.94, "#ffffff", 1, 0.5, RULE))
    checks = [True, True, False, True, True, False, True]
    for i, ok in enumerate(checks):
        v = 0.17 + i * 0.105
        col = ACCENT if ok else BLUE
        out.append(slab(p, 1.13, v - 0.03, 1.19, v + 0.03, col, 0.9 if ok else 0.22, 0.6 + i * 0.05, cls="pop"))
        out.append(textline(p, 1.23, 1.23 + (0.5 if ok else 0.34), v, 0.04, 0.22, 0.62 + i * 0.05, cls="type"))
    out.append(slab(p, 2.07, 0.06, 2.94, 0.94, "#ffffff", 1, 1.1, RULE))
    out.append(textline(p, 2.14, 2.72, 0.16, 0.055, 0.9, 1.2, BLUE, "rise"))
    for i, w in enumerate([0.68, 0.74, 0.60, 0.70, 0.46]):
        out.append(textline(p, 2.14, 2.14 + w, 0.28 + i * 0.088, 0.04, 0.22, 1.25 + i * 0.04, cls="rise"))
    nx, ny = p(1.93, 0.485)
    return wrap(lifted("".join(out))
                + note(nx + 26, ny, ["two rules it failed,", "so it went back"])
                + text(None, 178, 566, "draft", 14, MUTED, "start")
                + text(None, 480, 566, "the checks", 14, MUTED, "start")
                + text(None, 790, 566, "published", 14, MUTED, "start"))


def agent_platform() -> str:
    """Procedures are the asset. One tree of them, read by every agent."""
    p = Plane(516, 318, 620, 450, 1, 1)
    out = []
    proc = [(0.5, 0.10), (0.30, 0.26), (0.70, 0.26), (0.20, 0.42), (0.40, 0.42), (0.60, 0.42), (0.82, 0.42)]
    links = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
    for i, (a, b) in enumerate(links):
        x0, y0 = p(*proc[a])
        x1, y1 = p(*proc[b])
        out.append(f'<line class="c" x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
                   f'stroke="{BLUE}" stroke-width="1.3" style="--o:0.3;animation-delay:{i * 0.06:.2f}s"/>')
    for i, (u, v) in enumerate(proc):
        x, y = p(u, v)
        out.append(f'<circle class="c" cx="{x:.1f}" cy="{y:.1f}" r="{13 if i == 0 else 9}" '
                   f'fill="{BLUE}" style="--o:{0.95 if i == 0 else 0.7};animation-delay:{i * 0.06:.2f}s"/>')
    for k in range(9):
        u = 0.10 + k * 0.10
        x, y = p(u, 0.86)
        out.append(f'<polygon class="c" points="{p.quad(u - 0.033, 0.78, u + 0.033, 0.92)}" '
                   f'fill="{BLUE}" style="--o:0.5;animation-delay:{0.6 + k * 0.05:.2f}s"/>')
        for src in (3, 4, 5, 6):
            if k % 4 != (src - 3):
                continue
            sx, sy = p(*proc[src])
            out.append(f'<line class="c" x1="{sx:.1f}" y1="{sy:.1f}" x2="{x:.1f}" y2="{y - 16:.1f}" '
                       f'stroke="{BLUE}" stroke-width="1" style="--o:0.16;animation-delay:0.9s"/>')
    nx, ny = p(0.5, 0.10)
    return wrap(lifted("".join(out))
                + note(nx + 40, ny, ["the procedure, written", "once, in a file"])
                + text(None, 180, 566, "nine agents, one set of procedures", 14, MUTED, "start"))


def seo_history() -> str:
    """Four eras of how the words got written."""
    p = Plane(516, 322, 640, 400, 4, 1)
    eras = [("by hand", 0.12), ("by template", 0.30), ("by model", 0.72), ("by model, checked", 0.95)]
    out = []
    for i, (name, v) in enumerate(eras):
        last = i == len(eras) - 1
        out.append(f'<polygon class="c" points="{p.quad(i + 0.18, 1 - v, i + 0.82, 1.0)}" '
                   f'fill="{ACCENT if last else BLUE}" style="--o:{1 if last else 0.35 + i * 0.2:.2f};'
                   f'animation-delay:{i * 0.13:.2f}s"/>')
        lx, ly = p(i + 0.5, 1.0)
        out.append(text(None, lx, ly + 26, name, 14, MUTED))
    x0, y0 = p(0, 1.0)
    x1, y1 = p(4, 1.0)
    out.insert(0, f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{RULE}"/>')
    nx, ny = p(3.82, 0.05)
    return wrap(lifted("".join(out))
                + note(nx + 30, ny, ["volume was never", "the hard part"])
                + text(None, 190, 100, "words published per week", 14, MUTED, "start"))


def less_agentic() -> str:
    """Freedom against reliability. The useful place is not the far end."""
    p = Plane(516, 320, 620, 420, 1, 1)
    pts = [(x / 40, 1 - (0.15 + 1.55 * (x / 40) * math.exp(-2.6 * (x / 40)))) for x in range(41)]
    out = [f'<path class="draw" d="{p.path(pts)}" fill="none" stroke="{BLUE}" stroke-width="2.6" '
           f'style="--len:900"/>']
    x0, y0 = p(0, 1)
    x1, y1 = p(1, 1)
    xt, yt = p(0, 0)
    out.insert(0, f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{RULE}"/>'
                  f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{xt:.1f}" y2="{yt:.1f}" stroke="{RULE}"/>')
    peak = min(pts, key=lambda q: q[1])
    px, py = p(*peak)
    out.append(f'<circle class="c" cx="{px:.1f}" cy="{py:.1f}" r="7" fill="{ACCENT}" style="--o:1"/>')
    return wrap(lifted("".join(out))
                + note(px + 52, py - 6, ["as much freedom as", "it can be trusted with"])
                + text(None, 190, 100, "how well it works in production", 14, MUTED, "start")
                + text(None, 790, 566, "how much the agent decides", 14, MUTED, "start"))


def series_search_engine() -> str:
    """The series in one picture: the thing being rebuilt, a search page."""
    p = Plane(516, 314, 700, 460, 1, 1)
    out = [slab(p, 0.02, 0.02, 0.98, 0.98, "#ffffff", 1, 0, RULE)]
    out.append(searchbox(p, 0.08, 0.92, 0.16, 0.46, 0.15))
    for i in range(3):
        out.append(result(p, 0.08, 0.34 + i * 0.22, 0.66, 0.45 + i * 0.14))
    nx, ny = p(0.74, 0.39)
    return wrap(lifted("".join(out))
                + note(nx + 40, ny, ["nine parts, from the", "crawler to this page"]))


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
    "the-chinese-ai-wisdom": chinese_wisdom,
    "liu-xiaopai-and-chinese-vibe-code-rush": vibe_code_rush,
    "agentic-keyword-clustering": keyword_clustering,
    "why-our-ai-team-failed": team_failed,
    "an-artifact-driven-ai-initiative-blueprint": blueprint,
    "a-cms-adaptable-llm-pipeline-for-seo-compliant-content-publishing": cms_pipeline,
    "an-agent-platform-on-the-claude-agent-sdk": agent_platform,
    "a-brief-history-of-seo-content-writing-with-ai": seo_history,
    "the-less-agentic-agents-are-in-production-the-better": less_agentic,
    # The series page hardcodes /covers/series-<slug>.svg, prefix and all.
    "series-building-a-mini-search-engine": series_search_engine,
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
