"""Cover and carousel slides for `a-brief-history-of-seo-content-writing-with-ai`.

The post is about four architectures for one job, so every drawing here is one
of those architectures rather than a chart about them. The cover plays all four
in order; the carousel gives each its own frame at a size where the wiring is
readable.

    python scripts/make-seo-history-visuals.py            # everything
    python scripts/make-seo-history-visuals.py arch-1-chain

Nothing here depends on production numbers, deliberately: the two figures that
would need them (the fine-tune trade, the machine-cost table) are not drawn,
because a chart with invented values is worse than no chart.
"""
from __future__ import annotations

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
# One idea, not four. Four architectures at cover scale come out as four rows
# of unlabelled rectangles, which is the failure this whole style exists to
# avoid - so the cover draws the moment the post turns on instead: a brief with
# a rule in it, a machine reading the rule, and the machine going round again
# because the rule had a tolerance nobody ever had to write down.
#
# It animates in that order. The brief is typed, the machine arrives, the loop
# draws itself last and does not resolve.

def cover():
    p = Plane(596, 318, 880, 470, umax=1, vmax=1)
    m = []

    # The brief. Ordinary lines, and one of them is the rule that traps it.
    m.append(slab(p, 0.03, 0.06, 0.40, 0.94, "#ffffff", 1, 0.02, RULE, cls="rise"))
    for i, w in enumerate((0.26, 0.31, 0.22, 0.29)):
        m.append(textline(p, 0.065, 0.065 + w, 0.155 + i * 0.075, 0.028, 0.20,
                          0.08 + i * 0.05, cls="type"))
    m.append(slab(p, 0.055, 0.505, 0.375, 0.585, ACCENT, 0.30, 0.34, cls="type"))
    m.append(text(p, 0.215, 0.558, "≤ 1000 words", 19, INK, weight="600"))
    for i, w in enumerate((0.30, 0.24, 0.27)):
        m.append(textline(p, 0.065, 0.065 + w, 0.665 + i * 0.075, 0.028, 0.20,
                          0.44 + i * 0.05, cls="type"))

    # The machine that reads it.
    m.append(arrow(p, (0.415, 0.50), (0.545, 0.50), delay=0.62, o=0.6))
    m.append(node(p, 0.58, 0.40, 0.97, 0.60, "agent", True, 0.66, 21))

    # And the edge that never resolves.
    m.append(loop_arc(p, 0.595, 0.955, 0.385, 0.175, delay=0.80, o=0.65))

    return wrap(lifted("".join(m))
                + note(556, 556, ["the outline was already 900,",
                                  "and the rule had a tolerance",
                                  "nobody had written down"]))


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
