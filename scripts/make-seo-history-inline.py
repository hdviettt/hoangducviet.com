"""Inline figures for `a-brief-history-of-seo-content-writing-with-ai`.

These go inside ```render fences in the post body, so unlike the covers they
are part of the page: they read the article's CSS variables and inherit its
font, which means one drawing serves light and dark and the type matches the
prose around it. Nothing here is written to public/.

    python scripts/make-seo-history-inline.py            # write fences + preview
    python scripts/make-seo-history-inline.py --preview  # preview only

The preview harness fills the variables with the light-mode values from
globals.css so the figures can be rendered and looked at, which is the step
that catches everything the code hides.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "scripts" / "seo-history-inline"

HEAD = "var(--article-heading)"
BODY = "var(--article-text)"
LINE = "var(--article-border)"
BLUE = "hsl(var(--md-sys-color-primary))"


def svg(h: int, body: str, label: str) -> str:
    return (f'<svg viewBox="0 0 640 {h}" style="max-width:620px;margin:0 auto;display:block" '
            f'font-family="inherit" role="img" aria-label="{label}">\n{body}\n</svg>')


def cap(x: float, y: float, s: str, size=12, fill=BODY, anchor="start", weight="400", o=1.0):
    return (f'  <text x="{x}" y="{y}" font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}" font-weight="{weight}" opacity="{o}">{s}</text>')


def box(x, y, w, h, fill="none", stroke=LINE, sw=1.3, r=3, o=1.0, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}" opacity="{o}"{d}/>')


def bar(x, y, w, h, fill, o=1.0, r=2):
    return f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" opacity="{o}"/>'


def arrow(x0, y0, x1, y1, stroke=BODY, o=0.55, w=1.3):
    dx, dy = x1 - x0, y1 - y0
    n = max((dx * dx + dy * dy) ** 0.5, 1e-6)
    ux, uy = dx / n, dy / n
    hx, hy = x1 - ux * 7, y1 - uy * 7
    px, py = -uy * 3.6, ux * 3.6
    return (f'  <g opacity="{o}"><line x1="{x0}" y1="{y0}" x2="{hx:.1f}" y2="{hy:.1f}" '
            f'stroke="{stroke}" stroke-width="{w}"/><polygon points="{x1},{y1} '
            f'{hx + px:.1f},{hy + py:.1f} {hx - px:.1f},{hy - py:.1f}" fill="{stroke}"/></g>')


# ----------------------------------------------------------------- section 2

def breakpoint_figure():
    """One call has no seam. Three calls have two, and a seam is where you look."""
    b = [cap(0, 14, "one call", 12, BODY, weight="600", o=0.75)]
    b.append(box(0, 26, 300, 52, "none", LINE, 1.3, 4))
    b.append(cap(150, 57, "brief in, article out", 12.5, BODY, "middle", o=0.75))
    b.append(cap(150, 96, "nowhere to look when it is wrong", 11.5, BODY, "middle", o=0.55))

    b.append(cap(340, 14, "three calls", 12, HEAD, weight="600"))
    for i, name in enumerate(("outline", "draft", "review")):
        x = 340 + i * 100
        b.append(box(x, 26, 82, 52, "none", BLUE, 1.4, 4, 0.55))
        b.append(cap(x + 41, 57, name, 12, HEAD, "middle", "500"))
        if i:
            b.append(arrow(x - 16, 52, x - 3, 52, BLUE, 0.5))
        b.append(cap(x + 41, 98, ("read it", "diff it", "argue with it")[i], 11, BLUE,
                     "middle", o=0.8))
    return svg(120, "\n".join(b),
               "One opaque call beside a three-step chain whose seams can be inspected")


# ----------------------------------------------------------------- section 3

def fifty_steps():
    """Every optimiser step in the run, drawn one per tick. Warmup shaded."""
    b = [cap(0, 14, "528 examples, effective batch 32, three epochs", 12, HEAD, weight="600")]
    n, x0, gap = 50, 0, 12.4
    for i in range(n):
        x = x0 + i * gap
        warm = i < 10
        b.append(bar(x, 30, 7, 46, BLUE, 0.25 if warm else 0.85, 1.5))
    b.append(f'  <rect x="-2" y="24" width="{10 * gap - 3}" height="58" rx="3" fill="none" '
             f'stroke="{BLUE}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.55"/>')
    b.append(cap(58, 98, "warmup", 11.5, BLUE, "middle", o=0.9))
    b.append(cap(636, 98, "one tick is one optimiser step", 11.5, BODY, "end", o=0.6))
    b.append(cap(0, 126, "The entire fine-tune is this wide.", 12.5, HEAD, weight="600"))
    return svg(140, "\n".join(b),
               "Fifty tick marks, one per optimiser step, the first ten shaded as warmup")


# ----------------------------------------------------------------- section 4

def retrieval_vs_skill():
    """Retrieval scores and takes a few. A checklist does not survive that."""
    b = [cap(0, 14, "retrieval", 12, BODY, weight="600", o=0.75)]
    b.append(cap(352, 14, "a skill", 12, HEAD, weight="600"))
    items = 12
    for i in range(items):
        y = 30 + i * 20
        kept = i in (2, 6, 9)
        b.append(bar(0, y, 150 - (i % 4) * 14, 11, BLUE if kept else BODY,
                     0.85 if kept else 0.22))
        if kept:
            b.append(cap(176, y + 10, f"{0.9 - i * 0.06:.2f}", 10.5, BLUE, o=0.85))
        # the right-hand column: the same list, whole
        b.append(bar(352, y, 150 - (i % 4) * 14, 11, BLUE, 0.8))
    b.append(box(-4, 24, 200, items * 20 + 2, "none", LINE, 1.2, 4, 0.8))
    b.append(box(348, 24, 200, items * 20 + 2, "none", BLUE, 1.4, 4, 0.55))
    b.append(arrow(212, 148, 336, 148, BODY, 0.5))
    b.append(cap(274, 140, "top k", 11, BODY, "middle", o=0.7))
    b.append(cap(0, items * 20 + 50, "three of twelve, chosen by score", 11.5, BODY, o=0.7))
    b.append(cap(352, items * 20 + 50, "twelve of twelve, or nothing", 11.5, BLUE, weight="600"))
    b.append(cap(0, items * 20 + 74, "A checklist has no most relevant item.",
                 12.5, HEAD, weight="600"))
    return svg(items * 20 + 92, "\n".join(b),
               "Twelve checklist items with three selected by score, beside the same twelve delivered whole")


# ----------------------------------------------------------------- section 5

def deadlock():
    """The word count against the cap, seven times round."""
    # The heading sat at the same height as the first peak, so a data point
    # landed on top of the first word. The plot starts lower now.
    cap_y, n, x0, gap = 66, 7, 16, 41
    b = [cap(0, 14, "words in the expanded outline", 12, HEAD, weight="600")]
    b.append(f'  <line x1="0" y1="{cap_y}" x2="600" y2="{cap_y}" stroke="{BLUE}" '
             f'stroke-width="1.4" stroke-dasharray="5 4" opacity="0.8"/>')
    b.append(cap(606, cap_y + 4, "1,000", 11.5, BLUE, weight="600"))
    pts = [(x0 + i * gap, cap_y + (16 if i % 2 else -22)) for i in range(n * 2 + 1)]
    b.append('  <path d="M' + " L".join(f"{x} {y}" for x, y in pts) +
             f'" fill="none" stroke="{BLUE}" stroke-width="2" opacity="0.85"/>')
    for i, (x, y) in enumerate(pts):
        b.append(f'  <circle cx="{x}" cy="{y}" r="3.4" fill="{BLUE}" '
                 f'opacity="{0.9 if i % 2 == 0 else 0.5}"/>')
    b.append(cap(x0, cap_y - 32, "900", 11, BODY, "middle", o=0.75))
    b.append(cap(x0 + gap, cap_y + 36, "850", 11, BODY, "middle", o=0.75))
    b.append(cap(0, 128, "trim to fit", 11.5, BODY, o=0.7))
    b.append(cap(0, 146, "restore the section it dropped", 11.5, BODY, o=0.7))
    b.append(cap(606, 128, "× 7", 13, BLUE, "end", "700"))
    b.append(cap(0, 176, "A writer would have shipped 1,050 and nobody would have died.",
                 12.5, HEAD, weight="600"))
    return svg(192, "\n".join(b),
               "A word count oscillating above and below a 1,000 word cap seven times")


# ----------------------------------------------------------------- section 6

def what_survives():
    """Four architectures, and what is left of each to measure."""
    rows = (("workflow", "instance deleted, nothing exported", False),
            ("fine-tuned", "never served an article", False),
            ("reasoning agent", "observability was broken", False),
            ("app-agent hybrid", "reports", True))
    b = [cap(0, 14, "can this be measured now?", 12, HEAD, weight="600")]
    for i, (name, why, ok) in enumerate(rows):
        y = 32 + i * 42
        b.append(box(0, y, 620, 32, "none", BLUE if ok else LINE, 1.4 if ok else 1.2, 4,
                     1.0 if ok else 0.8, None if ok else "5 4"))
        b.append(cap(14, y + 21, name, 12.5, HEAD if ok else BODY,
                     weight="600" if ok else "400", o=1.0 if ok else 0.7))
        b.append(cap(606, y + 21, why, 12, BLUE if ok else BODY, "end",
                     "600" if ok else "400", 1.0 if ok else 0.6))
    b.append(cap(0, 32 + len(rows) * 42 + 22,
                 "We measured the last one because it was the first one that could be.",
                 12.5, HEAD, weight="600"))
    return svg(32 + len(rows) * 42 + 40, "\n".join(b),
               "Four architectures, three marked unmeasurable and one that reports")


FIGURES = {
    "s2-breakpoint": breakpoint_figure,
    "s3-fifty-steps": fifty_steps,
    "s4-retrieval-vs-skill": retrieval_vs_skill,
    "s5-deadlock": deadlock,
    "s6-what-survives": what_survives,
}

PREVIEW = """<!doctype html><meta charset="utf-8"><style>
:root {{ --article-text: hsl(213 7% 40%); --article-heading: hsl(220 7% 12%);
  --article-border: hsl(220 16% 88%); --md-sys-color-primary: 221 100% 47%; }}
body {{ background:#fff; font-family: 'DM Sans', system-ui, sans-serif; margin:0;
  padding:28px 0; width:680px; }}
section {{ padding:18px 30px 26px; border-bottom:1px solid #eef1f5; }}
h3 {{ font: 600 12px/1 ui-monospace, monospace; color:#8a919b; margin:0 0 14px;
  letter-spacing:.06em; text-transform:uppercase; }}
</style>{body}"""


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    parts = []
    for slug, fn in FIGURES.items():
        s = fn()
        (OUT / f"{slug}.svg").write_text(s, encoding="utf-8")
        parts.append(f"<section><h3>{slug}</h3>{s}</section>")
    (OUT / "preview.html").write_text(PREVIEW.format(body="".join(parts)), encoding="utf-8")
    print(f"  {len(FIGURES)} figures -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
