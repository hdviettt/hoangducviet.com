"""Draw the cover: one attention head, in perspective, with no prose on it.

The subject is a square of attention weights over `[CLS] query [SEP] document
[SEP]`. The block where query rows attend to document columns is the entire
reason a cross-encoder exists, so it is the only thing annotated. Everything
else on the image is an axis label.

Single hue. A two-colour heatmap encodes a category that is not there, so the
warm colour appears exactly once, around that block.

The plane is tilted and genuinely projected rather than skewed. Every cell is
emitted as a quadrilateral whose four corners went through the same perspective
transform, so the far edge is narrower than the near one and the grid converges
the way a surface does. A CSS skew keeps rows parallel and reads as a distorted
rectangle instead of a receding plane.

Deterministic: the pattern is a fixed formula, so rerunning gives the same image.

    python scripts/make-cover-attention.py
"""
from __future__ import annotations

import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "covers" / "i-wrote-a-transformer-by-hand.svg"

N = 26                       # tokens per axis
SEP1, SEP2 = 7, 25           # [CLS] q0..q5 [SEP] d0..d16 [SEP]
STEP = 23.0                  # cell pitch on the plane, before projection
INSET = 2.1                  # gap between cells

# A square matrix barely tilted is still nearly square, and 630px of canvas
# leaves about 480 for it. More tilt foreshortens it enough to fit; a far
# camera then keeps the convergence subtle rather than funnel-shaped.
TILT = math.radians(34)      # how far the plane leans away from the viewer
DIST = 3000.0                # camera distance; smaller exaggerates the convergence
CX, CY = 522.0, 318.0        # where the centre of the plane lands on the canvas

MUTED, RULE, BLUE, WARM = "#5f656d", "#dfe4ec", "#004aef", "#c2410c"
SPAN = (N - 1) * STEP


def project(u: float, v: float) -> tuple[float, float]:
    """Plane coordinate (column, row) to canvas coordinate.

    The plane is rotated about the horizontal axis, so a row further down the
    matrix is also further away and its scale factor shrinks.
    """
    x = u * STEP - SPAN / 2
    y0 = v * STEP - SPAN / 2
    y, z = y0 * math.cos(TILT), y0 * math.sin(TILT)
    s = DIST / (DIST + z)
    return CX + x * s, CY + y * s


def weight(i: int, j: int) -> float:
    """A plausible attention row: a local window, the [CLS] sink, the
    separators, and query rows genuinely reading the document.

    The window is symmetric because this is an encoder. A first version decayed
    only backwards and drew a causal triangle, which is a decoder's pattern and
    would have been wrong on the cover of a post about a cross-encoder.
    """
    w = 0.30 * math.exp(-abs(i - j) / 2.8)
    w += 0.30 * math.exp(-j / 1.5)
    if j in (SEP1, SEP2):
        w += 0.16
    if i > SEP1 and j <= SEP1:
        w += 0.10
    if i <= SEP1 and SEP1 < j < SEP2:
        # Two loci, not one. A query term usually matches in more than one
        # place, and a single narrow peak left most of the outlined block empty.
        w += 0.40 * math.exp(-((j - SEP1 - 3) ** 2) / 14)
        w += 0.28 * math.exp(-((j - SEP1 - 11) ** 2) / 20)
    return min(1.0, w)


def quad(i: int, j: int) -> str:
    k = INSET / STEP / 2
    corners = [(j - 0.5 + k, i - 0.5 + k), (j + 0.5 - k, i - 0.5 + k),
               (j + 0.5 - k, i + 0.5 - k), (j - 0.5 + k, i + 0.5 - k)]
    return " ".join("{:.1f},{:.1f}".format(*project(u, v)) for u, v in corners)


cells = []
for i in range(N):
    for j in range(N):
        o = weight(i, j)
        if o < 0.05:
            continue
        cells.append(
            f'<polygon class="c" points="{quad(i, j)}" fill="{BLUE}" '
            f'style="--o:{o:.3f};animation-delay:{(i + j) * 0.017:.2f}s"/>'
        )

block_pts = [project(SEP1 + 0.5, -0.55), project(SEP2 - 0.5, -0.55),
             project(SEP2 - 0.5, SEP1 + 0.5), project(SEP1 + 0.5, SEP1 + 0.5)]
block = " ".join(f"{x:.1f},{y:.1f}" for x, y in block_pts)
lead_x = block_pts[1][0]
lead_y = (block_pts[1][1] + block_pts[2][1]) / 2

ticks = ""
for k in (0, SEP1, SEP2):
    x1, y1 = project(k, N - 0.45)
    x2, y2 = project(k, N - 0.05)
    ticks += (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
              f'stroke="{MUTED}" stroke-width="1.2"/>')
    lx, ly = project(k, N + 0.6)
    ticks += (f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="middle" font-size="13" '
              f'fill="{MUTED}">{"[CLS]" if k == 0 else "[SEP]"}</text>')

edge_l, edge_r = project(-0.5, N - 0.45), project(N - 0.5, N - 0.45)
top_l = project(-0.5, -1.0)

OUT.write_text(f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"
     font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', Roboto, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="#fafbfe"/>
      <stop offset="1" stop-color="#edf1fa"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.47" cy="0.4" r="0.6">
      <stop offset="0" stop-color="#004aef" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#004aef" stop-opacity="0"/>
    </radialGradient>
    <filter id="lift" x="-25%" y="-25%" width="150%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#0b1a3a" flood-opacity="0.11"/>
    </filter>
  </defs>
  <style>
    /* One attention head over [CLS] query [SEP] document [SEP], on a plane
       tilted away from the viewer. The outlined block is query rows attending
       to document columns, the only thing a cross-encoder does that an
       embedding model cannot.
       14s loop: the matrix fills on a diagonal sweep, the block is outlined,
       then it rests. */
    polygon.c {{ opacity: 0; animation: fill 14s ease-in-out infinite; }}
    @keyframes fill {{ 0% {{ opacity: 0 }} 22%, 88% {{ opacity: var(--o) }} 100% {{ opacity: 0 }} }}
    .mark {{ opacity: 0; animation: mark 14s ease infinite; }}
    @keyframes mark {{ 0%, 34% {{ opacity: 0 }} 46%, 86% {{ opacity: 1 }} 96%, 100% {{ opacity: 0 }} }}
    @media (prefers-reduced-motion: reduce) {{
      polygon.c {{ opacity: var(--o); animation: none }}
      .mark {{ opacity: 1; animation: none }}
    }}
  </style>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g filter="url(#lift)">{"".join(cells)}</g>

  <line x1="{edge_l[0]:.1f}" y1="{edge_l[1]:.1f}" x2="{edge_r[0]:.1f}" y2="{edge_r[1]:.1f}" stroke="{RULE}"/>
  {ticks}

  <g class="mark">
    <polygon points="{block}" fill="none" stroke="{WARM}" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="{lead_x:.1f}" y1="{lead_y:.1f}" x2="{lead_x + 42:.1f}" y2="{lead_y:.1f}" stroke="{WARM}" stroke-width="1.2"/>
    <text x="{lead_x + 52:.1f}" y="{lead_y - 5:.1f}" font-size="17" fill="{WARM}">query attending</text>
    <text x="{lead_x + 52:.1f}" y="{lead_y + 17:.1f}" font-size="17" fill="{WARM}">to document</text>
  </g>

  <text x="{top_l[0]:.1f}" y="{top_l[1] - 14:.1f}" font-size="14" fill="{MUTED}">attends to</text>
</svg>
""", encoding="utf-8")

print(f"  {OUT.name}: {OUT.stat().st_size / 1024:.1f} KB, {len(cells)} cells, "
      f"tilt {math.degrees(TILT):.0f} deg, camera {DIST:.0f}")
