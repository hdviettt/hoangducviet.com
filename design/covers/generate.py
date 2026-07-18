"""Cover generator v3 — "SEONGON Flow" (see README.md).

Fusion of three languages:
- Google/DeepMind fluidity: soft light gradients, blurred blobs, glassy focus.
- SEONGON identity: the Prosperous Blue -> Future Green gradient, and the
  brand keyvisual's signature ECHO OUTLINES trailing behind a filled shape.
- Illustrative motifs: one abstract composition per post, one idea each.

Run:  python design/covers/generate.py   ->  public/covers/*.svg
Adding a post = one COVERS entry + (optionally) one motif function.
"""

from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "public" / "covers"

# ---- SEONGON brand ----------------------------------------------------------
P_BLUE = "#004aef"   # Prosperous Blue
F_GREEN = "#07ef9c"  # Future Green
T_CYAN = "#0fd6f7"   # Transform Cyan
B_YELLOW = "#ffce00" # Breakthrough Yellow
INKX = "#1e2126"

TINTS = {
    "blue": ["#004aef", "#2E62F1", "#7E9BF7", "#C7D6FB"],
    "green": ["#07ef9c", "#3DF3B1", "#86F7CC", "#C9FBE8"],
    "cyan": ["#0fd6f7", "#57E2FA", "#9FEFFC", "#D7F9FE"],
    "yellow": ["#ffce00", "#FFDC4D", "#FFEB99", "#FFF7D6"],
}

STYLE = """
      .drift1 { animation: d1 18s ease-in-out infinite alternate; }
      .drift2 { animation: d2 24s ease-in-out infinite alternate; }
      @keyframes d1 { to { transform: translate(22px, -16px); } }
      @keyframes d2 { to { transform: translate(-18px, 14px); } }
      .float { animation: fl 12s ease-in-out infinite alternate; }
      @keyframes fl { to { transform: translateY(-12px); } }
      .spin { animation: sp 60s linear infinite; }
      @keyframes sp { to { transform: rotate(360deg); } }
      .sparkle { animation: sk 6s ease-in-out infinite alternate; }
      @keyframes sk { from { transform: scale(0.94); } to { transform: scale(1.08); } }
      @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
"""

BASE_DEFS = f"""    <linearGradient id="brand" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="{P_BLUE}"/>
      <stop offset="1" stop-color="{F_GREEN}"/>
    </linearGradient>
    <linearGradient id="brandSoft" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="{TINTS['blue'][2]}"/>
      <stop offset="1" stop-color="{TINTS['green'][2]}"/>
    </linearGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="55"/>
    </filter>
"""


def frame(body: str, extra_defs: str = "", bg=("#F2F6FF", "#F3FEF9")) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="{bg[0]}"/>
      <stop offset="1" stop-color="{bg[1]}"/>
    </linearGradient>
{BASE_DEFS}{extra_defs}    <style>{STYLE}</style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
{body}</svg>
"""


def blob(cx, cy, r, color, opacity=0.5, cls="drift1"):
    return (
        f'  <circle class="{cls}" cx="{cx}" cy="{cy}" r="{r}" fill="{color}" '
        f'fill-opacity="{opacity}" filter="url(#soft)"/>\n'
    )


def echo_rrect(x, y, w, h, rx, n=3, step=26, stroke="url(#brand)", body_fill="url(#brand)"):
    """The SEONGON keyvisual move: a filled shape with outline echoes trailing
    down-left behind it, fading as they recede."""
    s = ""
    for i in range(n, 0, -1):
        o = 0.55 - i * 0.13
        s += (
            f'  <rect x="{x - i * step}" y="{y + i * step * 0.72}" width="{w}" height="{h}" '
            f'rx="{rx}" fill="none" stroke="{stroke}" stroke-opacity="{o:.2f}" stroke-width="2.5"/>\n'
        )
    s += f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{body_fill}"/>\n'
    return s


def echo_circle(cx, cy, r, n=3, step=24, stroke="url(#brand)"):
    s = ""
    for i in range(n, 0, -1):
        o = 0.5 - i * 0.12
        s += (
            f'  <circle cx="{cx - i * step}" cy="{cy + i * step * 0.72}" r="{r}" '
            f'fill="none" stroke="{stroke}" stroke-opacity="{o:.2f}" stroke-width="2.5"/>\n'
        )
    return s


def spark(cx, cy, r, fill=B_YELLOW, cls="sparkle"):
    d = r * 0.22
    path = (
        f"M {cx} {cy - r} Q {cx + d} {cy - d} {cx + r} {cy} "
        f"Q {cx + d} {cy + d} {cx} {cy + r} "
        f"Q {cx - d} {cy + d} {cx - r} {cy} "
        f"Q {cx - d} {cy - d} {cx} {cy - r} Z"
    )
    return (
        f'  <g class="{cls}" style="transform-origin:{cx}px {cy}px">'
        f'<path d="{path}" fill="{fill}"/></g>\n'
    )


def orb(cx, cy, r, grad_id, deep, light):
    defs = f"""    <radialGradient id="{grad_id}" cx="0.35" cy="0.3" r="0.95">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.45" stop-color="{light}"/>
      <stop offset="1" stop-color="{deep}"/>
    </radialGradient>
"""
    return defs, f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#{grad_id})"/>\n'


def ribbon(points, width, stroke, opacity=0.85, cls=""):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = points
    c = f' class="{cls}"' if cls else ""
    return (
        f'  <path{c} d="M {x0} {y0} C {x1} {y1}, {x2} {y2}, {x3} {y3}" '
        f'fill="none" stroke="{stroke}" stroke-opacity="{opacity}" '
        f'stroke-width="{width}" stroke-linecap="round"/>\n'
    )


# ---------------------------------------------------------------- motifs
# v4: every focal composition ILLUSTRATES the post's subject (deepmind rule:
# the thumbnail is the topic), rendered in the SEONGON Flow language.


def page_tile(x, y, w=110, h=76, rx=14, lines=3, fill="#FFFFFF", op=0.92):
    """A little document/page: white glass tile with text lines."""
    s = (
        f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" '
        f'fill-opacity="{op}" stroke="#FFFFFF" stroke-opacity="0.95" stroke-width="2"/>\n'
    )
    for i in range(lines):
        lw = w - 34 - (i == lines - 1) * (w * 0.3)
        s += (
            f'  <rect x="{x + 16}" y="{y + 18 + i * 16}" width="{lw:.0f}" height="7" rx="3.5" '
            f'fill="{TINTS["blue"][2]}" fill-opacity="0.8"/>\n'
        )
    return s


def app_window(x, y, w=96, h=72, rx=12):
    """A tiny app window: header dots + body block."""
    s = (
        f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="#FFFFFF" '
        f'fill-opacity="0.92" stroke="#FFFFFF" stroke-width="2"/>\n'
    )
    for i, c in enumerate([P_BLUE, T_CYAN, F_GREEN]):
        s += f'  <circle cx="{x + 16 + i * 13}" cy="{y + 14}" r="4" fill="{c}"/>\n'
    s += (
        f'  <rect x="{x + 12}" y="{y + 26}" width="{w - 24}" height="{h - 38}" rx="8" '
        f'fill="url(#brandSoft)" fill-opacity="0.65"/>\n'
    )
    return s


def link(x1, y1, x2, y2, op=0.5, width=2):
    return (
        f'  <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="url(#brand)" '
        f'stroke-opacity="{op}" stroke-width="{width}"/>\n'
    )


def node(cx, cy, r, filled=True):
    if filled:
        return f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#brand)"/>\n'
    return (
        f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="#FFFFFF" fill-opacity="0.9" '
        f'stroke="url(#brand)" stroke-opacity="0.8" stroke-width="2.5"/>\n'
    )


def series_numeral(n, deep):
    return (
        f'  <text x="60" y="580" font-size="360" font-weight="700" '
        f'fill="{deep}" fill-opacity="0.13" letter-spacing="-12">{n:02d}</text>\n'
    )


def m_blueprint():
    """The blueprint: a board mapping the agent roster, three pillars lit."""
    b = blob(250, 170, 220, TINTS["blue"][2], 0.5, "drift1")
    b += blob(960, 480, 250, TINTS["green"][2], 0.5, "drift2")
    b += echo_rrect(400, 130, 460, 340, 36, n=3, step=28, body_fill="#FFFFFF")
    b += '  <rect x="400" y="130" width="460" height="340" rx="36" fill="#FFFFFF" fill-opacity="0.6"/>\n'
    lit = {(0, 0), (1, 2), (2, 1)}
    for r in range(3):
        for c in range(5):
            x, y = 436 + c * 82, 172 + r * 90
            if (r, c) in lit:
                b += f'  <rect class="float" style="transform-origin:{x + 29}px {y + 29}px" x="{x}" y="{y}" width="58" height="58" rx="14" fill="url(#brand)"/>\n'
            else:
                b += (
                    f'  <rect x="{x}" y="{y}" width="58" height="58" rx="14" fill="none" '
                    f'stroke="url(#brand)" stroke-opacity="0.4" stroke-width="2"/>\n'
                )
    b += spark(950, 130, 48, B_YELLOW)
    return "", b


def m_failed():
    """Five pillars, four faded, one standing (4 of 5 missed)."""
    b = blob(240, 180, 220, TINTS["blue"][2], 0.45, "drift1")
    b += blob(960, 460, 250, TINTS["green"][2], 0.4, "drift2")
    xs = [250, 405, 560, 715, 870]
    for i, x in enumerate(xs):
        h = 250 + (i % 3) * 30
        y = 455 - h
        if i == 3:
            b += (
                f'  <rect class="float" style="transform-origin:{x}px 330px" '
                f'x="{x - 50}" y="{y}" width="100" height="{h}" rx="50" fill="url(#brand)"/>\n'
            )
        else:
            b += (
                f'  <rect x="{x - 50}" y="{y + 24}" width="100" height="{h - 24}" '
                f'rx="50" fill="none" stroke="url(#brandSoft)" stroke-opacity="0.75" stroke-width="2.5"/>\n'
            )
    b += spark(1010, 160, 44, T_CYAN)
    return "", b


def m_cn_wisdom():
    """Integration >> invention: app windows merging into one flow."""
    b = blob(300, 440, 240, TINTS["cyan"][1], 0.4, "drift1")
    b += blob(920, 170, 240, TINTS["green"][1], 0.4, "drift2")
    pts = [(-80, 470), (420, 540), (700, 110), (1290, 220)]
    b += ribbon(pts, 110, TINTS["cyan"][2], 0.5, "drift1")
    b += ribbon(pts, 64, "url(#brand)", 0.85, "drift1")
    b += ribbon(pts, 22, "#FFFFFF", 0.7, "drift1")
    wins = [(150, 120), (300, 90), (450, 160), (260, 230), (420, 280)]
    for i, (x, y) in enumerate(wins):
        b += app_window(x, y, 96 - i * 4, 72 - i * 3)
    b += spark(1030, 150, 48, F_GREEN)
    return "", b


def m_liu():
    """One builder, many shipped apps."""
    b = blob(240, 160, 200, TINTS["blue"][2], 0.4, "drift1")
    b += blob(950, 470, 250, TINTS["cyan"][2], 0.5, "drift2")
    # the builder: head + shoulders in brand gradient, echoes behind
    b += echo_circle(330, 260, 66, n=3, step=22)
    b += '  <circle cx="330" cy="260" r="66" fill="url(#brand)"/>\n'
    b += '  <circle cx="330" cy="238" r="22" fill="#FFFFFF" fill-opacity="0.9"/>\n'
    b += (
        '  <path d="M288 302 a42 30 0 0 1 84 0" fill="#FFFFFF" fill-opacity="0.9"/>\n'
    )
    wins = [(560, 120), (720, 170), (600, 260), (780, 320), (560, 380), (720, 440)]
    for i, (x, y) in enumerate(wins):
        b += app_window(x, y)
        b += link(410, 275, x, y + 36, 0.35)
    b += spark(1000, 140, 46, B_YELLOW)
    return "", b


def m_clustering():
    """Scattered keywords gathered into clusters."""
    import math
    import random

    b = blob(640, 210, 190, TINTS["cyan"][2], 0.5, "drift1")
    b += blob(880, 430, 160, TINTS["green"][2], 0.5, "drift2")
    b += blob(330, 420, 150, TINTS["blue"][3], 0.6, "drift1")
    rnd = random.Random(11)
    for _ in range(24):
        x, y = 90 + rnd.random() * 300, 90 + rnd.random() * 200
        b += f'  <circle cx="{x:.0f}" cy="{y:.0f}" r="5" fill="{P_BLUE}" fill-opacity="0.3"/>\n'
    b += (
        '  <path d="M 420 210 C 480 210, 500 210, 540 210" fill="none" '
        'stroke="url(#brand)" stroke-opacity="0.7" stroke-width="3" marker-end="none"/>\n'
    )
    clusters = [
        (660, 200, 88, 14, P_BLUE),
        (890, 420, 66, 10, "#04B876"),
        (360, 430, 56, 8, "#0AA6C4"),
    ]
    for cx, cy, r, n, col in clusters:
        b += (
            f'  <circle cx="{cx}" cy="{cy}" r="{r + 14}" fill="none" '
            f'stroke="url(#brand)" stroke-opacity="0.5" stroke-width="2.5" '
            f'stroke-dasharray="2 9" stroke-linecap="round"/>\n'
        )
        rr = random.Random(int(cx))
        for _ in range(n):
            ang, dist = rr.random() * 6.283, rr.random() * r
            b += (
                f'  <circle cx="{cx + math.cos(ang) * dist:.0f}" '
                f'cy="{cy + math.sin(ang) * dist:.0f}" r="6" fill="{col}"/>\n'
            )
    b += spark(1020, 150, 44, B_YELLOW)
    return "", b


# Series: 8 parts — one content illustration each, brand hue rotation + numeral.
SERIES_HUES = [
    (P_BLUE, "#7E9BF7"),
    (T_CYAN, "#9FEFFC"),
    ("#04B876", "#86F7CC"),
    (F_GREEN, "#C9FBE8"),
    (B_YELLOW, "#FFEB99"),
    ("#0AA6C4", "#57E2FA"),
    ("#2E62F1", "#C7D6FB"),
    ("#03895A", "#3DF3B1"),
]


def series_base(n):
    deep, light = SERIES_HUES[n - 1]
    b = blob(240, 170, 210, light, 0.55, "drift1")
    b += blob(1000, 490, 220, TINTS["green"][2], 0.5, "drift2")
    return deep, light, b


def m_se1():
    """Web crawling: a crawler walking a network of linked pages."""
    deep, light, b = series_base(1)
    pages = [(560, 150), (780, 120), (930, 250), (620, 300), (840, 380), (600, 440)]
    for i, (x, y) in enumerate(pages[1:], start=1):
        px, py = pages[0]
        b += link(px + 55, py + 38, x + 55, y + 38, 0.4)
    b += link(675, 338, 895, 288, 0.4)
    b += link(895, 288, 895, 380, 0.4)
    for x, y in pages:
        b += page_tile(x, y)
    b += echo_circle(500, 210, 34, n=2, step=16)
    b += '  <circle class="float" cx="500" cy="210" r="34" fill="url(#brand)"/>\n'
    b += spark(470, 130, 36, B_YELLOW)
    b += series_numeral(1, deep)
    return "", b


def m_se2():
    """Crawler design: frontier -> fetcher -> parser with the loop back."""
    deep, light, b = series_base(2)
    stages = [(480, 220, "queue"), (700, 220, "fetch"), (920, 220, "parse")]
    for i, (x, y, _) in enumerate(stages):
        if i == 1:
            b += echo_rrect(x - 75, y - 45, 150, 90, 24, n=2, step=18)
        else:
            b += (
                f'  <rect x="{x - 75}" y="{y - 45}" width="150" height="90" rx="24" '
                f'fill="#FFFFFF" fill-opacity="0.9" stroke="#FFFFFF" stroke-width="2"/>\n'
            )
            b += (
                f'  <rect x="{x - 45}" y="{y - 12}" width="90" height="24" rx="12" '
                f'fill="url(#brandSoft)" fill-opacity="0.8"/>\n'
            )
    b += link(555, 220, 625, 220, 0.7, 3)
    b += link(775, 220, 845, 220, 0.7, 3)
    b += (
        '  <path d="M 920 265 C 920 400, 480 400, 480 265" fill="none" '
        'stroke="url(#brand)" stroke-opacity="0.65" stroke-width="3" stroke-dasharray="10 8"/>\n'
    )
    b += spark(1010, 130, 42, T_CYAN)
    b += series_numeral(2, deep)
    return "", b


def m_se3():
    """Inverted index: terms on the left mapping to doc tiles."""
    deep, light, b = series_base(3)
    terms = [(470, 170), (470, 270), (470, 370)]
    docs = [(780, 140), (900, 220), (780, 300), (900, 380), (780, 440)]
    fan = [(0, [0, 2]), (1, [0, 1, 3]), (2, [4])]
    for ti, dis in fan:
        tx, ty = terms[ti]
        for di in dis:
            dx, dy = docs[di]
            b += link(tx + 108, ty + 20, dx, dy + 30, 0.4)
    for i, (x, y) in enumerate(terms):
        b += (
            f'  <rect x="{x}" y="{y}" width="108" height="40" rx="20" fill="url(#brand)"/>\n'
            f'  <rect x="{x + 20}" y="{y + 16}" width="{64 - i * 14}" height="8" rx="4" '
            f'fill="#FFFFFF" fill-opacity="0.9"/>\n'
        )
    for x, y in docs:
        b += page_tile(x, y, 96, 64, 12, 2)
    b += spark(1010, 130, 40, B_YELLOW)
    b += series_numeral(3, deep)
    return "", b


def m_se4():
    """BM25: documents being scored and ranked into order."""
    deep, light, b = series_base(4)
    bars = [(300, 200), (230, 290), (160, 380)]
    for i, (w2, y) in enumerate([(330, 190), (250, 285), (170, 380)]):
        fill = "url(#brand)" if i == 0 else "#FFFFFF"
        op = 1 if i == 0 else 0.85
        b += (
            f'  <rect x="480" y="{y}" width="{w2}" height="64" rx="32" fill="{fill}" '
            f'fill-opacity="{op}" stroke="#FFFFFF" stroke-width="2"/>\n'
        )
        b += (
            f'  <circle cx="{480 + w2 + 42}" cy="{y + 32}" r="19" fill="none" '
            f'stroke="url(#brand)" stroke-opacity="0.7" stroke-width="2.5"/>\n'
        )
        b += (
            f'  <rect x="{480 + w2 + 32}" y="{y + 28}" width="20" height="8" rx="4" '
            f'fill="{deep}"/>\n'
        )
    b += echo_rrect(480, 190, 330, 64, 32, n=2, step=20, body_fill="url(#brand)")
    b += spark(1010, 140, 42, T_CYAN)
    b += series_numeral(4, deep)
    return "", b


def m_se5():
    """PageRank: votes flowing through a graph, one node winning."""
    deep, light, b = series_base(5)
    nodes = [(520, 210, 26, False), (700, 150, 34, False), (820, 330, 58, True), (580, 390, 30, False), (960, 190, 30, False)]
    edges = [(0, 1), (1, 2), (3, 2), (0, 3), (4, 2), (1, 4)]
    for i, j in edges:
        x1, y1 = nodes[i][0], nodes[i][1]
        x2, y2 = nodes[j][0], nodes[j][1]
        b += link(x1, y1, x2, y2, 0.45, 2.5)
    for x, y, r, filled in nodes:
        if filled:
            b += echo_circle(x, y, r, n=3, step=20)
        b += node(x, y, r, filled)
    b += spark(1010, 430, 40, B_YELLOW)
    b += series_numeral(5, deep)
    return "", b


def m_se6():
    """AI Overviews: the answer card sitting on top of the SERP."""
    deep, light, b = series_base(6)
    b += (
        '  <rect x="480" y="120" width="440" height="56" rx="28" fill="#FFFFFF" '
        'fill-opacity="0.95" stroke="#FFFFFF" stroke-width="2"/>\n'
    )
    b += f'  <circle cx="516" cy="148" r="12" fill="none" stroke="{deep}" stroke-width="3"/>\n'
    b += f'  <line x1="525" y1="157" x2="534" y2="166" stroke="{deep}" stroke-width="3" stroke-linecap="round"/>\n'
    b += f'  <rect x="556" y="142" width="200" height="10" rx="5" fill="{TINTS["blue"][2]}"/>\n'
    b += echo_rrect(480, 210, 440, 220, 28, n=2, step=22, body_fill="#FFFFFF")
    b += '  <rect x="480" y="210" width="440" height="220" rx="28" fill="#FFFFFF" fill-opacity="0.6"/>\n'
    b += spark(516, 248, 20, "url(#brand)", cls="sparkle")
    for i in range(3):
        b += (
            f'  <rect x="546" y="{238 + i * 26}" width="{330 - i * 60}" height="10" rx="5" '
            f'fill="url(#brand)" fill-opacity="{0.75 - i * 0.15}"/>\n'
        )
    for i in range(3):
        b += (
            f'  <rect x="{506 + i * 120}" y="366" width="104" height="34" rx="17" '
            f'fill="none" stroke="url(#brand)" stroke-opacity="0.6" stroke-width="2"/>\n'
        )
        b += f'  <circle cx="{528 + i * 120}" cy="383" r="7" fill="{[P_BLUE, T_CYAN, F_GREEN][i]}"/>\n'
    b += series_numeral(6, deep)
    return "", b


def m_se7():
    """Neural reranking: candidates crossing through the model, reordered."""
    deep, light, b = series_base(7)
    left = [(470, 140), (470, 220), (470, 300), (470, 380)]
    right = [(880, 140), (880, 220), (880, 300), (880, 380)]
    remap = [2, 0, 3, 1]
    for i, (lx, ly) in enumerate(left):
        rx, ry = right[remap[i]]
        b += (
            f'  <path d="M {lx + 96} {ly + 26} C 700 {ly + 26}, 700 {ry + 26}, {rx} {ry + 26}" '
            f'fill="none" stroke="url(#brand)" stroke-opacity="0.45" stroke-width="2.5"/>\n'
        )
    b += echo_rrect(640, 180, 120, 200, 28, n=2, step=20)
    for x, y in left:
        b += page_tile(x, y, 96, 52, 12, 2)
    for i, (x, y) in enumerate(right):
        top = i == 0
        b += (
            f'  <rect x="{x}" y="{y}" width="96" height="52" rx="12" '
            f'fill="{"url(#brand)" if top else "#FFFFFF"}" fill-opacity="{1 if top else 0.9}" '
            f'stroke="#FFFFFF" stroke-width="2"/>\n'
        )
    b += spark(1010, 120, 38, B_YELLOW)
    b += series_numeral(7, deep)
    return "", b


def m_se8():
    """AI Mode: a conversation answered straight from the index."""
    deep, light, b = series_base(8)
    b += (
        '  <path d="M470 150 h300 a20 20 0 0 1 20 20 v70 a20 20 0 0 1 -20 20 h-240 l-38 34 v-34 h-22 a20 20 0 0 1 -20 -20 v-70 a20 20 0 0 1 20 -20 z" '
        'fill="#FFFFFF" fill-opacity="0.92" stroke="#FFFFFF" stroke-width="2"/>\n'
    )
    b += f'  <rect x="500" y="184" width="200" height="10" rx="5" fill="{TINTS["blue"][2]}"/>\n'
    b += f'  <rect x="500" y="206" width="140" height="10" rx="5" fill="{TINTS["blue"][3]}"/>\n'
    b += echo_rrect(620, 330, 340, 120, 28, n=2, step=20, body_fill="url(#brand)")
    b += '  <rect x="650" y="362" width="240" height="11" rx="5.5" fill="#FFFFFF" fill-opacity="0.95"/>\n'
    b += '  <rect x="650" y="386" width="180" height="11" rx="5.5" fill="#FFFFFF" fill-opacity="0.8"/>\n'
    for i, (x, y) in enumerate([(880, 150), (980, 220), (930, 300)]):
        b += page_tile(x, y, 80, 54, 10, 2)
        b += link(x + 40, y + 54, 850, 380, 0.35)
    b += spark(560, 300, 34, T_CYAN)
    b += series_numeral(8, deep)
    return "", b


def m_series_cover():
    """The series: a magnifying lens over the open web, 8 part-dots on orbit."""
    import math

    b = blob(230, 160, 210, TINTS["blue"][2], 0.5, "drift1")
    b += blob(1000, 470, 240, TINTS["green"][1], 0.45, "drift2")
    for x, y in [(180, 360), (300, 430), (830, 150), (950, 260), (860, 400)]:
        b += page_tile(x, y, 96, 64, 12, 2)
    b += echo_circle(560, 280, 150, n=3, step=26)
    b += (
        '  <circle cx="560" cy="280" r="150" fill="#FFFFFF" fill-opacity="0.35" '
        'stroke="url(#brand)" stroke-width="10"/>\n'
    )
    b += (
        '  <line x1="672" y1="392" x2="780" y2="500" stroke="url(#brand)" '
        'stroke-width="26" stroke-linecap="round"/>\n'
    )
    b += '  <g class="spin" style="transform-origin:560px 280px">\n'
    for i, (deep, _l) in enumerate(SERIES_HUES):
        ang = i * math.tau / 8
        x = 560 + 190 * math.cos(ang)
        y = 280 + 190 * math.sin(ang)
        b += f'    <circle cx="{x:.0f}" cy="{y:.0f}" r="10" fill="{deep}"/>\n'
    b += "  </g>\n"
    b += spark(930, 120, 50, B_YELLOW)
    return "", b


COVERS = {
    "an-artifact-driven-ai-initiative-blueprint": m_blueprint,
    "why-our-ai-team-failed": m_failed,
    "the-chinese-ai-wisdom": m_cn_wisdom,
    "liu-xiaopai-and-chinese-vibe-code-rush": m_liu,
    "agentic-keyword-clustering": m_clustering,
    "web-crawling-in-search-engines": m_se1,
    "designing-the-web-crawler": m_se2,
    "inverted-index": m_se3,
    "ranking-with-bm25": m_se4,
    "ranking-with-pagerank": m_se5,
    "ai-overviews": m_se6,
    "neural-reranking-with-bert": m_se7,
    "ai-mode": m_se8,
    "series-building-a-mini-search-engine": m_series_cover,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, motif in COVERS.items():
        defs, body = motif()
        (OUT / f"{slug}.svg").write_text(frame(body, defs), encoding="utf-8")
        print("wrote", slug)


if __name__ == "__main__":
    main()
