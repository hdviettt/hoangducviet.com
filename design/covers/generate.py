"""Cover generator v2 — the "Fluid Gradient" system (see README.md).

Google/DeepMind-flavored abstract art: soft light gradients, large blurred
color blobs, one crisp glassy focal composition per post, ambient motion.
Run:

    python design/covers/generate.py          # writes public/covers/*.svg

Adding a cover for a new post = add one entry to COVERS with a motif function.
"""

from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "public" / "covers"

# name: (bg_top, bg_bottom, blob_a, blob_b, accent, deep)
PALETTES = {
    "blue": ("#EAF1FF", "#FAFCFF", "#4285F4", "#8AB4F8", "#1A73E8", "#174EA6"),
    "indigo": ("#E8EAF6", "#FBFBFF", "#5C6BC0", "#9FA8DA", "#3949AB", "#283593"),
    "teal": ("#E0F7FA", "#F7FEFF", "#12B5CB", "#80DEEA", "#0097A7", "#006064"),
    "mint": ("#E6F4EA", "#F8FEF9", "#34A853", "#81C995", "#188038", "#0D652D"),
    "amber": ("#FEF7E0", "#FFFDF6", "#F9AB00", "#FDD663", "#EA8600", "#B06000"),
    "coral": ("#FCE8E6", "#FFF9F8", "#EA4335", "#F28B82", "#D93025", "#A50E0E"),
    "violet": ("#F3E8FD", "#FDFBFF", "#A142F4", "#D7AEFB", "#8430CE", "#681DA8"),
    "pink": ("#FDE7F3", "#FFF9FC", "#E52592", "#FF8BCB", "#C2185B", "#9C166B"),
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


def frame(pal: str, body: str, extra_defs: str = "") -> str:
    bg1, bg2, ba, bb, accent, deep = PALETTES[pal]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="{bg1}"/>
      <stop offset="1" stop-color="{bg2}"/>
    </linearGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="55"/>
    </filter>
    <filter id="softer" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
{extra_defs}    <style>{STYLE}</style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
{body}</svg>
"""


def blob(cx, cy, r, color, opacity=0.6, cls="drift1"):
    return (
        f'  <circle class="{cls}" cx="{cx}" cy="{cy}" r="{r}" fill="{color}" '
        f'fill-opacity="{opacity}" filter="url(#soft)"/>\n'
    )


def glass_rect(x, y, w, h, rx=28, opacity=0.5):
    return (
        f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
        f'fill="#FFFFFF" fill-opacity="{opacity}" stroke="#FFFFFF" '
        f'stroke-opacity="0.85" stroke-width="2"/>\n'
    )


def spark(cx, cy, r, fill, cls="sparkle"):
    """Gemini-style four-point star with pinched waists."""
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


def ribbon(points, width, stroke, opacity=0.85, cls=""):
    """A smooth flowing band through (x, y) control pairs."""
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = points
    c = f' class="{cls}"' if cls else ""
    return (
        f'  <path{c} d="M {x0} {y0} C {x1} {y1}, {x2} {y2}, {x3} {y3}" '
        f'fill="none" stroke="{stroke}" stroke-opacity="{opacity}" '
        f'stroke-width="{width}" stroke-linecap="round"/>\n'
    )


def orb(cx, cy, r, pal, grad_id):
    _, _, ba, bb, accent, deep = PALETTES[pal]
    defs = f"""    <radialGradient id="{grad_id}" cx="0.35" cy="0.3" r="0.9">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.45" stop-color="{bb}"/>
      <stop offset="1" stop-color="{accent}"/>
    </radialGradient>
"""
    body = f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#{grad_id})"/>\n'
    return defs, body


# ---------------------------------------------------------------- motifs


def m_blueprint():
    b = blob(280, 180, 240, PALETTES["blue"][2], 0.55, "drift1")
    b += blob(950, 480, 280, PALETTES["blue"][3], 0.7, "drift2")
    b += blob(700, 120, 170, "#A8C7FA", 0.5, "drift2")
    b += '  <g class="float" style="transform-origin:600px 340px">\n'
    b += glass_rect(330, 330, 190, 190, 40, 0.4)
    b += glass_rect(470, 250, 210, 210, 44, 0.55)
    b += glass_rect(630, 160, 230, 230, 48, 0.7)
    b += "  </g>\n"
    b += spark(920, 170, 64, PALETTES["blue"][4])
    return "", b


def m_failed():
    """Five pillars: one held, four dissolving into fog."""
    pal = PALETTES["coral"]
    b = blob(240, 180, 220, pal[3], 0.5, "drift1")
    b += blob(960, 460, 260, pal[2], 0.35, "drift2")
    xs = [250, 410, 570, 730, 890]
    for i, x in enumerate(xs):
        h = 260 + (i % 3) * 30
        y = 460 - h
        if i == 3:
            # the one pillar that held
            b += (
                f'  <rect class="float" style="transform-origin:{x}px 330px" '
                f'x="{x - 52}" y="{y}" width="104" height="{h}" rx="52" '
                f'fill="{pal[4]}" fill-opacity="0.92"/>\n'
            )
        else:
            # ghost pillars: clearly capsules, clearly faded — not smoke
            b += (
                f'  <rect x="{x - 52}" y="{y + 26}" width="104" height="{h - 26}" '
                f'rx="52" fill="{pal[3]}" fill-opacity="0.38"/>\n'
                f'  <rect x="{x - 52}" y="{y + 26}" width="104" height="{h - 26}" '
                f'rx="52" fill="none" stroke="{pal[2]}" stroke-opacity="0.3" stroke-width="2"/>\n'
            )
    return "", b


def m_cn_wisdom():
    """Integration: a stream of small pieces converging into one flow."""
    a, c = PALETTES["amber"], PALETTES["coral"]
    import math
    import random

    b = blob(280, 440, 250, a[3], 0.6, "drift1")
    b += blob(920, 180, 250, c[3], 0.45, "drift2")
    # the flow band: layered soft strokes, one graceful diagonal S
    pts = [(-80, 470), (420, 540), (700, 110), (1290, 220)]
    b += ribbon(pts, 120, a[3], 0.35, "drift1")
    b += ribbon(pts, 74, a[2], 0.55, "drift1")
    b += ribbon(pts, 30, "#FFFFFF", 0.7, "drift1")
    # pieces feeding the flow from the top-left
    rnd = random.Random(7)
    for i in range(14):
        t = i / 14
        x = 150 + t * 520 + rnd.uniform(-30, 30)
        y = 150 + t * 180 + rnd.uniform(-56, 56) - (1 - t) * 60
        wsize = 22 + rnd.random() * 22
        b += (
            f'  <rect x="{x:.0f}" y="{y:.0f}" width="{wsize:.0f}" '
            f'height="{wsize:.0f}" rx="8" fill="{c[2]}" '
            f'fill-opacity="{0.35 + t * 0.55:.2f}" '
            f'transform="rotate({rnd.uniform(-20, 20):.0f} {x:.0f} {y:.0f})"/>\n'
        )
    b += spark(1020, 150, 52, c[4])
    return "", b


def m_liu():
    pal = "violet"
    defs, b = orb(430, 320, 150, pal, "liuOrb")
    bl = blob(240, 160, 200, PALETTES[pal][2], 0.45, "drift1")
    bl += blob(950, 470, 260, PALETTES[pal][3], 0.6, "drift2")
    sats = [(660, 160, 64), (760, 300, 52), (700, 440, 58), (850, 200, 44), (880, 400, 48)]
    s = '  <g class="float" style="transform-origin:760px 300px">\n'
    for x, y, w in sats:
        s += glass_rect(x, y, w, w, 16, 0.55)
    s += "  </g>\n"
    return defs, bl + b + s


def m_clustering():
    import math
    import random

    pal = PALETTES["teal"]
    rnd = random.Random(11)
    b = blob(640, 210, 200, pal[3], 0.55, "drift1")
    b += blob(860, 430, 170, pal[2], 0.4, "drift2")
    b += blob(330, 420, 150, "#A7FFEB", 0.55, "drift1")
    # halos
    for cx, cy, r in [(640, 210, 120), (880, 430, 96), (340, 420, 84)]:
        b += f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="#FFFFFF" fill-opacity="0.35" filter="url(#softer)"/>\n'
    # loose field drifting in
    for _ in range(26):
        x, y = 90 + rnd.random() * 320, 90 + rnd.random() * 200
        b += f'  <circle cx="{x:.0f}" cy="{y:.0f}" r="5" fill="{pal[4]}" fill-opacity="0.35"/>\n'
    # clustered dots
    for cx, cy, r, n in [(640, 210, 86, 14), (880, 430, 66, 10), (340, 420, 56, 8)]:
        rr = random.Random(int(cx))
        for _ in range(n):
            ang, dist = rr.random() * 6.283, rr.random() * r
            b += (
                f'  <circle cx="{cx + math.cos(ang) * dist:.0f}" '
                f'cy="{cy + math.sin(ang) * dist:.0f}" r="6" fill="{pal[4]}"/>\n'
            )
    return "", b


SERIES_HUES = ["blue", "indigo", "teal", "mint", "amber", "coral", "violet", "pink"]


def m_series_part(n: int):
    """Mini Search Engine part n: the engine orb + orbit + big numeral."""
    pal = SERIES_HUES[n - 1]
    p = PALETTES[pal]
    defs, body = orb(760, 280, 165, pal, f"mse{n}")
    b = blob(260, 170, 230, p[2], 0.5, "drift1")
    b += blob(1000, 500, 240, p[3], 0.65, "drift2")
    b += body
    # orbit ring + satellite
    b += f'  <g class="spin" style="transform-origin:760px 280px">\n'
    b += f'    <ellipse cx="760" cy="280" rx="255" ry="92" fill="none" stroke="{p[5]}" stroke-opacity="0.35" stroke-width="2" transform="rotate(-18 760 280)"/>\n'
    b += f'    <circle cx="1005" cy="215" r="13" fill="{p[4]}"/>\n'
    b += "  </g>\n"
    b += spark(600, 120, 46, p[4])
    # translucent numeral, cropped by the left edge like a magazine folio
    b += (
        f'  <text x="60" y="580" font-size="360" font-weight="700" '
        f'fill="{p[5]}" fill-opacity="0.16" letter-spacing="-12">{n:02d}</text>\n'
    )
    return defs, b


def m_series_cover():
    """The whole series: one orb, eight hued orbit dots."""
    import math

    defs, body = orb(600, 300, 180, "blue", "mseAll")
    b = blob(230, 160, 220, PALETTES["blue"][2], 0.5, "drift1")
    b += blob(1000, 470, 250, PALETTES["teal"][3], 0.6, "drift2")
    b += blob(600, 560, 190, PALETTES["violet"][3], 0.4, "drift1")
    b += body
    b += '  <g class="spin" style="transform-origin:600px 300px">\n'
    b += '    <ellipse cx="600" cy="300" rx="330" ry="120" fill="none" stroke="#174EA6" stroke-opacity="0.3" stroke-width="2" transform="rotate(-16 600 300)"/>\n'
    for i, hue in enumerate(SERIES_HUES):
        ang = i * math.tau / 8
        x = 600 + 330 * math.cos(ang) * math.cos(-0.28) - 120 * math.sin(ang) * math.sin(-0.28)
        y = 300 + 330 * math.cos(ang) * math.sin(-0.28) * 0.35 + 120 * math.sin(ang) * math.cos(-0.28)
        b += f'    <circle cx="{x:.0f}" cy="{y:.0f}" r="12" fill="{PALETTES[hue][4]}"/>\n'
    b += "  </g>\n"
    b += spark(920, 130, 56, PALETTES["blue"][4])
    return defs, b


COVERS = {
    "an-artifact-driven-ai-initiative-blueprint": ("blue", m_blueprint),
    "why-our-ai-team-failed": ("coral", m_failed),
    "the-chinese-ai-wisdom": ("amber", m_cn_wisdom),
    "liu-xiaopai-and-chinese-vibe-code-rush": ("violet", m_liu),
    "agentic-keyword-clustering": ("teal", m_clustering),
    "web-crawling-in-search-engines": ("blue", lambda: m_series_part(1)),
    "designing-the-web-crawler": ("indigo", lambda: m_series_part(2)),
    "inverted-index": ("teal", lambda: m_series_part(3)),
    "ranking-with-bm25": ("mint", lambda: m_series_part(4)),
    "ranking-with-pagerank": ("amber", lambda: m_series_part(5)),
    "ai-overviews": ("coral", lambda: m_series_part(6)),
    "neural-reranking-with-bert": ("violet", lambda: m_series_part(7)),
    "ai-mode": ("pink", lambda: m_series_part(8)),
    "series-building-a-mini-search-engine": ("blue", m_series_cover),
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, (pal, motif) in COVERS.items():
        defs, body = motif()
        (OUT / f"{slug}.svg").write_text(frame(pal, body, defs), encoding="utf-8")
        print("wrote", slug)


if __name__ == "__main__":
    main()
