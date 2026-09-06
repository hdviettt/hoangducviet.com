"""Featured media: dang du lieu tham so, ve phang.

Vi sao bo isometric va bo do vat:

  * Khoi hop iso khong tu goi ten duoc no la gi — nguoi xem phai doc chu thich.
  * Thay bang file/folder thi goi ten duoc, nhung do la ngon ngu icon cua
    khoang 2015: nhan ra ngay va cu ngay.

Ngon ngu o day khac ca hai: moi hinh la mot TRUONG THAM SO — luoi, nhip, mat
do — va BAN THAN HINH DANG LA CON SO. Khong co do vat nao de goi ten, nen
khong co gi de cu; va khong can chu thich, vi cai nguoi xem thay chinh la
luong: bao nhieu, day o dau, thua o dau, cho nao bi ngat nhip.

Giu lai tu file cua Viet: mot mau duy nhat, va bo loc `rough` cho net rung nhe.
Bo hoan toan: phep chieu iso, tia sang, dong chu gia, va moi do vat.

    python scripts/make-work-field.py
"""

import math
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 960, 540
M = 84                      # le
AW, AH = W - 2 * M, H - 2 * M

INK = "#004AEF"
SW = 3.0


def defs():
    return """<defs>
  <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="turbulence" baseFrequency="0.016" numOctaves="2"
                  seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>"""


def dot(x, y, r=5.0, op=1.0, hollow=False, sw=None):
    if hollow:
        return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#FFFFFF" '
                f'stroke="{INK}" stroke-opacity="{op:.2f}" '
                f'stroke-width="{sw or SW * 0.85}"/>')
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{INK}" '
            f'fill-opacity="{op:.2f}"/>')


def seg(x0, y0, x1, y1, op=1.0, sw=None, dash=None, cap="round"):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<path d="M{x0:.1f},{y0:.1f} L{x1:.1f},{y1:.1f}" fill="none" '
            f'stroke="{INK}" stroke-opacity="{op:.2f}" '
            f'stroke-width="{sw or SW}" stroke-linecap="{cap}"{d}/>')


def rect(x, y, w, h, op=1.0, sw=None, fill=None, r=0, dash=None):
    f = f'fill="{INK}" fill-opacity="{fill}"' if fill else 'fill="none"'
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
            f'rx="{r}" {f} stroke="{INK}" stroke-opacity="{op:.2f}" '
            f'stroke-width="{sw or SW}"{d}/>')


def ellipse(cx, cy, rx, ry, op=1.0, sw=None, dash=None, rot=0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    t = f' transform="rotate({rot} {cx:.1f} {cy:.1f})"' if rot else ""
    return (f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" '
            f'fill="none" stroke="{INK}" stroke-opacity="{op:.2f}" '
            f'stroke-width="{sw or SW}"{d}{t}/>')


def svg(body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" stroke-linejoin="round">'
        f'{defs()}<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
        f'<g filter="url(#rough)">{body}</g></svg>'
    )


# ------------------------------------------------------------------- canh


def search():
    """Ma tran thua cua inverted index. Hang xep theo tan suat, nen mat do tu
    no ve ra cai nem Zipf: vai tu trung gan moi tai lieu, phan lon trung gan
    nhu khong cai nao. Mot hang duoc noi lien: mot posting list."""
    rng = np.random.default_rng(11)
    COLS, ROWS = 34, 15
    cw, ch = AW / COLS, AH / ROWS
    b = []
    for r in range(ROWS):
        k = 1 - r / (ROWS - 1)
        dens = max(0.02, 1.02 * k ** 1.9)
        rad = 2.4 + 3.8 * k
        op = 0.30 + 0.66 * k
        for c in range(COLS):
            if rng.random() < dens:
                b.append(dot(M + c * cw + cw / 2, M + r * ch + ch / 2,
                             rad, op))
    # mot posting list trong vung thua
    r = 8
    cols = [3, 9, 14, 21, 27, 31]
    y = M + r * ch + ch / 2
    for i in range(len(cols) - 1):
        b.append(seg(M + cols[i] * cw + cw / 2, y,
                     M + cols[i + 1] * cw + cw / 2, y, 0.75, SW * 0.8))
    for c in cols:
        b.append(dot(M + c * cw + cw / 2, y, 6.0, 1.0))
    return "".join(b)


def keywords():
    """Cung mot dam diem, hai lan: o vi tri deu tap ban dau va o vi tri sau khi
    nen chieu. Duong noi mo giua hai vi tri la chinh phep bien doi. Hai diem
    khong roi vao bao nao: thu HDBSCAN tu choi xep."""
    rng = np.random.default_rng(5)
    b = []
    N = 9
    step_x, step_y = AW / (N + 1), AH / (N - 1)
    starts, ends = [], []
    centres = [(0.24, 0.30), (0.68, 0.24), (0.46, 0.74)]
    for i in range(N):
        for j in range(N):
            sx = M + (i + 0.5) * step_x
            sy = M + j * step_y
            starts.append((sx, sy))
            g = (i + j) % 3
            cx, cy = centres[g]
            r = 0.10 + 0.035 * ((i * 3 + j) % 4)
            a = rng.uniform(0, 2 * math.pi)
            ex = M + (cx + math.cos(a) * r * rng.uniform(0.2, 1.0)) * AW
            ey = M + (cy + math.sin(a) * r * 1.5 * rng.uniform(0.2, 1.0)) * AH
            ends.append((ex, ey))
    # hai diem lac loai: khong vao cum nao
    strays = [(M + 0.06 * AW, M + 0.86 * AH), (M + 0.93 * AW, M + 0.66 * AH)]
    for k in range(2):
        ends[k * 40] = strays[k]

    for (sx, sy), (ex, ey) in zip(starts, ends):
        b.append(seg(sx, sy, ex, ey, 0.13, SW * 0.5))
    for sx, sy in starts:
        b.append(dot(sx, sy, 3.0, 0.22))
    for i, (ex, ey) in enumerate(ends):
        stray = (ex, ey) in strays
        b.append(dot(ex, ey, 5.4, 0.95, hollow=stray))
    for (cx, cy), rr in zip(centres, (0.155, 0.135, 0.145)):
        b.append(ellipse(M + cx * AW, M + cy * AH, rr * AW, rr * AH * 1.15,
                         0.5, SW * 0.75, dash="8 8"))
    return "".join(b)


def publishing():
    """So loi goi model theo thoi gian: mot xung o buoc dau, roi bang khong,
    mai mai. Bai duoc xuat ban van chay tiep — cac vach nho tren duong khong."""
    b = []
    base = M + AH * 0.72
    b.append(seg(M, base, M + AW, base, 0.55, SW * 0.9))
    # xung: mot lan duy nhat
    x0 = M + AW * 0.055
    b.append(seg(x0, base, x0, M + AH * 0.06, 1.0, SW * 1.9))
    b.append(dot(x0, M + AH * 0.06, 9.0, 1.0))
    # duong khong keo dai: cac vach nho la cac bai, khong vach nao nhac len
    n = 42
    for i in range(n):
        x = M + AW * (0.13 + 0.87 * i / (n - 1))
        op = 0.85 - 0.5 * (i / (n - 1))
        b.append(seg(x, base, x, base - 11, op, SW * 0.85))
    return "".join(b)


def content():
    """Bon kien truc, cung mot checklist muoi hai muc, va phan giu duoc cua moi
    ban. Ban thu hai to lien mot khoi khong chia o: giong noi vao trong so thi
    khong con tach ra duoc nua."""
    b = []
    ROWS = 12
    colw = AW / 7.4
    gap = (AW - 4 * colw) / 3
    ch = AH / ROWS
    kept = (3, 12, 12, 12)
    for s in range(4):
        x = M + s * (colw + gap)
        for r in range(ROWS):
            y = M + (ROWS - 1 - r) * ch
            on = r < kept[s]
            if s == 1:
                continue
            b.append(rect(x, y + 2, colw, ch - 5, 0.95 if on else 0.32,
                          SW * (1.0 if on else 0.7),
                          fill="0.16" if on else None,
                          dash=None if on else "6 7"))
        if s == 1:
            # mot khoi lien, khong duong chia: da dong bang vao trong so
            b.append(rect(x, M + 2, colw, AH - 5, 0.95, SW * 1.0, fill="0.16"))
    return "".join(b)


def quoting():
    """Chin buoc, bay buoc la so vao so ra — o trong khong co gi de nhin. Hai
    buoc con lai bi nhot: gach kin va co ngoac om hai ben. Thang nam bac ben
    duoi: model chon trong khoang, khong bao gio mot so tu do."""
    b = []
    G = 3
    cell = min(AW * 0.62, AH) / G
    ox = M + (AW * 0.62 - cell * G) / 2
    oy = M + (AH - cell * G) / 2
    caged = {(0, 1), (2, 0)}
    for r in range(G):
        for c in range(G):
            x, y = ox + c * cell, oy + r * cell
            b.append(rect(x + 4, y + 4, cell - 8, cell - 8, 0.9, SW))
            if (r, c) in caged:
                for k in range(7):
                    t = (k + 1) / 8
                    b.append(seg(x + 4 + (cell - 8) * t, y + 6,
                                 x + 4 + (cell - 8) * t, y + cell - 10,
                                 0.5, SW * 0.7))
                for sx in (x + 4, x + cell - 4):
                    b.append(seg(sx, y + 12, sx, y + cell - 16, 1.0, SW * 1.7))
    # thang nam bac, mot cham nam DUNG tren mot bac
    lx = M + AW * 0.78
    ly = oy + cell * 0.6
    for i in range(5):
        b.append(seg(lx - 34, ly + i * 34, lx + 34, ly + i * 34, 0.5, SW * 0.85))
    b.append(dot(lx, ly + 2 * 34, 8.5, 1.0))
    return "".join(b)


def platform():
    """Muoi chin vach tren MOT duong lien: mot nen tang, muoi chin agent. Duong
    nen khong bi ngat o bat ky cho nao — do la "zero changes to the core".
    Mot vach roi khoi duong, va cho no de lai duoc ve bang net dut."""
    b = []
    N = 19
    base = M + AH * 0.78
    step = AW / (N - 1)
    slot = 12
    b.append(seg(M - 10, base, M + AW + 10, base, 1.0, SW * 1.6))
    for i in range(N):
        x = M + i * step
        h = AH * (0.24 + 0.30 * abs(math.sin(i * 1.17)) + 0.12 * ((i * 7) % 3) / 2)
        if i == slot:
            b.append(seg(x, base, x, base - h, 0.3, SW * 0.9, dash="7 8"))
            b.append(seg(x, base - h - 44, x, base - h - 44 - h * 0.9, 1.0,
                         SW * 2.2))
            b.append(dot(x, base - h - 44 - h * 0.9, 8.0, 1.0))
            continue
        op = 0.9 - 0.35 * (i / (N - 1))
        b.append(seg(x, base, x, base - h, op, SW * 1.5))
    return "".join(b)


def presentation():
    """Slide da dung, va muoi sau phep do bao quanh no — linter la quan toa duy
    nhat. Model la o vuong nho o goc, voi mot net dut DUNG LAI truoc khi cham
    toi slide: no khong bao gio tu cham diem cho minh."""
    b = []
    sx, sy = M + AW * 0.20, M + AH * 0.16
    sw_, sh = AW * 0.60, AH * 0.62
    b.append(rect(sx, sy, sw_, sh, 1.0, SW * 1.5))
    # noi dung slide: mot dai tieu de, mot cot chu, mot khoi cot so lieu
    b.append(seg(sx + 26, sy + 34, sx + sw_ * 0.52, sy + 34, 0.75, SW * 1.5))
    for i in range(3):
        b.append(seg(sx + 26, sy + 76 + i * 22, sx + 26 + sw_ * (0.3, 0.22, 0.26)[i],
                     sy + 76 + i * 22, 0.42, SW * 0.9))
    for i, v in enumerate((0.42, 0.74, 0.55, 0.95)):
        bx = sx + sw_ * 0.56 + i * (sw_ * 0.10)
        b.append(rect(bx, sy + sh - 34 - (sh - 90) * v, sw_ * 0.055,
                      (sh - 90) * v, 0.7, SW * 0.9, fill="0.14"))
    # 16 phep do: 5 tren, 4 duoi, 4 trai, 3 phai
    def dim(x0, y0, x1, y1, op=0.55):
        c = 7
        if abs(x1 - x0) > abs(y1 - y0):
            caps = (seg(x0, y0 - c, x0, y0 + c, op, SW * 0.7),
                    seg(x1, y1 - c, x1, y1 + c, op, SW * 0.7))
        else:
            caps = (seg(x0 - c, y0, x0 + c, y0, op, SW * 0.7),
                    seg(x1 - c, y1, x1 + c, y1, op, SW * 0.7))
        return seg(x0, y0, x1, y1, op, SW * 0.7) + "".join(caps)

    for i in range(5):
        y = sy - 16 - i * 13
        b.append(dim(sx + sw_ * (0.02 + 0.10 * i), y,
                     sx + sw_ * (0.98 - 0.06 * i), y))
    for i in range(4):
        y = sy + sh + 16 + i * 13
        b.append(dim(sx + sw_ * (0.05 + 0.09 * i), y,
                     sx + sw_ * (0.95 - 0.08 * i), y))
    for i in range(4):
        x = sx - 16 - i * 13
        b.append(dim(x, sy + sh * (0.04 + 0.10 * i), x, sy + sh * (0.96 - 0.09 * i)))
    for i in range(3):
        x = sx + sw_ + 16 + i * 13
        b.append(dim(x, sy + sh * (0.10 + 0.12 * i), x, sy + sh * (0.90 - 0.10 * i)))
    # ba luat nghia: dat TREN noi dung, khac han cac phep do o le
    for px, py in ((sx + sw_ * 0.22, sy + 34), (sx + sw_ * 0.63, sy + sh * 0.62),
                   (sx + 26 + sw_ * 0.15, sy + 98)):
        b.append(dot(px, py, 7.5, 0.9, hollow=True, sw=SW * 1.1))
    # model: o goc duoi trai, net dut dung lai truoc khi cham slide
    mx, my = M + AW * 0.02, M + AH * 0.90
    b.append(rect(mx, my, 34, 34, 0.5, SW))
    b.append(seg(mx + 40, my + 12, sx - 46, sy + sh * 0.86, 0.35, SW * 0.8,
                 dash="7 9"))
    return "".join(b)


SCENES = {
    "agentic-ai-platform": platform,
    "mini-search-engine": search,
    "agentic-presentation-system": presentation,
    "cms-publishing-pipeline": publishing,
    "content-seo-ai": content,
    "keyword-clustering": keywords,
    "seo-quoting-agent": quoting,
}


def main():
    for slug, fn in SCENES.items():
        p = OUT / f"fld-{slug}.svg"
        p.write_text(svg(fn()), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
