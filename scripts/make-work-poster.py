"""Featured media theo loi tranh cua blog.google: nen mau no, vat the ve long,
co van giay, mot quang sang o giua va dung MOT bieu tuong den net sac.

Vi sao ba ban truoc truot:
  * doodle: chi co net, khong mau, khong sac do  -> ra so do
  * isometric: dep hon nhung van la khoi ky thuat -> ra minh hoa san pham
  * system map: chu va so day khung             -> ra ban ve ky thuat

Cai anh mau cua Google lam khac han o bon cho, va bon cho do la toan bo cong
thuc o day:

  1. NEN LA MOT MANG MAU NO, khong phai trang. Moi bai mot sac.
  2. VAT THE VE LONG: hinh don gian, to bang gradient nhieu chang mau, canh
     duoc lam meo bang nhieu de trong nhu ve tay chu khong phai vector.
  3. VAN GIAY phu len tat ca. Day la thu duy nhat lam mot hinh vector trong
     nhu duoc in ra.
  4. MOT tieu diem: quang sang trang, va giua no la bieu tuong den duy nhat
     sac net trong ca buc.

Khong co chu trong tranh. Ten du an da nam ngay canh no tren trang roi.

    python scripts/make-work-poster.py
"""

from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 1600, 900


def defs(ground, seed=7):
    """Bo loc dung chung: lam meo canh, lam mem, va van giay."""
    return f"""<defs>
  <filter id="paint" x="-12%" y="-12%" width="124%" height="124%">
    <!-- scale nho: canh phai long chu khong duoc ra thanh doi mau. Ban truoc
         de 26 nen ca cai ke ra thanh may vet nguech, cot ke bien mat han. -->
    <feTurbulence type="fractalNoise" baseFrequency="0.010" numOctaves="3"
                  seed="{seed}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="9"
                       xChannelSelector="R" yChannelSelector="G"/>
    <feGaussianBlur stdDeviation="1.1"/>
  </filter>
  <filter id="paintSoft" x="-16%" y="-16%" width="132%" height="132%">
    <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="3"
                  seed="{seed + 3}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="40"
                       xChannelSelector="R" yChannelSelector="G"/>
    <feGaussianBlur stdDeviation="9"/>
  </filter>
  <filter id="paintLine" filterUnits="userSpaceOnUse" x="-60" y="-60"
          width="2000" height="1200">
    <feTurbulence type="fractalNoise" baseFrequency="0.010" numOctaves="3"
                  seed="{seed}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="7"
                       xChannelSelector="R" yChannelSelector="G"/>
    <feGaussianBlur stdDeviation="0.9"/>
  </filter>
  <filter id="haze" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="46"/>
  </filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4"
                  seed="{seed}" result="g"/>
    <feColorMatrix in="g" type="saturate" values="0" result="gm"/>
    <feComponentTransfer in="gm" result="gt">
      <feFuncA type="linear" slope="0.5" intercept="0"/>
    </feComponentTransfer>
    <feBlend in="SourceGraphic" in2="gt" mode="multiply"/>
  </filter>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/>
    <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
</defs>"""


def grad(gid, stops, x1=0, y1=0, x2=1, y2=1):
    s = "".join(
        f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops
    )
    return (
        f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'
    )


def rrect(x, y, w, h, r, fill, filt="paint", op=1.0, rot=None):
    t = f' transform="rotate({rot} {x + w / 2:.0f} {y + h / 2:.0f})"' if rot else ""
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
        f'opacity="{op}" filter="url(#{filt})"{t}/>'
    )


def ellipse(cx, cy, rx, ry, fill, filt="paint", op=1.0):
    return (
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" '
        f'opacity="{op}" filter="url(#{filt})"/>'
    )


def stroke_path(d, color, w=14, filt="paint", cap="round", op=1.0):
    return (
        f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" '
        f'stroke-linecap="{cap}" opacity="{op}" filter="url(#{filt})"/>'
    )


def glow(cx, cy, r):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#glow)"/>'


def svg(ground, gradients, body, seed=7):
    """Van giay phu len TOAN BO buc, ke ca nen: khong thi nen min con vat the
    ram, va mat lien tuc ngay."""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">'
        f"{defs(ground, seed)}<defs>{gradients}</defs>"
        f'<g filter="url(#grain)">'
        f'<rect width="{W}" height="{H}" fill="{ground}"/>{body}</g></svg>'
    )


# ------------------------------------------------------------------- canh


def platform():
    """Tinh vat cua chinh cong viec, khong phai do dac trong nha.

    Ban truoc toi bung nguyen do vat cua buc Google mau: den, ban, ke. Chat
    lieu thi dung nhung noi dung thanh ra trang tri noi that. O day cac vat la
    thu cac agent thuc su cham vao moi ngay: mot trang tai lieu, mot khung
    chat, mot the so lieu, mot thu muc skill, mot cong noi. Tat ca dung tren
    mot mat duy nhat, va tia sang o giua la cai lam chung chay.
    """
    g = "".join([
        grad("gBase", [(0, "#5B3FBF"), (0.5, "#2F6BE8"), (1, "#35B7E8")], 0, 0, 1, 0.4),
        grad("gDoc", [(0, "#FFF3D6"), (1, "#F2A25B")], 0, 0, 0.5, 1),
        grad("gChat", [(0, "#FFC4E4"), (1, "#A345D8")], 0, 0, 0.7, 1),
        grad("gChart", [(0, "#BFE9FF"), (1, "#2F6BE8")], 0, 0, 0.5, 1),
        grad("gFolder", [(0, "#9BE05C"), (1, "#22B femme")], 0, 0, 1, 1),
        grad("gPlug", [(0, "#7A4BD8"), (1, "#4B2FA8")], 0, 0, 0.5, 1),
        grad("gArc", [(0, "#FFD166"), (0.45, "#F2607F"), (1, "#5B3FBF")], 0, 0, 1, 0.2),
    ])
    g = g.replace("#22B femme", "#22B58C")
    b = []
    b.append(ellipse(1230, 620, 400, 300, "#9C86EE", "haze", 0.5))
    b.append(ellipse(320, 250, 340, 250, "#7FD6F0", "haze", 0.42))

    # mat nen: mot mang mau chay suot, moi vat deu dung tren no
    b.append(rrect(180, 690, 1240, 84, 42, "url(#gBase)", "paint"))

    # cung sang vat qua tren: giu nhip cheo, khong con la can den
    b.append(stroke_path("M250,470 C420,190 980,150 1360,300", "url(#gArc)", 16,
                         "paintLine", op=0.9))

    def marks(x, y, w, rows, color="#FFFFFF", op=0.62, gap=34, wpx=None):
        out = []
        for i in range(rows):
            ww = (wpx[i] if wpx else w)
            out.append(stroke_path(f"M{x},{y + i * gap} H{x + ww}", color, 9,
                                   "paintLine", op=op))
        return "".join(out)

    # trang tai lieu
    b.append(rrect(300, 386, 196, 304, 22, "url(#gDoc)", "paint"))
    b.append(marks(336, 448, 0, 4, "#8A4B1F", 0.45, 40, [124, 96, 132, 78]))

    # khung chat
    b.append(rrect(566, 366, 250, 186, 40, "url(#gChat)", "paint"))
    b.append(
        '<path d="M612,548 L612,620 L684,548 Z" fill="url(#gChat)" '
        'filter="url(#paint)"/>'
    )
    b.append(marks(608, 426, 0, 3, "#FFFFFF", 0.7, 40, [150, 108, 128]))

    # the so lieu, ba cot
    b.append(rrect(880, 402, 232, 288, 26, "url(#gChart)", "paint"))
    for i, hh in enumerate((92, 148, 116)):
        b.append(rrect(918 + i * 62, 620 - hh, 40, hh, 12, "#FFFFFF", "paint", 0.72))

    # thu muc skill
    b.append(
        '<path d="M1156,420 h96 l26 34 h116 a22 22 0 0 1 22 22 v192 '
        'a22 22 0 0 1 -22 22 h-238 a22 22 0 0 1 -22 -22 v-226 '
        'a22 22 0 0 1 22 -22 z" fill="url(#gFolder)" filter="url(#paint)"/>'
    )
    b.append(marks(1186, 540, 0, 2, "#0E5A3C", 0.4, 38, [128, 88]))

    # cong noi, cam xuong mat nen
    for x in (430, 1290):
        b.append(rrect(x, 690, 56, 92, 18, "url(#gPlug)", "paint", 0.9))

    # tieu diem: quang trang + mot bieu tuong den duy nhat
    b.append(glow(660, 226, 236))
    b.append(
        '<g transform="translate(556,146) scale(2.0)">'
        '<rect x="2" y="8" width="70" height="56" rx="15" fill="none" '
        'stroke="#14161A" stroke-width="6.5"/>'
        '<path d="M17,29 H53 M17,45 H41" stroke="#14161A" stroke-width="6.5" '
        'stroke-linecap="round"/>'
        '<path d="M90,0 L97,19 L116,26 L97,33 L90,52 L83,33 L64,26 L83,19 Z" '
        'fill="#14161A"/>'
        "</g>"
    )
    return "#CFC6F5", g, "".join(b)


SCENES = {"agentic-ai-platform": platform}


def main():
    for slug, fn in SCENES.items():
        ground, gradients, body = fn()
        p = OUT / f"pos-{slug}.svg"
        p.write_text(svg(ground, gradients, body), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
