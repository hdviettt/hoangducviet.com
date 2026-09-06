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


def arrow(x0, x1, y, op=0.5, sw=None):
    w = sw or SW * 0.9
    h = 8.5
    return (seg(x0, y, x1, y, op, w)
            + seg(x1 - h, y - h * 0.66, x1, y, op, w)
            + seg(x1 - h, y + h * 0.66, x1, y, op, w))


def spark(cx, cy, s=11, op=0.95, sw=None):
    """Ngoi sao bon canh — dau hieu cua model. Chi xuat hien o dung hai cho
    trong ca bo: cau tra loi AI, va buoc duy nhat co model trong duong ong."""
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
    """Khung anh: mat troi va mot dinh nui kin. Hai dinh de mo thi doc ra
    thanh bieu do duong — dung hinh, sai nghia."""
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


def svg(body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" stroke-linejoin="round">'
        f'{defs()}<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
        f'<g filter="url(#rough)">{body}</g></svg>'
    )


# ------------------------------------------------------------------- canh


def search():
    """Trang ket qua that, ve dung thu nguoi dung nhin thay: o tim kiem voi
    cau da go, cau tra loi AI co trich nguon nam tren, roi cac ket qua ben
    duoi. Ban truoc ve ma tran thua cua chi muc — dung ve nguyen ly, nhung
    khong ai nhin vao ma doan ra day la mot cong cu tim kiem."""
    b = []
    # o tim kiem, keo het chieu ngang
    b.append(rect(M, M, AW, 50, 0.95, SW * 1.4, r=25))
    b.append(magnifier(M + 34, M + 25, 10, 0.8))
    qx = M + 64
    b.append(seg(qx, M + 25, qx + AW * 0.40, M + 25, 0.8, SW * 1.7))
    b.append(seg(qx + AW * 0.40 + 12, M + 12, qx + AW * 0.40 + 12, M + 38,
                 0.5, SW * 1.2))

    # cau tra loi AI: khoi duy nhat co nen, va ngoi sao la dau hieu
    py, ph = M + 72, 122
    b.append(rect(M, py, AW, ph, 0.9, SW * 1.3, fill="0.045", r=16))
    b.append(spark(M + 32, py + 30, 11, 0.95))
    for i, (a, z) in enumerate(((0.075, 0.70), (0.030, 0.95), (0.030, 0.78))):
        b.append(seg(M + AW * a, py + 30 + i * 23, M + AW * z, py + 30 + i * 23,
                     0.42, SW))
    # nguon trich: cau tra loi dat tren chinh chi muc ben duoi
    for i in range(3):
        b.append(rect(M + 26 + i * 64, py + ph - 36, 54, 21, 0.7, SW * 0.95,
                      r=10))

    # ket qua: cham favicon, dong dia chi, tieu de dam, hai dong trich
    for k, (uw, tw, s1, s2) in enumerate(((0.15, 0.58, 0.93, 0.74),
                                          (0.11, 0.46, 0.86, 0.0))):
        y = M + 220 + k * 98
        b.append(dot(M + 9, y, 6.5, 0.5, hollow=True))
        b.append(seg(M + 24, y, M + 24 + AW * uw, y, 0.45, SW * 0.9))
        b.append(seg(M, y + 25, M + AW * tw, y + 25, 1.0, SW * 2.1))
        b.append(seg(M, y + 49, M + AW * s1, y + 49, 0.32, SW * 0.95))
        if s2:
            b.append(seg(M, y + 69, M + AW * s2, y + 69, 0.32, SW * 0.95))
    return "".join(b)

def keywords():
    """Dau vao va dau ra that: mot danh sach tu khoa tho ben trai, ben phai la
    cac nhom da duoc dat ten. Hai dong khong vao nhom nao ve bang net dut —
    do la nhung tu HDBSCAN tu choi xep, khong phai loi ve.

    Ban truoc ve dam diem truoc va sau khi nen chieu: dung ve co che, nhung
    khong noi duoc dau vao la tu khoa va dau ra la mot ban do noi dung."""
    b = []
    lw = 210
    b.append(rect(M, M + 4, lw, AH - 8, 0.55, SW * 1.2, r=6))
    widths = (0.86, 0.62, 0.94, 0.70, 0.52, 0.88, 0.66, 0.78, 0.58, 0.90,
              0.72, 0.64, 0.84, 0.56, 0.76)
    for i, f in enumerate(widths):
        y = M + 34 + i * 22
        op = max(0.13, 0.44 - 0.019 * i)
        b.append(dot(M + 20, y, 3.4, op))
        b.append(seg(M + 32, y, M + 32 + (lw - 56) * f, y, op, SW * 0.9))
    b.append(arrow(M + lw + 16, M + lw + 58, M + AH / 2, 0.45))

    gx = M + lw + 76
    gw = M + AW - gx
    rows = (0.72, 0.92, 0.56, 0.84)
    for k, (oy, chh, n, frac) in enumerate(
        ((0, 122, 4, 1.0), (140, 122, 4, 1.0), (280, 92, 2, 0.56))
    ):
        y = M + oy
        w_ = gw * frac
        b.append(rect(gx, y, w_, chh, 0.9, SW * 1.4, r=8))
        b.append(seg(gx + 22, y + 28, gx + 22 + w_ * 0.40, y + 28, 1.0,
                     SW * 2.1))
        for j in range(n):
            yy = y + 58 + j * 20
            b.append(dot(gx + 24, yy, 3.4, 0.35))
            b.append(seg(gx + 36, yy, gx + 36 + (w_ - 90) * rows[j], yy, 0.32,
                         SW * 0.9))

    # hai tu khoa khong nhom nao nhan
    ux = gx + gw * 0.62
    for j in range(2):
        yy = M + 282 + j * 48
        b.append(rect(ux, yy, gw * 0.36, 32, 0.5, SW * 0.95, r=6, dash="6 6"))
        b.append(seg(ux + 18, yy + 16, ux + 18 + gw * 0.20, yy + 16, 0.32,
                     SW * 0.9))
    return "".join(b)

def publishing():
    """Duong ong that, doc tu trai sang phai: ban thao trong Google Docs, cac
    buoc kiem o giua, va o cuoi la bai da nam tren trang. Dung mot buoc co
    model — ve bang ngoi sao, khung net dut; sau buoc do la code chay het.

    Ban truoc ve so lan goi model theo thoi gian: mot xung roi bang khong mai
    mai. Dung ve luan diem, nhung noi "duong ong xuat ban" ma ve mot duong
    thang thi khong ai doan ra."""
    b = []
    mid = M + AH / 2

    # 1. ban thao
    dw, dh = 104, 142
    dy = mid - dh / 2
    b.append(rect(M, dy, dw, dh, 0.5, SW))
    b.append(seg(M + dw - 24, dy, M + dw, dy + 24, 0.5, SW * 0.9))
    for i, f in enumerate((0.64, 0.80, 0.70, 0.82, 0.54)):
        b.append(seg(M + 15, dy + 48 + i * 18, M + 15 + (dw - 30) * f,
                     dy + 48 + i * 18, 0.30, SW * 0.85))
    b.append(arrow(M + dw + 14, M + dw + 54, mid, 0.45))

    # 2. cac buoc kiem; buoc thu hai la buoc duy nhat co model
    sx, scol = M + dw + 68, 132
    rows, rh, gap = 6, 16, 12
    top = mid - (rows * rh + (rows - 1) * gap) / 2
    for i in range(rows):
        y = top + i * (rh + gap)
        op = 0.75 - 0.055 * i
        if i == 1:
            b.append(spark(sx + rh / 2, y + rh / 2, 10.5, 1.0, SW * 0.85))
            op = 1.0
        else:
            b.append(rect(sx, y, rh, rh, op, SW * 0.95, r=3))
            b.append(check(sx + rh / 2, y + rh / 2, 5, op))
        b.append(seg(sx + rh + 13, y + rh / 2, sx + scol, y + rh / 2,
                     op * 0.5, SW * 0.9))
    b.append(arrow(sx + scol + 16, sx + scol + 56, mid, 0.45))

    # 3. bai viet da len trang — vat chinh: to nhat, dam nhat
    ax = sx + scol + 78
    aw = M + AW - ax
    ay, ah = M + 4, AH - 8
    ix, iw = ax + 26, aw - 52
    b.append(rect(ax, ay, aw, ah, 1.0, SW * 1.9, r=8))
    b.append(seg(ax, ay + 42, ax + aw, ay + 42, 0.45, SW))
    for i in range(3):
        b.append(dot(ax + 22 + i * 17, ay + 21, 4.5, 0.4))
    b.append(rect(ax + 82, ay + 11, aw * 0.54, 20, 0.3, SW * 0.9, r=10))
    b.append(seg(ix, ay + 78, ix + iw * 0.88, ay + 78, 1.0, SW * 2.6))
    b.append(seg(ix, ay + 106, ix + iw * 0.56, ay + 106, 1.0, SW * 2.6))
    b.append(seg(ix, ay + 132, ix + iw * 0.40, ay + 132, 0.34, SW * 0.9))
    b.append(picture(ix, ay + 150, iw, 64, 0.45))
    b.append(seg(ix, ay + 244, ix + iw * 0.44, ay + 244, 0.9, SW * 1.9))
    for i, f in enumerate((0.98, 0.90)):
        b.append(seg(ix, ay + 266 + i * 18, ix + iw * f, ay + 266 + i * 18,
                     0.30, SW * 0.9))
    b.append(seg(ix, ay + 312, ix + iw * 0.32, ay + 312, 0.9, SW * 1.9))
    b.append(seg(ix, ay + 334, ix + iw * 0.94, ay + 334, 0.30, SW * 0.9))
    return "".join(b)

def content():
    """Cai nguoi dung thuc su nhin thay: bai dang duoc viet ra. Con tro nhap
    nhay o cuoi dong cuoi, cot dau tich o le phai — checklist chay ngay trong
    luc viet — va mot the goi y cua model neo vao cau no vua cham toi.

    Ban truoc ve bon kien truc va phan checklist moi ban giu duoc: dung ve
    lich su cua du an, nhung khong noi duoc day la mot cong cu viet."""
    b = []
    px, pw = M, 520
    py, ph = M, AH
    ix, iw = px + 30, pw - 60
    b.append(rect(px, py, pw, ph, 1.0, SW * 1.9, r=6))
    b.append(seg(ix, py + 52, ix + iw * 0.92, py + 52, 1.0, SW * 2.6))
    b.append(seg(ix, py + 80, ix + iw * 0.55, py + 80, 1.0, SW * 2.6))
    b.append(seg(ix, py + 108, ix + iw * 0.34, py + 108, 0.3, SW * 0.9))
    b.append(seg(ix, py + 146, ix + iw * 0.42, py + 146, 0.9, SW * 1.9))
    for i, f in enumerate((0.98, 0.92, 0.72)):
        b.append(seg(ix, py + 174 + i * 20, ix + iw * f, py + 174 + i * 20,
                     0.3, SW * 0.9))
    b.append(seg(ix, py + 254, ix + iw * 0.34, py + 254, 0.9, SW * 1.9))
    for i, f in enumerate((0.96, 0.88)):
        b.append(seg(ix, py + 282 + i * 20, ix + iw * f, py + 282 + i * 20,
                     0.3, SW * 0.9))
    # dong dang go do, va con tro dung o cuoi no
    cy = py + 322
    b.append(seg(ix, cy, ix + iw * 0.46, cy, 0.55, SW * 1.1))
    b.append(seg(ix + iw * 0.46 + 12, cy - 13, ix + iw * 0.46 + 12, cy + 13,
                 1.0, SW * 1.6))
    # cot dau tich o le phai cua trang
    for yy in (146, 174, 254, 282):
        b.append(check(px + pw - 20, py + yy, 5, 0.45))

    # the goi y cua model, neo vao cau no vua cham toi
    anchor_x, anchor_y = ix + iw * 0.92, py + 174
    b.append(dot(anchor_x, anchor_y, 5.0, 0.85, hollow=True))
    cx0, cw, chh, cy0 = px + pw - 34, 330, 104, py + 30
    b.append(f'<rect x="{cx0:.1f}" y="{cy0:.1f}" width="{cw}" height="{chh}" '
             f'rx="12" fill="#FFFFFF"/>')
    b.append(rect(cx0, cy0, cw, chh, 0.9, SW * 1.4, fill="0.045", r=12))
    b.append(spark(cx0 + 30, cy0 + 34, 11, 0.95))
    for i, (a, z) in enumerate(((0.165, 0.88), (0.07, 0.72))):
        b.append(seg(cx0 + cw * a, cy0 + 34 + i * 24, cx0 + cw * z,
                     cy0 + 34 + i * 24, 0.4, SW * 0.95))
    b.append(seg(cx0 + 4, cy0 + chh, anchor_x + 6, anchor_y - 6, 0.5,
                 SW * 0.85, dash="6 7"))
    return "".join(b)

def quoting():
    """Ban bao gia that: dau de, bang cac dong muc voi cot so canh phai, mot
    duong ke doi, va dong tong o duoi cung — net dam nhat trong ca hinh, vi do
    la dong nguoi nhan mo ra de xem.

    Ban truoc ve luoi ba nhan ba voi hai o bi nhot: dung y "model bi khoa
    trong hai buoc", nhung khong ai doc ra la mot ban bao gia."""
    b = []
    px, pw = M + 60, AW - 120
    ix = px + 34
    b.append(rect(px, M, pw, AH, 1.0, SW * 1.9, r=6))
    b.append(seg(ix, M + 48, ix + pw * 0.34, M + 48, 1.0, SW * 2.6))
    b.append(seg(ix, M + 76, ix + pw * 0.20, M + 76, 0.3, SW * 0.9))
    b.append(rect(px + pw - 102, M + 32, 68, 46, 0.32, SW * 0.95, r=6))
    b.append(seg(px, M + 106, px + pw, M + 106, 0.4, SW))
    for a, z in ((0.06, 0.22), (0.53, 0.62), (0.80, 0.90)):
        b.append(seg(px + pw * a, M + 130, px + pw * z, M + 130, 0.3,
                     SW * 0.85))
    for i, (lf, m1, m2) in enumerate(((0.34, 0.07, 0.10),
                                      (0.26, 0.05, 0.08),
                                      (0.40, 0.08, 0.11),
                                      (0.30, 0.06, 0.09),
                                      (0.36, 0.07, 0.12))):
        y = M + 156 + i * 30
        b.append(seg(px + pw * 0.06, y, px + pw * (0.06 + lf), y, 0.4,
                     SW * 0.95))
        b.append(seg(px + pw * (0.62 - m1), y, px + pw * 0.62, y, 0.34,
                     SW * 0.95))
        b.append(seg(px + pw * (0.90 - m2), y, px + pw * 0.90, y, 0.55,
                     SW * 1.1))
    # ke doi: hai net cach nhau du xa de bo loc rough khong dinh chung lai
    b.append(seg(px + pw * 0.52, M + 300, px + pw * 0.94, M + 300, 0.45,
                 SW * 0.9))
    b.append(seg(px + pw * 0.52, M + 310, px + pw * 0.94, M + 310, 0.45,
                 SW * 0.9))
    b.append(seg(px + pw * 0.52, M + 340, px + pw * 0.66, M + 340, 0.9,
                 SW * 1.9))
    b.append(seg(px + pw * 0.72, M + 340, px + pw * 0.90, M + 340, 1.0,
                 SW * 3.4))
    return "".join(b)

def platform():
    """Nen tang that la mot ung dung: cot trai la danh muc cac giai phap dang
    chay tren no — dai, mo dan xuong duoi vi con nua — va ben phai la mot giai
    phap dang mo, voi mot the goi cong cu.

    Ban truoc ve muoi chin vach tren mot duong lien: dung y "nhieu thu tren
    mot nen khong bi ngat", nhung khong ai nhin vao ma doan ra day la mot san
    pham co nguoi dung."""
    b = []
    x0, y0, w, h = M, M, AW, AH
    b.append(rect(x0, y0, w, h, 1.0, SW * 1.9, r=10))
    b.append(seg(x0, y0 + 44, x0 + w, y0 + 44, 0.45, SW))
    for i in range(3):
        b.append(dot(x0 + 24 + i * 17, y0 + 22, 4.5, 0.4))
    b.append(rect(x0 + 86, y0 + 12, w * 0.30, 20, 0.28, SW * 0.9, r=10))

    # cot trai: danh muc giai phap. Mot dong dang mo, ve tren mot nen mo.
    rail = 214
    b.append(seg(x0 + rail, y0 + 44, x0 + rail, y0 + h, 0.45, SW))
    b.append(rect(x0 + 22, y0 + 62, rail - 44, 26, 0.32, SW * 0.9, r=13))
    widths = (0.90, 0.68, 0.84, 0.58, 0.80, 0.66, 0.92, 0.54, 0.74)
    for i, f in enumerate(widths):
        y = y0 + 118 + i * 27
        op = 0.72 - 0.062 * i
        if i == 2:
            b.append(rect(x0 + 16, y - 10, rail - 32, 26, 0.0, SW,
                          fill="0.10", r=8))
            op = 1.0
        b.append(rect(x0 + 26, y - 6, 13, 13, op, SW * 0.9, r=3))
        b.append(seg(x0 + 50, y, x0 + 50 + (rail - 96) * f, y, op * 0.8,
                     SW * 0.9))

    # ben phai: giai phap dang chay
    mx = x0 + rail
    mw = w - rail
    b.append(seg(mx + 34, y0 + 84, mx + 34 + mw * 0.42, y0 + 84, 1.0, SW * 2.4))
    bw = mw * 0.44
    bx = x0 + w - 34 - bw
    b.append(rect(bx, y0 + 112, bw, 52, 0.5, SW, fill="0.05", r=12))
    for i, f in enumerate((0.80, 0.52)):
        b.append(seg(bx + 18, y0 + 132 + i * 18, bx + 18 + (bw - 36) * f,
                     y0 + 132 + i * 18, 0.34, SW * 0.85))
    b.append(spark(mx + 46, y0 + 202, 10.5, 0.95, SW * 0.85))
    for i, (a, z) in enumerate(((0.115, 0.80), (0.05, 0.94), (0.05, 0.66))):
        b.append(seg(mx + mw * a, y0 + 202 + i * 22, mx + mw * z,
                     y0 + 202 + i * 22, 0.4, SW * 0.95))
    b.append(rect(mx + 34, y0 + 278, mw * 0.64, 66, 0.6, SW, r=8))
    b.append(rect(mx + 52, y0 + 296, 14, 14, 0.6, SW * 0.9, r=3))
    b.append(seg(mx + 76, y0 + 303, mx + 76 + mw * 0.30, y0 + 303, 0.34,
                 SW * 0.85))
    b.append(seg(mx + 52, y0 + 326, mx + 52 + mw * 0.46, y0 + 326, 0.26,
                 SW * 0.85))
    return "".join(b)

def presentation():
    """Ket qua that la mot bo slide: ban brief va may file du lieu ben trai,
    slide dang mo ben phai — tieu de, cac y, mot bieu do cot — va dai thumbnail
    cua ca bo o duoi.

    Ban truoc ve slide bao quanh boi muoi sau phep do: dung y "linter la quan
    toa duy nhat", nhung phai doc chu thich moi hieu, va nhin xa thi chi con
    mot khung chu nhat."""
    b = []
    dw, dh = 98, 156
    dy = M + 100
    # phia sau la mot bang du lieu, khong phai ban sao cua brief: hai to giong
    # het nhau chi doc ra la "mot to bi ve hai lan"
    b.append(rect(M + 20, dy - 16, dw, dh, 0.3, SW * 0.9))
    for i in range(4):
        b.append(seg(M + 32, dy + 12 + i * 30, M + 20 + dw - 12,
                     dy + 12 + i * 30, 0.22, SW * 0.8))
    for i in range(2):
        b.append(seg(M + 52 + i * 30, dy - 16, M + 52 + i * 30, dy - 16 + dh,
                     0.22, SW * 0.8))
    b.append(rect(M, dy, dw, dh, 0.6, SW, fill="0.03"))
    b.append(seg(M + dw - 22, dy, M + dw, dy + 22, 0.5, SW * 0.9))
    for i, f in enumerate((0.70, 0.88, 0.62, 0.80)):
        b.append(seg(M + 14, dy + 48 + i * 18, M + 14 + (dw - 28) * f,
                     dy + 48 + i * 18, 0.3, SW * 0.85))
    b.append(arrow(M + dw + 32, M + dw + 76, dy + dh / 2, 0.45))

    # slide dang mo
    sx = M + 192
    sw_ = M + AW - sx
    sy, sh = M + 4, 250
    b.append(rect(sx, sy, sw_, sh, 1.0, SW * 1.9, r=6))
    b.append(seg(sx + 32, sy + 48, sx + sw_ * 0.50, sy + 48, 1.0, SW * 2.6))
    b.append(seg(sx + 32, sy + 76, sx + sw_ * 0.34, sy + 76, 0.32, SW))
    for i, f in enumerate((0.40, 0.34, 0.44)):
        yy = sy + 120 + i * 26
        b.append(dot(sx + 40, yy, 4.5, 0.5))
        b.append(seg(sx + 56, yy, sx + 56 + sw_ * f, yy, 0.34, SW * 0.95))
    base = sy + sh - 36
    for i, v in enumerate((0.40, 0.72, 0.52, 0.92)):
        bh = (sh - 132) * v
        b.append(rect(sx + sw_ * 0.60 + i * (sw_ * 0.095), base - bh,
                      sw_ * 0.062, bh, 0.7, SW * 0.95, fill="0.14"))
    b.append(seg(sx + sw_ * 0.56, base, sx + sw_ - 28, base, 0.45, SW * 0.9))

    # dai thumbnail: ca bo, slide dang mo la cai dau tien
    tw, gap = 132, 24
    ty, th = M + 276, 62
    for i in range(4):
        tx = sx + i * (tw + gap)
        op = 1.0 if i == 0 else 0.42 - 0.06 * i
        b.append(rect(tx, ty, tw, th, op, SW * (1.4 if i == 0 else 1.0), r=4))
        b.append(seg(tx + 14, ty + 20, tx + 14 + (tw - 28) * 0.72, ty + 20,
                     op * 0.5, SW * 0.85))
        b.append(seg(tx + 14, ty + 38, tx + 14 + (tw - 28) * 0.46, ty + 38,
                     op * 0.4, SW * 0.85))
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
