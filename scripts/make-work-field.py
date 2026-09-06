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
    """Thanh tien do. Mot buoc dang chay phai NHIN RA la dang chay, khong thi
    ca cot chi la mot danh sach tinh."""
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


def agent_rail(x, y, w, h, title, steps, note=None):
    """Cot ben phai: agent dang lam viec, tung buoc mot.

    Ba canh dung chung khoi nay va do la co y — bao gia, bai viet va bo slide
    deu chay tren cung mot nen tang, nen chung phai co cung mot mat."""
    b, t = [], []
    b.append(rect(x, y, w, h, 0.7, SW * 1.3, r=10, fill="0.03"))
    b.append(spark(x + 26, y + 32, 9.5, 0.95, SW * 0.8))
    t.append(text(x + 44, y + 37, title, 14, 0.9, 500))
    b.append(seg(x, y + 54, x + w, y + 54, 0.26, SW * 0.9))
    yy = y + 88
    run_y = None
    for label, state in steps:
        if state == "done":
            b.append(dot(x + 28, yy - 5, 8, 0.42, hollow=True))
            b.append(check(x + 28, yy - 5, 4.4, 0.7))
            t.append(text(x + 46, yy, label, 12.5, 0.48))
            yy += 32
        elif state == "run":
            b.append(dot(x + 28, yy - 5, 8.5, 0.95, hollow=True, sw=SW))
            b.append(dot(x + 28, yy - 5, 3.4, 1.0))
            t.append(text(x + 46, yy, label, 12.5, 0.95, 500))
            b.append(progress(x + 46, yy + 15, w - 76, 0.62))
            run_y = yy - 5
            yy += 48
        else:
            b.append(dot(x + 28, yy - 5, 8, 0.24, hollow=True))
            t.append(text(x + 46, yy, label, 12.5, 0.28))
            yy += 32
    if note:
        t.append(text(x + 26, y + h - 22, note, 11.5, 0.38))
    return "".join(b), "".join(t), run_y


def hashf(i, k):
    """So gia ngau nhien nhung tat dinh: chay lai phai ra dung mot buc anh."""
    return (math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1.0


# ------------------------------------------------------------------- canh


def platform():
    """Tinh nen tang khong nam o cho "co nhieu cong cu", ma o cho NGUOI VA
    AGENT LAM CHUNG MOT CHO. Nen day la mot canvas cong viec: moi dong co chu
    va co trang thai, va tren mat canvas co hai con tro — mot cua nguoi, mot
    cua agent — dang sua hai dong khac nhau."""
    b, t = [], []
    x0, y0, w, h = M, 72, AW, AH
    b.append(rect(x0, y0, w, h, 1.0, SW * 1.9, r=10))
    b.append(seg(x0, y0 + 44, x0 + w, y0 + 44, 0.42, SW))
    for i in range(3):
        b.append(dot(x0 + 24 + i * 17, y0 + 22, 4.5, 0.4))
    t.append(text(x0 + 92, y0 + 27, "Workspace · SEO production", 13.5,
                  0.45))
    # ai dang o day: ba nguoi va mot agent
    for i in range(4):
        cx = x0 + w - 96 + i * 24
        b.append(dot(cx, y0 + 22, 9, 0.5 if i < 3 else 0.9, hollow=True))
        if i == 3:
            b.append(spark(cx, y0 + 22, 5.4, 0.9, SW * 0.65))

    cols = ((x0 + 52, "Task", "start"), (x0 + 470, "Owner", "start"),
            (x0 + 646, "Status", "start"))
    for cx, label, anch in cols:
        t.append(text(cx, y0 + 82, label, 11.5, 0.38, anchor=anch))
    b.append(seg(x0, y0 + 96, x0 + w, y0 + 96, 0.22, SW * 0.9))

    rows = (
        ("Cluster 12,480 keywords", "Keyword agent", True, "done", None),
        ("Draft 12 outlines", "Content agent", True, "run", 0.58),
        ("Review the outlines", "Viet", False, "review", None),
        ("Price the Acme quote", "Quoting agent", True, "done", None),
        ("Publish 4 drafts", "Publishing agent", True, "queued", None),
        ("Approve the quote", "Mai", False, "wait", None),
    )
    for i, (task, owner, is_agent, state, pct) in enumerate(rows):
        y = y0 + 132 + i * 44
        strong = state == "run"
        b.append(rect(x0 + 44, y - 12, 15, 15, 0.55 if not strong else 0.9,
                      SW * 0.9, r=3))
        if state == "done":
            b.append(check(x0 + 51.5, y - 4.5, 5, 0.8))
        t.append(text(x0 + 72, y, task, 14, 0.85 if strong else 0.6,
                      500 if strong else 400))
        if is_agent:
            b.append(spark(x0 + 478, y - 5, 6.2, 0.75, SW * 0.7))
            t.append(text(x0 + 492, y, owner, 12.5, 0.5))
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
            wl = len(label) * 6.6 + 22
            b.append(rect(x0 + 646, y - 16, wl, 22, 0.35, SW * 0.9, r=11))
            t.append(text(x0 + 657, y, label, 12, 0.5))

    # hai con tro, tren hai dong khac nhau
    cb, ct = cursor(x0 + 318, y0 + 152, "Content agent", agent=True)
    b.append(cb)
    t.append(ct)
    cb, ct = cursor(x0 + 250, y0 + 208, "Viet")
    b.append(cb)
    t.append(ct)
    return "".join(b), "".join(t)


def search():
    """Trang ket qua that ben trai, va che do AI Mode ben phai: cau tra loi co
    trich nguon, roi mot cau hoi noi tiep va cau tra lai — vi cai lam AI Mode
    khac mot doan tom tat la no doi dap duoc."""
    b, t = [], []
    b.append(rect(M, 72, AW, 54, 0.95, SW * 1.4, r=27))
    b.append(magnifier(M + 34, 99, 10, 0.8))
    t.append(text(M + 62, 106, "who won the 2022 world cup final", 19, 0.88))
    b.append(seg(M + 372, 86, M + 372, 112, 0.5, SW * 1.2))

    tx = M
    for name in ("All", "AI Mode", "Images", "News"):
        on = name == "AI Mode"
        t.append(text(tx, 155, name, 14.5, 1.0 if on else 0.4,
                      500 if on else 400))
        if on:
            b.append(seg(tx - 2, 168, tx + 66, 168, 1.0, SW * 1.1))
        tx += len(name) * 8.6 + 32

    for y, url, title, snips in (
        (206, "en.wikipedia.org › 2022 FIFA World Cup final",
         "2022 FIFA World Cup final",
         ("Argentina won their third title, and Messi",
          "his first, in the final at Lusail.")),
        (322, "fifa.com › tournaments › qatar-2022",
         "Final: Argentina 3–3 France",
         ("Match report, line-ups and the penalty order.",)),
        (412, "olympics.com › news › messi-lusail",
         "Messi lifts the trophy in Lusail", ()),
    ):
        b.append(dot(M + 9, y - 5, 7, 0.5, hollow=True))
        t.append(text(M + 26, y, url, 13, 0.5))
        t.append(text(M, y + 29, title, 20, 1.0, 500))
        for j, sn in enumerate(snips):
            t.append(text(M, y + 55 + j * 20, sn, 13.5, 0.45))

    # AI Mode: mot cuoc doi dap, khong phai mot o tom tat
    px, pw = 500, M + AW - 500
    b.append(rect(px, 186, pw, 276, 0.9, SW * 1.3, fill="0.04", r=16))
    b.append(spark(px + 26, 212, 10, 0.95))
    t.append(text(px + 44, 217, "AI Mode", 14.5, 0.95, 500))
    b.append(seg(px, 232, px + pw, 232, 0.24, SW * 0.9))
    for i, line in enumerate((
            "Argentina beat France 4–2 on penalties",
            "after a 3–3 draw. Messi scored twice;",
            "Mbappé took a hat-trick.")):
        t.append(text(px + 24, 256 + i * 19, line, 13, 0.68))
    for i, (label, w_) in enumerate((("fifa.com", 76), ("wikipedia.org", 100))):
        cx = px + 24 + i * 88
        b.append(rect(cx, 318, w_, 22, 0.55, SW * 0.9, r=11))
        t.append(text(cx + w_ / 2, 334, label, 11.5, 0.65, anchor="middle"))

    bw = 212
    bx = px + pw - 22 - bw
    b.append(rect(bx, 354, bw, 34, 0.5, SW, fill="0.07", r=12))
    t.append(text(bx + 16, 376, "Who took the penalties?", 12.5, 0.6))
    for i, line in enumerate(("Messi, Paredes, Montiel and Dybala",
                              "scored; Coman and Tchouaméni missed.")):
        t.append(text(px + 24, 398 + i * 19, line, 13, 0.68))
    b.append(rect(px + 22, 430, pw - 44, 30, 0.3, SW * 0.95, r=15))
    t.append(text(px + 38, 450, "Ask a follow-up", 12.5, 0.34))
    return "".join(b), "".join(t)


def publishing():
    """Duong ong that, va o giua no la phan ky thuat: lay HTML tu ban /pub, roi
    MOT the goi model — anh xa cau truc cua CMS, chay dung mot lan cho moi site
    — roi ca chuoi kiem chay bang code. The model ve to va dam nhat trong cot
    giua, vi do la cho duy nhat co model trong ca duong ong."""
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
    b.append(arrow(mid, mid, 0, 0.0))  # giu cho, mui ten doc ve rieng
    b.append(seg(mid, 130, mid, 152, 0.4, SW * 0.9))
    b.append(seg(mid - 5, 145, mid, 152, 0.4, SW * 0.9))
    b.append(seg(mid + 5, 145, mid, 152, 0.4, SW * 0.9))

    b.append(rect(cx0, 158, cw, 106, 0.95, SW * 1.7, fill="0.05", r=10))
    b.append(spark(cx0 + 24, 184, 10, 1.0))
    t.append(text(cx0 + 42, 189, "Map the CMS", 14.5, 0.95, 500))
    b.append(rect(cx0 + cw - 92, 172, 80, 22, 0.5, SW * 0.9, r=11))
    t.append(text(cx0 + cw - 52, 188, "once", 11.5, 0.6, anchor="middle"))
    for i, line in enumerate(("h2      → wp:heading",
                              "figure  → wp:image")):
        t.append(text(cx0 + 24, 218 + i * 22, line, 12, 0.55, mono=True))
    b.append(seg(mid, 264, mid, 286, 0.4, SW * 0.9))
    b.append(seg(mid - 5, 279, mid, 286, 0.4, SW * 0.9))
    b.append(seg(mid + 5, 279, mid, 286, 0.4, SW * 0.9))

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
    t.append(text(ax + 86, ay + 26, "example.com/blog/running-shoes", 11,
                  0.45))
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
    """Bai dang duoc viet, va ben phai la agent dang viet no: da doc brief, da
    dung dan bai chin muc, dang viet muc "Arch support" — va dung muc do trong
    bai duoc to nen, voi con tro dung o cuoi dong."""
    b, t = [], []
    px, pw = M, 464
    py, ph = 72, AH
    ix, iw = px + 28, pw - 56
    b.append(rect(px, py, pw, ph, 1.0, SW * 1.9, r=6))
    t.append(text(ix, py + 50, "Running shoes for flat feet:", 21, 1.0, 500))
    t.append(text(ix, py + 76, "how to choose", 21, 1.0, 500))
    t.append(text(ix, py + 102, "Draft · 1,240 words · 9 H2s", 12,
                  0.4))
    t.append(text(ix, py + 142, "What to look for", 16.5, 0.85, 500))
    for i, f in enumerate((0.98, 0.9, 0.66)):
        b.append(seg(ix, py + 168 + i * 20, ix + iw * f, py + 168 + i * 20,
                     0.26, SW * 0.9))
    # muc agent dang viet: to nen, khong to vien
    b.append(rect(px + 12, py + 236, pw - 24, 118, 0.0, SW, fill="0.055", r=8))
    t.append(text(ix, py + 264, "Arch support", 16.5, 0.95, 500))
    for i, f in enumerate((0.94, 0.84)):
        b.append(seg(ix, py + 290 + i * 20, ix + iw * f, py + 290 + i * 20,
                     0.4, SW * 0.95))
    cy = py + 330
    b.append(seg(ix, cy, ix + iw * 0.42, cy, 0.5, SW * 1.1))
    b.append(seg(ix + iw * 0.42 + 12, cy - 13, ix + iw * 0.42 + 12, cy + 13,
                 1.0, SW * 1.6))

    rx, rw = 560, M + AW - 560
    rb, rt, run_y = agent_rail(
        rx, py, rw, ph, "Content agent",
        (("Read the brief", "done"),
         ("Build the outline — 9 H2s", "done"),
         ("Write ‘Arch support’", "run"),
         ("Insert internal links", "todo"),
         ("Run the publishing checklist", "todo")),
        note="checklist: 11 of 12 passing")
    b.append(rb)
    t.append(rt)
    if run_y:
        b.append(seg(rx, run_y, px + pw - 12, py + 288, 0.4, SW * 0.85,
                     dash="6 7"))
    return "".join(b), "".join(t)


def presentation():
    """Bo slide, va agent dang dung slide do: mot vung tren slide duoc khoanh
    lai bang net dut voi bon tay nam — do la phan no dang viet ngay luc nay."""
    b, t = [], []
    dw, dh = 96, 148
    dy = 186
    b.append(rect(M + 22, dy - 16, dw, dh, 0.26, SW * 0.9))
    for i in range(4):
        b.append(seg(M + 32, dy + 6 + i * 30, M + 22 + dw - 10,
                     dy + 6 + i * 30, 0.2, SW * 0.8))
    b.append(sheet(M, dy, dw, dh, 0.55, fill="0.03"))
    for i, f in enumerate((0.72, 0.9, 0.62, 0.84)):
        b.append(seg(M + 14, dy + 40 + i * 20, M + 14 + (dw - 30) * f,
                     dy + 40 + i * 20, 0.3, SW * 0.85))
    t.append(text(M + dw / 2, dy + dh + 24, "Brief", 13, 0.6, 500,
                  anchor="middle"))
    t.append(text(M + dw / 2, dy + dh + 42, "+ 3 data files", 11, 0.4,
                  anchor="middle"))
    b.append(arrow(M + dw + 8, M + dw + 38, dy + dh / 2, 0.45))

    sx, sw_ = M + 128, 412
    sy, sh = 76, 244
    b.append(rect(sx, sy, sw_, sh, 1.0, SW * 1.9, r=6))
    t.append(text(sx + 28, sy + 46, "Q3 organic performance", 20, 1.0, 500))
    t.append(text(sx + 28, sy + 70, "Sessions and revenue, Jul–Sep", 12,
                  0.42))
    for i, line in enumerate(("Sessions up 38% QoQ",
                              "Ten pages, 62% of revenue",
                              "Two clusters unranked")):
        yy = sy + 106 + i * 24
        b.append(dot(sx + 36, yy - 5, 4.2, 0.5))
        t.append(text(sx + 50, yy, line, 12.5, 0.6))

    # vung agent dang dung, khoanh net dut voi bon tay nam
    gx, gy, gw_, gh = sx + 224, sy + 84, 168, 132
    b.append(rect(gx, gy, gw_, gh, 0.85, SW * 1.1, r=6, dash="7 6"))
    for hx, hy in ((gx, gy), (gx + gw_, gy), (gx, gy + gh), (gx + gw_, gy + gh)):
        b.append(rect(hx - 4.5, hy - 4.5, 9, 9, 0.95, SW * 0.9))
    base = gy + gh - 22
    for i, (v, mon) in enumerate(((0.40, "Jul"), (0.64, "Aug"), (0.96, "Sep"))):
        bh = 68 * v
        bx = gx + 26 + i * 44
        b.append(rect(bx, base - bh, 26, bh, 0.7, SW * 0.95, fill="0.14"))
        t.append(text(bx + 13, base + 15, mon, 10.5, 0.4, anchor="middle"))
    b.append(seg(gx + 14, base, gx + gw_ - 14, base, 0.4, SW * 0.9))
    t.append(text(gx, gy - 9, "drafting", 11, 0.75, 500))

    tw, gap = 97, 8
    ty, th = 340, 62
    for i in range(4):
        tx = sx + i * (tw + gap)
        op = 1.0 if i == 2 else 0.36 - 0.04 * i
        b.append(rect(tx, ty, tw, th, op, SW * (1.4 if i == 2 else 1.0), r=4))
        b.append(seg(tx + 12, ty + 22, tx + 12 + (tw - 24) * 0.7, ty + 22,
                     op * 0.55, SW * 0.9))
        b.append(seg(tx + 12, ty + 40, tx + 12 + (tw - 24) * 0.44, ty + 40,
                     op * 0.4, SW * 0.85))
        t.append(text(tx + tw - 10, ty + th - 9, str(i + 1), 10.5,
                      0.6 if i == 2 else 0.3, anchor="end", mono=True))

    rx, rw = 636, M + AW - 636
    rb, rt, run_y = agent_rail(
        rx, 76, rw, 388, "Deck agent",
        (("Read the brief", "done"),
         ("Pick the argument", "done"),
         ("Write slide 3", "run"),
         ("Lay out the charts", "todo"),
         ("Run the geometry linter", "todo")),
        note="the model never places a pixel")
    b.append(rb)
    t.append(rt)
    if run_y:
        b.append(seg(rx, run_y, gx + gw_ + 6, gy + 20, 0.4, SW * 0.85,
                     dash="6 7"))
    return "".join(b), "".join(t)


def keywords():
    """Ba chang, khong phai hai: danh sach tu khoa tho, DUONG ONG o giua voi
    ten cong cu that o tung buoc, va cuoi cung la ban do — cac cum duoc khoanh
    vung va dat ten, cong nhung diem khong cum nao nhan."""
    b, t = [], []
    lw = 196
    b.append(rect(M, 76, lw, 388, 0.5, SW * 1.2, r=6))
    t.append(text(M + 16, 102, "12,480 keywords", 13.5, 0.7, 500))
    b.append(seg(M, 114, M + lw, 114, 0.28, SW * 0.9))
    raw = ("running shoes for men", "how to choose running shoes",
           "nike pegasus 40", "cheap running shoes", "running shoe size chart",
           "running shoes for women", "adidas ultraboost",
           "trail running shoes", "best running shoes 2026",
           "marathon racing shoes", "leather dress shoes", "high heels",
           "running shoes for kids")
    for i, kw in enumerate(raw):
        t.append(text(M + 16, 140 + i * 24, kw, 12, max(0.15, 0.5 - 0.026 * i)))

    px, pw = M + lw + 26, 128
    pmid = px + pw / 2
    stages = (("embed", "voyage-3-large", False), ("reduce", "UMAP", False),
              ("cluster", "HDBSCAN", False), ("name", "one cheap call", True))
    for i, (label, tool, is_model) in enumerate(stages):
        y = 108 + i * 84
        b.append(rect(px, y, pw, 54, 0.9 if is_model else 0.5,
                      SW * (1.6 if is_model else 1.1), r=8,
                      fill="0.05" if is_model else None))
        if is_model:
            b.append(spark(px + 20, y + 20, 8, 0.95, SW * 0.75))
            t.append(text(px + 34, y + 24, label, 13, 0.95, 500))
        else:
            t.append(text(px + 16, y + 24, label, 13, 0.75, 500))
        t.append(text(px + 16, y + 42, tool, 10.5, 0.45, mono=True))
        if i < 3:
            b.append(seg(pmid, y + 54, pmid, y + 76, 0.35, SW * 0.9))
            b.append(seg(pmid - 5, y + 69, pmid, y + 76, 0.35, SW * 0.9))
            b.append(seg(pmid + 5, y + 69, pmid, y + 76, 0.35, SW * 0.9))
    b.append(arrow(px + pw + 10, px + pw + 44, 270, 0.45))

    mx, my = px + pw + 62, 76
    mw, mh = M + AW - mx, 388
    groups = ((0.24, 0.27, 0.17, 0.145, "buy running shoes", 15),
              (0.74, 0.26, 0.18, 0.145, "how to choose", 14),
              (0.47, 0.71, 0.21, 0.155, "by brand", 13))
    for gi, (cx, cy, rx_, ry_, label, n) in enumerate(groups):
        ccx, ccy = mx + cx * mw, my + cy * mh
        b.append(ellipse(ccx, ccy, rx_ * mw, ry_ * mh, 0.45, SW * 0.9,
                         dash="8 8"))
        for i in range(n):
            a = hashf(i, gi) * 2 * math.pi
            r = 0.42 + 0.55 * hashf(i + 40, gi)
            b.append(dot(ccx + math.cos(a) * rx_ * mw * r,
                         ccy + math.sin(a) * ry_ * mh * r, 4.6, 0.85))
        t.append(text(ccx, ccy - ry_ * mh - 12, label, 13, 0.85, 500,
                      anchor="middle"))
    for ox, oy in ((0.06, 0.88), (0.17, 0.95), (0.93, 0.60)):
        b.append(dot(mx + ox * mw, my + oy * mh, 5.4, 0.7, hollow=True))
    t.append(text(mx + 0.02 * mw, my + 0.80 * mh, "3 outliers", 11.5, 0.45))
    return "".join(b), "".join(t)


def quoting():
    """Ban bao gia dang duoc dung: agent o cot phai chay tung buoc, va dong no
    dang tinh duoc to nen ngay tren ban bao gia, cot tien cua dong do la mot
    thanh tien do chu chua phai mot con so. Dong tong vi the ghi la tam tinh."""
    b, t = [], []
    px, pw = M, 464
    b.append(rect(px, 72, pw, AH, 1.0, SW * 1.9, r=6))
    t.append(text(px + 30, 118, "Quote", 24, 1.0, 500))
    t.append(text(px + 30, 142, "12 months · organic search", 12.5, 0.42))
    b.append(seg(px, 162, px + pw, 162, 0.35, SW))
    for label, ax_, anch in (("Scope", px + 30, "start"),
                             ("Qty", px + pw * 0.66, "end"),
                             ("Amount", px + pw * 0.93, "end")):
        t.append(text(ax_, 188, label, 11.5, 0.38, anchor=anch))

    rows = (("Technical audit", "1", "18.000.000", False),
            ("Content, 12 articles a month", "12", None, True),
            ("Internal linking", "1", "12.000.000", False),
            ("Digital PR", "6", "54.000.000", False),
            ("Monthly reporting", "12", "9.600.000", False))
    live_y = None
    for i, (scope, qty, amount, live) in enumerate(rows):
        y = 220 + i * 30
        if live:
            b.append(rect(px + 14, y - 21, pw - 28, 30, 0.0, SW, fill="0.07",
                          r=6))
            live_y = y - 6
        t.append(text(px + 30, y, scope, 13.5, 0.85 if live else 0.55,
                      500 if live else 400))
        t.append(text(px + pw * 0.66, y, qty, 12.5, 0.45, anchor="end"))
        if amount:
            t.append(text(px + pw * 0.93, y, amount, 12.5, 0.7, anchor="end",
                          mono=True))
        else:
            b.append(progress(px + pw * 0.93 - 90, y - 5, 90, 0.55))
    b.append(seg(px + pw * 0.50, 386, px + pw * 0.94, 386, 0.4, SW * 0.9))
    b.append(seg(px + pw * 0.50, 395, px + pw * 0.94, 395, 0.4, SW * 0.9))
    t.append(text(px + pw * 0.50, 428, "Total", 16, 0.8, 500))
    t.append(text(px + pw * 0.93, 428, "189.600.000 ₫", 21, 1.0, 600,
                  anchor="end"))
    t.append(text(px + pw * 0.93, 448, "provisional · one line still pricing",
                  10.5, 0.4, anchor="end"))

    rx, rw = 560, M + AW - 560
    rb, rt, run_y = agent_rail(
        rx, 72, rw, AH, "Quoting agent",
        (("Read the brief", "done"),
         ("Fetch the top 10 results", "done"),
         ("Score competitor depth", "done"),
         ("Price content volume", "run"),
         ("Apply the rate card", "todo"),
         ("Assemble the quote", "todo")),
        note="two model calls, both bounded")
    b.append(rb)
    t.append(rt)
    if run_y and live_y:
        b.append(seg(rx, run_y, px + pw - 12, live_y, 0.4, SW * 0.85,
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
