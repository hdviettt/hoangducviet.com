"""Ba huong manh tay, cho mot bo featured media khong nhat.

Chan doan cua ban truoc: "qua bland". Dung, va ly do co the goi ten:

  * vat the qua NHO — no nam gon giua khung, chua bao gio cham mep
  * mau qua NHAT — nen pastel, vat the pastel, tuong phan gan nhu khong co
  * hinh qua QUEN — mot chu nhat bo goc thi la icon ung dung, khong phai tranh
  * khong co ANH SANG — chi co gradient phang, khong quang, khong vien sang

Ba ban duoi day sua ca bon, va deu giu dung luat cua Viet: khong noise, va co
mot tieu diem duy nhat.

    python scripts/make-work-bold.py
"""

import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 1600, 900


def head(extra=""):
    return f"""<defs>
  <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="42"/>
  </filter>
  <filter id="bloomBig" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="120"/>
  </filter>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="14"/>
  </filter>
  <filter id="drop" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="30" stdDeviation="40" flood-color="#05010F"
                  flood-opacity="0.45"/>
  </filter>
  {extra}
</defs>"""


def lg(gid, stops, x1=0, y1=0, x2=1, y2=1):
    s = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>'
                for o, c, a in stops)
    return f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rg(gid, stops, cx=0.5, cy=0.5, r=0.5):
    s = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>'
                for o, c, a in stops)
    return f'<radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


def svg(defs_extra, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">{head(defs_extra)}{body}</svg>'
    )


# ------------------------------------------------------------------ ban 1
# Dai sang vat qua ca khung. Vat the lon nhat co the: no bi cat o ca hai mep,
# nen nguoi xem hieu no con keo dai ra ngoai.


def ribbon():
    d = "".join([
        lg("field", [(0, "#0B0725", 1), (0.55, "#1A0F4E", 1), (1, "#0E1E5C", 1)], 0, 0, 0.6, 1),
        lg("band", [(0, "#2AA8F2", 1), (0.42, "#6A4BE8", 1), (1, "#E85BC0", 1)], 0, 0, 1, 0.3),
        lg("band2", [(0, "#07EF9C", 1), (1, "#2AA8F2", 1)], 0, 0, 1, 0.4),
        rg("core", [(0, "#FFFFFF", 0.95), (0.45, "#B9D9FF", 0.45), (1, "#7A9CFF", 0)]),
    ])
    b = [f'<rect width="{W}" height="{H}" fill="url(#field)"/>']
    b.append(f'<ellipse cx="900" cy="420" rx="620" ry="360" fill="url(#core)" opacity="0.55"/>')

    band = ("M-80,690 C260,690 300,300 700,300 C1080,300 1140,600 1700,540 "
            "L1700,700 C1140,760 1080,470 700,470 C340,470 300,860 -80,860 Z")
    b.append(f'<path d="{band}" fill="url(#band)" opacity="0.55" filter="url(#bloom)"/>')
    b.append(f'<path d="{band}" fill="url(#band)"/>')

    band2 = ("M-80,470 C300,470 340,180 720,180 C1100,180 1180,400 1700,330 "
             "L1700,404 C1180,474 1100,254 720,254 C380,254 340,544 -80,544 Z")
    b.append(f'<path d="{band2}" fill="url(#band2)" opacity="0.75"/>')

    # tieu diem: mot diem sang tren dai, kem quang
    b.append('<circle cx="700" cy="366" r="120" fill="url(#core)"/>')
    b.append('<circle cx="700" cy="366" r="30" fill="#FFFFFF"/>')
    return d, "".join(b)


# ------------------------------------------------------------------ ban 2
# Kinh xep lop. Nhieu tam trong suot cheo nhau, tam truoc sang nhat. Doc ra la
# "nhieu lop tren mot nen" ma khong can mot cai nhan nao.


def glass():
    d = "".join([
        lg("field2", [(0, "#120A33", 1), (1, "#251A6B", 1)], 0, 0, 0.4, 1),
        lg("pane1", [(0, "#6A4BE8", 0.55), (1, "#2AA8F2", 0.30)], 0, 0, 0.8, 1),
        lg("pane2", [(0, "#8E6BFF", 0.62), (1, "#3F63EE", 0.34)], 0, 0, 0.8, 1),
        lg("pane3", [(0, "#FFFFFF", 0.92), (0.5, "#A9C6FF", 0.72), (1, "#6A4BE8", 0.58)], 0, 0, 0.9, 1),
        lg("rim", [(0, "#FFFFFF", 0.9), (0.5, "#FFFFFF", 0.12), (1, "#FFFFFF", 0.5)], 0, 0, 0.4, 1),
        rg("glowc", [(0, "#7FB0FF", 0.75), (1, "#7FB0FF", 0)]),
    ])
    b = [f'<rect width="{W}" height="{H}" fill="url(#field2)"/>']
    b.append('<ellipse cx="1060" cy="300" rx="620" ry="480" fill="url(#glowc)"/>')

    def pane(cx, cy, w, h, rot, fill, op=1.0):
        return (
            f'<g transform="rotate({rot} {cx} {cy})">'
            f'<rect x="{cx - w / 2:.0f}" y="{cy - h / 2:.0f}" width="{w}" height="{h}" '
            f'rx="52" fill="{fill}" opacity="{op}"/>'
            f'<rect x="{cx - w / 2:.0f}" y="{cy - h / 2:.0f}" width="{w}" height="{h}" '
            f'rx="52" fill="none" stroke="url(#rim)" stroke-width="2.5"/></g>'
        )

    b.append(pane(760, 470, 1180, 560, -18, "url(#pane1)"))
    b.append(pane(830, 450, 1080, 520, -10, "url(#pane2)"))
    b.append(pane(900, 430, 980, 470, -3, "url(#pane3)"))
    # tieu diem: tia sang tren tam truoc
    b.append(
        '<g transform="rotate(-3 900 430) translate(830,352) scale(1.7)">'
        '<path d="M50,0 L61,32 L93,43 L61,54 L50,86 L39,54 L7,43 L39,32 Z" '
        'fill="#1B1247"/></g>'
    )
    return d, "".join(b)


# ------------------------------------------------------------------ ban 3
# Mot khoi cau lon bi cat o day khung, sang tu ben trong. Hinh don gian nhat
# trong ba ban, va cung la ban co suc nang nhat: mot vat, mot nguon sang.


def orb():
    d = "".join([
        lg("field3", [(0, "#F2F4FF", 1), (1, "#D6DCF7", 1)], 0, 0, 0.3, 1),
        rg("ball", [(0, "#8FD8FF", 1), (0.42, "#3F63EE", 1), (0.82, "#4B2FA8", 1),
                    (1, "#2A1466", 1)], 0.36, 0.30, 0.78),
        rg("rimlight", [(0, "#FFFFFF", 0), (0.86, "#FFFFFF", 0), (0.96, "#C9E4FF", 0.85),
                        (1, "#FFFFFF", 0)]),
        rg("cast", [(0, "#3A2E7A", 0.45), (1, "#3A2E7A", 0)]),
    ])
    b = [f'<rect width="{W}" height="{H}" fill="url(#field3)"/>']
    b.append('<ellipse cx="800" cy="836" rx="470" ry="70" fill="url(#cast)"/>')
    b.append('<circle cx="800" cy="470" r="360" fill="url(#ball)" filter="url(#drop)"/>')
    b.append('<circle cx="800" cy="470" r="360" fill="url(#rimlight)"/>')
    # vanh sang cat qua: cho khoi cau mot huong, va la tieu diem
    b.append(
        '<ellipse cx="800" cy="470" rx="356" ry="104" fill="none" stroke="#BFE3FF" '
        'stroke-width="6" opacity="0.85" transform="rotate(-16 800 470)"/>'
    )
    b.append(
        '<ellipse cx="800" cy="470" rx="356" ry="104" fill="none" stroke="#7FD6FF" '
        'stroke-width="16" opacity="0.35" filter="url(#soft)" '
        'transform="rotate(-16 800 470)"/>'
    )
    b.append('<circle cx="666" cy="352" r="86" fill="#FFFFFF" opacity="0.22" filter="url(#soft)"/>')
    return d, "".join(b)


SCENES = {"bold1-ribbon": ribbon, "bold2-glass": glass, "bold3-orb": orb}


def main():
    for name, fn in SCENES.items():
        d, body = fn()
        p = OUT / f"{name}.svg"
        p.write_text(svg(d, body), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
