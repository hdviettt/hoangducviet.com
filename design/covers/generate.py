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


def m_blueprint():
    b = blob(260, 180, 230, TINTS["blue"][1], 0.4, "drift1")
    b += blob(960, 470, 260, TINTS["green"][1], 0.45, "drift2")
    b += '  <g class="float" style="transform-origin:620px 300px">\n'
    b += echo_rrect(560, 150, 250, 250, 52, n=4, step=30)
    b += "  </g>\n"
    b += echo_rrect(300, 330, 150, 150, 34, n=2, step=22, body_fill="url(#brandSoft)")
    b += spark(1000, 150, 54, B_YELLOW)
    return "", b


def m_failed():
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
    b = blob(300, 440, 240, TINTS["cyan"][1], 0.4, "drift1")
    b += blob(920, 170, 240, TINTS["green"][1], 0.4, "drift2")
    pts = [(-80, 470), (420, 540), (700, 110), (1290, 220)]
    b += ribbon(pts, 110, TINTS["cyan"][2], 0.5, "drift1")
    b += ribbon(pts, 64, "url(#brand)", 0.85, "drift1")
    b += ribbon(pts, 22, "#FFFFFF", 0.7, "drift1")
    import random

    rnd = random.Random(7)
    for i in range(13):
        t = i / 13
        x = 150 + t * 520 + rnd.uniform(-28, 28)
        y = 150 + t * 175 + rnd.uniform(-52, 52) - (1 - t) * 60
        wsize = 20 + rnd.random() * 22
        b += (
            f'  <rect x="{x:.0f}" y="{y:.0f}" width="{wsize:.0f}" height="{wsize:.0f}" '
            f'rx="7" fill="{B_YELLOW}" fill-opacity="{0.4 + t * 0.55:.2f}" '
            f'transform="rotate({rnd.uniform(-20, 20):.0f} {x:.0f} {y:.0f})"/>\n'
        )
    b += spark(1030, 150, 48, F_GREEN)
    return "", b


def m_liu():
    defs, body = orb(430, 310, 150, "liuOrb", P_BLUE, TINTS["blue"][2])
    b = blob(240, 160, 200, TINTS["blue"][2], 0.4, "drift1")
    b += blob(950, 470, 250, TINTS["cyan"][2], 0.5, "drift2")
    b += echo_circle(430, 310, 150, n=3, step=26)
    b += body
    sats = [(660, 160, 60), (760, 300, 48), (700, 440, 54), (850, 200, 42), (880, 400, 46)]
    b += '  <g class="float" style="transform-origin:760px 300px">\n'
    for i, (x, y, w) in enumerate(sats):
        fill = B_YELLOW if i == 3 else "#FFFFFF"
        op = 0.9 if i == 3 else 0.55
        b += (
            f'  <rect x="{x}" y="{y}" width="{w}" height="{w}" rx="14" fill="{fill}" '
            f'fill-opacity="{op}" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="2"/>\n'
        )
    b += "  </g>\n"
    return defs, b


def m_clustering():
    import math
    import random

    b = blob(640, 210, 190, TINTS["cyan"][2], 0.5, "drift1")
    b += blob(880, 430, 160, TINTS["green"][2], 0.5, "drift2")
    b += blob(330, 420, 150, TINTS["blue"][3], 0.6, "drift1")
    rnd = random.Random(11)
    for _ in range(24):
        x, y = 90 + rnd.random() * 320, 90 + rnd.random() * 200
        b += f'  <circle cx="{x:.0f}" cy="{y:.0f}" r="5" fill="{P_BLUE}" fill-opacity="0.3"/>\n'
    clusters = [
        (640, 210, 88, 14, P_BLUE),
        (880, 430, 66, 10, "#04B876"),
        (340, 420, 56, 8, "#0AA6C4"),
    ]
    for cx, cy, r, n, col in clusters:
        b += (
            f'  <circle cx="{cx}" cy="{cy}" r="{r + 14}" fill="none" '
            f'stroke="url(#brand)" stroke-opacity="0.5" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>\n'
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


# Series: 8 parts rotate through brand-family hue pairs (deep, light).
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


def m_series_part(n: int):
    deep, light = SERIES_HUES[n - 1]
    defs, body = orb(760, 280, 160, f"mse{n}", deep, light)
    b = blob(260, 170, 220, light, 0.55, "drift1")
    b += blob(1000, 500, 230, TINTS["green"][2], 0.5, "drift2")
    b += echo_circle(760, 280, 160, n=3, step=26)
    b += body
    b += '  <g class="spin" style="transform-origin:760px 280px">\n'
    b += (
        f'    <ellipse cx="760" cy="280" rx="250" ry="90" fill="none" '
        f'stroke="url(#brand)" stroke-opacity="0.45" stroke-width="2" transform="rotate(-18 760 280)"/>\n'
    )
    b += f'    <circle cx="1000" cy="215" r="12" fill="{B_YELLOW}"/>\n'
    b += "  </g>\n"
    b += spark(590, 120, 42, T_CYAN)
    b += (
        f'  <text x="60" y="580" font-size="360" font-weight="700" '
        f'fill="{deep}" fill-opacity="0.14" letter-spacing="-12">{n:02d}</text>\n'
    )
    return defs, b


def m_series_cover():
    import math

    defs, body = orb(600, 300, 180, "mseAll", P_BLUE, TINTS["blue"][2])
    b = blob(230, 160, 210, TINTS["blue"][2], 0.5, "drift1")
    b += blob(1000, 470, 240, TINTS["green"][1], 0.45, "drift2")
    b += echo_circle(600, 300, 180, n=4, step=28)
    b += body
    b += '  <g class="spin" style="transform-origin:600px 300px">\n'
    b += (
        '    <ellipse cx="600" cy="300" rx="330" ry="118" fill="none" '
        'stroke="url(#brand)" stroke-opacity="0.4" stroke-width="2" transform="rotate(-16 600 300)"/>\n'
    )
    for i, (deep, _light) in enumerate(SERIES_HUES):
        ang = i * math.tau / 8
        x = 600 + 330 * math.cos(ang)
        y = 300 + 118 * math.sin(ang)
        b += f'    <circle cx="{x:.0f}" cy="{y:.0f}" r="11" fill="{deep}"/>\n'
    b += "  </g>\n"
    b += spark(930, 130, 52, B_YELLOW)
    return defs, b


COVERS = {
    "an-artifact-driven-ai-initiative-blueprint": m_blueprint,
    "why-our-ai-team-failed": m_failed,
    "the-chinese-ai-wisdom": m_cn_wisdom,
    "liu-xiaopai-and-chinese-vibe-code-rush": m_liu,
    "agentic-keyword-clustering": m_clustering,
    "web-crawling-in-search-engines": lambda: m_series_part(1),
    "designing-the-web-crawler": lambda: m_series_part(2),
    "inverted-index": lambda: m_series_part(3),
    "ranking-with-bm25": lambda: m_series_part(4),
    "ranking-with-pagerank": lambda: m_series_part(5),
    "ai-overviews": lambda: m_series_part(6),
    "neural-reranking-with-bert": lambda: m_series_part(7),
    "ai-mode": lambda: m_series_part(8),
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
