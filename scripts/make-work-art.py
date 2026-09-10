"""Ba huong xu ly hinh cho cung mot de tai, de chon bang mat.

Ban 'clean doodle' truoc do that ra la mot so do: gan nhu khong mau, moi khoi
bang nhau, khong co diem nhin. Ba ban duoi day khac nhau o dung ba thu lam nen
mot illustration thuc su:

  1. MAU VA SAC DO — khoi duoc to, khong chi vien; co nen, co bong.
  2. LOP — vat the che nhau, co huong sang, nen co chieu sau.
  3. TUONG PHAN CO — mot hinh lon lam diem nhin, phan con lai nho va lap lai.

Cai khong doi giua ba ban: hinh van phai la CO CHE cua du an. Muoi chin agent
dung tren mot nen. Bo chu thich di van doc ra duoc.

    python scripts/make-work-art.py
"""

import math
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 1600, 900

INK = "#14161A"
BLUE = "#004AEF"
BLUE_MID = "#4C7DF5"
BLUE_PALE = "#DCE6FF"
GREEN = "#07EF9C"
GREEN_DEEP = "#04815A"
PAPER = "#FFFFFF"
SAND = "#F1EFEA"


def defs(extra=""):
    return f"""<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2FB"/>
  </linearGradient>
  <linearGradient id="slab" x1="0" y1="0" x2="1" y2="0.6">
    <stop offset="0" stop-color="#0B3BD6"/><stop offset="1" stop-color="#004AEF"/>
  </linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="#004AEF" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#4C7DF5" stop-opacity="0.55"/>
  </linearGradient>
  <linearGradient id="mint" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#07EF9C" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#04815A" stop-opacity="0.75"/>
  </linearGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0B1B3A" flood-opacity="0.13"/>
  </filter>
  <filter id="softer" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="26" stdDeviation="34" flood-color="#0B1B3A" flood-opacity="0.16"/>
  </filter>
  <filter id="blur60"><feGaussianBlur stdDeviation="60"/></filter>
  {extra}
</defs>"""


def svg(body, extra_defs="", ground="url(#sky)"):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">{defs(extra_defs)}'
        f'<rect width="{W}" height="{H}" fill="{ground}"/>{body}</svg>'
    )


def rrect(x, y, w, h, r, fill, **kw):
    at = "".join(f' {k.replace("_", "-")}="{v}"' for k, v in kw.items())
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}" fill="{fill}"{at}/>'


def line(x1, y1, x2, y2, color, w=6, opacity=1.0, cap="round"):
    return (
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
        f'stroke="{color}" stroke-width="{w}" stroke-linecap="{cap}" opacity="{opacity}"/>'
    )


def circle(cx, cy, r, fill, **kw):
    at = "".join(f' {k.replace("_", "-")}="{v}"' for k, v in kw.items())
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}"{at}/>'


def poly(pts, fill, **kw):
    at = "".join(f' {k.replace("_", "-")}="{v}"' for k, v in kw.items())
    d = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return f'<polygon points="{d}" fill="{fill}"{at}/>'


# ------------------------------------------------------------------ huong 1
# Flat color, nhin thang, co lop va bong mem. Ngon ngu quen thuoc cua bao chi
# cong nghe: khoi to phang, bang mau han che, bong do that nhe.


def art_flat():
    """Nhin thang, khoi to phang, bong mem.

    Ban truoc the trang qua nhat tren nen cung nhat nen ca hinh 'boc hoi'. O
    day the co mat ben dam hon mot bac, nen co suc nang; nen duoc day sam hon;
    va nhom lech trai de con khoang tho ben phai."""
    out = []
    out.append(circle(1240, 220, 320, BLUE_PALE, opacity=0.9, filter="url(#blur60)"))
    out.append(circle(300, 760, 250, "#D6F5E8", opacity=0.85, filter="url(#blur60)"))

    bx, by, bw, bh = 150, 612, 1150, 82
    out.append(
        f'<ellipse cx="{bx + bw / 2:.0f}" cy="{by + bh + 26:.0f}" rx="{bw / 2 + 20:.0f}" '
        f'ry="34" fill="#0B1B3A" opacity="0.13" filter="url(#blur60)"/>'
    )

    heights = [138, 206, 158, 246, 176, 122, 216, 152, 186, 130]
    accent = {3: (GREEN, "#05C888"), 6: (BLUE_MID, "#2A5AD8")}

    # hang sau: nho hon, nhat hon, lech nua nhip => chieu sau
    for i in range(9):
        x = bx + 108 + i * 112
        h = [96, 134, 108, 156, 116, 90, 140, 102, 126][i]
        y = by - h - 104
        out.append(rrect(x, y, 70, h, 15, "#FFFFFF", opacity=0.72, filter="url(#soft)"))
        out.append(rrect(x + 56, y, 14, h, 7, "#DCE4F4", opacity=0.72))
        out.append(line(x + 14, y + 28, x + 46, y + 28, "#C9D2E4", 5))

    # be do
    out.append(rrect(bx, by, bw, bh, 28, "url(#slab)", filter="url(#softer)"))
    out.append(rrect(bx + 14, by + 10, bw - 28, 10, 5, "#FFFFFF", opacity=0.18))
    for i in range(6):
        x = bx + 92 + i * (bw - 184) / 5
        out.append(rrect(x - 27, by + bh - 6, 54, 24, 9, "#0A2E9E"))

    # hang truoc: the trang co mat ben, ba dong noi dung
    for i, h in enumerate(heights):
        x = bx + 42 + i * 112
        y = by - h
        if i in accent:
            face, side = accent[i]
            ink = "#FFFFFF"
        else:
            face, side = "#FFFFFF", "#D7E0F2"
            ink = "#B9C5DC"
        out.append(rrect(x, y, 90, h, 17, face, filter="url(#soft)"))
        out.append(rrect(x + 74, y, 16, h, 8, side))
        for k in range(3):
            wpx = [44, 28, 36][k]
            out.append(line(x + 16, y + 32 + k * 24, x + 16 + wpx, y + 32 + k * 24,
                            ink, 7, 0.95))
        if i in accent:
            out.append(circle(x + 62, y + 30, 10, "#FFFFFF", opacity=0.95))

    return svg("".join(out))


# ------------------------------------------------------------------ huong 2
# Isometric. Cung mot y nhung co khong gian: mat tren sang, mat ben toi, bong
# do theo mot huong sang duy nhat.


ISO_X = (0.866, 0.5)
ISO_Y = (-0.866, 0.5)


def iso(x, y, z=0.0, ox=800, oy=470, s=1.0):
    px = ox + (x * ISO_X[0] + y * ISO_Y[0]) * s
    py = oy + (x * ISO_X[1] + y * ISO_Y[1]) * s - z * s
    return px, py


def iso_box(x, y, w, d, z0, z1, top, left, right, s=1.0, ox=800, oy=470):
    """Mot khoi hop iso tu cao do z0 den z1.

    z0 ton tai vi cac khoi phai DUNG TREN mat be: ban truoc ve tu 0 nen chung
    lun vao trong be, va cai be thi ve sau nen no de len ca khoi."""
    a = iso(x, y, z1, ox, oy, s)
    b = iso(x + w, y, z1, ox, oy, s)
    c = iso(x + w, y + d, z1, ox, oy, s)
    e = iso(x, y + d, z1, ox, oy, s)
    b0 = iso(x + w, y, z0, ox, oy, s)
    c0 = iso(x + w, y + d, z0, ox, oy, s)
    e0 = iso(x, y + d, z0, ox, oy, s)
    # Mot vien rat nhat tren mat tren: hai khoi trang canh nhau ma khong co
    # vien thi dinh lai thanh mot mang trang, mat het so khoi.
    return (
        poly([a, b, c, e], top, stroke="#DCE5F5", stroke_width="1.6")
        + poly([e, c, c0, e0], right)
        + poly([b, c, c0, b0], left)
    )


def art_iso():
    out = []
    out.append(circle(1150, 260, 300, BLUE_PALE, opacity=0.7, filter="url(#blur60)"))
    out.append(circle(430, 700, 250, "#DFF7EC", opacity=0.75, filter="url(#blur60)"))

    # bong do tren nen, truoc tien
    out.append(
        f'<ellipse cx="800" cy="690" rx="470" ry="96" fill="#0B1B3A" '
        f'opacity="0.10" filter="url(#blur60)"/>'
    )

    # be do: ve TRUOC, vi no nam duoi tat ca
    out.append(iso_box(-340, -200, 680, 400, -30, 0, "#0F3FD6", "#092C9B", "#0A34B4"))

    cells = [(r, c) for r in range(4) for c in range(5) if not (r == 3 and c == 4)]
    accent = {(1, 2): (GREEN, "#05B87A", "#06D28B"),
              (0, 4): (BLUE_MID, "#2A5AD8", "#3C6BE6"),
              (3, 0): (BLUE_MID, "#2A5AD8", "#3C6BE6")}

    def pos(rc):
        r, c = rc
        return -286 + c * 122, -156 + r * 100

    # Thu tu ve: xa truoc, gan sau. Tren luoi iso nay do sau tang theo x + y.
    for rc in sorted(cells, key=lambda rc: sum(pos(rc))):
        x, y = pos(rc)
        r, c = rc
        h = 54 + ((r * 5 + c) % 4) * 30
        if rc in accent:
            top, left, right = accent[rc]
        else:
            # sac do mat tren lech nhe theo o => luoi khong bi det
            top = PAPER if (r + c) % 2 == 0 else "#F6F9FF"
            left, right = "#C4D2EE", "#E2EAF9"
        out.append(iso_box(x, y, 92, 68, 0, h, top, left, right))
    return svg("".join(out))


# ------------------------------------------------------------------ huong 3
# Truu tuong nhung van doc duoc: mot khoi kinh lon la nen tang, cac nut nho
# nam tren no, ba nut sang. It chi tiet, nhieu khoang tho, tuong phan co manh.


def art_abstract():
    out = []
    out.append(circle(420, 300, 320, "#DDE6FF", opacity=0.9, filter="url(#blur60)"))
    out.append(circle(1180, 640, 300, "#D8F7EA", opacity=0.9, filter="url(#blur60)"))

    # khoi nen: mot hinh bo goc rat lon, hoi nghieng
    out.append(
        f'<g transform="rotate(-8 800 470)">'
        + rrect(300, 300, 1000, 340, 170, "url(#glass)", filter="url(#softer)")
        + "</g>"
    )

    # cac nut tren khoi, xep thanh luoi nghieng cung goc
    rng = np.random.default_rng(19)
    nodes = []
    for r in range(3):
        for c in range(7):
            if r == 2 and c > 4:
                continue
            nodes.append((r, c))
    out.append('<g transform="rotate(-8 800 470)">')
    for r, c in nodes:
        x = 384 + c * 124
        y = 372 + r * 96
        big = (r, c) in {(1, 3)}
        mid = (r, c) in {(0, 5), (2, 1)}
        if big:
            out.append(circle(x, y, 46, "url(#mint)", filter="url(#soft)"))
            out.append(circle(x, y, 18, PAPER, opacity=0.95))
        elif mid:
            out.append(circle(x, y, 30, GREEN, opacity=0.9))
        else:
            out.append(circle(x, y, 22, PAPER, opacity=0.55))
    out.append("</g>")
    return svg("".join(out))


def main():
    for name, fn in (("art1-flat", art_flat), ("art2-iso", art_iso)):
        p = OUT / f"{name}.svg"
        p.write_text(fn(), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
