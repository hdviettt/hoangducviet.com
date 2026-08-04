"""Cover and carousel slides for `a-brief-history-of-seo-content-writing-with-ai`.

The post is about four architectures for one job, so every drawing here is one
of those architectures rather than a chart about them. The cover puts all four topologies side by side so the
shape can be seen changing; the carousel gives each one its own frame at a size
where the wiring is readable.

    python scripts/make-seo-history-visuals.py            # everything
    python scripts/make-seo-history-visuals.py arch-1-chain

Nothing here depends on production numbers, deliberately: the two figures that
would need them (the fine-tune trade, the machine-cost table) are not drawn,
because a chart with invented values is worse than no chart.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from figure import (  # noqa: E402
    ACCENT, ACCENT_TEXT, BLUE, H, INK, MUTED, RULE, W,
    Plane, emit, lifted, slab, text, wrap,
)

ROOT = Path(__file__).resolve().parent.parent
COVERS = ROOT / "public" / "covers"
SLIDES = ROOT / "public" / "figures" / "seo-history"


# ------------------------------------------------------------------ pieces
#
# A node is the unit every one of these architectures is built from: a labelled
# box that either holds a model or does not. Whether it holds one is the whole
# argument of the post, so it is the one thing the drawing distinguishes.

def node(p: Plane, u0, v0, u1, v1, label=None, model=False, delay=0.0,
         size=13, cls="rise"):
    """A box on the canvas. Filled means a model call happens inside it."""
    fill = BLUE if model else "#ffffff"
    out = [slab(p, u0, v0, u1, v1, fill, 1, delay, None if model else RULE, cls=cls)]
    if label:
        out.append(text(p, (u0 + u1) / 2, (v0 + v1) / 2 + 0.012, label, size,
                        "#ffffff" if model else MUTED, weight="500"))
    return "".join(out)


def arrow(p: Plane, a, b, delay=0.0, o=0.5):
    """A connector with a head, so direction reads without a legend."""
    x0, y0 = p(*a)
    x1, y1 = p(*b)
    dx, dy = x1 - x0, y1 - y0
    n = max((dx * dx + dy * dy) ** 0.5, 1e-6)
    ux, uy = dx / n, dy / n
    hx, hy = x1 - ux * 9, y1 - uy * 9
    px, py = -uy * 4.5, ux * 4.5
    return (f'<g class="c" style="--o:{o};animation-delay:{delay:.2f}s">'
            f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{hx:.1f}" y2="{hy:.1f}" '
            f'stroke="{BLUE}" stroke-width="1.6"/>'
            f'<polygon points="{x1:.1f},{y1:.1f} {hx + px:.1f},{hy + py:.1f} '
            f'{hx - px:.1f},{hy - py:.1f}" fill="{BLUE}"/></g>')


def loop_arc(p: Plane, u0, u1, v, height=0.075, delay=0.0, o=0.55):
    """The return edge that makes an agent an agent: output back to input."""
    x0, y0 = p(u0, v)
    x1, y1 = p(u1, v)
    xm, ym = p((u0 + u1) / 2, v - height)
    return (f'<g class="c" style="--o:{o};animation-delay:{delay:.2f}s">'
            f'<path d="M{x1:.1f} {y1:.1f} Q{xm:.1f} {ym:.1f} {x0:.1f} {y0:.1f}" '
            f'fill="none" stroke="{BLUE}" stroke-width="1.6"/>'
            f'<polygon points="{x0:.1f},{y0:.1f} {x0 + 9:.1f},{y0 - 5:.1f} '
            f'{x0 + 9:.1f},{y0 + 5:.1f}" fill="{BLUE}"/></g>')


# -------------------------------------------------------------------- cover
#
# Two earlier versions of this cover failed in ways worth keeping a note of.
# Four architectures drawn as labelled boxes came out as rows of rectangles
# that said nothing. Four execution traces came out as a waveform: they showed
# how long and how busy, which is not what an archetype is. An archetype is a
# topology, so this draws the topologies.

PANELS = ("n8n chain", "fine-tuned", "reasoning agent", "app + rail")

COVER_DEFS = f"""  <defs>
    <linearGradient id="plate" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.94"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.40"/>
    </linearGradient>
    <linearGradient id="head" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{BLUE}"/>
      <stop offset="1" stop-color="#2f6bf6"/>
    </linearGradient>
    <linearGradient id="chip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a72f4"/>
      <stop offset="1" stop-color="{BLUE}"/>
    </linearGradient>
    <linearGradient id="loss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{BLUE}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="{BLUE}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="7" stdDeviation="10" flood-color="#0b1a3a" flood-opacity="0.14"/>
    </filter>
  </defs>
"""


def cover():
    """The four architectures drawn as the screens they actually were.

    A graph of an n8n workflow is not what an n8n workflow looks like, so panel
    one is the canvas: dot grid, named nodes with ports, bezier connectors, and
    a vector store hanging under the writer the way a sub-node does. Panel two
    is a training run, because that is what a fine-tune looks like: pairs going
    in on the left, loss coming down on the right. Panel three is the agent
    transcript, and the loop is shown by the same two steps appearing again
    rather than by an arrow nobody can read. Panel four is the application, with
    articles and their status, and the agent in a rail beside them.

    The text is placeholder but it is the shape of the real thing, so a reader
    can tell what each screen is without the caption.
    """
    p = Plane(600, 318, 1092, 400, umax=4, vmax=1)
    m = []

    def L(j, lx, ly):
        return j + 0.06 + lx * 0.88, 0.10 + ly * 0.76

    def XY(j, lx, ly):
        return p(*L(j, lx, ly))

    def rect(j, a, b, c, d, fill=None, o=1.0, delay=0.0, stroke=None, cls="rise"):
        u0, v0 = L(j, a, b)
        u1, v1 = L(j, c, d)
        return slab(p, u0, v0, u1, v1, fill, o, delay, stroke, cls)

    def t(j, lx, ly, s, size=9.5, fill=MUTED, anchor="start", weight="400"):
        u, v = L(j, lx, ly)
        return text(p, u, v, s, size, fill, anchor, weight)

    def circ(j, lx, ly, r, fill, o=1.0, delay=0.0):
        x, y = XY(j, lx, ly)
        return (f'<circle class="pop" cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" '
                f'style="--o:{o};animation-delay:{delay:.2f}s"/>')

    def bez(j, a, b, delay=0.0, o=0.55, w=1.7):
        x0, y0 = XY(j, *a)
        x1, y1 = XY(j, *b)
        k = max(abs(x1 - x0) * 0.55, 16)
        return (f'<path class="c" d="M{x0:.1f} {y0:.1f} C{x0 + k:.1f} {y0:.1f} '
                f'{x1 - k:.1f} {y1:.1f} {x1:.1f} {y1:.1f}" fill="none" stroke="{BLUE}" '
                f'stroke-opacity="0.42" stroke-width="{w}" '
                f'style="--o:{o};animation-delay:{delay:.2f}s"/>')

    def plate(j, d=0.0):
        pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in
                       (XY(j, -0.05, -0.06), XY(j, 1.05, -0.06),
                        XY(j, 1.05, 1.06), XY(j, -0.05, 1.06)))
        return (f'<polygon class="rise" points="{pts}" fill="url(#plate)" '
                f'filter="url(#soft)" style="--o:1;animation-delay:{d:.2f}s"/>')

    def n8n_node(j, lx, ly, name, w=0.30, h=0.20, model=True, delay=0.0):
        out = [rect(j, lx, ly, lx + w, ly + h, "#ffffff", 1, delay, RULE),
               rect(j, lx + 0.035, ly + 0.05, lx + 0.10, ly + h - 0.05,
                    BLUE if model else MUTED, 0.92 if model else 0.42, delay + 0.02),
               t(j, lx + 0.125, ly + 0.095, name, 9.5, INK, weight="500"),
               rect(j, lx + 0.125, ly + 0.125, lx + w - 0.05, ly + 0.15,
                    MUTED, 0.22, delay + 0.04),
               circ(j, lx, ly + h / 2, 3.4, "#ffffff", 1, delay + 0.02),
               circ(j, lx + w, ly + h / 2, 3.4, BLUE, 0.75, delay + 0.02)]
        return "".join(out)

    def grid(j, delay=0.0):
        out = []
        for r in range(7):
            for c in range(9):
                out.append(circ(j, 0.045 + c * 0.115, 0.05 + r * 0.152, 1.2,
                                MUTED, 0.28, delay))
        return "".join(out)

    for j in range(4):
        m.append(plate(j, 0.24 * j))

    # 1. The canvas.
    m.append(grid(0, 0.04))
    xs = (0.00, 0.35, 0.70)
    for i, (lx, name) in enumerate(zip(xs, ("Outline", "Write", "Review"))):
        m.append(n8n_node(0, lx, 0.22, name, delay=0.08 + 0.06 * i))
        if i:
            m.append(bez(0, (xs[i - 1] + 0.30, 0.32), (lx, 0.32), 0.10 + 0.06 * i))
    m.append(n8n_node(0, 0.30, 0.64, "Vector Store", 0.40, 0.20, False, 0.30))
    m.append(bez(0, (0.50, 0.64), (0.50, 0.42), 0.34, 0.5, 1.5))

    # 2. A training run: pairs on the left, loss coming down on the right.
    m.append(rect(1, 0.00, 0.02, 1.00, 0.98, "#ffffff", 1, 0.30, RULE))
    m.append(t(1, 0.05, 0.115, "seongon_travel", 9.5, INK, weight="600"))
    for r in range(6):
        y = 0.17 + r * 0.088
        m.append(rect(1, 0.05, y, 0.05 + (0.17, 0.20, 0.15, 0.19, 0.16, 0.18)[r],
                      y + 0.038, BLUE, 0.55, 0.34 + 0.03 * r, cls="type"))
        m.append(rect(1, 0.245, y, 0.245 + (0.17, 0.14, 0.19, 0.15, 0.18, 0.16)[r],
                      y + 0.038, MUTED, 0.24, 0.35 + 0.03 * r, cls="type"))
    m.append(t(1, 0.05, 0.79, "528 pairs · vi", 9.5, INK, weight="500"))

    m.append(rect(1, 0.50, 0.13, 0.97, 0.66, "#fbfcff", 1, 0.52, RULE))
    m.append(t(1, 0.525, 0.215, "training loss", 9.5, MUTED))
    pts = [XY(1, 0.535 + (k / 18) * 0.41, 0.30 + 0.30 * (1 - (1 - k / 18) ** 2.4))
           for k in range(19)]
    area = ("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) +
            f' L{XY(1, 0.945, 0.62)[0]:.1f} {XY(1, 0.945, 0.62)[1]:.1f}'
            f' L{XY(1, 0.535, 0.62)[0]:.1f} {XY(1, 0.535, 0.62)[1]:.1f} Z')
    m.append(f'<path class="c" d="{area}" fill="url(#loss)" '
             'style="--o:1;animation-delay:0.60s"/>')
    m.append('<path class="draw" d="M' + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) +
             f'" fill="none" stroke="{BLUE}" stroke-width="2.2" opacity="0.9" '
             'style="--len:340;animation-delay:0.58s"/>')
    m.append(rect(1, 0.535, 0.618, 0.945, 0.622, RULE, 0.9, 0.56))
    m.append(t(1, 0.50, 0.735, "steps", 9.5, MUTED))
    m.append(t(1, 0.97, 0.735, "loss", 9.5, MUTED, "end"))
    m.append(t(1, 0.50, 0.83, "Mistral 24B · Unsloth + TRL", 9, MUTED))

    # 3. The transcript. The loop shows as the same two steps coming round again.
    m.append(rect(2, 0.00, 0.02, 1.00, 0.98, "#ffffff", 1, 0.52, RULE))
    m.append(f'<ellipse class="c" cx="{XY(2, 0.5, 0.52)[0]:.1f}" '
             f'cy="{XY(2, 0.5, 0.52)[1]:.1f}" rx="112" ry="92" fill="url(#halo)" '
             'style="--o:1;animation-delay:0.56s"/>')
    log = [(0.00, "brief: 1,000 words max", False),
           (0.06, "search(brand_guide)", True),
           (0.00, "outline expands to 900", False),
           (0.06, "trim_outline()", True),
           (0.00, "section 3 now missing", False),
           (0.06, "trim_outline()", True)]
    for k, (ind, label, tool) in enumerate(log):
        y = 0.11 + k * 0.128
        if tool:
            w = 0.30 + 0.012 * len(label)
            m.append(rect(2, 0.06 + ind, y, 0.06 + ind + w, y + 0.086,
                          "url(#chip)", 1, 0.58 + 0.05 * k, cls="type"))
            m.append(t(2, 0.085 + ind, y + 0.062, label, 9, "#ffffff", weight="500"))
        else:
            m.append(rect(2, 0.06 + ind, y + 0.008, 0.075 + ind, y + 0.078,
                          MUTED, 0.30, 0.58 + 0.05 * k, cls="type"))
            m.append(t(2, 0.095 + ind, y + 0.062, label, 9, MUTED))
    m.append(rect(2, 0.63, 0.755, 0.94, 0.845, "#ffffff", 1, 0.94, BLUE, cls="pop"))
    m.append(t(2, 0.785, 0.812, "↺  retry × 7", 9.5, BLUE, "middle", "600"))

    # 4. The application, and the agent in the rail beside it.
    m.append(rect(3, 0.00, 0.02, 1.00, 0.98, "#ffffff", 1, 0.76, RULE))
    m.append(rect(3, 0.00, 0.02, 1.00, 0.115, "url(#head)", 1, 0.78))
    m.append(t(3, 0.045, 0.085, "Articles", 9.5, "#ffffff", weight="600"))
    titles = (("Best CRM for SMEs", "Draft", False), ("How to pick a POS", "Review", True),
              ("SEO audit checklist", "Draft", False), ("Landing page tips", "Live", True),
              ("Email flows 101", "Draft", False))
    for r, (title, status, hot) in enumerate(titles):
        y = 0.175 + r * 0.155
        m.append(t(3, 0.045, y + 0.045, title, 9, INK))
        m.append(rect(3, 0.395, y + 0.006, 0.545, y + 0.058,
                      "url(#chip)" if hot else MUTED, 1 if hot else 0.20,
                      0.82 + 0.04 * r, cls="rise"))
        m.append(t(3, 0.47, y + 0.046, status, 8.5, "#ffffff" if hot else MUTED,
                   "middle", "500"))
        m.append(rect(3, 0.00, y + 0.104, 0.60, y + 0.107, RULE, 0.8, 0.82 + 0.04 * r))
    m.append(rect(3, 0.60, 0.115, 0.603, 0.98, RULE, 0.9, 1.02))
    m.append(rect(3, 0.635, 0.175, 0.955, 0.285, "url(#chip)", 1, 1.06, cls="rise"))
    m.append(t(3, 0.795, 0.245, "rewrite the intro", 8.5, "#ffffff", "middle"))
    m.append(rect(3, 0.635, 0.335, 0.92, 0.475, MUTED, 0.18, 1.12, cls="rise"))
    m.append(t(3, 0.66, 0.395, "done. 940 words,", 8.5, MUTED))
    m.append(t(3, 0.66, 0.448, "intro rewritten.", 8.5, MUTED))
    m.append(rect(3, 0.635, 0.83, 0.955, 0.925, "#ffffff", 1, 1.20, RULE, cls="rise"))
    m.append(t(3, 0.66, 0.893, "ask the agent…", 8.5, MUTED))

    for j, label in enumerate(PANELS):
        u, _ = L(j, 0.5, 0)
        m.append(text(p, u, 1.03, label, 15, MUTED))

    return wrap(COVER_DEFS + lifted("".join(m)))


# ------------------------------------------------------------------ slides
#
# A slide has the whole canvas, so it carries what a cover panel cannot: node
# subtitles, column headers, tool arguments, axis ticks, counters. Same
# components as the cover, drawn at a size where the detail is readable.

SLIDE_DEFS = COVER_DEFS


def kit(p):
    """Drawing helpers in 0..1 surface coordinates."""

    def rect(a, b, c, d, fill=None, o=1.0, delay=0.0, stroke=None, cls="rise"):
        return slab(p, a, b, c, d, fill, o, delay, stroke, cls)

    def t(x, y, s, size=13, fill=MUTED, anchor="start", weight="400"):
        return text(p, x, y, s, size, fill, anchor, weight)

    def circ(x, y, r, fill, o=1.0, delay=0.0):
        cx, cy = p(x, y)
        return (f'<circle class="pop" cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}" '
                f'style="--o:{o};animation-delay:{delay:.2f}s"/>')

    def bez(a, b, delay=0.0, o=0.55, w=2.0):
        x0, y0 = p(*a)
        x1, y1 = p(*b)
        k = max(abs(x1 - x0) * 0.55, 26)
        return (f'<path class="c" d="M{x0:.1f} {y0:.1f} C{x0 + k:.1f} {y0:.1f} '
                f'{x1 - k:.1f} {y1:.1f} {x1:.1f} {y1:.1f}" fill="none" stroke="{BLUE}" '
                f'stroke-opacity="0.45" stroke-width="{w}" '
                f'style="--o:{o};animation-delay:{delay:.2f}s"/>')

    return rect, t, circ, bez


def arch_1_chain():
    """The n8n canvas, with the names and the sub-nodes it actually carries."""
    p = Plane(600, 326, 1020, 470, umax=1, vmax=1)
    rect, t, circ, bez = kit(p)
    m = [f'<rect x="0" y="0" width="{W}" height="{H}" fill="none"/>']

    for r in range(9):
        for c in range(15):
            m.append(circ(0.035 + c * 0.0665, 0.05 + r * 0.108, 1.6, MUTED, 0.26, 0.02))

    def node(x, y, name, sub, w=0.20, h=0.145, model=True, delay=0.0):
        out = [rect(x, y, x + w, y + h, "#ffffff", 1, delay, RULE),
               rect(x + 0.018, y + 0.028, x + 0.055, y + h - 0.028,
                    BLUE if model else MUTED, 0.92 if model else 0.42, delay + 0.02),
               t(x + 0.072, y + 0.062, name, 14, INK, weight="600"),
               t(x + 0.072, y + 0.104, sub, 11.5, MUTED),
               circ(x, y + h / 2, 5.0, "#ffffff", 1, delay + 0.02),
               circ(x + w, y + h / 2, 5.0, BLUE, 0.8, delay + 0.02)]
        return "".join(out)

    m.append(rect(0.02, 0.05, 0.20, 0.115, "#ffffff", 1, 0.02, RULE, cls="rise"))
    m.append(t(0.036, 0.093, "seo-article-v3", 12.5, MUTED))
    m.append(circ(0.185, 0.082, 4.0, ACCENT, 1, 0.04))

    m.append(rect(0.02, 0.30, 0.115, 0.435, "#ffffff", 1, 0.06, RULE))
    m.append(t(0.0675, 0.352, "▶", 15, BLUE, "middle"))
    m.append(t(0.0675, 0.398, "brief added", 11, MUTED, "middle"))
    m.append(circ(0.115, 0.3675, 5.0, BLUE, 0.8, 0.08))

    xs = ((0.175, "Outline", "Agent"), (0.445, "Write", "Agent"), (0.715, "Review", "Agent"))
    for i, (x, name, sub) in enumerate(xs):
        m.append(node(x, 0.295, name, sub, delay=0.12 + 0.08 * i))
        prev = 0.115 if i == 0 else xs[i - 1][0] + 0.20
        m.append(bez((prev, 0.3675), (x, 0.3675), 0.14 + 0.08 * i))

    m.append(node(0.395, 0.66, "Supabase", "Vector Store", 0.20, 0.145, False, 0.38))
    m.append(f'<line class="c" x1="{p(0.495, 0.66)[0]:.1f}" y1="{p(0.495, 0.66)[1]:.1f}" x2="{p(0.495, 0.445)[0]:.1f}" y2="{p(0.495, 0.445)[1]:.1f}" stroke="{BLUE}" stroke-opacity="0.45" stroke-width="1.8" style="--o:0.5;animation-delay:0.42s"/>')
    m.append(t(0.512, 0.575, "retrieval", 11.5, ACCENT_TEXT))

    m.append(node(0.135, 0.66, "Drive", "hash diff", 0.20, 0.145, False, 0.34))
    m.append(bez((0.335, 0.7325), (0.395, 0.7325), 0.40, 0.5, 1.8))

    m.append(t(0.935, 0.3675, "→ CMS", 13, MUTED))
    m.append(t(0.50, 0.955, "code holds the control flow; a model runs at three points",
               13.5, MUTED, "middle"))
    return wrap(SLIDE_DEFS + lifted("".join(m)))


def arch_2_finetune():
    """What a fine-tune looks like: the pairs going in and the loss coming down."""
    p = Plane(600, 326, 1020, 470, umax=1, vmax=1)
    rect, t, circ, bez = kit(p)
    m = []

    m.append(rect(0.02, 0.06, 0.46, 0.90, "#ffffff", 1, 0.02, RULE))
    m.append(rect(0.02, 0.06, 0.46, 0.145, "#f6f8fd", 1, 0.03))
    m.append(t(0.04, 0.118, "seongon_travel", 13, INK, weight="600"))
    m.append(t(0.44, 0.118, "528 rows", 12, MUTED, "end"))
    for r in range(9):
        y = 0.185 + r * 0.075
        m.append(t(0.038, y + 0.030, f"{r + 1:>3}", 10.5, MUTED))
        m.append(rect(0.072, y, 0.112, y + 0.036, MUTED, 0.42, 0.05 + 0.03 * r,
                      cls="type"))
        m.append(rect(0.128, y, 0.128 + (0.075, 0.095, 0.065, 0.088, 0.070, 0.082,
                                         0.060, 0.092, 0.074)[r], y + 0.036,
                      BLUE, 0.55, 0.06 + 0.03 * r, cls="type"))
        m.append(rect(0.245, y, 0.245 + (0.15, 0.12, 0.17, 0.13, 0.16, 0.11, 0.155,
                                         0.12, 0.14)[r], y + 0.036,
                      MUTED, 0.24, 0.07 + 0.03 * r, cls="type"))
    m.append(t(0.092, 0.885, "system", 11, ACCENT_TEXT, "middle"))
    m.append(t(0.168, 0.885, "brief", 11, ACCENT_TEXT, "middle"))
    m.append(t(0.315, 0.885, "what shipped", 11, ACCENT_TEXT, "middle"))

    m.append(rect(0.50, 0.06, 0.98, 0.90, "#ffffff", 1, 0.10, RULE))
    m.append(rect(0.50, 0.06, 0.98, 0.145, "#f6f8fd", 1, 0.11))
    m.append(t(0.52, 0.118, "training run", 13, INK, weight="600"))
    m.append(t(0.96, 0.118, "Vietnamese · travel", 12, MUTED, "end"))

    # No tick values. The model card publishes no loss numbers and inventing a
    # scale for a post about honest measurement would be the wrong kind of joke.
    for k in range(4):
        y = 0.225 + k * 0.115
        m.append(rect(0.575, y, 0.945, y + 0.003, RULE, 0.8, 0.14))
    pts = [p(0.582 + (k / 22) * 0.355, 0.225 + 0.395 * (1 - (1 - k / 22) ** 2.6))
           for k in range(23)]
    area = ("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) +
            f' L{p(0.937, 0.665)[0]:.1f} {p(0.937, 0.665)[1]:.1f}'
            f' L{p(0.582, 0.665)[0]:.1f} {p(0.582, 0.665)[1]:.1f} Z')
    m.append(f'<path class="c" d="{area}" fill="url(#loss)" style="--o:1;animation-delay:0.24s"/>')
    m.append('<path class="draw" d="M' + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) +
             f'" fill="none" stroke="{BLUE}" stroke-width="2.6" opacity="0.9" '
             'style="--len:520;animation-delay:0.20s"/>')
    m.append(rect(0.575, 0.665, 0.945, 0.669, RULE, 0.9, 0.16))
    m.append(t(0.76, 0.712, "steps", 11, MUTED, "middle"))
    m.append(t(0.52, 0.60, "loss", 11.5, MUTED))

    for k, (a, b) in enumerate((("base", "Mistral 24B"), ("stack", "Unsloth + TRL"),
                                ("rows", "528"), ("lang", "vi"))):
        x = 0.52 + k * 0.115
        m.append(rect(x, 0.775, x + 0.10, 0.855, "#f6f8fd", 1, 0.30 + 0.03 * k, RULE))
        m.append(t(x + 0.05, 0.808, a, 10, MUTED, "middle"))
        m.append(t(x + 0.05, 0.840, b, 11.5, INK, "middle", "600"))

    m.append(t(0.50, 0.955, "the target is not what the model wrote, "
               "it is what a human was willing to publish", 13.5, MUTED, "middle"))
    return wrap(SLIDE_DEFS + lifted("".join(m)))


def arch_3_agent():
    """The transcript. The loop is two steps arriving again, not an arrow."""
    p = Plane(600, 326, 1020, 470, umax=1, vmax=1)
    rect, t, circ, bez = kit(p)
    m = []

    m.append(rect(0.10, 0.05, 0.90, 0.90, "#ffffff", 1, 0.02, RULE))
    m.append(rect(0.10, 0.05, 0.90, 0.135, "#f6f8fd", 1, 0.03))
    m.append(t(0.12, 0.108, "run 4f2a", 13, INK, weight="600"))
    m.append(t(0.235, 0.108, "claude agent sdk", 12, MUTED))
    m.append(t(0.88, 0.108, "18.4s", 12, MUTED, "end"))

    log = (("reason", "the brief caps the article at 1,000 words", 0.00, "84"),
           ("act", "search(brand_guide, \"tone\")", 0.03, "1.2k"),
           ("observe", "3 passages returned", 0.06, "310"),
           ("reason", "the approved outline expands to 900", 0.00, "96"),
           ("act", "trim_outline(target=850)", 0.03, "540"),
           ("observe", "section 3 is now missing", 0.06, "128"),
           ("act", "trim_outline(target=850)", 0.03, "540"))
    for k, (role, body, ind, tok) in enumerate(log):
        y = 0.175 + k * 0.098
        m.append(t(0.125, y + 0.048, f"{k + 1:>2}", 10.5, MUTED))
        if role == "act":
            w = 0.022 * len(body) * 0.62 + 0.06
            m.append(rect(0.16 + ind, y, 0.16 + ind + w, y + 0.068,
                          "url(#chip)", 1, 0.06 + 0.05 * k, cls="type"))
            m.append(t(0.175 + ind, y + 0.047, body, 12, "#ffffff", weight="500"))
        else:
            m.append(rect(0.16 + ind, y + 0.008, 0.1645 + ind, y + 0.060,
                          MUTED, 0.35, 0.06 + 0.05 * k, cls="type"))
            m.append(t(0.176 + ind, y + 0.047, body, 12,
                       INK if role == "reason" else MUTED))
        m.append(t(0.145, y + 0.047, "", 10))
        m.append(t(0.875, y + 0.047, tok, 10.5, MUTED, "end"))

    ry0, ry1 = 0.175 + 4 * 0.098, 0.175 + 7 * 0.098
    x0, y0 = p(0.905, ry0)
    x1, y1 = p(0.905, ry1)
    m.append(f'<g class="c" style="--o:0.75;animation-delay:0.52s">'
             f'<path d="M{x0:.1f} {y0:.1f} h14 V{y1:.1f} h-14" fill="none" '
             f'stroke="{BLUE}" stroke-opacity="0.6" stroke-width="1.8"/></g>')
    bx, by = p(0.925, (ry0 + ry1) / 2)
    m.append(f'<g class="mark"><rect x="{bx + 6:.0f}" y="{by - 15:.0f}" width="86" '
             f'height="30" rx="15" fill="#ffffff" stroke="{BLUE}" stroke-width="1.4"/>'
             f'<text x="{bx + 49:.0f}" y="{by + 5:.0f}" font-size="13" fill="{BLUE}" '
             f'text-anchor="middle" font-weight="600">↺ × 7</text></g>')

    m.append(t(0.50, 0.955, "the same two steps arrive again; "
               "the rule had a tolerance nobody wrote down", 13.5, MUTED, "middle"))
    return wrap(SLIDE_DEFS + lifted("".join(m)))


def arch_4_hybrid():
    """The application that shipped, with the conversation moved to a rail."""
    p = Plane(600, 326, 1020, 470, umax=1, vmax=1)
    rect, t, circ, bez = kit(p)
    m = []

    m.append(rect(0.02, 0.05, 0.98, 0.90, "#ffffff", 1, 0.02, RULE))
    m.append(rect(0.02, 0.05, 0.98, 0.135, "url(#head)", 1, 0.03))
    m.append(t(0.042, 0.108, "Articles", 14, "#ffffff", weight="600"))
    for k in range(3):
        m.append(circ(0.94 + k * 0.017, 0.0925, 3.2, "#ffffff", 0.7, 0.05))

    m.append(rect(0.02, 0.135, 0.155, 0.90, "#fafbfe", 1, 0.05))
    for k, nav in enumerate(("Queue", "Briefs", "Published", "Settings")):
        m.append(t(0.042, 0.215 + k * 0.088, nav, 12,
                   INK if k == 0 else MUTED, weight="600" if k == 0 else "400"))
    m.append(rect(0.02, 0.185, 0.024, 0.235, BLUE, 1, 0.06))

    cols = ((0.175, "Title"), (0.475, "Owner"), (0.585, "Status"), (0.685, "Words"))
    for x, lab in cols:
        m.append(t(x, 0.195, lab, 11, MUTED, weight="600"))
    m.append(rect(0.155, 0.215, 0.735, 0.218, RULE, 0.9, 0.07))

    rows = (("Best CRM for SMEs", "Linh", "Draft", "820", False),
            ("How to pick a POS", "Minh", "Review", "1,040", True),
            ("SEO audit checklist", "Linh", "Draft", "610", False),
            ("Landing page tips", "An", "Live", "980", True),
            ("Email flows 101", "Minh", "Draft", "740", False),
            ("Choosing a helpdesk", "An", "Draft", "560", False))
    for r, (title, owner, status, words, hot) in enumerate(rows):
        y = 0.245 + r * 0.104
        m.append(t(0.175, y + 0.052, title, 12.5, INK))
        m.append(t(0.475, y + 0.052, owner, 12, MUTED))
        m.append(rect(0.585, y + 0.014, 0.665, y + 0.070,
                      "url(#chip)" if hot else "#eef1f7", 1, 0.08 + 0.04 * r, cls="rise"))
        m.append(t(0.625, y + 0.053, status, 11, "#ffffff" if hot else MUTED,
                   "middle", "500"))
        m.append(t(0.720, y + 0.052, words, 12, MUTED, "end"))
        m.append(rect(0.155, y + 0.088, 0.735, y + 0.090, RULE, 0.7, 0.08 + 0.04 * r))

    m.append(rect(0.735, 0.135, 0.738, 0.90, RULE, 0.9, 0.34))
    m.append(t(0.755, 0.195, "Agent", 12, MUTED, weight="600"))
    m.append(rect(0.795, 0.225, 0.96, 0.305, "url(#chip)", 1, 0.38, cls="rise"))
    m.append(t(0.9375, 0.272, "rewrite the intro", 11.5, "#ffffff", "end"))
    m.append(rect(0.755, 0.335, 0.945, 0.465, "#f2f4f9", 1, 0.44, cls="rise"))
    m.append(t(0.772, 0.385, "done. 940 words, and the", 11.5, MUTED))
    m.append(t(0.772, 0.428, "intro leads with the price.", 11.5, MUTED))
    m.append(rect(0.815, 0.495, 0.96, 0.575, "url(#chip)", 1, 0.50, cls="rise"))
    m.append(t(0.9375, 0.542, "set it to Review", 11.5, "#ffffff", "end"))
    m.append(rect(0.755, 0.605, 0.90, 0.685, "#f2f4f9", 1, 0.56, cls="rise"))
    m.append(t(0.772, 0.652, "row 2 updated.", 11.5, MUTED))
    m.append(rect(0.755, 0.79, 0.96, 0.865, "#ffffff", 1, 0.62, RULE, cls="rise"))
    m.append(t(0.772, 0.838, "ask the agent…", 11.5, MUTED))

    x0, y0 = p(0.752, 0.545)
    x1, y1 = p(0.672, 0.383)
    m.append(f'<g class="c" style="--o:0.7;animation-delay:0.66s">'
             f'<path d="M{x0:.1f} {y0:.1f} C{x0 - 34:.1f} {y0:.1f} {x1 + 30:.1f} '
             f'{y1:.1f} {x1:.1f} {y1:.1f}" fill="none" stroke="{ACCENT_TEXT}" '
             f'stroke-width="1.6"/>'
             f'<polygon points="{x1:.1f},{y1:.1f} {x1 + 9:.1f},{y1 - 4:.1f} '
             f'{x1 + 8:.1f},{y1 + 6:.1f}" fill="{ACCENT_TEXT}"/></g>')

    m.append(t(0.50, 0.955, "the application holds the state; "
               "the conversation moved to a rail beside it", 13.5, MUTED, "middle"))
    return wrap(SLIDE_DEFS + lifted("".join(m)))


FIGURES = {"a-brief-history-of-seo-content-writing-with-ai": cover}
SLIDE_FIGURES = {
    "arch-1-chain": arch_1_chain,
    "arch-2-finetune": arch_2_finetune,
    "arch-3-agent": arch_3_agent,
    "arch-4-hybrid": arch_4_hybrid,
}


if __name__ == "__main__":
    argv = sys.argv[1:]
    cov = [s for s in argv if s in FIGURES] or (list(FIGURES) if not argv else [])
    sld = [s for s in argv if s in SLIDE_FIGURES] or (list(SLIDE_FIGURES) if not argv else [])
    rc = emit(FIGURES, COVERS, cov) if cov else 0
    rc = emit(SLIDE_FIGURES, SLIDES, sld) or rc if sld else rc
    sys.exit(rc)
