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
    ACCENT, ACCENT_TEXT, BLUE, INK, MUTED, RULE,
    Plane, connect, dot, emit, lifted, note, slab, text, textline, window, wrap,
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
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="{BLUE}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="7" stdDeviation="10" flood-color="#0b1a3a" flood-opacity="0.14"/>
    </filter>
    <filter id="card" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0b1a3a" flood-opacity="0.14"/>
    </filter>
  </defs>
"""


def cover():
    """The four architectures drawn as the things themselves.

    Dots and lines make a graph, and a graph of an n8n workflow is not what an
    n8n workflow looks like. So panel one is a canvas: a dot grid, nodes with
    icons and ports, bezier connectors, and a sub-node hanging underneath the
    way a vector store hangs off an AI node. Panel two is that identical canvas
    with our own model dropped into the middle slot, because the fine-tune
    changed the model and not the shape. Panel three is an agent transcript,
    alternating reasoning and tool calls with the return that makes it a loop.
    Panel four is the application: a header, rows of articles with status, and
    the agent in a rail beside them.

    Blue marks where a model runs. It occupies three nodes, then one swapped
    node, then most of a transcript, then a few bubbles in a side rail.

    Every position is a formula or a literal, so a rebuild reproduces the image.
    """
    p = Plane(600, 300, 1092, 396, umax=4, vmax=1)
    m = []

    def L(j, lx, ly):
        return j + 0.06 + lx * 0.88, 0.10 + ly * 0.76

    def XY(j, lx, ly):
        return p(*L(j, lx, ly))

    def rect(j, a, b, c, d, fill=None, o=1.0, delay=0.0, stroke=None, cls="rise"):
        u0, v0 = L(j, a, b)
        u1, v1 = L(j, c, d)
        return slab(p, u0, v0, u1, v1, fill, o, delay, stroke, cls)

    def circ(j, lx, ly, r, fill, o=1.0, delay=0.0):
        x, y = XY(j, lx, ly)
        return (f'<circle class="pop" cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" '
                f'style="--o:{o};animation-delay:{delay:.2f}s"/>')

    def bez(j, a, b, delay=0.0, o=0.55, w=1.7):
        """An n8n connector: leaves a port sideways and arrives sideways."""
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

    def n8n_node(j, lx, ly, w=0.26, h=0.19, model=True, delay=0.0):
        """A node the way the canvas draws one: card, icon, two lines, ports."""
        out = [rect(j, lx, ly, lx + w, ly + h, "#ffffff", 1, delay, RULE)]
        out.append(rect(j, lx + 0.045, ly + 0.048, lx + 0.115, ly + h - 0.048,
                        BLUE if model else MUTED, 0.92 if model else 0.4, delay + 0.02))
        out.append(rect(j, lx + 0.145, ly + 0.062, lx + w - 0.04, ly + 0.092,
                        MUTED, 0.30, delay + 0.03))
        out.append(rect(j, lx + 0.145, ly + 0.112, lx + w - 0.09, ly + 0.138,
                        MUTED, 0.20, delay + 0.04))
        out.append(circ(j, lx, ly + h / 2, 3.4, "#ffffff", 1, delay + 0.02))
        out.append(circ(j, lx + w, ly + h / 2, 3.4, BLUE, 0.75, delay + 0.02))
        return "".join(out)

    def grid(j, delay=0.0):
        """The canvas dot grid, which is most of why an n8n screen is legible."""
        out = []
        for r in range(7):
            for c in range(9):
                out.append(circ(j, 0.045 + c * 0.115, 0.05 + r * 0.152, 1.25,
                                MUTED, 0.30, delay))
        return "".join(out)

    for j in range(4):
        m.append(plate(j, 0.26 * j))

    # 1. The canvas. Three nodes wired left to right, and a vector store hanging
    #    under the writer the way a sub-node hangs off an AI node.
    m.append(grid(0, 0.04))
    xs = (0.02, 0.37, 0.72)
    for i, lx in enumerate(xs):
        m.append(n8n_node(0, lx, 0.24, delay=0.10 + 0.07 * i))
        if i:
            m.append(bez(0, (xs[i - 1] + 0.26, 0.335), (lx, 0.335), 0.12 + 0.07 * i))
    m.append(n8n_node(0, 0.37, 0.66, 0.26, 0.19, False, 0.34))
    m.append(bez(0, (0.50, 0.68), (0.50, 0.43), 0.38, 0.5, 1.5))

    # 2. The same canvas. Only the middle node changed.
    m.append(grid(1, 0.30))
    for i, lx in enumerate(xs):
        if i != 1:
            m.append(n8n_node(1, lx, 0.24, delay=0.36 + 0.06 * i))
        if i:
            m.append(bez(1, (xs[i - 1] + 0.26, 0.335), (lx, 0.335), 0.38 + 0.06 * i))
    m.append(rect(1, 0.37, 0.20, 0.63, 0.47, "#ffffff", 1, 0.48, BLUE))
    m.append(rect(1, 0.37, 0.20, 0.63, 0.245, "url(#head)", 1, 0.50))
    pts = []
    for k in range(13):
        t = k / 12
        pts.append(XY(1, 0.405 + t * 0.19, 0.435 - 0.145 * (1 - (1 - t) ** 2.6)))
    m.append('<path class="draw" d="M' + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) +
             f'" fill="none" stroke="{BLUE}" stroke-width="2.1" opacity="0.85" '
             'style="--len:260;animation-delay:0.56s"/>')
    m.append(circ(1, 0.37, 0.335, 3.4, "#ffffff", 1, 0.50))
    m.append(circ(1, 0.63, 0.335, 3.4, BLUE, 0.75, 0.50))

    # 3. The transcript. Reasoning, a tool call, an observation, and the return
    #    edge that sends it round again.
    m.append(rect(2, 0.00, 0.02, 1.00, 0.98, "#ffffff", 1, 0.56, RULE))
    m.append(halo := f'<ellipse class="c" cx="{XY(2, 0.5, 0.5)[0]:.1f}" '
             f'cy="{XY(2, 0.5, 0.5)[1]:.1f}" rx="104" ry="86" fill="url(#halo)" '
             'style="--o:1;animation-delay:0.60s"/>')
    rows = ((0.00, 0.62, False), (0.10, 0.44, True), (0.10, 0.52, False),
            (0.20, 0.40, True), (0.20, 0.48, False), (0.10, 0.56, True))
    for k, (ind, w, tool) in enumerate(rows):
        y = 0.10 + k * 0.132
        if tool:
            m.append(rect(2, 0.07 + ind, y, 0.07 + ind + w, y + 0.082,
                          "url(#chip)", 1, 0.62 + 0.05 * k, cls="type"))
            m.append(rect(2, 0.10 + ind, y + 0.024, 0.13 + ind, y + 0.058,
                          "#ffffff", 0.85, 0.64 + 0.05 * k, cls="type"))
        else:
            m.append(rect(2, 0.07 + ind, y + 0.014, 0.07 + ind + w, y + 0.068,
                          MUTED, 0.26, 0.62 + 0.05 * k, cls="type"))
    ax0, ay0 = XY(2, 0.055, 0.86)
    ax1, ay1 = XY(2, 0.055, 0.145)
    m.append(f'<g class="c" style="--o:0.6;animation-delay:0.96s">'
             f'<path d="M{ax0:.1f} {ay0:.1f} C{ax0 - 46:.1f} {ay0:.1f} '
             f'{ax1 - 46:.1f} {ay1:.1f} {ax1:.1f} {ay1:.1f}" fill="none" '
             f'stroke="{BLUE}" stroke-opacity="0.55" stroke-width="2.1"/>'
             f'<polygon points="{ax1:.1f},{ay1:.1f} {ax1 - 8:.1f},{ay1 + 5:.1f} '
             f'{ax1 - 1:.1f},{ay1 + 10:.1f}" fill="{BLUE}" opacity="0.65"/></g>')

    # 4. The application. Header, rows of articles with status, and the agent in
    #    a rail on the right.
    m.append(rect(3, 0.00, 0.02, 1.00, 0.98, "#ffffff", 1, 0.84, RULE))
    m.append(rect(3, 0.00, 0.02, 1.00, 0.115, "url(#head)", 1, 0.86))
    for k in range(3):
        m.append(circ(3, 0.045 + k * 0.045, 0.068, 2.6, "#ffffff", 0.75, 0.88))
    for r in range(5):
        y = 0.20 + r * 0.152
        m.append(rect(3, 0.045, y, 0.045 + (0.30, 0.40, 0.26, 0.36, 0.31)[r],
                      y + 0.045, MUTED, 0.24, 0.90 + 0.04 * r, cls="rise"))
        m.append(rect(3, 0.50, y + 0.004, 0.575, y + 0.041,
                      BLUE if r in (1, 3) else MUTED, 0.62 if r in (1, 3) else 0.22,
                      0.92 + 0.04 * r, cls="rise"))
        m.append(rect(3, 0.00, y + 0.098, 0.635, y + 0.102, RULE, 0.8, 0.90 + 0.04 * r))
    m.append(rect(3, 0.635, 0.115, 0.639, 0.98, RULE, 0.9, 1.10))
    bubbles = ((0.665, 0.90, 0.20, False), (0.72, 0.955, 0.34, True),
               (0.665, 0.86, 0.48, False), (0.75, 0.955, 0.62, True))
    for k, (x0, x1, y, mine) in enumerate(bubbles):
        m.append(rect(3, x0, y, x1, y + 0.10, "url(#chip)" if mine else MUTED,
                      1 if mine else 0.22, 1.12 + 0.06 * k, cls="rise"))
    m.append(rect(3, 0.665, 0.80, 0.90, 0.875, "#ffffff", 1, 1.36, RULE, cls="rise"))

    for j, label in enumerate(PANELS):
        u, _ = L(j, 0.5, 0)
        m.append(text(p, u, 1.03, label, 15, MUTED))

    # A diagonal leader, so the annotation sits under the last panel instead of
    # forcing a right margin wide enough to push everything off centre. The text
    # is right-aligned and the leader leaves from its right edge, which keeps
    # both clear of the panel label underneath.
    tx, ty = XY(3, 0.80, 0.60)
    ex, ey = 1036, 502
    m.append(f'<g class="mark"><path d="M{ex:.1f} {ey - 8:.1f} L{tx + 12:.1f} '
             f'{ty + 18:.1f}" fill="none" stroke="{ACCENT_TEXT}" stroke-width="1.4"/>'
             f'<circle cx="{tx + 10:.1f}" cy="{ty + 16:.1f}" r="2.6" fill="{ACCENT_TEXT}"/>'
             f'<text x="{ex - 12:.1f}" y="{ey:.1f}" font-size="17" text-anchor="end" '
             f'fill="{ACCENT_TEXT}">the loop survived.</text>'
             f'<text x="{ex - 12:.1f}" y="{ey + 23:.1f}" font-size="17" text-anchor="end" '
             f'fill="{ACCENT_TEXT}">the stage did not.</text></g>')

    return wrap(COVER_DEFS + lifted("".join(m)))



# ----------------------------------------------------------------- slide 1
#
# The n8n canvas as it actually looked: three model nodes left to right, and
# the retrieval layer hanging under the writer, hash-diffed from Drive.

def arch_1_chain():
    p = Plane(600, 296, 900, 470, umax=1, vmax=1)
    m = []
    labels = ("Outline", "Write", "Review")
    for i, u in enumerate((0.05, 0.39, 0.73)):
        m.append(node(p, u, 0.16, u + 0.22, 0.32, labels[i], True, i * 0.10, 18))
        if i:
            m.append(arrow(p, (u - 0.12, 0.24), (u - 0.012, 0.24), delay=i * 0.10))

    m.append(node(p, 0.33, 0.58, 0.61, 0.72, "vector store", delay=0.34, size=16))
    m.append(arrow(p, (0.47, 0.573), (0.47, 0.334), delay=0.38))
    m.append(node(p, 0.03, 0.58, 0.26, 0.72, "Drive", delay=0.30, size=16))
    m.append(arrow(p, (0.268, 0.65), (0.322, 0.65), delay=0.34))
    m.append(text(p, 0.295, 0.545, "hash diff", 14, ACCENT_TEXT))
    m.append(text(p, 0.50, 0.075, "code holds the control flow", 16, MUTED))
    return wrap(lifted("".join(m)) + note(392, 556, ["a model runs at three points, and nowhere else"]))


# ----------------------------------------------------------------- slide 2
#
# A fine-tune is a dataset and a model, so that is what gets drawn. The pairs
# are outline and *published* article: the target is what a human shipped, not
# what the model first wrote.

def arch_2_finetune():
    p = Plane(600, 296, 900, 470, umax=1, vmax=1)
    m = []
    for i in range(7):
        v = 0.14 + i * 0.098
        m.append(textline(p, 0.04, 0.21, v, 0.040, 0.60, 0.05 + i * 0.05, BLUE, "type"))
        m.append(textline(p, 0.235, 0.45, v, 0.040, 0.24, 0.07 + i * 0.05, cls="type"))
    m.append(text(p, 0.125, 0.055, "outline", 15, MUTED))
    m.append(text(p, 0.34, 0.055, "what shipped", 15, MUTED))

    m.append(arrow(p, (0.49, 0.43), (0.59, 0.43), delay=0.50))
    m.append(node(p, 0.61, 0.32, 0.95, 0.54, "weights", True, 0.54, 20))
    return wrap(lifted("".join(m)) + note(392, 556, ["the target is what a human was willing to publish"]))


# ----------------------------------------------------------------- slide 3
#
# The loop is the point. A chain stops at step three; this reads its own output
# and goes again, and a skill is pulled in only when the step calls for it.

def arch_3_agent():
    p = Plane(600, 296, 900, 470, umax=1, vmax=1)
    m = []
    m.append(node(p, 0.16, 0.30, 0.44, 0.48, "reason", True, 0.04, 19))
    m.append(node(p, 0.58, 0.30, 0.86, 0.48, "act", delay=0.12, size=19))
    m.append(arrow(p, (0.448, 0.39), (0.572, 0.39), delay=0.14))
    m.append(loop_arc(p, 0.175, 0.855, 0.295, 0.185, delay=0.24))
    m.append(text(p, 0.50, 0.075, "the model holds the control flow", 16, MUTED))

    m.append(node(p, 0.16, 0.66, 0.44, 0.80, "skill", delay=0.34, size=17))
    m.append(arrow(p, (0.30, 0.655), (0.30, 0.492), delay=0.38))
    return wrap(lifted("".join(m)) + note(392, 556, ["a skill is loaded only when the step calls for it"]))


# ----------------------------------------------------------------- slide 4
#
# What shipped. An application holds the state in the middle of the screen and
# the conversation moves to a rail beside it. Drawn as the screen, because a
# reader who has used a spreadsheet already knows what one looks like.

def arch_4_hybrid():
    p = Plane(600, 292, 900, 450, umax=1, vmax=1)
    m = []
    m.append(slab(p, 0.02, 0.06, 0.64, 0.84, "#ffffff", 1, 0.04, RULE, cls="rise"))
    m.append(slab(p, 0.02, 0.06, 0.64, 0.155, BLUE, 0.9, 0.06, cls="rise"))
    for i in range(6):
        v = 0.235 + i * 0.105
        m.append(textline(p, 0.055, 0.055 + (0.24, 0.30, 0.20, 0.27, 0.22, 0.31)[i],
                          v, 0.030, 0.26, 0.10 + i * 0.04, cls="rise"))
        m.append(dot(p, 0.595, v, 5.0, ACCENT if i in (1, 3) else RULE, 1, 0.12 + i * 0.04))
        m.append(slab(p, 0.02, v + 0.052, 0.64, v + 0.054, RULE, 0.7, 0.10 + i * 0.04))

    m.append(slab(p, 0.69, 0.06, 0.98, 0.84, "#ffffff", 1, 0.42, RULE, cls="rise"))
    m.append(slab(p, 0.69, 0.06, 0.98, 0.155, ACCENT, 0.95, 0.44, cls="rise"))
    for i, w in enumerate((0.21, 0.15, 0.23, 0.12)):
        m.append(textline(p, 0.715, 0.715 + w, 0.245 + i * 0.095, 0.028, 0.24,
                          0.48 + i * 0.06, cls="type"))
    m.append(arrow(p, (0.685, 0.60), (0.615, 0.60), delay=0.78, o=0.6))
    return wrap(lifted("".join(m)) + note(392, 556, ["the conversation moved to a rail beside the work"]))


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
