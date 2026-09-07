"""Bo net ve doodle dung chung cho ca ba loai hinh tren blog.

Ba noi dung dung chung mot ngon ngu, va do la ly do file nay ton tai:

  * featured media cua Work   (960x640, mau nen, mau in cung)
  * anh bia bai viet          (1200x630, mau in cung, vi no nam trong <img>
                               nen khong doc duoc bien CSS cua trang)
  * hinh trong long bai viet  (rong 640, mau lay tu `currentColor` nen tu doi
                               theo sang/toi cua trang)

Hai luat khong duoc pha:

  1. CHU NAM NGOAI BO LOC `rough`. Bo loc day diem anh di 2.4px cho net rung
     nhu ve tay, va chinh 2.4px do bien mot dong 13px thanh vet nhoe.
  2. MOI HINH TRONG BAI PHAI CO ID BO LOC RIENG. Nhieu SVG inline nam chung
     mot trang; hai cai cung dat id="rough" thi cai sau an theo dinh nghia cua
     cai dau, va mot ngay nao do doi mot hinh se lam hong mot hinh khac.
"""

import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 960, 640
M = 72
AW, AH = W - 2 * M, H - 2 * M

INK = "#004AEF"          # mau in cung, dung cho <img> doc lap
SW = 3.0
SANS = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"


def defs(fid="rough"):
    return f"""<defs>
  <filter id="{fid}" x="-20%" y="-20%" width="140%" height="140%">
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
                f'stroke="currentColor" stroke-opacity="{op:.2f}" '
                f'stroke-width="{sw or SW * 0.85}"/>')
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="currentColor" '
            f'fill-opacity="{op:.2f}"/>')


def seg(x0, y0, x1, y1, op=1.0, sw=None, dash=None, cap="round"):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<path d="M{x0:.1f},{y0:.1f} L{x1:.1f},{y1:.1f}" fill="none" '
            f'stroke="currentColor" stroke-opacity="{op:.2f}" '
            f'stroke-width="{sw or SW}" stroke-linecap="{cap}"{d}/>')


def rect(x, y, w, h, op=1.0, sw=None, fill=None, r=0, dash=None):
    f = f'fill="currentColor" fill-opacity="{fill}"' if fill else 'fill="none"'
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
            f'rx="{r}" {f} stroke="currentColor" stroke-opacity="{op:.2f}" '
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
            f'{x1:.1f},{y1:.1f}" fill="none" stroke="currentColor" '
            f'stroke-opacity="{op:.2f}" stroke-width="{sw or SW}" '
            f'stroke-linecap="butt"/>')


def ellipse(cx, cy, rx, ry, op=1.0, sw=None, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" '
            f'fill="none" stroke="currentColor" stroke-opacity="{op:.2f}" '
            f'stroke-width="{sw or SW}"{d}/>')


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
    return (f'<path d="{d}" fill="currentColor" fill-opacity="{op * 0.9:.2f}" '
            f'stroke="currentColor" stroke-opacity="{op:.2f}" '
            f'stroke-width="{sw or SW * 0.8}" stroke-linejoin="round"/>')


def check(cx, cy, s=5.4, op=0.85, sw=None):
    w = sw or SW * 0.9
    return (seg(cx - s, cy, cx - s * 0.2, cy + s * 0.72, op, w)
            + seg(cx - s * 0.2, cy + s * 0.72, cx + s, cy - s * 0.78, op, w))


def magnifier(cx, cy, r=10, op=0.85, sw=None):
    w = sw or SW
    return (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" '
            f'stroke="currentColor" stroke-opacity="{op:.2f}" stroke-width="{w}"/>'
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
        f'fill="none" stroke="currentColor" stroke-opacity="{op:.2f}" '
        f'stroke-width="{SW * .85}"/>',
        f'<path d="{peak}" fill="currentColor" fill-opacity="{op * .28:.2f}" '
        f'stroke="currentColor" stroke-opacity="{op:.2f}" stroke-width="{SW * .9}" '
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
            f'font-weight="{weight}" fill="currentColor" fill-opacity="{op:.2f}" '
            f'text-anchor="{anchor}" xml:space="preserve">{esc(s)}</text>')


def work_svg(strokes, labels="", w=W, h=H):
    """Featured media cua Work: khung co dinh, mau in cung, nen trang."""
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}" role="img" stroke-linejoin="round" '
        f'style="color:{INK}">'
        f'{defs("rough")}<rect width="{w}" height="{h}" fill="#FFFFFF"/>'
        f'<g filter="url(#rough)">{strokes}</g>{labels}</svg>'
    )


def cover_svg(strokes, labels="", w=1200, h=630):
    """Anh bia: cung luat nhu Work, chi khac kich thuoc. Nam trong <img> nen
    moi mau phai in cung — no khong doc duoc bien CSS cua trang."""
    return work_svg(strokes, labels, w, h)


def figure_file_svg(strokes, labels="", w=640, h=320):
    """Hinh roi, nam trong bai qua the <img> — nghia la no giu duoc chu thich
    tu alt, thu ma mot khoi ```render``` khong co.

    Vi la mot tai lieu doc lap, no khong doc duoc bien CSS cua trang. Nhung no
    CO the tu doc `prefers-color-scheme` cua chinh minh, nen o day dat mau bang
    mot khoi <style> va khong ve nen: hinh noi trong nen cua bai o ca hai che
    do, thay vi la mot mieng trang giua trang toi."""
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}" role="img" stroke-linejoin="round">'
        '<style>svg{color:#004AEF}'
        '@media (prefers-color-scheme:dark){svg{color:#8FB2FF}}</style>'
        f'{defs("rough")}<g filter="url(#rough)">{strokes}</g>{labels}</svg>'
    )


def article_svg(uid, strokes, labels="", w=640, h=320, maxw=None):
    """Hinh trong long bai viet.

    Khac hai ban tren o hai cho, va ca hai deu bat buoc:
      * mau lay tu `currentColor`, dat o the boc ngoai bang bien cua trang, nen
        hinh tu doi mau khi trang chuyen sang che do toi;
      * id cua bo loc mang `uid` rieng, vi mot bai co the co muoi lam hinh nam
        chung mot trang.
    """
    fid = f"rough-{uid}"
    return (
        f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" '
        f'style="max-width:{maxw or w}px;margin:0 auto;display:block;'
        'font-family:inherit;color:hsl(var(--md-sys-color-primary))" '
        f'stroke-linejoin="round">{defs(fid)}'
        f'<g filter="url(#{fid})">{strokes}</g>{labels}</svg>'
    )


# ------------------------------------------------------- khoi dung chung


def progress(x, y, w, pct, op=1.0):
    return (seg(x, y, x + w, y, 0.22, SW * 1.4)
            + seg(x, y, x + w * pct, y, op, SW * 1.4))


def cursor(x, y, label, agent=False):
    """Con tro tren canvas kem the ten."""
    d = (f"M{x},{y} L{x},{y + 19} L{x + 5.2},{y + 14.2} "
         f"L{x + 8.6},{y + 21} L{x + 12},{y + 19.4} L{x + 8.6},{y + 12.8} "
         f"L{x + 14.6},{y + 12.4} Z")
    wl = len(label) * 6.7 + (34 if agent else 22)
    b = [f'<path d="{d}" fill="currentColor" fill-opacity="0.95" stroke="currentColor" '
         f'stroke-opacity="0.95" stroke-width="{SW * 0.7}" '
         f'stroke-linejoin="round"/>',
         white(x + 14, y + 17, wl, 23, 6),
         rect(x + 14, y + 17, wl, 23, 0.5, SW * 0.9, fill="0.09", r=6)]
    if agent:
        b.append(spark(x + 27, y + 28.5, 6.2, 0.9, SW * 0.7))
    return "".join(b), text(x + (38 if agent else 25), y + 33, label, 11.5,
                            0.9, 500)


def caret_block(x, y, op=0.85):
    """Con tro khoi o cuoi dong dang chay ra."""
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="8" height="15" '
            f'fill="currentColor" fill-opacity="{op:.2f}"/>')


def chip(x, y, w, h, label, size=11, op=0.5, tone=0.7, mono_=False):
    return (rect(x, y, w, h, op, SW * 0.9, r=h / 2),
            text(x + w / 2, y + h / 2 + size * 0.36, label, size, tone,
                 anchor="middle", mono=mono_))


def agent_panel(x, y, w, h, name, thought, tool, meta, lines, foot=None,
                tool2=None):
    """Mot cau tra loi cua model, khong phai mot checklist: mot dong suy nghi,
    the goi cong cu co ten ham that, va van ban DANG chay ra voi con tro khoi
    dung giua chung mot cau."""
    b, t = [], []
    b.append(rect(x, y, w, h, 0.8, SW * 1.4, r=12, fill="0.028"))
    b.append(spark(x + 26, y + 32, 10, 0.95))
    t.append(text(x + 44, y + 37, name, 14, 0.92, 500))
    b.append(dot(x + w - 28, y + 32, 4.5, 0.8))
    b.append(seg(x, y + 54, x + w, y + 54, 0.24, SW * 0.9))
    t.append(text(x + 24, y + 80, thought, 11.5, 0.4))

    ty = y + 94
    for i, (tl, mt) in enumerate([(tool, meta)] + ([tool2] if tool2 else [])):
        cy = ty + i * 66
        b.append(rect(x + 20, cy, w - 40, 54, 0.38, SW * 0.95, r=8))
        b.append(seg(x + 34, cy + 14, x + 40, cy + 20, 0.55, SW * 0.85))
        b.append(seg(x + 40, cy + 20, x + 34, cy + 26, 0.55, SW * 0.85))
        b.append(seg(x + 44, cy + 26, x + 51, cy + 26, 0.55, SW * 0.85))
        t.append(text(x + 58, cy + 24, tl, 11, 0.7, mono=True))
        t.append(text(x + 34, cy + 42, mt, 10.5, 0.4))

    ly = ty + (66 * (2 if tool2 else 1)) + 16
    for i, line in enumerate(lines):
        t.append(text(x + 24, ly + i * 21, line, 12.5, 0.72))
    b.append(caret_block(x + 26 + len(lines[-1]) * 6.35,
                         ly + (len(lines) - 1) * 21 - 11))
    if foot:
        t.append(text(x + 24, y + h - 22, foot, 11, 0.36))
    return "".join(b), "".join(t), ty + 27


def hashf(i, k):
    """So gia ngau nhien nhung tat dinh: chay lai phai ra dung mot buc anh."""
    return (math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1.0


def filechip(x, y, w, label, op=0.5):
    b = [rect(x, y, w, 28, op, SW * 0.95, r=8),
         rect(x + 12, y + 7, 14, 14, op + 0.15, SW * 0.85, r=2)]
    for i in (1, 2):
        b.append(seg(x + 12, y + 7 + i * 4.6, x + 26, y + 7 + i * 4.6,
                     op * 0.7, SW * 0.6))
    b.append(seg(x + 16.6, y + 7, x + 16.6, y + 21, op * 0.7, SW * 0.6))
    return "".join(b), text(x + 34, y + 19, label, 11, 0.6, mono=True)


def mark(kind, x, y, s=10, op=0.9):
    """Dau hieu rieng cho tung giai phap. Mot cot bieu tuong giong het nhau thi
    khong con la mot thu vien, chi la mot danh sach."""
    if kind == "cluster":
        b = [ellipse(x, y, s, s * 0.82, op * 0.5, SW * 0.8, dash="4 4")]
        for dx, dy in ((-3.5, -2), (3, -3), (0.5, 3.5)):
            b.append(dot(x + dx, y + dy, 2.6, op))
        return "".join(b)
    if kind == "pen":
        return (seg(x - s * 0.7, y + s * 0.7, x + s * 0.5, y - s * 0.7, op, SW)
                + seg(x + s * 0.5, y - s * 0.7, x + s * 0.8, y - s * 0.2, op, SW)
                + seg(x - s * 0.7, y + s * 0.7, x - s * 0.2, y + s * 0.55, op,
                      SW * 0.8))
    if kind == "tag":
        return (f'<path d="M{x},{y - s} L{x + s},{y} L{x},{y + s} '
                f'L{x - s},{y} Z" fill="none" stroke="currentColor" '
                f'stroke-opacity="{op:.2f}" stroke-width="{SW * 0.9}" '
                f'stroke-linejoin="round"/>' + dot(x, y, 2.6, op))
    if kind == "link":
        return (arc(x - s * 0.35, y, s * 0.62, 40, 320, op, SW * 0.9)
                + arc(x + s * 0.35, y, s * 0.62, 220, 500, op, SW * 0.9))
    if kind == "deck":
        return (rect(x - s * 0.4, y - s * 0.85, s * 1.3, s * 1.5, op * 0.45,
                     SW * 0.8, r=2)
                + rect(x - s, y - s * 0.55, s * 1.3, s * 1.5, op, SW * 0.9, r=2))
    # "flow"
    return (seg(x - s * 0.8, y + s * 0.5, x, y - s * 0.6, op * 0.7, SW * 0.8)
            + seg(x, y - s * 0.6, x + s * 0.8, y + s * 0.5, op * 0.7, SW * 0.8)
            + dot(x - s * 0.8, y + s * 0.5, 2.8, op) + dot(x, y - s * 0.6, 2.8, op)
            + dot(x + s * 0.8, y + s * 0.5, 2.8, op))
