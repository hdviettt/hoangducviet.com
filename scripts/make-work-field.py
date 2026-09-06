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


def ellipse(cx, cy, rx, ry, op=1.0, sw=None, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" '
            f'fill="none" stroke="{INK}" stroke-opacity="{op:.2f}" '
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


# ------------------------------------------------------- khoi dung chung


def progress(x, y, w, pct, op=1.0):
    """Thanh tien do."""
    return (seg(x, y, x + w, y, 0.22, SW * 1.4)
            + seg(x, y, x + w * pct, y, op, SW * 1.4))


def cursor(x, y, label, agent=False):
    """Con tro tren canvas kem the ten. Day la cach duy nhat mot buc tinh noi
    duoc rang o day co hai ben cung lam: mot nguoi va mot agent."""
    d = (f"M{x},{y} L{x},{y + 19} L{x + 5.2},{y + 14.2} "
         f"L{x + 8.6},{y + 21} L{x + 12},{y + 19.4} L{x + 8.6},{y + 12.8} "
         f"L{x + 14.6},{y + 12.4} Z")
    wl = len(label) * 6.7 + (34 if agent else 22)
    b = [f'<path d="{d}" fill="{INK}" fill-opacity="0.95" stroke="{INK}" '
         f'stroke-opacity="0.95" stroke-width="{SW * 0.7}" '
         f'stroke-linejoin="round"/>',
         white(x + 14, y + 17, wl, 23, 6),
         rect(x + 14, y + 17, wl, 23, 0.5, SW * 0.9, fill="0.09", r=6)]
    if agent:
        b.append(spark(x + 27, y + 28.5, 6.2, 0.9, SW * 0.7))
    tx = x + (38 if agent else 25)
    return "".join(b), text(tx, y + 33, label, 11.5, 0.9, 500)


def caret_block(x, y, op=0.85):
    """Con tro khoi o cuoi dong dang chay ra. Mot danh sach dau tich thi tinh;
    mot doan van dang go do voi con tro nhap nhay o cuoi thi dang chay."""
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="8" height="15" '
            f'fill="{INK}" fill-opacity="{op:.2f}"/>')


def agent_panel(x, y, w, h, name, thought, tool, meta, lines, foot=None):
    """Mot cau tra loi cua model, khong phai mot checklist.

    Cai lam nguoi xem doc ra "day la model" khong phai la mot cot dau tich —
    checklist thi phan mem nao cung co. Ma la ba thu: mot dong suy nghi, mot
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
    b.append(rect(x + 20, ty, w - 40, 54, 0.38, SW * 0.95, r=8))
    b.append(seg(x + 34, ty + 14, x + 40, ty + 20, 0.55, SW * 0.85))
    b.append(seg(x + 40, ty + 20, x + 34, ty + 26, 0.55, SW * 0.85))
    b.append(seg(x + 44, ty + 26, x + 51, ty + 26, 0.55, SW * 0.85))
    t.append(text(x + 58, ty + 24, tool, 11, 0.7, mono=True))
    t.append(text(x + 34, ty + 42, meta, 10.5, 0.4))

    ly = ty + 82
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
    """The file dinh kem, co luoi o nho ben trong bieu tuong — mot bang tinh."""
    b = [rect(x, y, w, 28, op, SW * 0.95, r=8),
         rect(x + 12, y + 7, 14, 14, op + 0.15, SW * 0.85, r=2)]
    for i in (1, 2):
        b.append(seg(x + 12, y + 7 + i * 4.6, x + 26, y + 7 + i * 4.6,
                     op * 0.7, SW * 0.6))
    b.append(seg(x + 16.6, y + 7, x + 16.6, y + 21, op * 0.7, SW * 0.6))
    return "".join(b), text(x + 34, y + 19, label, 11, 0.6, mono=True)


# ------------------------------------------------------------------- canh


def platform():
    """Tinh nen tang khong nam o cho "co nhieu cong cu", ma o cho NGUOI VA
    AGENT LAM CHUNG MOT CHO. Nen day la mot canvas cong viec, va tren mat
    canvas co hai con tro — mot cua nguoi, mot cua agent — dang sua hai dong
    khac nhau."""
    b, t = [], []
    x0, y0, w, h = M, 72, AW, AH
    b.append(rect(x0, y0, w, h, 1.0, SW * 1.9, r=10))
    b.append(seg(x0, y0 + 44, x0 + w, y0 + 44, 0.42, SW))
    for i in range(3):
        b.append(dot(x0 + 24 + i * 17, y0 + 22, 4.5, 0.4))
    t.append(text(x0 + 92, y0 + 27, "Workspace · SEO production", 13.5, 0.45))
    for i in range(4):
        cx = x0 + w - 96 + i * 24
        b.append(dot(cx, y0 + 22, 9, 0.5 if i < 3 else 0.9, hollow=True))
        if i == 3:
            b.append(spark(cx, y0 + 22, 5.4, 0.9, SW * 0.65))

    for cx, label in ((x0 + 52, "Task"), (x0 + 470, "Owner"),
                      (x0 + 646, "Status")):
        t.append(text(cx, y0 + 82, label, 11.5, 0.38))
    b.append(seg(x0, y0 + 96, x0 + w, y0 + 96, 0.22, SW * 0.9))

    rows = (
        ("Cluster 12,480 keywords", "Keyword agent", True, "done", None),
        ("Draft 12 outlines", "Content agent", True, "run", 0.58),
        ("Review the outlines", "Viet", False, "review", None),
        ("Price the Client X quote", "Quoting agent", True, "done", None),
        ("Publish 4 drafts", "Publishing agent", True, "queued", None),
        ("Approve the quote", "Mai", False, "wait", None),
    )
    for i, (task, owner, is_agent, state, pct) in enumerate(rows):
        y = y0 + 132 + i * 44
        strong = state == "run"
        b.append(rect(x0 + 44, y - 12, 15, 15, 0.9 if strong else 0.55,
                      SW * 0.9, r=3))
        if state == "done":
            b.append(check(x0 + 51.5, y - 4.5, 5, 0.8))
        t.append(text(x0 + 72, y, task, 14, 0.85 if strong else 0.6,
                      500 if strong else 400))
        if is_agent:
            b.append(spark(x0 + 478, y - 5, 6.2, 0.75, SW * 0.7))
        else:
            b.append(dot(x0 + 478, y - 5, 6.5, 0.45, hollow=True))
        t.append(text(x0 + 492, y, owner, 12.5, 0.5))
        if state == "run":
            b.append(progress(x0 + 646, y - 5, 108, pct))
            t.append(text(x0 + 764, y, "7 / 12", 12, 0.7, mono=True))
        elif state == "done":
            b.append(check(x0 + 652, y - 5, 5, 0.7))
            t.append(text(x0 + 668, y, "Done", 12.5, 0.45))
        else:
            label = {"review": "Needs review", "queued": "Queued",
                     "wait": "Waiting"}[state]
            b.append(rect(x0 + 646, y - 16, len(label) * 6.6 + 22, 22, 0.35,
                          SW * 0.9, r=11))
            t.append(text(x0 + 657, y, label, 12, 0.5))

    cb, ct = cursor(x0 + 318, y0 + 152, "Content agent", agent=True)
    b.append(cb)
    t.append(ct)
    cb, ct = cursor(x0 + 250, y0 + 208, "Viet")
    b.append(cb)
    t.append(ct)
    return "".join(b), "".join(t)


def search():
    """Trang ket qua that: cau tra loi AI keo het chieu ngang voi ba nguon
    trich, mot o chat nho ngay duoi no de hoi tiep, roi cac ket qua. Ban truoc
    tach AI Mode thanh mot cot rieng ben phai va bo cuc vo ra."""
    b, t = [], []
    b.append(rect(M, 64, AW, 48, 0.95, SW * 1.4, r=24))
    b.append(magnifier(M + 32, 88, 9.5, 0.8))
    t.append(text(M + 58, 95, "who won the 2022 world cup final", 18, 0.88))
    b.append(seg(M + 352, 76, M + 352, 100, 0.5, SW * 1.2))

    tx = M
    for name in ("All", "AI Mode", "Images", "News"):
        on = name == "AI Mode"
        t.append(text(tx, 140, name, 14, 1.0 if on else 0.4,
                      500 if on else 400))
        if on:
            b.append(seg(tx - 2, 152, tx + 64, 152, 1.0, SW * 1.1))
        tx += len(name) * 8.4 + 30

    b.append(rect(M, 168, AW, 104, 0.9, SW * 1.3, fill="0.045", r=16))
    b.append(spark(M + 30, 196, 11, 0.95))
    t.append(text(M + 56, 202,
                  "Argentina beat France 4–2 on penalties after a 3–3 draw",
                  15.5, 0.7))
    t.append(text(M + 30, 226,
                  "in Lusail. Messi scored twice; Mbappé took a hat-trick.",
                  15.5, 0.7))
    for i, (label, w_) in enumerate((("fifa.com", 82), ("espn.com", 86),
                                     ("wikipedia.org", 106))):
        cx = M + 28 + i * 104
        b.append(rect(cx, 240, w_, 24, 0.6, SW * 0.95, r=12))
        t.append(text(cx + w_ / 2, 257, label, 12.5, 0.7, anchor="middle"))

    # o chat nho ngay duoi cau tra loi: hoi tiep tren chinh cau tra loi do
    cw = 396
    b.append(rect(M, 288, cw, 34, 0.4, SW, r=17))
    t.append(text(M + 20, 310, "Ask a follow-up", 12.5, 0.4))
    b.append(dot(M + cw - 22, 305, 12, 0.0, hollow=False))
    b.append(seg(M + cw - 27, 305, M + cw - 17, 305, 1.0, SW * 0.9))
    b.append(seg(M + cw - 21, 301, M + cw - 17, 305, 1.0, SW * 0.9))
    b.append(seg(M + cw - 21, 309, M + cw - 17, 305, 1.0, SW * 0.9))

    for y, url, title, snips in (
        (352, "en.wikipedia.org › 2022 FIFA World Cup final",
         "2022 FIFA World Cup final",
         ("Argentina won their third title, and Messi his first.",)),
        (430, "fifa.com › tournaments › qatar-2022",
         "Final: Argentina 3–3 France (4–2 pens)", ()),
    ):
        b.append(dot(M + 9, y - 5, 7, 0.5, hollow=True))
        t.append(text(M + 26, y, url, 13, 0.5))
        t.append(text(M, y + 29, title, 20, 1.0, 500))
        for j, sn in enumerate(snips):
            t.append(text(M, y + 55 + j * 20, sn, 13.5, 0.45))
    return "".join(b), "".join(t)


def publishing():
    """Duong ong that, va o giua no la phan ky thuat: lay HTML tu ban /pub, roi
    MOT the goi model — anh xa cau truc cua CMS, chay dung mot lan cho moi site
    — roi ca chuoi kiem chay bang code."""
    b, t = [], []
    dw, dh = 106, 140
    dy = 196
    b.append(sheet(M, dy, dw, dh, 0.5))
    b.append(seg(M + 16, dy + 32, M + 16 + (dw - 40) * 0.8, dy + 32, 0.55,
                 SW * 1.3))
    for i, f in enumerate((0.86, 0.7, 0.9, 0.62)):
        b.append(seg(M + 16, dy + 58 + i * 17, M + 16 + (dw - 34) * f,
                     dy + 58 + i * 17, 0.28, SW * 0.85))
    t.append(text(M + dw / 2, dy + dh + 24, "Google Docs", 12.5, 0.5,
                  anchor="middle"))
    b.append(arrow(M + dw + 12, M + dw + 48, dy + dh / 2, 0.45))

    cx0, cw = M + 168, 250
    mid = cx0 + cw / 2
    b.append(rect(cx0, 92, cw, 38, 0.45, SW, r=8))
    t.append(text(cx0 + 18, 116, "GET /pub → HTML", 12.5, 0.6, mono=True))
    for y0_ in (130, 264):
        b.append(seg(mid, y0_, mid, y0_ + 22, 0.4, SW * 0.9))
        b.append(seg(mid - 5, y0_ + 15, mid, y0_ + 22, 0.4, SW * 0.9))
        b.append(seg(mid + 5, y0_ + 15, mid, y0_ + 22, 0.4, SW * 0.9))

    b.append(rect(cx0, 158, cw, 106, 0.95, SW * 1.7, fill="0.05", r=10))
    b.append(spark(cx0 + 24, 184, 10, 1.0))
    t.append(text(cx0 + 42, 189, "Map the CMS", 14.5, 0.95, 500))
    b.append(rect(cx0 + cw - 92, 172, 80, 22, 0.5, SW * 0.9, r=11))
    t.append(text(cx0 + cw - 52, 188, "once", 11.5, 0.6, anchor="middle"))
    for i, line in enumerate(("h2      → wp:heading",
                              "figure  → wp:image")):
        t.append(text(cx0 + 24, 218 + i * 22, line, 12, 0.55, mono=True))

    for i, label in enumerate(("title tag under 60", "exactly one H1",
                               "alt text on every image",
                               "three internal links")):
        y = 300 + i * 28
        b.append(rect(cx0 + 8, y, 16, 16, 0.6 - 0.05 * i, SW * 0.95, r=3))
        b.append(check(cx0 + 16, y + 8, 5, 0.6 - 0.05 * i))
        t.append(text(cx0 + 36, y + 13, label, 12.5, 0.5))
    t.append(text(mid, 438, "nine checks · zero model calls", 12, 0.42,
                  anchor="middle"))
    b.append(arrow(cx0 + cw + 12, cx0 + cw + 48, 270, 0.45))

    ax = cx0 + cw + 66
    aw = M + AW - ax
    ay, ah = 76, 388
    ix, iw = ax + 24, aw - 48
    b.append(rect(ax, ay, aw, ah, 1.0, SW * 1.9, r=8))
    b.append(seg(ax, ay + 42, ax + aw, ay + 42, 0.45, SW))
    for i in range(3):
        b.append(dot(ax + 20 + i * 16, ay + 21, 4.5, 0.4))
    b.append(rect(ax + 74, ay + 10, aw * 0.60, 22, 0.26, SW * 0.9, r=11))
    t.append(text(ax + 86, ay + 26, "clientx.io/blog/running-shoes", 11, 0.45))
    t.append(text(ix, ay + 86, "How to choose running", 20, 1.0, 500))
    t.append(text(ix, ay + 112, "shoes for flat feet", 20, 1.0, 500))
    t.append(text(ix, ay + 138, "12 min read · updated today", 11.5, 0.4))
    b.append(picture(ix, ay + 154, iw, 82, 0.45))
    t.append(text(ix, ay + 272, "What to look for", 16.5, 0.85, 500))
    for i, f in enumerate((0.98, 0.88)):
        b.append(seg(ix, ay + 294 + i * 18, ix + iw * f, ay + 294 + i * 18,
                     0.28, SW * 0.9))
    t.append(text(ix, ay + 344, "Arch support", 16.5, 0.85, 500))
    b.append(seg(ix, ay + 366, ix + iw * 0.94, ay + 366, 0.28, SW * 0.9))
    return "".join(b), "".join(t)


def content():
    """Bai dang duoc viet, va ben phai la cau tra loi cua model dang chay ra.
    Trong bai: muc agent dang viet co mot vach dam o le trai va nhan "writing",
    va mot the goi y AI noi len tren doan chu — the do la thu Viet muon giu."""
    b, t = [], []
    px, pw = M, 468
    py, ph = 72, AH
    ix, iw = px + 30, pw - 60
    b.append(rect(px, py, pw, ph, 1.0, SW * 1.9, r=6))
    t.append(text(ix, py + 46, "Running shoes for flat feet:", 20, 1.0, 500))
    t.append(text(ix, py + 72, "how to choose", 20, 1.0, 500))
    t.append(text(ix, py + 98, "Draft · 1,240 words · 9 H2s", 11.5, 0.4))
    t.append(text(ix, py + 134, "What to look for", 16, 0.85, 500))
    for i, f in enumerate((0.98, 0.9, 0.64)):
        b.append(seg(ix, py + 160 + i * 20, ix + iw * f, py + 160 + i * 20,
                     0.26, SW * 0.9))

    # muc agent dang viet: nen mo, mot vach dam o le trai, va mot nhan
    hy, hh = py + 236, 148
    b.append(rect(px + 10, hy, pw - 20, hh, 0.0, SW, fill="0.055", r=8))
    b.append(seg(px + 14, hy + 8, px + 14, hy + hh - 8, 0.95, SW * 2.2))
    b.append(spark(ix + 4, hy + 22, 7, 0.9, SW * 0.75))
    t.append(text(ix + 18, hy + 26, "writing", 11, 0.7, 500))
    t.append(text(ix, hy + 56, "Arch support", 16, 0.95, 500))
    for i, f in enumerate((0.94, 0.84)):
        b.append(seg(ix, hy + 82 + i * 20, ix + iw * f, hy + 82 + i * 20, 0.42,
                     SW * 0.95))
    b.append(seg(ix, hy + 122, ix + iw * 0.40, hy + 122, 0.5, SW * 1.1))
    b.append(caret_block(ix + iw * 0.40 + 8, hy + 113, 0.95))

    # the goi y AI, noi len tren doan chu va neo vao dung cau no sua
    anchor_x, anchor_y = ix + iw * 0.28, py + 202
    b.append(dot(anchor_x, anchor_y - 5, 5.0, 0.85, hollow=True))
    cx0, cw, chh, cy0 = px + 208, 250, 96, py + 118
    b.append(white(cx0, cy0, cw, chh, 12))
    b.append(rect(cx0, cy0, cw, chh, 0.95, SW * 1.4, fill="0.05", r=12))
    b.append(spark(cx0 + 22, cy0 + 26, 9, 0.95, SW * 0.8))
    t.append(text(cx0 + 38, cy0 + 30, "Suggested edit", 12, 0.85, 500))
    t.append(text(cx0 + 18, cy0 + 52, "Cut the hedge, name the test", 11.5,
                  0.6))
    b.append(rect(cx0 + 18, cy0 + 62, 56, 22, 0.55, SW * 0.9, r=11))
    t.append(text(cx0 + 46, cy0 + 78, "Apply", 11, 0.75, anchor="middle"))
    b.append(rect(cx0 + 82, cy0 + 62, 66, 22, 0.3, SW * 0.9, r=11))
    t.append(text(cx0 + 115, cy0 + 78, "Rewrite", 11, 0.5, anchor="middle"))
    b.append(seg(cx0 + 10, cy0 + chh, anchor_x + 8, anchor_y - 10, 0.4,
                 SW * 0.85, dash="6 7"))

    rx, rw = 568, M + AW - 568
    rb, rt, anchor = agent_panel(
        rx, py, rw, ph, "Content agent", "Thought for 3s",
        'links.search("arch support")', "12 candidates · 3 kept",
        ("Arch support is the section readers",
         "bounce on, so it opens with the test",
         "they can do at home"),
        foot="checklist: 11 of 12 passing")
    b.append(rb)
    t.append(rt)
    b.append(seg(rx, anchor + 96, px + pw - 10, hy + 70, 0.35, SW * 0.85,
                 dash="6 7"))
    return "".join(b), "".join(t)


def presentation():
    """Dau vao that la mot cau lenh, khong phai mot to giay: thanh chat o tren
    voi bo template da chon va hai file du lieu dinh kem. Ben duoi la bo slide
    dang duoc dung, va cau tra loi cua model dang chay ra ben phai."""
    b, t = [], []
    # bo chon template
    t.append(text(M, 88, "Template", 11.5, 0.4))
    b.append(rect(M + 62, 72, 152, 26, 0.55, SW * 0.95, r=13))
    t.append(text(M + 78, 90, "SEO Proposal", 12, 0.8, 500))
    b.append(seg(M + 190, 82, M + 195, 88, 0.6, SW * 0.9))
    b.append(seg(M + 195, 88, M + 200, 82, 0.6, SW * 0.9))

    # thanh chat: cau lenh that, hai file dinh kem, nut gui
    b.append(rect(M, 110, AW, 88, 0.9, SW * 1.4, r=16, fill="0.03"))
    t.append(text(M + 22, 142,
                  "Create an SEO proposal for Client X from the attached data "
                  "files", 15, 0.85))
    fb, ft = filechip(M + 22, 156, 150, "traffic-2026.xlsx")
    b.append(fb)
    t.append(ft)
    fb, ft = filechip(M + 184, 156, 138, "keywords-q3.csv")
    b.append(fb)
    t.append(ft)
    b.append(dot(M + AW - 40, 170, 15, 0.0))
    b.append(rect(M + AW - 55, 155, 30, 30, 0.7, SW, r=15))
    b.append(seg(M + AW - 40, 178, M + AW - 40, 162, 0.9, SW))
    b.append(seg(M + AW - 46, 168, M + AW - 40, 162, 0.9, SW))
    b.append(seg(M + AW - 34, 168, M + AW - 40, 162, 0.9, SW))

    # bo slide
    sx, sw_ = M, 486
    sy, sh = 224, 172
    b.append(rect(sx, sy, sw_, sh, 1.0, SW * 1.9, r=6))
    t.append(text(sx + 26, sy + 40, "Where the traffic will come from", 17,
                  1.0, 500))
    t.append(text(sx + 26, sy + 62, "Client X · organic, 12 months", 11.5,
                  0.42))
    for i, line in enumerate(("Ten pages already on page two",
                              "62% of revenue sits in them")):
        yy = sy + 96 + i * 22
        b.append(dot(sx + 34, yy - 5, 4, 0.5))
        t.append(text(sx + 46, yy, line, 12, 0.6))
    gx, gy, gw_, gh = sx + 250, sy + 64, 208, 92
    b.append(rect(gx, gy, gw_, gh, 0.85, SW * 1.1, r=6, dash="7 6"))
    for hx, hy in ((gx, gy), (gx + gw_, gy), (gx, gy + gh),
                   (gx + gw_, gy + gh)):
        b.append(rect(hx - 4.5, hy - 4.5, 9, 9, 0.95, SW * 0.9))
    base = gy + gh - 20
    for i, (v, mon) in enumerate(((0.38, "Q1"), (0.62, "Q2"), (0.94, "Q3"))):
        bh = 52 * v
        bx = gx + 34 + i * 50
        b.append(rect(bx, base - bh, 28, bh, 0.7, SW * 0.95, fill="0.14"))
        t.append(text(bx + 14, base + 14, mon, 10, 0.4, anchor="middle"))
    b.append(seg(gx + 18, base, gx + gw_ - 18, base, 0.4, SW * 0.9))
    t.append(text(gx, gy - 8, "drafting", 11, 0.75, 500))

    tw, gap = 114, 10
    ty, th = 410, 54
    for i in range(4):
        tx = sx + i * (tw + gap)
        on = i == 2
        b.append(rect(tx, ty, tw, th, 1.0 if on else 0.3, SW * (1.4 if on
                                                                else 1.0), r=4))
        b.append(seg(tx + 12, ty + 20, tx + 12 + (tw - 24) * 0.7, ty + 20,
                     0.5 if on else 0.2, SW * 0.9))
        b.append(seg(tx + 12, ty + 36, tx + 12 + (tw - 24) * 0.44, ty + 36,
                     0.4 if on else 0.16, SW * 0.85))
        t.append(text(tx + tw - 10, ty + th - 8, str(i + 1), 10.5,
                      0.6 if on else 0.28, anchor="end", mono=True))

    rx, rw = 590, M + AW - 590
    rb, rt, anchor = agent_panel(
        rx, 224, rw, 240, "Deck agent", "Thought for 5s",
        'sheets.read("traffic-2026")', "3 sheets · 14 months",
        ("Slide 3 carries the argument: the",
         "opportunity is the ten pages that",
         "already rank on page two"))
    b.append(rb)
    t.append(rt)
    b.append(seg(rx, anchor + 84, gx + gw_ + 6, gy + 30, 0.35, SW * 0.85,
                 dash="6 7"))
    return "".join(b), "".join(t)


def keywords():
    """Ba chang, va o chang giua la HINH THU CUA DU LIEU tai tung buoc: tu khoa
    thanh mot vector, vector nen xuong con hai chieu, hai chieu tu chum lai,
    chum duoc dat ten. Do la thu mot danh sach ten cong cu khong noi duoc."""
    b, t = [], []
    lw = 190
    b.append(rect(M, 76, lw, 388, 0.5, SW * 1.2, r=6))
    t.append(text(M + 16, 102, "12,480 keywords", 13, 0.7, 500))
    b.append(seg(M, 114, M + lw, 114, 0.28, SW * 0.9))
    raw = ("running shoes for men", "how to choose running shoes",
           "nike pegasus 40", "cheap running shoes", "running shoe size chart",
           "running shoes for women", "adidas ultraboost",
           "trail running shoes", "best running shoes 2026",
           "marathon racing shoes", "leather dress shoes", "high heels",
           "running shoes for kids")
    for i, kw in enumerate(raw):
        t.append(text(M + 14, 140 + i * 24, kw, 11.5,
                      max(0.15, 0.5 - 0.026 * i)))

    px, pw = M + 214, 164
    pmid = px + pw / 2
    for i, (label, tool) in enumerate((("embed", "voyage-3-large"),
                                       ("reduce", "UMAP"),
                                       ("cluster", "HDBSCAN"),
                                       ("name", "one cheap call"))):
        y = 88 + i * 96
        model = i == 3
        b.append(rect(px, y, pw, 76, 0.9 if model else 0.5,
                      SW * (1.6 if model else 1.1), r=8,
                      fill="0.05" if model else None))
        if model:
            b.append(spark(px + 20, y + 22, 8, 0.95, SW * 0.75))
            t.append(text(px + 34, y + 26, label, 13, 0.95, 500))
        else:
            t.append(text(px + 16, y + 26, label, 13, 0.75, 500))
        t.append(text(px + 16, y + 42, tool, 10, 0.42, mono=True))

        # hinh thu cua du lieu sau buoc nay
        gy = y + 54
        if i == 0:                                    # mot vector 14 chieu
            for k in range(14):
                b.append(rect(px + 16 + k * 9.4, gy, 7, 12, 0.0, SW,
                              fill=f"{0.14 + 0.62 * hashf(k, 3):.2f}"))
        elif i == 1:                                  # con hai chieu
            for k in range(2):
                b.append(rect(px + 16 + k * 22, gy, 18, 12, 0.0, SW,
                              fill=f"{0.3 + 0.4 * k:.2f}"))
            t.append(text(px + 66, gy + 11, "→ (x, y)", 10.5, 0.4, mono=True))
        elif i == 2:                                  # chum lai
            for k in range(9):
                b.append(dot(px + 22 + (k % 5) * 11 + (k // 5) * 62,
                             gy + 6 + (k // 5) * 2 + 5 * hashf(k, 7), 3.4,
                             0.75))
        else:                                         # co ten
            b.append(rect(px + 16, gy - 2, 116, 18, 0.6, SW * 0.9, r=9))
            t.append(text(px + 26, gy + 11, "buy running shoes", 10, 0.7))
        if i < 3:
            b.append(seg(pmid, y + 76, pmid, y + 92, 0.35, SW * 0.9))
            b.append(seg(pmid - 5, y + 85, pmid, y + 92, 0.35, SW * 0.9))
            b.append(seg(pmid + 5, y + 85, pmid, y + 92, 0.35, SW * 0.9))
    b.append(arrow(px + pw + 12, px + pw + 44, 270, 0.45))

    mx, my = px + pw + 62, 76
    mw, mh = M + AW - mx, 388
    for gi, (cx, cy, rx_, ry_, label, n) in enumerate((
            (0.26, 0.26, 0.19, 0.145, "buy running shoes", 15),
            (0.74, 0.28, 0.19, 0.145, "how to choose", 14),
            (0.48, 0.72, 0.22, 0.155, "by brand", 13))):
        ccx, ccy = mx + cx * mw, my + cy * mh
        b.append(ellipse(ccx, ccy, rx_ * mw, ry_ * mh, 0.45, SW * 0.9,
                         dash="8 8"))
        for i in range(n):
            a = hashf(i, gi) * 2 * math.pi
            r = 0.42 + 0.55 * hashf(i + 40, gi)
            b.append(dot(ccx + math.cos(a) * rx_ * mw * r,
                         ccy + math.sin(a) * ry_ * mh * r, 4.4, 0.85))
        t.append(text(ccx, ccy - ry_ * mh - 12, label, 12.5, 0.85, 500,
                      anchor="middle"))
    for ox, oy in ((0.06, 0.88), (0.17, 0.95), (0.93, 0.60)):
        b.append(dot(mx + ox * mw, my + oy * mh, 5.4, 0.7, hollow=True))
    t.append(text(mx + 0.02 * mw, my + 0.80 * mh, "3 outliers", 11.5, 0.45))
    return "".join(b), "".join(t)


def quoting():
    """Ban bao gia cua mot khach hang co ten, co dau, co ten mien; mot bang so
    tom tat o dau; cac hang muc chia thanh nhom va hang muc con; va nhom dang
    duoc dinh gia to nen, o tien la mot thanh tien do. Ben phai la cau tra loi
    cua model dang chay ra, khong phai mot cot dau tich."""
    b, t = [], []
    px, pw = M, 468
    b.append(rect(px, 72, pw, AH, 1.0, SW * 1.9, r=6))

    # dau: mot dau hieu tu ve, ten khach, ten mien
    lx, ly = px + 28, 92
    b.append(rect(lx, ly, 34, 34, 0.95, SW * 1.6, r=9))
    b.append(seg(lx + 8, ly + 26, lx + 26, ly + 8, 0.95, SW * 1.6))
    b.append(dot(lx + 25, ly + 25, 4.2, 0.95))
    t.append(text(lx + 46, ly + 16, "Client X", 19, 1.0, 500))
    t.append(text(lx + 46, ly + 32, "clientx.io", 11, 0.45, mono=True))
    t.append(text(px + pw - 28, ly + 16, "Quote Q-2026-118", 11.5, 0.5,
                  anchor="end", mono=True))
    t.append(text(px + pw - 28, ly + 32, "12 months · organic search", 11,
                  0.4, anchor="end"))

    # bang so tom tat
    b.append(seg(px, 138, px + pw, 138, 0.3, SW * 0.9))
    for i, (v, label) in enumerate((("48", "articles"), ("12", "months"),
                                    ("18", "clusters"),
                                    ("41→58", "DR target"))):
        cx = px + 32 + i * 108
        t.append(text(cx, 170, v, 19, 0.95, 500))
        t.append(text(cx, 186, label, 10.5, 0.4))
    # ty trong ba nhanh, mot thanh xep chong
    bx, bw = px + 32, pw - 64
    for frac, off, op in ((0.506, 0.0, 1.0), (0.285, 0.506, 0.55),
                          (0.209, 0.791, 0.28)):
        b.append(seg(bx + bw * off, 202, bx + bw * (off + frac) - 6, 202, op,
                     SW * 2.6))
    b.append(seg(px, 218, px + pw, 218, 0.3, SW * 0.9))

    for label, ax_, anch in (("Scope", px + 32, "start"),
                             ("Qty", px + pw * 0.70, "end"),
                             ("Amount", px + pw * 0.94, "end")):
        t.append(text(ax_, 234, label, 11, 0.38, anchor=anch))

    rows = (
        ("Technical audit", None, "18.000.000", 0, False),
        ("Crawl and log audit", "1", None, 1, False),
        ("Core Web Vitals", "1", None, 1, False),
        ("Content programme", None, None, 0, True),
        ("Articles · 12 a month", "48", None, 1, True),
        ("Briefs and outlines", "48", None, 1, True),
        ("Authority", None, "54.000.000", 0, False),
        ("Digital PR placements", "6", None, 1, False),
        ("Reporting", "12", "9.600.000", 0, False),
    )
    live_y = None
    for i, (label, qty, amount, depth, live) in enumerate(rows):
        y = 254 + i * 19
        if live and depth == 0:
            b.append(rect(px + 14, y - 14, pw - 28, 60, 0.0, SW, fill="0.07",
                          r=6))
            live_y = y + 16
        t.append(text(px + 32 + depth * 16, y, label, 12.5 if depth == 0
                      else 11.5, (0.9 if live else 0.72) if depth == 0
                      else 0.45, 500 if depth == 0 else 400))
        if qty:
            t.append(text(px + pw * 0.70, y, qty, 11.5, 0.45, anchor="end"))
        if amount:
            t.append(text(px + pw * 0.94, y, amount, 12, 0.7, anchor="end",
                          mono=True))
        elif live and depth == 0:
            b.append(progress(px + pw * 0.94 - 84, y - 4, 84, 0.55))

    for ry in (420, 428):
        b.append(seg(px + pw * 0.50, ry, px + pw * 0.94, ry, 0.4, SW * 0.9))
    t.append(text(px + pw * 0.50, 452, "Total", 15.5, 0.8, 500))
    t.append(text(px + pw * 0.94, 452, "189.600.000 ₫", 20, 1.0, 600,
                  anchor="end"))

    rx, rw = 568, M + AW - 568
    rb, rt, anchor = agent_panel(
        rx, 72, rw, AH, "Quoting agent", "Thought for 6s",
        'serp.top10("seo agency hanoi")', "10 results · depth scored",
        ("Content is the biggest line here.",
         "The top three publish 11–14 pieces",
         "a month, so 12 holds parity"),
        foot="two model calls, both bounded")
    b.append(rb)
    t.append(rt)
    if live_y:
        b.append(seg(rx, anchor + 96, px + pw - 10, live_y, 0.35, SW * 0.85,
                     dash="6 7"))
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
