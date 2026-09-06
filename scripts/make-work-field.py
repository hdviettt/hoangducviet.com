"""Featured media: giao dien that cua tung du an, ve tay.

Ba lan lam lai, va day la thu con lai sau ca ba:

  1. Ve NGUYEN LY thi doc khong ra. Ma tran thua cua chi muc dung ve cach mot
     cong cu tim kiem hoat dong, va khong ai nhin vao ma doan duoc do la mot
     cong cu tim kiem.
  2. Ve dung do vat thi doc ra, nhung neu chi co khung va gach thi ca bay hinh
     thanh mot bo wireframe: toan hop chu nhat, khong phan biet duoc cai nao la
     cai nao ngoai bo cuc.
  3. Cai bien mot cai khung thanh mot GIAO DIEN la CHU THAT o trong no. Mot
     truy van that, mot ten cum tu khoa that, mot dong tien that. Chung de doc
     hon va thu vi hon mot vach xam, o dung cung mot do dam.

Ky thuat quan trong nhat o day: chu nam NGOAI bo loc `rough`. Bo loc day diem
anh di 2.4px cho net ve rung nhe nhu ve tay, va chinh 2.4px do bien mot dong
13px thanh vet nhoe. Tach ra thi duoc ca hai — khung ve tay, chu sac.

Mau: mot mau duy nhat, primary cua site. Chieu sau bang do mo, khong bong do.

    python scripts/make-work-field.py
"""

import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 960, 540
M = 72
AW, AH = W - 2 * M, H - 2 * M

INK = "#004AEF"
SW = 3.0
SANS = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"


def defs():
    return """<defs>
  <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="turbulence" baseFrequency="0.016" numOctaves="2"
                  seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>"""


# ------------------------------------------------------------------ net ve


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


def white(x, y, w, h, r=0):
    """Nen trang dac: cach duy nhat trong ngon ngu nay de mot the noi len tren
    cai nam duoi no, vi o day khong co bong do."""
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
            f'rx="{r}" fill="#FFFFFF"/>')


def arc(cx, cy, r, a0, a1, op=1.0, sw=None):
    """Cung tron; goc do, 0 la huong 12 gio, chay theo chieu kim dong ho."""

    def pt(a):
        t = math.radians(a - 90)
        return cx + r * math.cos(t), cy + r * math.sin(t)

    x0, y0 = pt(a0)
    x1, y1 = pt(a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return (f'<path d="M{x0:.1f},{y0:.1f} A{r},{r} 0 {large} 1 '
            f'{x1:.1f},{y1:.1f}" fill="none" stroke="{INK}" '
            f'stroke-opacity="{op:.2f}" stroke-width="{sw or SW}" '
            f'stroke-linecap="butt"/>')


def arrow(x0, x1, y, op=0.5, sw=None):
    w = sw or SW * 0.9
    h = 8.5
    return (seg(x0, y, x1, y, op, w)
            + seg(x1 - h, y - h * 0.66, x1, y, op, w)
            + seg(x1 - h, y + h * 0.66, x1, y, op, w))


def spark(cx, cy, s=11, op=0.95, sw=None):
    """Ngoi sao bon canh — dau hieu cua model, va chi cua model."""
    d = (f"M{cx:.1f},{cy - s:.1f} Q{cx + s * .17:.1f},{cy - s * .17:.1f} "
         f"{cx + s:.1f},{cy:.1f} Q{cx + s * .17:.1f},{cy + s * .17:.1f} "
         f"{cx:.1f},{cy + s:.1f} Q{cx - s * .17:.1f},{cy + s * .17:.1f} "
         f"{cx - s:.1f},{cy:.1f} Q{cx - s * .17:.1f},{cy - s * .17:.1f} "
         f"{cx:.1f},{cy - s:.1f} Z")
    return (f'<path d="{d}" fill="{INK}" fill-opacity="{op * 0.9:.2f}" '
            f'stroke="{INK}" stroke-opacity="{op:.2f}" '
            f'stroke-width="{sw or SW * 0.8}" stroke-linejoin="round"/>')


def check(cx, cy, s=5.4, op=0.85, sw=None):
    w = sw or SW * 0.9
    return (seg(cx - s, cy, cx - s * 0.2, cy + s * 0.72, op, w)
            + seg(cx - s * 0.2, cy + s * 0.72, cx + s, cy - s * 0.78, op, w))


def magnifier(cx, cy, r=10, op=0.85, sw=None):
    w = sw or SW
    return (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" '
            f'stroke="{INK}" stroke-opacity="{op:.2f}" stroke-width="{w}"/>'
            + seg(cx + r * .72, cy + r * .72, cx + r * 1.55, cy + r * 1.55,
                  op, w))


def picture(x, y, w, h, op=0.45):
    """Khung anh: mat troi va mot dinh nui kin. Hai dinh mo doc ra thanh bieu
    do duong — dung hinh, sai nghia."""
    peak = (f"M{x + w * .30:.1f},{y + h - 10:.1f} L{x + w * .52:.1f},"
            f"{y + h * .20:.1f} L{x + w * .74:.1f},{y + h - 10:.1f} Z")
    return "".join([
        rect(x, y, w, h, op, SW * 0.9, r=4),
        f'<circle cx="{x + w * .17:.1f}" cy="{y + h * .28:.1f}" r="7.5" '
        f'fill="none" stroke="{INK}" stroke-opacity="{op:.2f}" '
        f'stroke-width="{SW * .85}"/>',
        f'<path d="{peak}" fill="{INK}" fill-opacity="{op * .28:.2f}" '
        f'stroke="{INK}" stroke-opacity="{op:.2f}" stroke-width="{SW * .9}" '
        f'stroke-linejoin="round"/>',
    ])


def sheet(x, y, w, h, op=0.55, fill=None):
    """To giay: khung co mot goc gap. Goc gap la thu phan biet mot to giay voi
    mot cai hop."""
    return rect(x, y, w, h, op, SW, fill=fill) + seg(
        x + w - 24, y, x + w, y + 24, op, SW * 0.9)


# --------------------------------------------------------------------- chu


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, size=14, op=0.9, weight=400, anchor="start", mono=False):
    """Chu that, dat ngoai bo loc `rough`."""
    return (f'<text x="{x:.1f}" y="{y:.1f}" '
            f'font-family="{MONO if mono else SANS}" font-size="{size}" '
            f'font-weight="{weight}" fill="{INK}" fill-opacity="{op:.2f}" '
            f'text-anchor="{anchor}" xml:space="preserve">{esc(s)}</text>')


def svg(strokes, labels=""):
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" stroke-linejoin="round">'
        f'{defs()}<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
        f'<g filter="url(#rough)">{strokes}</g>{labels}</svg>'
    )


# ------------------------------------------------------------------- canh


def search():
    """Trang ket qua that: truy van da go, hang tab voi che do Explore dang mo,
    cau tra loi dat tren ba nguon trich, roi hai ket qua co dia chi va tieu de
    that."""
    b, t = [], []
    b.append(rect(M, 72, AW, 54, 0.95, SW * 1.4, r=27))
    b.append(magnifier(M + 34, 99, 10, 0.8))
    t.append(text(M + 62, 106, "who won the 2022 world cup final", 19, 0.88))
    b.append(seg(M + 372, 86, M + 372, 112, 0.5, SW * 1.2))

    tx = M
    for name, op, wt in (("All", 0.42, 400), ("Explore", 1.0, 500),
                         ("Images", 0.42, 400), ("News", 0.42, 400)):
        t.append(text(tx, 155, name, 14.5, op, wt))
        if name == "Explore":
            b.append(seg(tx - 2, 168, tx + 58, 168, 1.0, SW * 1.1))
        tx += len(name) * 8.6 + 34

    b.append(rect(M, 186, AW, 112, 0.9, SW * 1.3, fill="0.045", r=16))
    b.append(spark(M + 30, 216, 11, 0.95))
    t.append(text(M + 56, 222,
                  "Argentina beat France 4–2 on penalties after a 3–3 draw",
                  15.5, 0.7))
    t.append(text(M + 30, 246,
                  "in Lusail. Messi scored twice; Mbappé took a hat-trick.",
                  15.5, 0.7))
    for i, (label, w_) in enumerate((("fifa.com", 84), ("espn.com", 88),
                                     ("wikipedia.org", 110))):
        cx = M + 28 + i * 108
        b.append(rect(cx, 262, w_, 24, 0.6, SW * 0.95, r=12))
        t.append(text(cx + w_ / 2, 279, label, 12.5, 0.7, anchor="middle"))

    for k, (url, title, snip) in enumerate((
        ("en.wikipedia.org > 2022 FIFA World Cup final",
         "2022 FIFA World Cup final",
         "Argentina won their third title, and Messi his first."),
        ("fifa.com > tournaments > qatar-2022",
         "Final: Argentina 3–3 France (4–2 pens)",
         "Full match report, line-ups and the penalty order."),
    )):
        y = 330 + k * 90
        b.append(dot(M + 9, y - 5, 7, 0.5, hollow=True))
        t.append(text(M + 26, y, url, 13, 0.5))
        t.append(text(M, y + 29, title, 21, 1.0, 500))
        if snip:
            t.append(text(M, y + 55, snip, 14, 0.45))
    return "".join(b), "".join(t)


def publishing():
    """Duong ong that, doc tu trai sang phai: ban thao trong Google Docs, cac
    buoc kiem co ten that o giua, va o cuoi la bai da nam tren trang. Dung mot
    buoc co model, va no chay dung mot lan luc dau noi CMS."""
    b, t = [], []
    mid = 270

    dw, dh = 116, 150
    dy = mid - dh / 2
    b.append(sheet(M, dy, dw, dh, 0.5))
    b.append(seg(M + 16, dy + 34, M + 16 + (dw - 40) * 0.8, dy + 34, 0.55,
                 SW * 1.3))
    for i, f in enumerate((0.86, 0.7, 0.9, 0.62)):
        b.append(seg(M + 16, dy + 62 + i * 18, M + 16 + (dw - 34) * f,
                     dy + 62 + i * 18, 0.28, SW * 0.85))
    t.append(text(M + dw / 2, dy + dh + 24, "Google Docs", 13, 0.5,
                  anchor="middle"))
    b.append(arrow(M + dw + 16, M + dw + 58, mid, 0.45))

    sx = M + 194
    rows = (("map the CMS", True), ("title tag under 60", False),
            ("exactly one H1", False), ("H2 order", False),
            ("alt text on every image", False), ("three internal links", False))
    rh, gap = 18, 17
    top = mid - (len(rows) * rh + (len(rows) - 1) * gap) / 2
    for i, (label, is_model) in enumerate(rows):
        y = top + i * (rh + gap)
        if is_model:
            b.append(spark(sx + rh / 2, y + rh / 2, 10.5, 1.0, SW * 0.85))
            t.append(text(sx + 32, y + 14, label, 13.5, 0.9, 500))
            t.append(text(sx + 32 + len(label) * 7.6 + 10, y + 14, "once",
                          11.5, 0.4))
        else:
            op = 0.68 - 0.04 * i
            b.append(rect(sx, y, rh, rh, op, SW * 0.95, r=3))
            b.append(check(sx + rh / 2, y + rh / 2, 5.4, op))
            t.append(text(sx + 32, y + 14, label, 13, 0.5))
    t.append(text(sx + 100, top + 6 * (rh + gap) + 16,
                  "nine checks · one model call", 12.5, 0.45, anchor="middle"))
    b.append(arrow(sx + 206, sx + 248, mid, 0.45))

    ax = sx + 266
    aw = M + AW - ax
    ay, ah = 76, 388
    ix, iw = ax + 26, aw - 52
    b.append(rect(ax, ay, aw, ah, 1.0, SW * 1.9, r=8))
    b.append(seg(ax, ay + 42, ax + aw, ay + 42, 0.45, SW))
    for i in range(3):
        b.append(dot(ax + 22 + i * 17, ay + 21, 4.5, 0.4))
    b.append(rect(ax + 80, ay + 10, aw * 0.60, 22, 0.26, SW * 0.9, r=11))
    t.append(text(ax + 92, ay + 26, "example.com/blog/running-shoes", 11.5,
                  0.45))
    t.append(text(ix, ay + 88, "How to choose running", 21, 1.0, 500))
    t.append(text(ix, ay + 115, "shoes for flat feet", 21, 1.0, 500))
    t.append(text(ix, ay + 141, "12 min read · updated today", 12, 0.4))
    b.append(picture(ix, ay + 158, iw, 84, 0.45))
    t.append(text(ix, ay + 278, "What to look for", 17, 0.85, 500))
    for i, f in enumerate((0.98, 0.88)):
        b.append(seg(ix, ay + 300 + i * 18, ix + iw * f, ay + 300 + i * 18,
                     0.28, SW * 0.9))
    t.append(text(ix, ay + 350, "Arch support", 17, 0.85, 500))
    b.append(seg(ix, ay + 372, ix + iw * 0.94, ay + 372, 0.28, SW * 0.9))
    return "".join(b), "".join(t)


def platform():
    """Nen tang that la mot ung dung: cot trai la danh muc cac giai phap dang
    chay tren no, mang ten that, va con mot dong "+12 more" vi con nua. Ben
    phai la mot giai phap dang mo, voi mot loi goi cong cu that."""
    b, t = [], []
    x0, y0, w, h = M, 72, AW, AH
    b.append(rect(x0, y0, w, h, 1.0, SW * 1.9, r=10))
    b.append(seg(x0, y0 + 44, x0 + w, y0 + 44, 0.45, SW))
    for i in range(3):
        b.append(dot(x0 + 24 + i * 17, y0 + 22, 4.5, 0.4))
    t.append(text(x0 + 92, y0 + 27, "AI platform", 13.5, 0.45))

    rail = 240
    b.append(seg(x0 + rail, y0 + 44, x0 + rail, y0 + h, 0.45, SW))
    b.append(rect(x0 + 20, y0 + 60, rail - 42, 28, 0.28, SW * 0.9, r=14))
    b.append(magnifier(x0 + 38, y0 + 74, 6, 0.35, SW * 0.8))
    t.append(text(x0 + 54, y0 + 79, "Search solutions", 12.5, 0.35))

    names = ("Keyword clustering", "Content writer", "Quoting agent",
             "Internal linking", "Outline builder", "Deck builder",
             "Publishing pipeline", "Audit crawler")
    for i, name in enumerate(names):
        y = y0 + 116 + i * 30
        op = 0.70 - 0.055 * i
        if i == 1:
            b.append(rect(x0 + 14, y - 12, rail - 30, 28, 0.0, SW,
                          fill="0.10", r=8))
            op = 1.0
        # bieu tuong doi hinh theo loai, cho khoi thanh mot cot o vuong y het
        if i % 3 == 0:
            b.append(dot(x0 + 34, y - 4, 6.5, op, hollow=True))
        elif i % 3 == 1:
            b.append(rect(x0 + 28, y - 10, 13, 13, op, SW * 0.9, r=3))
        else:
            b.append(seg(x0 + 28, y + 2, x0 + 34.5, y - 10, op, SW * 0.9))
            b.append(seg(x0 + 34.5, y - 10, x0 + 41, y + 2, op, SW * 0.9))
            b.append(seg(x0 + 28, y + 2, x0 + 41, y + 2, op, SW * 0.9))
        t.append(text(x0 + 52, y, name, 13.5, min(0.92, op + 0.22),
                      500 if i == 1 else 400))
    t.append(text(x0 + 52, y0 + 116 + 8 * 30, "+ 12 more", 13, 0.35))

    mx = x0 + rail
    mw = w - rail
    t.append(text(mx + 34, y0 + 86, "Content writer", 22, 1.0, 500))
    bw = 300
    bx = x0 + w - 34 - bw
    b.append(rect(bx, y0 + 106, bw, 56, 0.45, SW, fill="0.05", r=14))
    t.append(text(bx + 18, y0 + 130, "Outline for 'running shoes", 13, 0.55))
    t.append(text(bx + 18, y0 + 150, "for flat feet'", 13, 0.55))
    b.append(spark(mx + 44, y0 + 202, 10.5, 0.95, SW * 0.85))
    t.append(text(mx + 64, y0 + 207,
                  "Nine H2s, ordered by search intent, each", 14.5, 0.6))
    t.append(text(mx + 34, y0 + 229,
                  "with the internal links it should carry.", 14.5, 0.6))
    b.append(rect(mx + 34, y0 + 258, mw - 68, 74, 0.5, SW, r=10))
    b.append(rect(mx + 54, y0 + 278, 14, 14, 0.55, SW * 0.9, r=3))
    t.append(text(mx + 78, y0 + 290, "internal_links.search()", 13, 0.7,
                  mono=True))
    t.append(text(mx + 54, y0 + 316, "12 candidates · 3 kept", 12.5, 0.4))
    b.append(rect(mx + 34, y0 + 340, mw - 68, 34, 0.28, SW * 0.95, r=17))
    t.append(text(mx + 52, y0 + 362, "Ask anything", 13, 0.32))
    return "".join(b), "".join(t)


def presentation():
    """Ket qua that la mot bo slide: brief va may file du lieu ben trai, slide
    dang mo ben phai voi tieu de, cac y va bieu do co nhan truc, va dai
    thumbnail cua ca bo o duoi."""
    b, t = [], []
    dw, dh = 106, 166
    dy = 190
    b.append(rect(M + 24, dy - 18, dw, dh, 0.28, SW * 0.9))
    for i in range(4):
        b.append(seg(M + 36, dy + 8 + i * 32, M + 24 + dw - 12,
                     dy + 8 + i * 32, 0.2, SW * 0.8))
    for i in range(2):
        b.append(seg(M + 56 + i * 32, dy - 18, M + 56 + i * 32, dy - 18 + dh,
                     0.2, SW * 0.8))
    b.append(sheet(M, dy, dw, dh, 0.6, fill="0.03"))
    for i, f in enumerate((0.72, 0.9, 0.64, 0.84, 0.5)):
        b.append(seg(M + 16, dy + 42 + i * 20, M + 16 + (dw - 34) * f,
                     dy + 42 + i * 20, 0.3, SW * 0.85))
    t.append(text(M + dw / 2, dy + dh + 26, "Brief", 13.5, 0.6, 500,
                  anchor="middle"))
    t.append(text(M + dw / 2, dy + dh + 44, "+ 3 data files", 11.5, 0.4,
                  anchor="middle"))
    b.append(arrow(M + 146, M + 186, dy + dh / 2, 0.45))

    sx = M + 206
    sw_ = M + AW - sx
    sy, sh = 76, 262
    b.append(rect(sx, sy, sw_, sh, 1.0, SW * 1.9, r=6))
    t.append(text(sx + 32, sy + 50, "Q3 organic performance", 24, 1.0, 500))
    t.append(text(sx + 32, sy + 76, "Sessions and revenue, Jul–Sep", 13.5,
                  0.42))
    for i, line in enumerate(("Sessions up 38% on last quarter",
                              "Ten pages drive 62% of revenue",
                              "Two clusters still unranked")):
        yy = sy + 118 + i * 28
        b.append(dot(sx + 40, yy - 5, 4.5, 0.5))
        t.append(text(sx + 56, yy, line, 14, 0.6))

    base = sy + sh - 48
    cx0 = sx + sw_ * 0.58
    for i, (v, mon) in enumerate(((0.42, "Jul"), (0.66, "Aug"), (0.98, "Sep"))):
        bh = (sh - 152) * v
        bx = cx0 + i * 56
        b.append(rect(bx, base - bh, 34, bh, 0.7, SW * 0.95, fill="0.14"))
        t.append(text(bx + 17, base + 20, mon, 11.5, 0.4, anchor="middle"))
    b.append(seg(cx0 - 14, base, cx0 + 3 * 56 + 4, base, 0.45, SW * 0.9))

    tw, gap = 148, 16
    ty, th = 366, 72
    for i in range(4):
        tx = sx + i * (tw + gap)
        op = 1.0 if i == 0 else 0.40 - 0.055 * i
        b.append(rect(tx, ty, tw, th, op, SW * (1.4 if i == 0 else 1.0), r=4))
        b.append(seg(tx + 14, ty + 24, tx + 14 + (tw - 28) * 0.7, ty + 24,
                     op * 0.55, SW * 0.9))
        b.append(seg(tx + 14, ty + 44, tx + 14 + (tw - 28) * 0.44, ty + 44,
                     op * 0.4, SW * 0.85))
        t.append(text(tx + tw - 12, ty + th - 10, str(i + 1), 11,
                      0.5 if i == 0 else 0.3, anchor="end", mono=True))
    return "".join(b), "".join(t)


def content():
    """Cai nguoi dung thuc su nhin thay: bai dang duoc viet ra, con tro dung o
    cuoi dong cuoi, cot dau tich chay doc le phai, va the goi y cua model neo
    bang net dut vao dung cau no vua cham toi."""
    b, t = [], []
    px, pw = M, 548
    py, ph = 72, AH
    ix, iw = px + 30, pw - 60
    b.append(rect(px, py, pw, ph, 1.0, SW * 1.9, r=6))
    t.append(text(ix, py + 52, "Running shoes for flat feet:", 23, 1.0, 500))
    t.append(text(ix, py + 80, "how to choose", 23, 1.0, 500))
    t.append(text(ix, py + 106, "Draft · 1,240 words · 9 H2s", 12.5, 0.4))
    t.append(text(ix, py + 146, "What to look for", 17, 0.88, 500))
    for i, f in enumerate((0.98, 0.92, 0.7)):
        b.append(seg(ix, py + 172 + i * 20, ix + iw * f, py + 172 + i * 20,
                     0.28, SW * 0.9))
    t.append(text(ix, py + 258, "Arch support", 17, 0.88, 500))
    for i, f in enumerate((0.96, 0.86)):
        b.append(seg(ix, py + 284 + i * 20, ix + iw * f, py + 284 + i * 20,
                     0.28, SW * 0.9))
    cy = py + 328
    b.append(seg(ix, cy, ix + iw * 0.44, cy, 0.5, SW * 1.1))
    b.append(seg(ix + iw * 0.44 + 12, cy - 13, ix + iw * 0.44 + 12, cy + 13,
                 1.0, SW * 1.6))
    for yy in (216, 258, 304, 348):
        b.append(check(px + pw - 22, py + yy - 4, 5.2, 0.4))

    anchor_x, anchor_y = ix + iw * 0.92, py + 172
    b.append(dot(anchor_x, anchor_y - 5, 5.0, 0.8, hollow=True))
    cx0, cw, chh, cy0 = px + pw - 42, 318, 126, py + 22
    b.append(white(cx0, cy0, cw, chh, 12))
    b.append(rect(cx0, cy0, cw, chh, 0.9, SW * 1.4, fill="0.045", r=12))
    b.append(spark(cx0 + 28, cy0 + 32, 11, 0.95))
    t.append(text(cx0 + 48, cy0 + 37, "Tighten this to one claim,", 13.5, 0.62))
    t.append(text(cx0 + 22, cy0 + 59, "then cite the source in the", 13.5,
                  0.62))
    t.append(text(cx0 + 22, cy0 + 81, "sentence after it.", 13.5, 0.62))
    b.append(rect(cx0 + 22, cy0 + 94, 62, 24, 0.55, SW * 0.95, r=12))
    t.append(text(cx0 + 53, cy0 + 111, "Apply", 12, 0.7, anchor="middle"))
    b.append(seg(cx0 + 6, cy0 + chh, anchor_x + 6, anchor_y - 12, 0.45,
                 SW * 0.85, dash="6 7"))
    return "".join(b), "".join(t)


def keywords():
    """Dau vao va dau ra that: mot danh sach tu khoa tho ben trai, ben phai la
    cac cum da duoc dat ten. Hai tu trong khung net dut la nhung tu HDBSCAN tu
    choi xep — khong phai cho trong con thieu."""
    b, t = [], []
    lw = 244
    b.append(rect(M, 76, lw, 388, 0.5, SW * 1.2, r=6))
    t.append(text(M + 18, 104, "12,480 keywords", 14, 0.7, 500))
    b.append(seg(M, 118, M + lw, 118, 0.3, SW * 0.9))
    raw = ("giày chạy bộ nam", "cách chọn giày chạy bộ", "nike pegasus 40",
           "giày chạy bộ giá rẻ", "size giày chạy bộ", "giày chạy bộ nữ",
           "adidas ultraboost", "giày chạy trail", "giày chạy bộ tốt nhất",
           "giày chạy bộ chính hãng", "giày tây nam", "giày cao gót",
           "giày chạy bộ 2026")
    for i, kw in enumerate(raw):
        t.append(text(M + 18, 146 + i * 24, kw, 13,
                      max(0.16, 0.5 - 0.026 * i)))
    b.append(arrow(M + lw + 18, M + lw + 58, 270, 0.45))

    gx = M + lw + 78
    gw = M + AW - gx
    for oy, chh, name, members in (
        (76, 122, "Mua giày chạy bộ",
         ("giày chạy bộ nam", "giày chạy bộ giá rẻ",
          "giày chạy bộ chính hãng")),
        (214, 122, "Tư vấn chọn giày",
         ("cách chọn giày chạy bộ", "size giày chạy bộ",
          "giày chạy bộ tốt nhất")),
        (344, 120, "Theo hãng",
         ("nike pegasus 40", "adidas ultraboost", "nike air zoom")),
    ):
        w_ = gw if oy != 344 else gw * 0.58
        b.append(rect(gx, oy, w_, chh, 0.9, SW * 1.4, r=8))
        t.append(text(gx + 22, oy + 32, name, 17, 0.95, 500))
        for j, kw in enumerate(members):
            yy = oy + 60 + j * 22
            b.append(dot(gx + 26, yy - 4, 3.4, 0.32))
            t.append(text(gx + 38, yy, kw, 12.5, 0.42))

    ux = gx + gw * 0.62
    for j, kw in enumerate(("giày tây nam", "giày cao gót")):
        yy = 352 + j * 40
        b.append(rect(ux, yy, gw * 0.36, 32, 0.5, SW * 0.95, r=6, dash="6 6"))
        t.append(text(ux + 16, yy + 21, kw, 12.5, 0.45))
    t.append(text(ux, 454, "no cluster would take these", 11.5, 0.38))
    return "".join(b), "".join(t)


def quoting():
    """Ban bao gia that: cac dong muc co ten, cot so luong, cot tien, mot vong
    tron chia ty trong o goc, va dong tong o duoi cung — dam nhat trong ca
    hinh, vi do la dong nguoi nhan mo ra de xem."""
    b, t = [], []
    px, pw = M + 46, AW - 92
    b.append(rect(px, 72, pw, AH, 1.0, SW * 1.9, r=6))
    t.append(text(px + 34, 122, "SEO proposal", 24, 1.0, 500))
    t.append(text(px + 34, 148, "12 months · organic growth", 13, 0.42))

    # vong tron chia ty trong: hinh tron duy nhat trong ca bo, va no mang dung
    # ty le cua bang ngay ben duoi
    dcx, dcy, dr = px + pw - 74, 132, 30
    a = 0.0
    for share, op in ((96 / 189.6, 1.0), (54 / 189.6, 0.62),
                      (18 / 189.6, 0.42), (21.6 / 189.6, 0.3)):
        span = share * 360
        b.append(arc(dcx, dcy, dr, a + 4, a + span - 4, op, SW * 1.8))
        a += span

    b.append(seg(px, 176, px + pw, 176, 0.4, SW))
    for label, ax_, anch in (("Scope", px + 34, "start"),
                             ("Qty", px + pw * 0.62, "end"),
                             ("Amount", px + pw * 0.92, "end")):
        t.append(text(ax_, 204, label, 12, 0.4, anchor=anch))
    for i, (scope, qty, amount) in enumerate((
        ("Technical audit", "1", "18.000.000"),
        ("Content, 12 articles a month", "12", "96.000.000"),
        ("Internal linking", "1", "12.000.000"),
        ("Digital PR", "6", "54.000.000"),
        ("Monthly reporting", "12", "9.600.000"),
    )):
        y = 240 + i * 30
        t.append(text(px + 34, y, scope, 14, 0.6))
        t.append(text(px + pw * 0.62, y, qty, 13.5, 0.45, anchor="end"))
        t.append(text(px + pw * 0.92, y, amount, 13.5, 0.72, anchor="end",
                      mono=True))
    b.append(seg(px + pw * 0.48, 396, px + pw * 0.94, 396, 0.45, SW * 0.9))
    b.append(seg(px + pw * 0.48, 405, px + pw * 0.94, 405, 0.45, SW * 0.9))
    t.append(text(px + pw * 0.48, 442, "Total", 17, 0.85, 500))
    t.append(text(px + pw * 0.92, 442, "189.600.000 ₫", 22, 1.0, 600,
                  anchor="end"))
    return "".join(b), "".join(t)


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
        strokes, labels = fn()
        p = OUT / f"fld-{slug}.svg"
        p.write_text(svg(strokes, labels), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
