"""Draw the cover as an attention matrix, with no prose on it.

One head over `[CLS] query [SEP] document [SEP]`. The block where query rows
attend to document columns is the entire reason a cross-encoder exists, so it
is the only thing annotated.

Single hue, because a two-hue heatmap encodes a category that is not there. The
warm colour appears once, as a hairline around that block.

Deterministic: the pattern is a fixed formula, so rerunning gives the same image.
"""
import math
from pathlib import Path

OUT = Path("C:/Users/admin/Desktop/workspace/personal/projects/personal-blog"
           "/public/covers/i-wrote-a-transformer-by-hand.svg")

N = 26                       # tokens per axis
CELL, GAP = 18.0, 2.0
SEP1, SEP2 = 7, 25           # [CLS] q0..q5 [SEP] d0..d16 [SEP]
SIZE = N * CELL + (N - 1) * GAP
# Matrix and annotation are one composition, centred together: 518 + 40 + 240
# leaves an equal 200px margin either side.
X0 = 200
Y0 = (630 - SIZE) / 2 + 6

MUTED, RULE, BLUE, WARM = "#5f656d", "#e1e6ec", "#004aef", "#c2410c"


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
        # place, and a single narrow peak left most of the outlined block
        # empty, which made the annotation point at white space.
        w += 0.40 * math.exp(-((j - SEP1 - 3) ** 2) / 14)
        w += 0.28 * math.exp(-((j - SEP1 - 11) ** 2) / 20)
    return min(1.0, w)


def pos(k: int) -> float:
    return k * (CELL + GAP)


cells = []
for i in range(N):
    for j in range(N):
        o = weight(i, j)
        if o < 0.045:
            continue
        cells.append(
            f'<rect class="c" x="{X0 + pos(j):.1f}" y="{Y0 + pos(i):.1f}" '
            f'width="{CELL}" height="{CELL}" rx="2.5" fill="{BLUE}" '
            f'style="--o:{o:.3f};animation-delay:{(i + j) * 0.018:.2f}s"/>'
        )

bx, by = X0 + pos(SEP1 + 1) - GAP / 2, Y0 - GAP / 2
bw, bh = pos(SEP2 - SEP1 - 1), pos(SEP1 + 1)


def tick(k: int) -> str:
    x = X0 + pos(k) + CELL / 2
    return (f'<line x1="{x:.1f}" y1="{Y0 + SIZE + 10:.1f}" x2="{x:.1f}" '
            f'y2="{Y0 + SIZE + 17:.1f}" stroke="{MUTED}" stroke-width="1.2"/>')


def label(k: int, s: str) -> str:
    return (f'<text x="{X0 + pos(k) + CELL / 2:.1f}" y="{Y0 + SIZE + 33:.1f}" '
            f'text-anchor="middle">{s}</text>')


OUT.write_text(f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"
     font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', Roboto, sans-serif">
  <style>
    /* One attention head over [CLS] query [SEP] document [SEP]. The outlined
       block is query rows attending to document columns, which is the only
       thing a cross-encoder does that an embedding model cannot.
       14s loop: the matrix fills on a diagonal sweep, the block is outlined,
       then it rests. */
    rect.c {{ opacity: 0; animation: fill 14s ease-in-out infinite; }}
    @keyframes fill {{ 0% {{ opacity: 0 }} 22%, 88% {{ opacity: var(--o) }} 100% {{ opacity: 0 }} }}
    .mark {{ opacity: 0; animation: mark 14s ease infinite; }}
    @keyframes mark {{ 0%, 34% {{ opacity: 0 }} 46%, 86% {{ opacity: 1 }} 96%, 100% {{ opacity: 0 }} }}
    @media (prefers-reduced-motion: reduce) {{
      rect.c {{ opacity: var(--o); animation: none }}
      .mark {{ opacity: 1; animation: none }}
    }}
  </style>

  <rect width="1200" height="630" fill="#ffffff"/>
  <g>{''.join(cells)}</g>

  <g class="mark">
    <rect x="{bx:.1f}" y="{by:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="4"
          fill="none" stroke="{WARM}" stroke-width="1.8"/>
    <line x1="{bx + bw:.1f}" y1="{by + bh / 2:.1f}" x2="{bx + bw + 40:.1f}" y2="{by + bh / 2:.1f}"
          stroke="{WARM}" stroke-width="1.2"/>
    <text x="{bx + bw + 50:.1f}" y="{by + bh / 2 - 4:.1f}" font-size="17" fill="{WARM}">query attending</text>
    <text x="{bx + bw + 50:.1f}" y="{by + bh / 2 + 18:.1f}" font-size="17" fill="{WARM}">to document</text>
  </g>

  <text x="{X0:.1f}" y="{Y0 - 20:.1f}" font-size="14" fill="{MUTED}">attends to</text>
  <text x="{X0 - 30:.1f}" y="{Y0 + SIZE / 2:.1f}" font-size="14" fill="{MUTED}" text-anchor="middle"
        transform="rotate(-90 {X0 - 30:.1f} {Y0 + SIZE / 2:.1f})">token</text>

  <line x1="{X0:.1f}" y1="{Y0 + SIZE + 10:.1f}" x2="{X0 + SIZE:.1f}" y2="{Y0 + SIZE + 10:.1f}" stroke="{RULE}"/>
  {tick(0)}{tick(SEP1)}{tick(SEP2)}
  <g font-size="13" fill="{MUTED}">{label(0, '[CLS]')}{label(SEP1, '[SEP]')}{label(SEP2, '[SEP]')}</g>
</svg>
""", encoding="utf-8")

print(f"  {OUT.name}: {OUT.stat().st_size / 1024:.1f} KB, {len(cells)} cells, grid {SIZE:.0f}px")
