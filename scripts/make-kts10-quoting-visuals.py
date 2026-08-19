"""Cover and figures for `a-wrong-quote-that-looks-like-a-right-one`.

The post is about one internal agent: the SEO quoting workbench. Figures come in
two kinds, both SEONGON (Prosperous Blue carries the data, one Future Green
accent per figure), all English:

  * app screens on the tilted plane (the cover, the workbench, a failing quote),
  * flat technical diagrams (architecture, sequence, the gate).

    python scripts/make-kts10-quoting-visuals.py            # everything

Real structure/labels come from the live app (Kts10BgsxView.tsx, lib/kts10.ts),
translated to English; no prices, domains, or rate-card values.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from figure import (  # noqa: E402
    ACCENT, ACCENT_TEXT, BLUE, H, INK, MUTED, RULE, W,
    Plane, emit, lifted, slab, text, wrap,
)

ROOT = Path(__file__).resolve().parent.parent
COVERS = ROOT / "public" / "covers"
FIGS = ROOT / "public" / "figures" / "kts10-quoting"

DEFS = f"""  <defs>
    <linearGradient id="head" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{BLUE}"/>
      <stop offset="1" stop-color="#2f6bf6"/>
    </linearGradient>
    <linearGradient id="chip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a72f4"/>
      <stop offset="1" stop-color="{BLUE}"/>
    </linearGradient>
    <linearGradient id="plate" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.94"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.42"/>
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="7" stdDeviation="10" flood-color="#0b1a3a" flood-opacity="0.14"/>
    </filter>
  </defs>
"""

# English labels (translated from the live Vietnamese app).
TABS = ("Quote", "Justify", "Topics", "Rivals", "Commitment", "Keywords", "Assumptions")
STEPS = ("input", "check keywords", "read rankings", "pick rivals", "cluster",
         "estimate KPI", "size off-page", "size content", "assemble costs")


# =========================================================== flat primitives

def fbox(x0, y0, x1, y1, fill="#ffffff", stroke=RULE, o=1.0, delay=0.0, cls="rise", w=1.4):
    st = f' stroke="{stroke}" stroke-width="{w}"' if stroke else ""
    return (f'<rect class="{cls}" x="{x0:.1f}" y="{y0:.1f}" width="{x1 - x0:.1f}" '
            f'height="{y1 - y0:.1f}" rx="10" fill="{fill}"{st} '
            f'style="--o:{o};animation-delay:{delay:.2f}s"/>')


def ftext(x, y, s, size=14, fill=MUTED, anchor="start", weight="400", mono=False):
    s = str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    fam = " font-family=\"ui-monospace, 'JetBrains Mono', monospace\"" if mono else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-size="{size}" '
            f'fill="{fill}" font-weight="{weight}"{fam}>{s}</text>')


def farrow(x0, y0, x1, y1, col=BLUE, o=0.55, delay=0.0, w=1.7, cls="c", dash=None):
    dx, dy = x1 - x0, y1 - y0
    n = max((dx * dx + dy * dy) ** 0.5, 1e-6)
    ux, uy = dx / n, dy / n
    hx, hy = x1 - ux * 9, y1 - uy * 9
    px, py = -uy * 4.5, ux * 4.5
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<g class="{cls}" style="--o:{o};animation-delay:{delay:.2f}s">'
            f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{hx:.1f}" y2="{hy:.1f}" '
            f'stroke="{col}" stroke-width="{w}"{d}/>'
            f'<polygon points="{x1:.1f},{y1:.1f} {hx + px:.1f},{hy + py:.1f} '
            f'{hx - px:.1f},{hy - py:.1f}" fill="{col}"/></g>')


def fdot(x, y, r, fill, o=1.0, delay=0.0, cls="pop"):
    return (f'<circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" '
            f'style="--o:{o};animation-delay:{delay:.2f}s"/>')


def person(x, y, col, delay=0.0, cls="pop"):
    return (f'<g class="{cls}" style="--o:1;animation-delay:{delay:.2f}s">'
            f'<circle cx="{x:.1f}" cy="{y - 11:.1f}" r="7" fill="{col}"/>'
            f'<path d="M{x - 12:.1f} {y + 11:.1f} a12 12 0 0 1 24 0 z" fill="{col}"/></g>')


def caption(s):
    return ftext(W / 2, 600, s, 15, MUTED, "middle")


# =============================================== technical: architecture

def kts10_architecture():
    m = []
    m.append(person(96, 150, ACCENT_TEXT, 0.02))
    m.append(ftext(96, 186, "operator", 12, MUTED, "middle"))
    m.append(fbox(150, 108, 470, 190, "#ffffff", BLUE, 1, 0.06))
    m.append(ftext(310, 150, "the app", 17, INK, "middle", "600"))
    m.append(ftext(310, 174, "holds the state, one row per step", 12.5, MUTED, "middle"))
    m.append(fbox(520, 108, 850, 190, "#ffffff", RULE, 1, 0.12))
    m.append(ftext(685, 146, "the agent", 17, INK, "middle", "600"))
    m.append(ftext(685, 168, "navigates, never computes a number", 12, MUTED, "middle"))
    for i, tool in enumerate(("get_quote", "run_step", "set_route")):
        tx = 540 + i * 103
        m.append(fbox(tx, 200, tx + 96, 226, "#f4f7ff", BLUE, 1, 0.16 + i * 0.03, w=1))
        m.append(ftext(tx + 48, 217, tool, 10.5, BLUE, "middle", mono=True))
    m.append(farrow(128, 150, 150, 150, MUTED, 0.5, 0.08))
    m.append(farrow(470, 135, 520, 135, BLUE, 0.55, 0.14))
    m.append(farrow(520, 163, 470, 163, BLUE, 0.55, 0.16))

    py0 = 300
    m.append(ftext(150, py0 - 12, "nine deterministic steps", 12, MUTED))
    sw = (850 - 150) / 9
    for i, s in enumerate(STEPS):
        sx = 150 + i * sw
        model = (i == 3)
        m.append(fbox(sx + 3, py0, sx + sw - 3, py0 + 74,
                      "#f4f7ff" if model else "#ffffff", BLUE if model else RULE,
                      1, 0.2 + i * 0.03))
        m.append(ftext(sx + sw / 2, py0 + 26, f"{i + 1}", 11, BLUE if model else MUTED,
                       "middle", "600"))
        m.append(ftext(sx + sw / 2, py0 + 50, s, 9, INK, "middle"))
    mx = 150 + 3.5 * sw
    m.append(fdot(mx, py0 + 92, 4.5, BLUE, 1, 0.32))
    m.append(ftext(mx, py0 + 112, "one step calls the model", 11, ACCENT_TEXT, "middle", "500"))
    m.append(farrow(310, 190, 310, py0, BLUE, 0.4, 0.2))

    m.append(fbox(880, 108, 1120, 300, "#f6f8fb", RULE, 1, 0.24))
    m.append(ftext(1000, 138, "quote_stages", 13, INK, "middle", "600", mono=True))
    for k in range(4):
        m.append(fbox(902, 158 + k * 30, 1098, 182 + k * 30, "#ffffff", RULE, 1, 0.28 + k * 0.02, w=1))
    m.append(ftext(1000, 292, "one row per step", 11, MUTED, "middle"))
    m.append(farrow(850, 250, 880, 250, BLUE, 0.45, 0.3))

    gy = 430
    m.append(f'<line x1="150" y1="{gy}" x2="850" y2="{gy}" stroke="{ACCENT_TEXT}" '
             f'stroke-width="2" stroke-dasharray="7 5" class="draw" '
             f'style="--len:720;animation-delay:0.42s"/>')
    m.append(ftext(150, gy + 22, "invariant gate: every result must be present, not just truthy",
                   13, ACCENT_TEXT))
    m.append(farrow(310, py0 + 74, 310, gy - 4, BLUE, 0.4, 0.4))
    m.append(fbox(150, gy + 44, 470, gy + 96, "#ffffff", BLUE, 1, 0.5))
    m.append(ftext(310, gy + 76, "the workbench a human approves", 13.5, INK, "middle", "600"))
    m.append(person(560, gy + 74, ACCENT_TEXT, 0.56))
    m.append(farrow(470, gy + 70, 542, gy + 70, ACCENT_TEXT, 0.6, 0.56))

    m.append(caption("nine deterministic steps; the state lives in the rows they write, not the chat"))
    return wrap(DEFS + f'<g filter="url(#lift)">{"".join(m)}</g>')


# =============================================== technical: sequence

def kts10_sequence():
    m = []
    lanes = [("Operator", 96, ACCENT_TEXT), ("The app", 268, BLUE), ("Agent", 440, BLUE),
             ("Pipeline", 640, BLUE), ("quote_stages", 900, MUTED), ("Gate", 1104, ACCENT_TEXT)]
    top, bot = 96, 540
    for name, x, col in lanes:
        m.append(fbox(x - 78, top - 30, x + 78, top, "#ffffff", col, 1, 0.02, w=1.3))
        m.append(ftext(x, top - 11, name, 12, INK, "middle", "600", mono=(name == "quote_stages")))
        m.append(f'<line x1="{x}" y1="{top}" x2="{x}" y2="{bot}" stroke="{RULE}" '
                 f'stroke-width="1.2" stroke-dasharray="3 4"/>')
    X = {n: x for n, x, _ in lanes}

    def msg(a, b, y, label, col=BLUE, delay=0.0, ret=False):
        x0, x1 = X[a], X[b]
        hx = x1 - (9 if x1 > x0 else -9)
        dd = ' stroke-dasharray="5 3"' if ret else ""
        return (f'<g class="c" style="--o:0.9;animation-delay:{delay:.2f}s">'
                f'<line x1="{x0}" y1="{y}" x2="{hx}" y2="{y}" stroke="{col}" stroke-width="1.5"{dd}/>'
                f'<polygon points="{x1},{y} {hx},{y - 4.5} {hx},{y + 4.5}" fill="{col}"/>'
                f'<text x="{(x0 + x1) / 2:.0f}" y="{y - 6}" text-anchor="middle" font-size="11" '
                f'fill="{INK}">{label}</text></g>')

    y = top + 40
    m.append(msg("Operator", "The app", y, "submit a keyword set", BLUE, 0.08)); y += 34
    m.append(msg("The app", "quote_stages", y, "create an empty quote", BLUE, 0.14)); y += 34
    m.append(msg("The app", "Agent", y, "take it", BLUE, 0.2)); y += 30
    ly0 = y - 4
    m.append(f'<rect class="rise" x="{X["Agent"] - 96}" y="{ly0}" '
             f'width="{X["quote_stages"] - X["Agent"] + 150}" height="96" rx="8" fill="none" '
             f'stroke="{RULE}" stroke-width="1.2" stroke-dasharray="2 3" '
             f'style="--o:1;animation-delay:0.26s"/>')
    m.append(f'<rect x="{X["Agent"] - 96}" y="{ly0}" width="118" height="20" fill="#eef3ff" '
             f'class="rise" style="--o:1;animation-delay:0.26s"/>')
    m.append(ftext(X["Agent"] - 90, ly0 + 14, "loop · 9 steps", 10, BLUE, "start", "600"))
    y = ly0 + 42
    m.append(msg("Agent", "Pipeline", y, "run step k", BLUE, 0.3)); y += 32
    m.append(msg("Pipeline", "quote_stages", y, "write its row", BLUE, 0.36)); y += 22
    m.append(ftext(X["Pipeline"], ly0 + 90, "step 4 calls the model", 10, ACCENT_TEXT, "middle"))
    y = ly0 + 116
    m.append(msg("Agent", "Gate", y, "every result present?", ACCENT_TEXT, 0.44)); y += 32
    m.append(msg("Gate", "The app", y, "pass", ACCENT_TEXT, 0.5, ret=True)); y += 32
    m.append(msg("The app", "Operator", y, "quote ready to approve", BLUE, 0.56, ret=True))

    m.append(caption("one run: every step writes a row; the gate checks before a human sees it"))
    return wrap(DEFS + f'<g filter="url(#lift)">{"".join(m)}</g>')


# =============================================== technical: the gate

def kts10_gate():
    m = []
    cards = (("v1 · truthiness", "if not stages.get(step):", 120, "#b2453f"),
             ("v2 · presence", "if step not in stages:", 660, ACCENT_TEXT))
    for lab, code, x, col in cards:
        m.append(fbox(x, 96, x + 420, 158, "#ffffff", RULE, 1, 0.06))
        m.append(ftext(x + 20, 122, lab, 11.5, col, "start", "600"))
        m.append(ftext(x + 20, 146, code, 15, INK, "start", mono=True))

    rows = (("full payload", "{ price, links... }", "passes", ACCENT_TEXT, "passes", ACCENT_TEXT, False),
            ("empty payload", "{ }", "passes, slips through", "#b2453f", "fires", ACCENT_TEXT, True),
            ("missing step", "(absent)", "fires", MUTED, "fires", MUTED, False))
    ry, rh = 210, 88
    for i, (pl, val, v1, c1, v2, c2, div) in enumerate(rows):
        y = ry + i * rh
        cy = y + rh / 2
        if div:
            m.append(f'<rect class="rise" x="80" y="{y}" width="1040" height="{rh - 12}" rx="10" '
                     f'fill="#eef7f1" style="--o:1;animation-delay:{0.16 + i * 0.08:.2f}s"/>')
        m.append(fbox(490, y + 8, 710, y + rh - 20, "#ffffff", BLUE if div else RULE, 1,
                      0.18 + i * 0.08, w=1.3 if div else 1))
        m.append(ftext(600, cy - 6, pl, 13, INK, "middle", "600"))
        m.append(ftext(600, cy + 14, val, 12, MUTED, "middle", mono=True))
        m.append(ftext(460, cy, v1, 13.5, c1, "end", "700" if div else "400"))
        m.append(ftext(740, cy, v2, 13.5, c2, "start", "700" if div else "400"))
        if div:
            m.append(fdot(762, cy - 24, 5, ACCENT, 1, 0.4))
    m.append(ftext(W / 2, ry + 3 * rh + 4,
                   "the empty payload is the whole bug: one check waves it through, the other fires",
                   12, ACCENT_TEXT, "middle"))
    m.append(caption("empty is not never-ran; the gate has to know the difference"))
    return wrap(DEFS + f'<g filter="url(#lift)">{"".join(m)}</g>')


# =========================================== tilted-plane app screens

def kit(p: Plane):
    def rect(a, b, c, d, fill=None, o=1.0, delay=0.0, stroke=None, cls="rise"):
        return slab(p, a, b, c, d, fill, o, delay, stroke, cls)

    def t(x, y, s, size=13, fill=MUTED, anchor="start", weight="400"):
        return text(p, x, y, s, size, fill, anchor, weight)

    def dotp(x, y, r, fill, o=1.0, delay=0.0, cls="pop"):
        cx, cy = p(x, y)
        return (f'<circle class="{cls}" cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}" '
                f'style="--o:{o};animation-delay:{delay:.2f}s"/>')

    return rect, t, dotp


def topbar(rect, t, x0, x1, y0, delay, active=0):
    out = [rect(x0, y0, x1, y0 + 0.052, "url(#head)", 1, delay),
           t(x0 + 0.014, y0 + 0.036, "SEO Production Quote", 12, "#ffffff", weight="600")]
    out.append(rect(x1 - 0.155, y0 + 0.011, x1 - 0.088, y0 + 0.042, "#ffffff", 0.18, delay + 0.02))
    out.append(t(x1 - 0.1215, y0 + 0.033, "Run", 8.5, "#ffffff", "middle"))
    out.append(rect(x1 - 0.082, y0 + 0.011, x1 - 0.014, y0 + 0.042, "#ffffff", 0.28, delay + 0.02))
    out.append(t(x1 - 0.048, y0 + 0.033, "Agent", 8.5, "#ffffff", "middle"))
    ty = y0 + 0.052
    tw = (x1 - x0) / len(TABS)
    for i, tab in enumerate(TABS):
        cx = x0 + tw * (i + 0.5)
        on = (i == active)
        if on:
            out.append(rect(x0 + i * tw + 0.006, ty + 0.006, x0 + (i + 1) * tw - 0.006,
                            ty + 0.044, BLUE, 0.10, delay + 0.05 + i * 0.01))
        out.append(t(cx, ty + 0.033, tab, 10 if on else 9.5, INK if on else MUTED,
                     "middle", "600" if on else "400"))
    return "".join(out), ty + 0.05


COST_COLS = (("Item", 0.045, "start"), ("Qty", 0.40, "end"),
             ("Unit", 0.52, "end"), ("Min cost", 0.635, "end"), ("Max cost", 0.71, "end"))
COST_ROWS = (("Content", None, True, "green"), ("New blog posts", "62", False, "green"),
             ("Product posts", "28", False, "green"), ("Off-page", None, True, "blue"),
             ("Guest-post links", "•", False, "blue"), ("Technical", None, True, "green"),
             ("Personnel", None, True, "amber"))
SRC = {"green": ACCENT, "blue": BLUE, "amber": "#e0a000"}


def cover():
    p = Plane(600, 336, 1128, 520, umax=1, vmax=1)
    rect, t, dotp = kit(p)
    m = [f'<polygon class="rise" points="{p.quad(-0.02, -0.03, 1.02, 1.03)}" '
         f'fill="url(#plate)" filter="url(#soft)" style="--o:1;animation-delay:0s"/>']
    head, ty = topbar(rect, t, 0.02, 0.72, 0.03, 0.04, active=0)
    m.append(head)
    m.append(t(0.045, ty + 0.03, "Quote", 11, INK, weight="600"))
    m.append(t(0.10, ty + 0.03, "edit directly in the table", 9, MUTED))
    hy = ty + 0.055
    m.append(rect(0.03, hy, 0.72, hy + 0.032, "#f0f4f9", 1, 0.10))
    for lab, x, an in COST_COLS:
        m.append(t(x, hy + 0.022, lab, 8.5, MUTED, an, "600"))
    m.append(rect(0.36, hy, 0.565, hy + 0.032, BLUE, 0.06, 0.11))
    ry, rh = hy + 0.032, 0.052
    for i, (label, sl, group, src) in enumerate(COST_ROWS):
        y = ry + i * rh
        d = 0.16 + i * 0.05
        if group:
            m.append(rect(0.03, y, 0.72, y + rh, "#f6f8fb", 1, d))
        m.append(dotp(0.038, y + rh / 2, 3.4, SRC[src], 1, d + 0.02,
                      cls="pop" if src == "green" else "rise"))
        m.append(t(0.058, y + rh / 2 + 0.012, label, 9.5 if not group else 10, INK,
                   weight="600" if group else "400"))
        if sl and sl != "•":
            m.append(t(0.40, y + rh / 2 + 0.012, sl, 9.5, INK, "end"))
            m.append(rect(0.47, y + 0.014, 0.565, y + rh - 0.014, BLUE, 0.16, d + 0.04))
            m.append(rect(0.60, y + 0.016, 0.715, y + rh - 0.016, MUTED, 0.14, d + 0.05))
        m.append(rect(0.03, y + rh - 0.002, 0.72, y + rh, RULE, 0.7, d))
    fy = ry + 4 * rh
    m.append(rect(0.06, fy + 0.016, 0.36, fy + rh - 0.016, BLUE, 0.10, 0.9, cls="type"))
    tly = ry + 7 * rh + 0.006
    m.append(rect(0.03, tly, 0.72, tly + 0.05, BLUE, 0.09, 0.9))
    m.append(t(0.058, tly + 0.033, "QUOTE TOTAL", 11, INK, weight="700"))
    m.append(rect(0.56, tly + 0.014, 0.715, tly + 0.038, BLUE, 0.6, 0.94, cls="pop"))
    m.append(rect(0.735, 0.03, 0.98, 0.965, "#ffffff", 1, 0.10, RULE, cls="rise"))
    m.append(rect(0.735, 0.03, 0.98, 0.082, "#f6f8fb", 1, 0.11))
    m.append(t(0.752, 0.064, "Quoting agent", 10.5, INK, weight="600"))
    m.append(rect(0.775, 0.11, 0.965, 0.20, "url(#chip)", 1, 0.5, cls="rise"))
    m.append(t(0.955, 0.152, "rivals: dropped 4 sites", 8.5, "#ffffff", "end"))
    m.append(t(0.955, 0.178, "that only share a keyword", 8.5, "#ffffff", "end"))
    m.append(rect(0.752, 0.23, 0.93, 0.335, "#f2f4f9", 1, 0.56, cls="rise"))
    m.append(t(0.766, 0.276, "assembled the cost table,", 8.5, MUTED))
    m.append(t(0.766, 0.303, "9 of 9 steps done.", 8.5, MUTED))
    m.append(rect(0.775, 0.36, 0.965, 0.45, "url(#chip)", 1, 0.62, cls="rise"))
    m.append(t(0.955, 0.402, "invariant gate: every", 8.5, "#ffffff", "end"))
    m.append(t(0.955, 0.428, "number present before ship", 8.5, "#ffffff", "end"))
    m.append(rect(0.752, 0.88, 0.965, 0.945, "#ffffff", 1, 0.7, RULE, cls="rise"))
    m.append(t(0.766, 0.918, "message the agent…", 8.5, MUTED))
    return wrap(DEFS + lifted("".join(m)))


def kts10_workbench():
    """The traceability 'Explain & adjust' glass box: the workbench's signature."""
    p = Plane(600, 336, 1012, 500, umax=1, vmax=1)
    rect, t, dotp = kit(p)
    m = [f'<polygon class="rise" points="{p.quad(-0.02, -0.03, 1.02, 1.03)}" '
         f'fill="url(#plate)" filter="url(#soft)" style="--o:1;animation-delay:0s"/>']
    m.append(t(0.04, 0.10, "Explain & adjust", 13, INK, weight="600"))
    m.append(t(0.26, 0.10, "why this number", 11, MUTED))
    m.append(t(0.955, 0.10, "↗", 15, ACCENT_TEXT, "end"))
    chain = (("Commitment 62% = current 41% plus part of the gap", "the committed target", "Step 6 · estimate KPI"),
             ("Current 41% = 128 of 312 keywords", "counted straight from Google, not estimated", "Step 3 · read rankings"),
             ("Article count = MAX(3 estimates)", "so it never under-sizes", "Step 8 · size content"))
    cx, y0, ny = 0.08, 0.22, 0.20
    lx0, ly0 = p(cx, y0 + 0.02)
    lx1, ly1 = p(cx, y0 + 2 * ny + 0.02)
    m.append(f'<line class="c" x1="{lx0:.1f}" y1="{ly0:.1f}" x2="{lx1:.1f}" y2="{ly1:.1f}" '
             f'stroke="{BLUE}" stroke-opacity="0.35" stroke-width="1.6" style="--o:0.5;animation-delay:0.1s"/>')
    for i, (expr, why, link) in enumerate(chain):
        y = y0 + i * ny
        d = 0.12 + i * 0.08
        last = (i == 2)
        px, py = p(cx, y + 0.02)
        m.append(f'<circle class="pop" cx="{px:.1f}" cy="{py:.1f}" r="5.2" '
                 f'fill="{MUTED if last else "#ffffff"}" style="--o:1;animation-delay:{d + 0.02:.2f}s"/>')
        if not last:
            m.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="5.2" fill="none" stroke="{BLUE}" stroke-width="1.6"/>')
        m.append(t(cx + 0.03, y + 0.006, expr, 12, INK, weight="500"))
        m.append(t(cx + 0.03, y + 0.05, why, 10.5, MUTED))
        m.append(t(cx + 0.03, y + 0.092, f"↳ {link}", 10.5, ACCENT_TEXT, weight="500"))
    ly = 0.80
    m.append(rect(0.04, ly - 0.035, 0.96, ly + 0.06, "#f6f8fb", 1, 0.5))
    legend = (("deterministic formula", ACCENT), ("agent judgment", BLUE), ("human-locked", "#e0a000"))
    lxp = 0.08
    for i, (label, dot) in enumerate(legend):
        m.append(dotp(lxp, ly + 0.012, 4.5, dot, 1, 0.58 + i * 0.06, cls="pop" if i == 0 else "rise"))
        m.append(t(lxp + 0.022, ly + 0.024, label, 11, INK))
        lxp += 0.30
    return wrap(DEFS + lifted("".join(m)))


def kts10_silent_failure():
    p = Plane(600, 340, 1052, 520, umax=1, vmax=1)
    rect, t, dotp = kit(p)
    m = [f'<rect x="0" y="0" width="{W}" height="{H}" fill="none"/>']
    m.append(rect(0.05, 0.05, 0.95, 0.90, "#ffffff", 1, 0.02, RULE, cls="rise"))
    m.append(rect(0.05, 0.05, 0.95, 0.125, "url(#head)", 1, 0.03))
    m.append(t(0.072, 0.10, "Quote · edit directly in the table", 12.5, "#ffffff", weight="600"))
    m.append(rect(0.80, 0.066, 0.93, 0.11, ACCENT, 0.9, 0.9, cls="pop"))
    m.append(t(0.865, 0.098, "9/9 · done", 10, ACCENT_TEXT, "middle", "700"))
    cols = (("Item", 0.09, "start"), ("Qty", 0.52, "end"), ("Unit", 0.63, "end"),
            ("Min cost", 0.78, "end"), ("Max cost", 0.90, "end"))
    hy = 0.145
    m.append(rect(0.05, hy, 0.95, hy + 0.05, "#f0f4f9", 1, 0.10))
    for lab, x, an in cols:
        m.append(t(x, hy + 0.033, lab, 9.5, MUTED, an, "600"))
    rows = (("Content", "", False, "green"), ("New blog posts", "62", True, "green"),
            ("Product posts", "28", True, "green"), ("Off-page (booking)", "GONE", False, "blue"),
            ("Technical", "", False, "green"), ("Personnel", "", False, "green"))
    ry, rh = hy + 0.05, 0.083
    for i, (label, sl, filled, src) in enumerate(rows):
        y = ry + i * rh
        d = 0.14 + i * 0.06
        gone = (sl == "GONE")
        if gone:
            m.append(rect(0.05, y, 0.95, y + rh, "#fbeceb", 0.7, d))
        elif label in ("Content", "Technical", "Personnel"):
            m.append(rect(0.05, y, 0.95, y + rh, "#f6f8fb", 1, d))
        if not gone:
            m.append(dotp(0.062, y + rh / 2, 3.6, SRC[src], 1, d + 0.02,
                          cls="pop" if src == "green" else "rise"))
        m.append(t(0.082, y + rh / 2 + 0.012, label, 11, INK, weight="600" if not filled else "400"))
        if filled:
            m.append(t(0.52, y + rh / 2 + 0.012, sl, 11, INK, "end"))
            m.append(rect(0.56, y + 0.022, 0.665, y + rh - 0.022, BLUE, 0.16, d + 0.04))
            m.append(rect(0.70, y + 0.024, 0.90, y + rh - 0.024, MUTED, 0.14, d + 0.05))
        if gone:
            gx0, gy = p(0.30, y + rh / 2)
            gx1, _ = p(0.90, y + rh / 2)
            m.append(f'<line class="c" x1="{gx0:.1f}" y1="{gy:.1f}" x2="{gx1:.1f}" y2="{gy:.1f}" '
                     f'stroke="{MUTED}" stroke-width="1.4" stroke-dasharray="6 5" '
                     f'style="--o:0.4;animation-delay:{d + 0.05:.2f}s"/>')
        m.append(rect(0.05, y + rh - 0.002, 0.95, y + rh, RULE, 0.7, d))
    tly = ry + 6 * rh
    m.append(rect(0.05, tly, 0.95, tly + 0.058, BLUE, 0.09, 0.86))
    m.append(t(0.082, tly + 0.04, "QUOTE TOTAL", 12, INK, weight="700"))
    m.append(rect(0.72, tly + 0.016, 0.90, tly + 0.044, BLUE, 0.55, 0.9, cls="pop"))
    m.append(t(0.50, 0.955, "a whole block gone, no error, no warning; the total still computes and looks clean",
               13, MUTED, "middle"))
    return wrap(DEFS + lifted("".join(m)))


COVER_FIGS = {"a-wrong-quote-that-looks-like-a-right-one": cover}
SLIDE_FIGS = {
    "kts10-architecture": kts10_architecture,
    "kts10-sequence": kts10_sequence,
    "kts10-gate": kts10_gate,
    "kts10-workbench": kts10_workbench,
    "kts10-silent-failure": kts10_silent_failure,
}


if __name__ == "__main__":
    argv = sys.argv[1:]
    cov = [s for s in argv if s in COVER_FIGS] or (list(COVER_FIGS) if not argv else [])
    sld = [s for s in argv if s in SLIDE_FIGS] or (list(SLIDE_FIGS) if not argv else [])
    rc = emit(COVER_FIGS, COVERS, cov) if cov else 0
    rc = emit(SLIDE_FIGS, FIGS, sld) or rc if sld else rc
    sys.exit(rc)
