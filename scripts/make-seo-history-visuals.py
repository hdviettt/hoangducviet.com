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


def cover():
    """The four archetypes as the shapes they actually are.

    A chain is a line. A fine-tune is that same line with one node swollen into
    a mass, because it changed the model and not the shape. A reasoning agent
    is a ring with a return chord and skills hanging off it. What shipped is a
    lattice holding the state with a small ring attached at the side.

    Blue is where a model runs. It spreads from three nodes to a whole ring and
    then collapses to a satellite, which is the argument of the post drawn as
    area rather than stated.

    Every position is a formula or a literal. No random draws: a rebuild has to
    reproduce the image or it becomes a silent redesign.
    """
    p = Plane(486, 296, 900, 560, umax=4, vmax=1)
    m = []

    def q(j, lx, ly):
        """Local panel coordinates into plane coordinates."""
        return j + 0.07 + lx * 0.86, 0.10 + ly * 0.72

    def node_at(j, lx, ly, r=6.5, model=False, d=0.0):
        u, v = q(j, lx, ly)
        return dot(p, u, v, r, BLUE if model else "#ffffff", 1.0, d,
                   cls="pop") + ("" if model else
                                 f'<circle class="pop" cx="{p(u, v)[0]:.1f}" '
                                 f'cy="{p(u, v)[1]:.1f}" r="{r}" fill="none" '
                                 f'stroke="{MUTED}" stroke-width="1.3" '
                                 f'style="--o:0.55;animation-delay:{d:.2f}s"/>')

    def edge(j, a, b, d=0.0, o=0.30, w=1.3):
        return connect(p, q(j, *a), q(j, *b), o, d, w)

    # 1. A line. Five steps, three of them a model, one retrieval hanging under
    #    the middle of it.
    chain = [0.06, 0.27, 0.48, 0.69, 0.90]
    for i, lx in enumerate(chain):
        if i:
            m.append(edge(0, (chain[i - 1], 0.42), (lx, 0.42), 0.05 * i))
        m.append(node_at(0, lx, 0.42, 7.0, i in (1, 2, 3), 0.05 * i))
    m.append(edge(0, (0.48, 0.74), (0.48, 0.47), 0.30))
    m.append(node_at(0, 0.48, 0.74, 5.5, False, 0.32))

    # 2. The same line. One node became a mass of weights.
    for i, lx in enumerate(chain):
        if i:
            m.append(edge(1, (chain[i - 1], 0.42), (lx, 0.42), 0.34 + 0.04 * i))
        if i != 2:
            m.append(node_at(1, lx, 0.42, 7.0, i in (1, 3), 0.34 + 0.04 * i))
    for k in range(44):
        a = 2.399963 * k                     # golden angle, a deterministic disc
        rr = 0.115 * math.sqrt((k + 0.5) / 44)
        m.append(node_at(1, 0.48 + rr * math.cos(a), 0.42 + rr * 1.30 * math.sin(a),
                         3.0, True, 0.50 + 0.006 * k))

    # 3. A ring, the return chord that makes it an agent, and skills radiating.
    ring = [(0.46 + 0.30 * math.cos(2 * math.pi * k / 7 - math.pi / 2),
             0.42 + 0.28 * 1.28 * math.sin(2 * math.pi * k / 7 - math.pi / 2))
            for k in range(7)]
    for k in range(7):
        m.append(edge(2, ring[k], ring[(k + 1) % 7], 0.62 + 0.03 * k, 0.34))
    m.append(edge(2, ring[4], ring[0], 0.86, 0.5, 1.8))
    for k, pt in enumerate(ring):
        m.append(node_at(2, pt[0], pt[1], 6.5, True, 0.62 + 0.03 * k))
    for k in (1, 3, 5):
        sx = 0.46 + 1.42 * (ring[k][0] - 0.46)
        sy = 0.42 + 1.42 * (ring[k][1] - 0.42)
        m.append(edge(2, ring[k], (sx, sy), 0.90, 0.22))
        m.append(node_at(2, sx, sy, 4.0, False, 0.92))

    # 4. A lattice holding the state, with what is left of the loop beside it.
    for r in range(5):
        for c in range(6):
            lx, ly = 0.04 + c * 0.107, 0.10 + r * 0.16
            if c:
                m.append(edge(3, (lx - 0.107, ly), (lx, ly), 1.00, 0.18))
            if r:
                m.append(edge(3, (lx, ly - 0.16), (lx, ly), 1.00, 0.18))
            m.append(node_at(3, lx, ly, 4.2, False, 1.00 + 0.012 * (r * 6 + c)))
    small = [(0.86 + 0.075 * math.cos(2 * math.pi * k / 4 - math.pi / 2),
              0.42 + 0.085 * 1.28 * math.sin(2 * math.pi * k / 4 - math.pi / 2))
             for k in range(4)]
    for k in range(4):
        m.append(edge(3, small[k], small[(k + 1) % 4], 1.20, 0.40))
        m.append(node_at(3, small[k], small[k], 5.0, True, 1.20 + 0.02 * k)
                 if False else node_at(3, small[k][0], small[k][1], 5.0, True, 1.20 + 0.02 * k))
    m.append(edge(3, (0.575, 0.34), (0.785, 0.40), 1.30, 0.30))
    m.append(edge(3, (0.785, 0.46), (0.575, 0.58), 1.32, 0.30))

    for j, label in enumerate(PANELS):
        u, _ = q(j, 0.5, 0)
        m.append(text(p, u, 1.04, label, 15, MUTED))

    ax, ay = p(*q(3, 0.945, 0.42))
    return wrap(lifted("".join(m))
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
