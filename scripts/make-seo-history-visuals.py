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

PANELS = ("n8n chain", "fine-tuned", "reasoning agent", "app + rail")

# Flat discs and hairlines read as a schematic. These give the marks a body:
# a node is lit from the upper left, a model-heavy region carries a halo, and
# each panel sits on a plate so the four shapes read as four objects rather
# than one drawing with gaps in it.
COVER_DEFS = f"""  <defs>
    <radialGradient id="nb" cx="0.34" cy="0.28" r="0.92">
      <stop offset="0" stop-color="#5b86f7"/>
      <stop offset="0.52" stop-color="{BLUE}"/>
      <stop offset="1" stop-color="#00308f"/>
    </radialGradient>
    <radialGradient id="nw" cx="0.34" cy="0.28" r="0.95">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e8edf7"/>
    </radialGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="{BLUE}" stop-opacity="0.20"/>
      <stop offset="0.55" stop-color="{BLUE}" stop-opacity="0.07"/>
      <stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="plate" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.92"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.34"/>
    </linearGradient>
    <linearGradient id="wire" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{BLUE}" stop-opacity="0.12"/>
      <stop offset="0.5" stop-color="{BLUE}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="{BLUE}" stop-opacity="0.12"/>
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#0b1a3a" flood-opacity="0.13"/>
    </filter>
  </defs>
"""


def cover():
    """The four archetypes as the shapes they actually are.

    A chain is a directed line with the model riding on it. A fine-tune is that
    same line with one node swollen into a cloud of weights, because it changed
    the model and not the shape. A reasoning agent is a hub with tools around
    it and a return arc, which is what a ReAct loop is and what a ring of peers
    is not. What shipped is a list of records with that same hub shrunk to a
    satellite beside it, so the last panel literally contains the third one.

    Blue is where a model runs. It grows from three nodes to a hub with a halo
    and then collapses to a satellite, so the argument of the post is carried
    as area rather than asserted in a caption.

    Every position is a formula or a literal. No random draws: a rebuild has to
    reproduce the image or it becomes a silent redesign.
    """
    p = Plane(505, 296, 960, 384, umax=4, vmax=1)
    m = []

    def q(j, lx, ly):
        return j + 0.07 + lx * 0.86, 0.09 + ly * 0.72

    def xy(j, lx, ly):
        return p(*q(j, lx, ly))

    def orb(j, lx, ly, r=7.0, model=False, d=0.0, o=1.0):
        """A node with a body. Lit from the upper left so it sits on the page."""
        x, y = xy(j, lx, ly)
        fill = "url(#nb)" if model else "url(#nw)"
        ring = "" if model else (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="none" '
                                 f'stroke="{MUTED}" stroke-width="1.2" opacity="0.5"/>')
        return (f'<g class="pop" style="--o:{o};animation-delay:{d:.2f}s">'
                f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}"/>{ring}</g>')

    def wire(j, a, b, d=0.0, o=0.5, w=1.6):
        x0, y0 = xy(j, *a)
        x1, y1 = xy(j, *b)
        return (f'<line class="c" x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
                f'stroke="{BLUE}" stroke-opacity="0.34" stroke-width="{w}" stroke-linecap="round" '
                f'style="--o:{o};animation-delay:{d:.2f}s"/>')

    def halo(j, lx, ly, rx, ry, d=0.0):
        x, y = xy(j, lx, ly)
        return (f'<ellipse class="c" cx="{x:.1f}" cy="{y:.1f}" rx="{rx}" ry="{ry}" '
                f'fill="url(#halo)" style="--o:1;animation-delay:{d:.2f}s"/>')

    def plate(j, d=0.0):
        pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in
                       (xy(j, -0.06, -0.05), xy(j, 1.06, -0.05),
                        xy(j, 1.06, 1.05), xy(j, -0.06, 1.05)))
        return (f'<polygon class="rise" points="{pts}" fill="url(#plate)" '
                f'filter="url(#soft)" style="--o:1;animation-delay:{d:.2f}s"/>')

    def ret_arc(j, a, b, bulge, d=0.0, o=0.55, w=2.2):
        """The return edge, drawn round the outside so the cycle is visible."""
        x0, y0 = xy(j, *a)
        x1, y1 = xy(j, *b)
        cx, cy = xy(j, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - bulge)
        hx, hy = x1 - (x1 - cx) * 0.16, y1 - (y1 - cy) * 0.16
        nx, ny = -(y1 - hy), (x1 - hx)
        n = max((nx * nx + ny * ny) ** 0.5, 1e-6)
        nx, ny = nx / n * 4.5, ny / n * 4.5
        return (f'<g class="c" style="--o:{o};animation-delay:{d:.2f}s">'
                f'<path d="M{x0:.1f} {y0:.1f} Q{cx:.1f} {cy:.1f} {x1:.1f} {y1:.1f}" '
                f'fill="none" stroke="{BLUE}" stroke-width="{w}" opacity="0.55" '
                f'stroke-linecap="round"/>'
                f'<polygon points="{x1:.1f},{y1:.1f} {hx + nx:.1f},{hy + ny:.1f} '
                f'{hx - nx:.1f},{hy - ny:.1f}" fill="{BLUE}" opacity="0.65"/></g>')

    for j in range(4):
        m.append(plate(j, 0.30 * j))

    # 1. A line. The model rides on a frame code laid down, and retrieval hangs
    #    off the middle of it.
    chain = [0.08, 0.29, 0.50, 0.71, 0.92]
    for i, lx in enumerate(chain):
        if i:
            m.append(wire(0, (chain[i - 1], 0.40), (lx, 0.40), 0.05 * i, 0.55))
        model = i in (1, 2, 3)
        m.append(orb(0, lx, 0.40, 8.5 if model else 6.0, model, 0.05 * i))
    m.append(wire(0, (0.50, 0.76), (0.50, 0.44), 0.28, 0.35))
    m.append(orb(0, 0.50, 0.76, 5.5, False, 0.30))

    # 2. The same line. One node became a cloud of weights.
    m.append(halo(1, 0.50, 0.40, 78, 62, 0.42))
    for i, lx in enumerate(chain):
        if i:
            m.append(wire(1, (chain[i - 1], 0.40), (lx, 0.40), 0.34 + 0.03 * i, 0.55))
        if i != 2:
            m.append(orb(1, lx, 0.40, 8.5 if i in (1, 3) else 6.0, i in (1, 3),
                         0.34 + 0.03 * i))
    for k in range(58):
        a = 2.399963 * k                       # golden angle: a deterministic disc
        rr = 0.150 * math.sqrt((k + 0.5) / 58)
        m.append(orb(1, 0.50 + rr * math.cos(a), 0.40 + rr * 1.28 * math.sin(a),
                     3.4, True, 0.48 + 0.005 * k, 0.92))

    # 3. A hub with tools around it and a return arc. A ReAct loop is not a ring
    #    of peers: everything goes back through the model.
    m.append(halo(2, 0.50, 0.42, 96, 78, 0.62))
    tools = [(0.50 + 0.34 * math.cos(2 * math.pi * k / 5 - math.pi / 2),
              0.42 + 0.30 * 1.12 * math.sin(2 * math.pi * k / 5 - math.pi / 2))
             for k in range(5)]
    for k, t in enumerate(tools):
        m.append(wire(2, (0.50, 0.42), t, 0.66 + 0.03 * k, 0.5, 1.8))
    for k, t in enumerate(tools):
        m.append(orb(2, t[0], t[1], 6.0, False, 0.68 + 0.03 * k))
    m.append(orb(2, 0.50, 0.42, 14.0, True, 0.64))
    m.append(ret_arc(2, tools[3], (0.50, 0.42), -0.40, 0.86))

    # 4. Records, and that same hub shrunk to a satellite beside them.
    for r in range(6):
        ly = 0.10 + r * 0.128
        m.append(slab(p, *q(3, 0.03, ly - 0.020), *q(3, 0.30 + 0.22 * ((r * 3) % 4) / 3.0,
                                                     ly + 0.020),
                      MUTED, 0.19, 1.00 + 0.04 * r, cls="rise"))
        m.append(orb(3, 0.575, ly, 3.6, r in (1, 4), 1.02 + 0.04 * r, 0.75))
    m.append(halo(3, 0.84, 0.42, 44, 36, 1.28))
    sat = [(0.84 + 0.115 * math.cos(2 * math.pi * k / 5 - math.pi / 2),
            0.42 + 0.115 * 1.12 * math.sin(2 * math.pi * k / 5 - math.pi / 2))
           for k in range(5)]
    for k, t in enumerate(sat):
        m.append(wire(3, (0.84, 0.42), t, 1.30 + 0.02 * k, 0.42, 1.3))
        m.append(orb(3, t[0], t[1], 3.4, False, 1.32 + 0.02 * k))
    m.append(orb(3, 0.84, 0.42, 9.5, True, 1.28))
    m.append(ret_arc(3, sat[3], (0.84, 0.42), -0.15, 1.42, 0.5, 1.5))
    m.append(wire(3, (0.60, 0.31), (0.74, 0.39), 1.36, 0.4))
    m.append(wire(3, (0.74, 0.46), (0.60, 0.56), 1.38, 0.4))

    for j, label in enumerate(PANELS):
        u, _ = q(j, 0.5, 0)
        m.append(text(p, u, 1.02, label, 15, MUTED))

    ax, ay = xy(3, 0.965, 0.42)
    return wrap(COVER_DEFS + lifted("".join(m))
                + note(ax + 34, ay, ["the loop survived.", "the stage did not."]))



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
