"""Featured media cho /work: so do he thong that, dat tren nen co chieu sau.

Hai thu ghep lai:

  * THAN HINH lay tu bo figure san co cua blog (mse-01-build-pipeline.svg):
    the co ten that, so that, nhom duoc khoanh bang khung dut, mui ten co nhan.
    Cai lam no dat khong phai net ve ma la DO CU THE — "145,736 terms" noi
    duoc nhieu hon bat ky bieu tuong nao ve mot cai index.
  * NEN lay tu ban isometric: gradient nhat, hai quang mau nhoe phia sau, va
    bong do mem duoi moi the. Do la thu keo mot so do phang thanh mot hinh co
    khong khi.

Luat giu nguyen tu cac ban truoc: mot mau nhan cho moi hinh, va hinh phai la
co che that cua du an chu khong phai trang tri.

Chu dung font he thong. SVG nam trong the <img> nen no khong doc duoc font cua
trang; nhung font ma trang nay dung deu la grotesque, va Segoe UI / SF doc ra
gan nhu vay.

    python scripts/make-work-map.py
"""

from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 1600, 900

INK = "#14161A"
BODY = "#3C4043"
MUTED = "#80868B"
FAINT = "#B6BCC4"
BLUE = "#004AEF"
BLUE_SOFT = "#E7EDFF"
BLUE_LINE = "#9DB6F5"
GREEN = "#04815A"
GREEN_SOFT = "#DFF7EC"
CARD = "#FFFFFF"
CARD_ALT = "#F3F5F8"
RULE = "#DFE3EA"

FONT = ("ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, "
        "Helvetica, Arial, sans-serif")
MONO = ("ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace")


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def defs():
    return f"""<defs>
  <linearGradient id="ground" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF1F9"/>
  </linearGradient>
  <filter id="card" x="-30%" y="-30%" width="160%" height="180%">
    <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#0B1B3A" flood-opacity="0.10"/>
  </filter>
  <filter id="lift" x="-40%" y="-40%" width="180%" height="200%">
    <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#0B1B3A" flood-opacity="0.16"/>
  </filter>
  <filter id="wash"><feGaussianBlur stdDeviation="80"/></filter>
  <marker id="ah" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9"
          markerHeight="9" orient="auto-start-reverse">
    <path d="M1,1 L11,6 L1,11" fill="none" stroke="{FAINT}" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <marker id="ahb" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9"
          markerHeight="9" orient="auto-start-reverse">
    <path d="M1,1 L11,6 L1,11" fill="none" stroke="{BLUE_LINE}" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>"""


def ground():
    """Nen: gradient + hai quang mau nhoe. Day la phan 'chieu sau'."""
    return (
        f'<rect width="{W}" height="{H}" fill="url(#ground)"/>'
        f'<circle cx="1330" cy="140" r="330" fill="#D9E4FF" opacity="0.85" filter="url(#wash)"/>'
        f'<circle cx="230" cy="820" r="290" fill="#D9F5E9" opacity="0.8" filter="url(#wash)"/>'
    )


def text(x, y, s, size=20, color=BODY, weight=400, anchor="start", font=FONT,
         spacing=None):
    ls = f' letter-spacing="{spacing}"' if spacing else ""
    return (
        f'<text x="{x:.0f}" y="{y:.0f}" font-family="{font}" font-size="{size}" '
        f'font-weight="{weight}" fill="{color}" text-anchor="{anchor}"{ls}>{esc(s)}</text>'
    )


def card(x, y, w, h, title, sub=None, accent=False, alt=False, note=None):
    """Mot khoi he thong, voi mot LUOI TRONG co dinh.

    Ban truoc dat tay tung dong nen chu phu de len tieu de va nhan so dam vao
    dong mo ta. O day moi dong co mot moc cham: tieu de y+46, mo ta y+78, nhan
    o goc duoi phai. Muon them dong thi tang h, khong doi moc.
    """
    fill = BLUE_SOFT if accent else (CARD_ALT if alt else CARD)
    stroke = BLUE if accent else RULE
    sw = 2 if accent else 1.4
    out = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{fill}" '
        f'stroke="{stroke}" stroke-width="{sw}" filter="url(#{"lift" if accent else "card"})"/>'
    ]
    out.append(text(x + 26, y + 46, title, 25, BLUE if accent else INK, 600))
    if sub:
        out.append(text(x + 26, y + 78, sub, 20, BLUE if accent else MUTED, 400))
    if note:
        out.append(text(x + w - 26, y + h - 24, note, 18,
                        BLUE if accent else MUTED, 500, anchor="end", font=MONO))
    return "".join(out)


def group(x, y, w, h, label):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="20" fill="none" '
        f'stroke="{FAINT}" stroke-width="1.6" stroke-dasharray="7 7"/>'
        + text(x + 4, y - 14, label, 21, MUTED, 600)
    )


def path(d, color=FAINT, w=2, dashed=False, arrow=True, blue=False):
    dash = ' stroke-dasharray="6 7"' if dashed else ""
    mk = f' marker-end="url(#{"ahb" if blue else "ah"})"' if arrow else ""
    return (
        f'<path d="{d}" fill="none" stroke="{BLUE_LINE if blue else color}" '
        f'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"'
        f"{dash}{mk}/>"
    )


def pill(x, y, s, color=MUTED, bg="#FFFFFF"):
    w = 16 + len(s) * 10.6
    return (
        f'<rect x="{x}" y="{y}" width="{w:.0f}" height="34" rx="17" fill="{bg}" '
        f'stroke="{RULE}" stroke-width="1.4"/>'
        + text(x + w / 2, y + 23, s, 18, color, 500, anchor="middle")
    )


def edge_label(x, y, s, blue=False):
    """Nhan dat tren mot duong noi.

    Phai co nen trang: dat chu thang len duong ke thi no dinh vao net va vao
    khung dut ben duoi, dung nhu ban truoc.
    """
    w = 18 + len(s) * 9.2
    return (
        f'<rect x="{x - w / 2:.0f}" y="{y - 21:.0f}" width="{w:.0f}" height="30" '
        f'rx="15" fill="#FFFFFF" opacity="0.94"/>'
        + text(x, y, s, 18, BLUE if blue else MUTED, 500, anchor="middle")
    )


def caption(s):
    return text(56, H - 42, s, 21, MUTED, 500, font=MONO)


def svg(body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">{defs()}{ground()}{body}</svg>'
    )


# --------------------------------------------------------------------- canh


def platform():
    """Mot procedure di vao, mot agent chay no, va bon thu nen tang cho khong.

    So lieu deu that: 19 agent, 63 skill, 103 phan trong repo va 52 phan khong
    cham den model, 21 connector, 120 nguoi dung, cong eval 5/5.
    """
    out = []
    out.append(text(56, 76, "AI platform", 31, INK, 600))
    out.append(text(56, 110, "one runtime, 19 agents, 120 people", 21, MUTED))

    CH = 132  # chieu cao chuan cua mot the co ba dong

    # --- cot trai: nguoi va thu ho viet ---
    out.append(group(56, 158, 340, 366, "Owned by the practitioner"))
    out.append(card(86, 196, 280, CH, "AI Champion", "SEO, Ads, Back Office",
                    note="writes it"))
    out.append(card(86, 372, 280, CH, "SKILL.md", "the written procedure",
                    note="63 skills"))
    out.append(path("M226,328 L226,368", w=2))

    # --- giua: runtime ---
    out.append(group(444, 158, 668, 366, "The runtime, owned by the AI team"))
    out.append(card(474, 196, 292, CH, "agent.md", "frontmatter is the contract",
                    note="19 agents"))
    out.append(card(790, 196, 292, CH, "Claude Agent SDK", "session, tools, skills"))
    out.append(card(474, 372, 292, CH, "Deterministic code", "when variance runs out",
                    note="52 / 103"))
    out.append(card(790, 372, 292, CH, "MCP connectors", "Lark, WordPress, Docs",
                    note="21"))
    out.append(path("M766,262 L786,262", w=2))
    out.append(path("M620,328 L620,368", w=2))
    out.append(path("M936,328 L936,368", w=2))
    out.append(path("M366,262 L470,262", w=2))
    out.append(edge_label(418, 268, "skill"))

    # --- cot phai: ket qua ---
    out.append(card(1160, 196, 384, CH, "120 people", "across 30 teams", alt=True))
    out.append(card(1160, 372, 384, CH, "Over 20 solutions",
                    "owned by the departments", alt=True))
    out.append(path("M1112,262 L1156,262", w=2))
    out.append(path("M1112,438 L1156,438", w=2))

    # --- duoi: bon thu nen tang cho khong ---
    out.append(group(56, 596, 1488, 208, "What every agent gets for free"))
    items = [
        ("Credential store", "never seen by a model", None, False),
        ("Run history", "input, steps, tokens, cost", None, False),
        ("Eval gate", "5 of 5 gold cases", "or it stays off", True),
        ("Cost tracking", "per department and person", None, False),
    ]
    for i, (t, sub, note, acc) in enumerate(items):
        x = 86 + i * 358
        out.append(card(x, 634, 330, 138, t, sub, accent=acc, note=note))

    # Duong xanh: cong eval la thu duy nhat dung giua agent va 120 nguoi dung.
    out.append(path("M1132,634 L1132,566 L1352,566 L1352,510", w=2.4, blue=True))
    out.append(edge_label(1242, 573, "nothing ships until it passes", blue=True))

    out.append(caption("procedure in, agent out, one gate between it and 120 people"))
    return "".join(out)


SCENES = {"agentic-ai-platform": platform}


def main():
    for slug, fn in SCENES.items():
        p = OUT / f"map-{slug}.svg"
        p.write_text(svg(fn()), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
