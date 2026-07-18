"""Cover generator — the "Technical Blueprint" system (see README.md).

Each cover = shared frame (navy, dual grid, register crosses, title block)
+ one bespoke schematic motif per post. Run:

    python design/covers/generate.py          # writes public/covers/<slug>.svg

Adding a cover for a new post = add one entry to COVERS with a motif function.
"""

from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "public" / "covers"

NAVY = "#0D2E6B"
INK = "#FFFFFF"
BLUE = "#8AB4F8"
AMBER = "#F9AB00"
RED = "#D93025"

STYLE = """
      .march { stroke-dasharray: 10 8; animation: march 4s linear infinite; }
      .tmarch { stroke-dasharray: 4 8; animation: march 6s linear infinite; }
      @keyframes march { to { stroke-dashoffset: -72; } }
      .p1, .p2, .p3 { animation: pulse 3.6s ease-in-out infinite; }
      .p2 { animation-delay: 1.2s; }
      .p3 { animation-delay: 2.4s; }
      @keyframes pulse { 0%, 100% { opacity: 0.45; } 18% { opacity: 1; } 36% { opacity: 0.45; } }
      .glow { animation: glow 3.6s ease-in-out infinite; }
      @keyframes glow { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
      @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
"""


def frame(doc: str, sheet: str, scale: str, rev: str, body: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="'JetBrains Mono', Consolas, monospace">
  <defs>
    <pattern id="g1" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="{INK}" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
    <pattern id="g2" width="200" height="200" patternUnits="userSpaceOnUse">
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="{INK}" stroke-opacity="0.16" stroke-width="1"/>
    </pattern>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,1 L8,5 L0,9" stroke="{INK}" stroke-width="1.6" fill="none"/>
    </marker>
    <marker id="arrb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,1 L8,5 L0,9" stroke="{BLUE}" stroke-width="1.4" fill="none"/>
    </marker>
    <style>{STYLE}</style>
  </defs>
  <rect width="1200" height="630" fill="{NAVY}"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g stroke="{INK}" stroke-opacity="0.35" stroke-width="1.5">
    <path d="M594 74 h12 M600 68 v12"/>
    <path d="M1074 434 h12 M1080 428 v12"/>
    <path d="M154 534 h12 M160 528 v12"/>
    <path d="M1094 134 h12 M1100 128 v12"/>
  </g>
{body}
  <g>
    <rect x="770" y="480" width="370" height="100" fill="none" stroke="{INK}" stroke-width="1.5"/>
    <line x1="770" y1="514" x2="1140" y2="514" stroke="{INK}" stroke-width="1"/>
    <line x1="770" y1="548" x2="1140" y2="548" stroke="{INK}" stroke-width="1"/>
    <line x1="960" y1="514" x2="960" y2="580" stroke="{INK}" stroke-width="1"/>
    <text x="786" y="503" font-size="15" fill="{INK}" letter-spacing="2">HOANGDUCVIET.COM</text>
    <text x="786" y="537" font-size="14" fill="{BLUE}">DOC. {doc}</text>
    <text x="976" y="537" font-size="14" fill="{BLUE}">SHEET {sheet}</text>
    <text x="786" y="571" font-size="14" fill="{BLUE}">SCALE {scale}</text>
    <text x="976" y="571" font-size="14" fill="{BLUE}">REV. {rev}</text>
  </g>
</svg>
"""


def box(x, y, w, h, label="", stroke=INK, sw=2.5, fs=16, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    s = f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="none" stroke="{stroke}" stroke-width="{sw}"{d}/>\n'
    if label:
        s += f'  <text x="{x + w / 2}" y="{y + h / 2 + 6}" text-anchor="middle" font-size="{fs}" fill="{stroke}">{label}</text>\n'
    return s


def flow(x1, y1, x2, y2, marching=True, stroke=INK):
    cls = ' class="march"' if marching else ""
    return f'  <line{cls} x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="2" marker-end="url(#arr)"/>\n'


# ---------------------------------------------------------------- motifs


def m_failed() -> str:
    b = ""
    labels = ["BLUEPRINT", "INFRASTRUCTURE", "SKILLS DOCS", "AI CAPABILITY", "MIDDLE MGMT"]
    for i, lb in enumerate(labels):
        y = 380 - i * 62
        w = 420 - i * 56
        x = 170 + i * 28
        b += box(x, y, w, 46, f"{i + 1} · {lb}", stroke=BLUE, sw=1.5, fs=14)
    # four of five pillars missed: red strike across the stack
    b += f'  <line x1="140" y1="120" x2="640" y2="440" stroke="{RED}" stroke-width="4" stroke-opacity="0.9"/>\n'
    b += f'  <g transform="rotate(-12 850 250)" class="glow">\n'
    b += f'    <rect x="720" y="200" width="260" height="86" fill="none" stroke="{RED}" stroke-width="4"/>\n'
    b += f'    <text x="850" y="238" text-anchor="middle" font-size="26" fill="{RED}" letter-spacing="4">4 OF 5</text>\n'
    b += f'    <text x="850" y="268" text-anchor="middle" font-size="20" fill="{RED}" letter-spacing="3">MISSED</text>\n'
    b += "  </g>\n"
    b += f'  <text x="170" y="100" font-size="18" fill="{INK}" letter-spacing="3">POST-MORTEM</text>\n'
    return b


def m_cn_wisdom() -> str:
    b = box(150, 200, 220, 140, "FRONTIER<tspan x='260' dy='24'>MODEL</tspan>", stroke=INK, fs=18)
    b += flow(370, 270, 520, 270)
    cells = [(560, 150), (700, 190), (620, 290), (760, 330), (560, 380), (820, 210)]
    for i, (x, y) in enumerate(cells):
        cls = AMBER if i == 2 else BLUE
        b += box(x, y, 120, 56, "app", stroke=cls, sw=1.5, fs=13)
    for x, y in cells[1:]:
        b += f'  <line x1="680" y1="318" x2="{x + 60}" y2="{y + 28}" stroke="{BLUE}" stroke-width="1" stroke-opacity="0.6"/>\n'
    b += f'  <text x="150" y="120" font-size="18" fill="{INK}" letter-spacing="3">INTEGRATION &#8811; INVENTION</text>\n'
    return b


def m_liu() -> str:
    b = f'  <circle cx="360" cy="270" r="60" fill="none" stroke="{INK}" stroke-width="2.5"/>\n'
    b += f'  <circle cx="360" cy="250" r="13" fill="none" stroke="{INK}" stroke-width="2"/>\n'
    b += f'  <path d="M332 300 a28 18 0 0 1 56 0" fill="none" stroke="{INK}" stroke-width="2"/>\n'
    b += f'  <text x="360" y="360" text-anchor="middle" font-size="15" fill="{INK}">ONE BUILDER</text>\n'
    apps = [(560, 120, "app-01"), (700, 170, "app-02"), (610, 250, "app-03"), (760, 300, "app-04"), (560, 330, "app-05"), (700, 400, "app-0N")]
    for i, (x, y, lb) in enumerate(apps):
        stroke = AMBER if lb == "app-0N" else BLUE
        b += box(x, y, 118, 50, lb, stroke=stroke, sw=1.5, fs=13)
        b += f'  <line class="tmarch" x1="418" y1="278" x2="{x}" y2="{y + 25}" stroke="{BLUE}" stroke-width="1.2"/>\n'
    b += f'  <text x="150" y="120" font-size="18" fill="{INK}" letter-spacing="3">VIBE CODE RUSH</text>\n'
    return b


def m_clustering() -> str:
    import random

    rnd = random.Random(4)
    b = f'  <text x="150" y="120" font-size="18" fill="{INK}" letter-spacing="3">5,000 KEYWORDS</text>\n'
    for _ in range(38):
        x, y = 160 + rnd.random() * 220, 160 + rnd.random() * 240
        b += f'  <circle cx="{x:.0f}" cy="{y:.0f}" r="4" fill="{BLUE}" fill-opacity="0.8"/>\n'
    b += flow(420, 280, 540, 280)
    clusters = [(640, 200, 90, BLUE, "p1"), (820, 300, 74, BLUE, "p2"), (680, 390, 60, AMBER, "p3")]
    for cx, cy, r, col, cls in clusters:
        b += f'  <circle class="{cls}" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{col}" stroke-width="1.6" stroke-dasharray="6 6"/>\n'
        rr = random.Random(cx)
        for _ in range(9):
            a, d = rr.random() * 6.283, rr.random() * (r - 14)
            import math

            b += f'  <circle cx="{cx + math.cos(a) * d:.0f}" cy="{cy + math.sin(a) * d:.0f}" r="4" fill="{col}"/>\n'
    return b


def m_se(sheet_no: int) -> str:
    """Shared header for the Mini Search Engine series covers."""
    return f'  <text x="150" y="120" font-size="18" fill="{INK}" letter-spacing="3">MINI SEARCH ENGINE &#183; PART {sheet_no}</text>\n'


def m_crawl() -> str:
    b = m_se(1)
    b += box(150, 240, 170, 60, "SEED URL", stroke=INK, fs=15)
    l1 = [(420, 150), (420, 270), (420, 390)]
    for x, y in l1:
        b += box(x, y, 140, 52, "page", stroke=BLUE, sw=1.5, fs=13)
        b += flow(320, 270, x, y + 26)
    for x, y in [(660, 190), (660, 320)]:
        b += box(x, y, 140, 52, "page", stroke=BLUE, sw=1.5, fs=13, dash="6 6")
        b += flow(560, 290, x, y + 26)
    b += f'  <text x="860" y="290" font-size="22" fill="{BLUE}">&#8230;</text>\n'
    return b


def m_crawler_design() -> str:
    b = m_se(2)
    b += box(150, 240, 190, 64, "FRONTIER", stroke=INK, fs=15)
    b += flow(340, 272, 460, 272)
    b += box(460, 240, 180, 64, "FETCHER", stroke=BLUE, sw=2, fs=15)
    b += flow(640, 272, 760, 272)
    b += box(760, 240, 180, 64, "PARSER", stroke=BLUE, sw=2, fs=15)
    # discovered links loop back to the frontier
    b += f'  <path class="tmarch" d="M850 304 C 850 420, 245 420, 245 304" fill="none" stroke="{AMBER}" stroke-width="2" marker-end="url(#arr)"/>\n'
    b += f'  <text x="548" y="408" text-anchor="middle" font-size="14" fill="{AMBER}">new links &#8594; back to the queue</text>\n'
    return b


def m_inverted_index() -> str:
    b = m_se(3)
    for i, d in enumerate(["DOC 1", "DOC 2", "DOC 3"]):
        b += box(150, 170 + i * 84, 130, 56, d, stroke=BLUE, sw=1.5, fs=14)
        b += flow(280, 198 + i * 84, 430, 260)
    b += box(430, 170, 420, 240, "", stroke=INK)
    rows = [("&#34;search&#34;", "&#8594; 1, 3"), ("&#34;engine&#34;", "&#8594; 1, 2, 3"), ("&#34;crawl&#34;", "&#8594; 2")]
    for i, (t, p) in enumerate(rows):
        y = 220 + i * 56
        b += f'  <text x="460" y="{y}" font-size="16" fill="{BLUE}">{t}</text>\n'
        b += f'  <text class="p{i + 1}" x="640" y="{y}" font-size="16" fill="{INK}">{p}</text>\n'
    b += f'  <text x="640" y="446" text-anchor="middle" font-size="14" fill="{BLUE}">term &#8594; postings</text>\n'
    return b


def m_bm25() -> str:
    b = m_se(4)
    b += f'  <text x="150" y="230" font-size="24" fill="{INK}">score(q,d) = &#931; idf(t) &#183; </text>\n'
    b += f'  <text x="520" y="200" font-size="20" fill="{BLUE}">tf &#183; (k&#8321;+1)</text>\n'
    b += f'  <line x1="500" y1="218" x2="740" y2="218" stroke="{INK}" stroke-width="2"/>\n'
    b += f'  <text x="504" y="252" font-size="20" fill="{BLUE}">tf + k&#8321;(1-b+b&#183;|d|/avg)</text>\n'
    for i, w in enumerate([300, 210, 130]):
        y = 320 + i * 44
        cls = "p1" if i == 0 else ("p2" if i == 1 else "p3")
        col = AMBER if i == 0 else BLUE
        b += f'  <rect class="{cls}" x="150" y="{y}" width="{w}" height="26" fill="{col}" fill-opacity="0.85"/>\n'
        b += f'  <text x="{160 + w}" y="{y + 18}" font-size="14" fill="{BLUE}">doc {i + 1}</text>\n'
    return b


def m_pagerank() -> str:
    b = m_se(5)
    nodes = [(300, 220, 26), (520, 160, 34), (640, 330, 52), (400, 380, 30), (850, 210, 38)]
    edges = [(0, 1), (1, 2), (3, 2), (0, 3), (2, 4), (1, 4), (3, 0)]
    for i, j in edges:
        x1, y1, _ = nodes[i]
        x2, y2, _ = nodes[j]
        b += f'  <line class="tmarch" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{BLUE}" stroke-width="1.4" marker-end="url(#arrb)"/>\n'
    for k, (x, y, r) in enumerate(nodes):
        col = AMBER if r == 52 else INK
        b += f'  <circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{col}" stroke-width="2.5"/>\n'
        b += f'  <text x="{x}" y="{y + 5}" text-anchor="middle" font-size="13" fill="{col}">{[".12", ".18", ".38", ".14", ".18"][k]}</text>\n'
    b += f'  <text x="640" y="430" text-anchor="middle" font-size="14" fill="{BLUE}">votes flow until they settle</text>\n'
    return b


def m_aio() -> str:
    b = m_se(6)
    b += box(150, 160, 500, 48, "", stroke=BLUE, sw=1.5)
    b += f'  <circle cx="182" cy="184" r="9" fill="none" stroke="{BLUE}" stroke-width="1.6"/>\n'
    b += f'  <line x1="189" y1="191" x2="197" y2="199" stroke="{BLUE}" stroke-width="1.6"/>\n'
    b += f'  <text x="215" y="190" font-size="15" fill="{BLUE}">best seo agency</text>\n'
    b += box(150, 240, 500, 170, "", stroke=AMBER, sw=2)
    b += f'  <text x="174" y="272" font-size="14" fill="{AMBER}" letter-spacing="2">AI OVERVIEW</text>\n'
    for i in range(3):
        b += f'  <line x1="174" y1="{298 + i * 26}" x2="{560 - i * 60}" y2="{298 + i * 26}" stroke="{INK}" stroke-opacity="0.55" stroke-width="6"/>\n'
    for i in range(3):
        cls = f"p{i + 1}"
        b += f'  <rect class="{cls}" x="{174 + i * 92}" y="366" width="80" height="26" rx="13" fill="none" stroke="{BLUE}" stroke-width="1.4"/>\n'
        b += f'  <text x="{214 + i * 92}" y="384" text-anchor="middle" font-size="13" fill="{BLUE}">[{i + 1}]</text>\n'
    b += f'  <text x="700" y="330" font-size="15" fill="{BLUE}">who gets cited?</text>\n'
    return b


def m_bert() -> str:
    b = m_se(7)
    order1 = ["d3", "d1", "d5", "d2", "d4"]
    for i, d in enumerate(order1):
        b += box(150, 160 + i * 54, 110, 40, d, stroke=BLUE, sw=1.5, fs=14)
    b += flow(260, 290, 420, 290)
    b += box(420, 240, 220, 100, "CROSS-<tspan x='530' dy='24'>ENCODER</tspan>", stroke=INK, fs=17)
    b += flow(640, 290, 800, 290)
    order2 = ["d5", "d3", "d2", "d1", "d4"]
    for i, d in enumerate(order2):
        col = AMBER if i == 0 else BLUE
        b += box(800, 160 + i * 54, 110, 40, d, stroke=col, sw=1.5 if i else 2.5, fs=14)
    return b


def m_ai_mode() -> str:
    b = m_se(8)
    b += f'  <path d="M150 180 h330 a14 14 0 0 1 14 14 v54 a14 14 0 0 1 -14 14 h-270 l-32 30 v-30 h-28 a14 14 0 0 1 -14 -14 v-54 a14 14 0 0 1 14 -14 z" fill="none" stroke="{INK}" stroke-width="2.2"/>\n'
    b += f'  <text x="322" y="228" text-anchor="middle" font-size="15" fill="{INK}">ask anything, keep asking</text>\n'
    b += f'  <path d="M560 320 h330 a14 14 0 0 1 14 14 v54 a14 14 0 0 1 -14 14 h-28 v30 l-32 -30 h-270 a14 14 0 0 1 -14 -14 v-54 a14 14 0 0 1 14 -14 z" fill="none" stroke="{AMBER}" stroke-width="2.2"/>\n'
    b += f'  <text x="732" y="368" text-anchor="middle" font-size="15" fill="{AMBER}">synthesized from the index</text>\n'
    for i, (x, y) in enumerate([(600, 170), (700, 150), (800, 180)]):
        b += box(x, y, 90, 40, "idx", stroke=BLUE, sw=1.4, fs=12, dash="5 5")
        b += f'  <line class="tmarch" x1="{x + 45}" y1="{y + 40}" x2="720" y2="316" stroke="{BLUE}" stroke-width="1.2"/>\n'
    return b


COVERS = {
    "why-our-ai-team-failed": ("POST-MORTEM", "01", "1:5", "A", m_failed),
    "the-chinese-ai-wisdom": ("CN-WISDOM", "01", "1:1.4B", "A", m_cn_wisdom),
    "liu-xiaopai-and-chinese-vibe-code-rush": ("VIBE-CODE-RUSH", "01", "1:1", "A", m_liu),
    "agentic-keyword-clustering": ("KW-CLUSTER", "01", "1:5000", "A", m_clustering),
    "web-crawling-in-search-engines": ("MSE-SERIES", "01", "1:WWW", "A", m_crawl),
    "designing-the-web-crawler": ("MSE-SERIES", "02", "1:N", "A", m_crawler_design),
    "inverted-index": ("MSE-SERIES", "03", "TERM:DOCS", "A", m_inverted_index),
    "ranking-with-bm25": ("MSE-SERIES", "04", "B=0.75", "A", m_bm25),
    "ranking-with-pagerank": ("MSE-SERIES", "05", "D=0.85", "A", m_pagerank),
    "ai-overviews": ("MSE-SERIES", "06", "10:1", "A", m_aio),
    "neural-reranking-with-bert": ("MSE-SERIES", "07", "768D", "A", m_bert),
    "ai-mode": ("MSE-SERIES", "08", "&#8734;:1", "A", m_ai_mode),
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, (doc, sheet, scale, rev, motif) in COVERS.items():
        svg = frame(doc, sheet, scale, rev, motif())
        (OUT / f"{slug}.svg").write_text(svg, encoding="utf-8")
        print("wrote", slug)


if __name__ == "__main__":
    main()
