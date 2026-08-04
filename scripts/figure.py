"""Shared machinery for post covers and in-article figures.

Import this, write one function per figure, call `emit()`. Everything that is
the same across figures - the canvas, the wash, the lift, the animation
vocabulary, the perspective - lives here so a new figure is only its own idea.

    from figure import Plane, wrap, lifted, slab, textline, note, text, emit

    def my_figure():
        p = Plane(516, 314, 660, 440, umax=1, vmax=1)
        marks = slab(p, 0.1, 0.1, 0.9, 0.9, cls="rise")
        return wrap(lifted(marks) + note(900, 300, ["the one thing", "worth pointing at"]))

    emit({"my-slug": my_figure})

Two things this file will not do for you, and both matter more than anything
it does:

1. Decide what the figure is. A bar chart is right when the subject is a
   quantity. When the subject is a screen, a graph, a document or a timeline,
   draw that. See SKILL.md.
2. Look at the output. Render the PNG and open it. Half of what has ever been
   wrong with these was invisible in the code and obvious in the image.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

W, H = 1200, 630

# SEONGON. Prosperous Blue carries the data; Future Green is the single accent.
# Future Green measures 1.52:1 on white, so it can fill a shape and nothing
# else - text and hairlines take the darker step at 4.89:1. The pair still sits
# 4.29:1 apart in luminance, which keeps them separable for a colour-blind
# reader even though both are cool.
BLUE = "#004aef"
ACCENT = "#07ef9c"
ACCENT_TEXT = "#04815a"
INK, MUTED, RULE = "#1f2124", "#5f656d", "#dfe4ec"

FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', Roboto, sans-serif"

# A square figure barely tilted is still square, and 630px of canvas leaves
# about 480 for it. This much tilt foreshortens it into the frame; a camera
# this far away then keeps the convergence a hint rather than a funnel.
TILT = math.radians(34)
DIST = 3000.0


class Plane:
    """A surface tilted away from the viewer, that figure coordinates land on.

    `u` runs right and `v` runs away. Both are in whatever units the figure
    finds natural - 0..1, or 0..30 columns - declared as `umax` and `vmax`.

    The projection is real: every corner of every mark goes through it, so the
    far edge comes out narrower than the near one and the grid converges. A CSS
    skew keeps rows parallel and reads as a distorted rectangle instead.
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


# ------------------------------------------------------------------ marks

def slab(p: Plane, u0, v0, u1, v1, fill=None, o=1.0, delay=0.0,
         stroke=None, cls="c") -> str:
    """A rectangle on the plane. Rounded corners are unavailable on a projected
    quadrilateral, and at cover scale nobody reads the corner."""
    extra = f' stroke="{stroke}" stroke-width="1.2"' if stroke else ""
    return (f'<polygon class="{cls}" points="{p.quad(u0, v0, u1, v1)}" '
            f'fill="{fill or BLUE}"{extra} '
            f'style="--o:{o};animation-delay:{delay:.2f}s"/>')


def textline(p: Plane, u0, u1, v, h=0.05, o=0.22, delay=0.0, fill=None, cls="c") -> str:
    """A line of body text, the way a wireframe draws one."""
    return slab(p, u0, v - h / 2, u1, v + h / 2, fill or MUTED, o, delay, cls=cls)


def dot(p: Plane, u, v, r=5.5, fill=None, o=1.0, delay=0.0, cls="pop") -> str:
    x, y = p(u, v)
    return (f'<circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="{r}" '
            f'fill="{fill or BLUE}" style="--o:{o};animation-delay:{delay:.2f}s"/>')


def connect(p: Plane, a, b, o=0.25, delay=0.0, width=1.0, cls="c") -> str:
    x0, y0 = p(*a)
    x1, y1 = p(*b)
    return (f'<line class="{cls}" x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
            f'stroke="{BLUE}" stroke-width="{width}" '
            f'style="--o:{o};animation-delay:{delay:.2f}s"/>')


def curve(p: Plane, points, o=1.0, width=2.4, delay=0.0, length=900) -> str:
    return (f'<path class="draw" d="{p.path(points)}" fill="none" stroke="{BLUE}" '
            f'stroke-width="{width}" opacity="{o}" '
            f'style="--len:{length};animation-delay:{delay:.2f}s"/>')


def text(p: Plane | None, u, v, s, size=13, fill=MUTED,
         anchor="middle", weight="400", dy=0.0) -> str:
    """Pass `p=None` to place at canvas coordinates instead of on the plane."""
    x, y = p(u, v) if p else (u, v)
    s = str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (f'<text x="{x:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}" font-size="{size}" '
            f'fill="{fill}" font-weight="{weight}">{s}</text>')


def note(x: float, y: float, lines: list[str]) -> str:
    """The one accent annotation, at canvas coordinates.

    One per figure. If a figure needs two, it is trying to say two things and
    should be two figures, or one of them is not worth saying. It stays flat
    rather than lying on the plane, which puts it in front and makes the depth
    read.
    """
    out = [f'<line x1="{x - 42:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y:.1f}" '
           f'stroke="{ACCENT_TEXT}" stroke-width="1.4"/>']
    for i, ln in enumerate(lines):
        out.append(f'<text x="{x + 10:.1f}" y="{y + 5 + i * 22 - (len(lines) - 1) * 11:.1f}" '
                   f'font-size="17" fill="{ACCENT_TEXT}">{ln}</text>')
    return '<g class="mark">' + "".join(out) + "</g>"


def lifted(marks: str) -> str:
    """Put the figure on the plane, above the wash."""
    return f'  <g filter="url(#lift)">{marks}</g>'


# ------------------------------------------------------------------- chrome

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
       panel expands and pushes what is under it away, a curve is drawn. A fade
       only says "this exists".

       `transform-box: fill-box` is what makes transform-origin mean the shape's
       own box rather than the whole canvas. Without it a scaleX on a text line
       grows from the middle of the page.

       Every class rests on the finished figure, and reduced motion paints that
       frame directly. The og:image renderer forces reduced motion, so the still
       it captures is always the completed drawing. Check this after any change
       to the keyframes: a scaleY(0) that fails to reset removes the shape from
       every social card, and nobody notices until someone shares the post. */
    .c, .type, .pop, .rise, .expandy {{ transform-box: fill-box; }}

    .c {{ opacity: 0; animation: fade 14s ease-in-out infinite; }}
    @keyframes fade {{ 0% {{ opacity: 0 }} 20%, 88% {{ opacity: var(--o, 1) }} 100% {{ opacity: 0 }} }}

    .type {{ opacity: 0; transform-origin: left center;
             animation: type 14s cubic-bezier(0.25, 0.9, 0.3, 1) infinite; }}
    @keyframes type {{ 0% {{ opacity: 0; transform: scaleX(0) }}
                      6% {{ opacity: var(--o, 1); transform: scaleX(0) }}
                      22%, 88% {{ opacity: var(--o, 1); transform: scaleX(1) }}
                      100% {{ opacity: 0; transform: scaleX(1) }} }}

    .pop {{ opacity: 0; transform-origin: center;
            animation: pop 14s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }}
    @keyframes pop {{ 0% {{ opacity: 0; transform: scale(0.6) }}
                     18%, 88% {{ opacity: var(--o, 1); transform: scale(1) }}
                     100% {{ opacity: 0; transform: scale(0.6) }} }}

    .rise {{ opacity: 0; animation: rise 14s cubic-bezier(0.2, 0.9, 0.3, 1) infinite; }}
    @keyframes rise {{ 0% {{ opacity: 0; transform: translateY(22px) }}
                      20%, 88% {{ opacity: var(--o, 1); transform: translateY(0) }}
                      100% {{ opacity: 0; transform: translateY(22px) }} }}

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


# -------------------------------------------------- interface primitives
#
# Most posts are about a screen, and a reader who has used Google knows what
# one looks like, so drawing it carries more than any bar chart of it.

def searchbox(p: Plane, u0, u1, v, query=0.42, delay=0.0) -> str:
    """A field, the typed query, the button. The query is typed, not faded:
    it is the first thing that happens on the page."""
    return "".join([
        slab(p, u0, v - 0.075, u1, v + 0.075, "#ffffff", 1, delay, RULE),
        textline(p, u0 + 0.03, u0 + 0.03 + query, v, 0.05, 0.9, delay + 0.1, BLUE, "type"),
        slab(p, u1 - 0.075, v - 0.048, u1 - 0.02, v + 0.048, BLUE, 0.95, delay + 0.15, cls="pop"),
    ])


def result(p: Plane, u0, v, w=0.62, delay=0.0, title_o=0.95) -> str:
    """One organic result: url, blue title, two lines of snippet. The block
    rises as a unit, because that is how a result appears."""
    return "".join([
        textline(p, u0, u0 + w * 0.34, v, 0.035, 0.35, delay, cls="rise"),
        textline(p, u0, u0 + w, v + 0.055, 0.052, title_o, delay + 0.02, BLUE, "rise"),
        textline(p, u0, u0 + w * 0.96, v + 0.115, 0.033, 0.20, delay + 0.04, cls="rise"),
        textline(p, u0, u0 + w * 0.72, v + 0.158, 0.033, 0.20, delay + 0.06, cls="rise"),
    ])


def window(p: Plane, u0, v0, u1, v1, delay=0.0, accent=False, lines=(0.72, 0.86, 0.54)) -> str:
    """An app window: header strip and body lines. Narrow it too far and it
    becomes a bar with a different silhouette, which is not the same thing."""
    head = (v1 - v0) * 0.16
    out = [slab(p, u0, v0, u1, v1, "#ffffff", 1, delay, RULE, cls="rise"),
           slab(p, u0, v0, u1, v0 + head, ACCENT if accent else BLUE, 0.9, delay + 0.04, cls="rise")]
    pad = (u1 - u0) * 0.12
    for i, ww in enumerate(lines):
        out.append(textline(p, u0 + pad, u0 + pad + (u1 - u0 - 2 * pad) * ww,
                            v0 + head + (v1 - v0) * (0.16 + i * 0.16), 0.030, 0.22,
                            delay + 0.07 + i * 0.02, cls="rise"))
    return "".join(out)


# --------------------------------------------------------------------- emit

def emit(figures: dict, out_dir: Path, argv: list[str] | None = None) -> int:
    """Write the requested figures, or all of them."""
    argv = sys.argv[1:] if argv is None else argv
    wanted = argv or list(figures)
    unknown = [s for s in wanted if s not in figures]
    if unknown:
        print(f"unknown: {', '.join(unknown)}", file=sys.stderr)
        return 2
    out_dir.mkdir(parents=True, exist_ok=True)
    for slug in wanted:
        path = out_dir / f"{slug}.svg"
        path.write_text(figures[slug](), encoding="utf-8")
        print(f"  {path.name:<52} {path.stat().st_size / 1024:5.1f} KB")
    return 0
