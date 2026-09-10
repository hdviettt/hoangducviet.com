"""Featured media: MOT hinh lon sach, gradient hoa hop, khong noise.

Viet chi ra hai cong thuc cua Google, va cai chung cua ca hai la FOCUS. Ba
ban truoc cua toi hong o dung cho do:

  * doodle / system map: moi khoi mot trong luong nhu nhau -> khong co focus
  * poster co van giay: bon vat the xep hang ngang, cung co -> van khong focus,
    va van giay lam no "am" chu khong "sang"

Cong thuc o day:

  1. MOT vat the chinh, chiem khoang 55-65% chieu cao khung. Do la focus.
  2. Vat phu it, nho hon han, mo hon han. Chung ton tai de do sau, khong de
     chia se su chu y.
  3. Gradient HOA HOP: hai ba chang mau cung ho, khong cau vong.
  4. Khong noise, khong van. Bo mat phai muot.
  5. Bong rat rong va rat nhat. Do la thu tao cam giac vat the co khoi luong
     ma khong lam ban nen.

    python scripts/make-work-hero.py
"""

from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 1600, 900


def defs(palette):
    """palette: (nen1, nen2, quang, vat1, vat2, vat3, phu)"""
    bg1, bg2, halo, o1, o2, o3, sub = palette
    return f"""<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
    <stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/>
  </linearGradient>
  <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{halo}" stop-opacity="0.9"/>
    <stop offset="1" stop-color="{halo}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="hero" x1="0.05" y1="0" x2="0.9" y2="1">
    <stop offset="0" stop-color="{o1}"/>
    <stop offset="0.52" stop-color="{o2}"/>
    <stop offset="1" stop-color="{o3}"/>
  </linearGradient>
  <linearGradient id="heroEdge" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/>
    <stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0.08"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.22"/>
  </linearGradient>
  <linearGradient id="sub" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="{sub}" stop-opacity="0.85"/>
    <stop offset="1" stop-color="{sub}" stop-opacity="0.45"/>
  </linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.34"/>
    <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0.06"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <filter id="castShadow" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="44" stdDeviation="46" flood-color="#1B1440"
                  flood-opacity="0.22"/>
  </filter>
  <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="20" stdDeviation="26" flood-color="#1B1440"
                  flood-opacity="0.13"/>
  </filter>
  <filter id="wide"><feGaussianBlur stdDeviation="90"/></filter>
</defs>"""


def rrect(x, y, w, h, r, fill, rot=None, op=1.0, filt=None, stroke=None, sw=1.5):
    t = f' transform="rotate({rot} {x + w / 2:.0f} {y + h / 2:.0f})"' if rot else ""
    f = f' filter="url(#{filt})"' if filt else ""
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return (
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="{r}" '
        f'fill="{fill}" opacity="{op}"{st}{f}{t}/>'
    )


def svg(palette, body):
    bg1, bg2, halo = palette[0], palette[1], palette[2]
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">{defs(palette)}'
        f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
        f'<ellipse cx="1120" cy="240" rx="520" ry="420" fill="url(#halo)"/>'
        f'<ellipse cx="300" cy="820" rx="420" ry="320" fill="url(#halo)" opacity="0.5"/>'
        f"{body}</svg>"
    )


# --------------------------------------------------------------------- canh


def platform():
    """Mot the lon duy nhat, hai the mo dan lui ve sau.

    Focus la the truoc. Hai the sau khong duoc phep tranh su chu y: chung nho
    hon, mo hon, va bi che mot phan — do la ly do chung ton tai."""
    palette = ("#F4F1FF", "#E4E7FA", "#C9C4F5",
               "#6A4BE8", "#3F63EE", "#2AA8F2", "#8E86F0")
    b = []

    # hai the lui ve sau: nho hon, mo hon, xoay khac
    b.append(rrect(524, 262, 420, 300, 44, "url(#sub)", rot=-9, op=0.55,
                   filt="softShadow"))
    b.append(rrect(700, 236, 440, 320, 46, "url(#sub)", rot=7, op=0.75,
                   filt="softShadow"))

    # THE CHINH: chiem gan hai phan ba chieu cao khung
    hx, hy, hw, hh = 520, 236, 560, 430
    b.append(rrect(hx, hy, hw, hh, 56, "url(#hero)", rot=-3, filt="castShadow"))
    b.append(rrect(hx, hy, hw, hh, 56, "url(#sheen)", rot=-3))
    b.append(rrect(hx, hy, hw, hh, 56, "none", rot=-3, stroke="url(#heroEdge)", sw=2))

    # dau hieu duy nhat tren the: mot tia sang, cung mot ngon ngu voi cai the
    b.append(
        '<g transform="rotate(-3 800 451) translate(724,368) scale(1.5)">'
        '<path d="M50,0 L61,32 L93,43 L61,54 L50,86 L39,54 L7,43 L39,32 Z" '
        'fill="#FFFFFF" opacity="0.92"/>'
        "</g>"
    )
    return palette, "".join(b)


def platform_grid():
    """Cung mot vat chinh, nhung ben trong no co noi dung.

    Ban thuan (platform) sach va co focus nhung noi khong duoc gi: mot the tim
    xanh voi ngoi sao thi san pham AI nao cung dung duoc. O day tren mat the
    la mot luoi o nho — 19 agent tren mot nen — nen hinh vua giu duoc mot tieu
    diem duy nhat, vua noi dung ve du an nay."""
    palette = ("#F4F1FF", "#E4E7FA", "#C9C4F5",
               "#6A4BE8", "#3F63EE", "#2AA8F2", "#8E86F0")
    b = []
    b.append(rrect(556, 268, 400, 290, 42, "url(#sub)", rot=-9, op=0.5,
                   filt="softShadow"))
    b.append(rrect(716, 244, 420, 306, 44, "url(#sub)", rot=7, op=0.7,
                   filt="softShadow"))

    hx, hy, hw, hh = 500, 226, 600, 452
    b.append(rrect(hx, hy, hw, hh, 58, "url(#hero)", rot=-3, filt="castShadow"))
    b.append(rrect(hx, hy, hw, hh, 58, "url(#sheen)", rot=-3))

    # luoi o tren mat the: 5 x 4 thieu mot o = 19
    g = [f'<g transform="rotate(-3 {hx + hw / 2:.0f} {hy + hh / 2:.0f})">']
    cw, ch, gx, gy = 88, 66, 22, 22
    gw = 5 * cw + 4 * gx
    gh = 4 * ch + 3 * gy
    ox = hx + (hw - gw) / 2
    oy = hy + (hh - gh) / 2 + 6
    for r in range(4):
        for c in range(5):
            if r == 3 and c == 4:
                continue
            x = ox + c * (cw + gx)
            y = oy + r * (ch + gy)
            hot = (r, c) == (1, 2)
            g.append(
                f'<rect x="{x:.0f}" y="{y:.0f}" width="{cw}" height="{ch}" rx="16" '
                f'fill="#FFFFFF" opacity="{0.95 if hot else 0.24}"/>'
            )
            if hot:
                g.append(
                    f'<g transform="translate({x + cw / 2 - 17:.0f},{y + ch / 2 - 17:.0f}) scale(0.36)">'
                    '<path d="M50,0 L61,32 L93,43 L61,54 L50,86 L39,54 L7,43 L39,32 Z" '
                    'fill="#3F63EE"/></g>'
                )
    g.append("</g>")
    b.append("".join(g))
    b.append(rrect(hx, hy, hw, hh, 58, "none", rot=-3, stroke="url(#heroEdge)", sw=2))
    return palette, "".join(b)


SCENES = {"agentic-ai-platform": platform, "agentic-ai-platform-grid": platform_grid}


def main():
    for slug, fn in SCENES.items():
        palette, body = fn()
        p = OUT / f"hero-{slug}.svg"
        p.write_text(svg(palette, body), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
