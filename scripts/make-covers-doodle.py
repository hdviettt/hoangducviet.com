"""Anh bia bai viet, ve tay, cung mot ngon ngu voi featured media cua Work.

Luat ve giong het ben Work, va chi co mot luat:

    VE DUNG THU BAI DO NOI TOI, KHONG VE MOT AN DU CUA NO.

Bai ve inverted index thi ve chinh bang tra tu -> trang. Bai ve BM25 thi ve
chinh duong bao hoa. Bai ve doi thoai voi chu tich thi ve chinh doi thoai do.
Mot cai bia doc duoc ma khong can tieu de la mot cai bia dung.

Bia nam trong <img> nen moi mau phai in cung, va khong duoc dat chu duoi 22px:
bia duoc nhin o co the, khoang mot phan ba kich thuoc that.

    python scripts/make-covers-doodle.py [slug ...]
"""

import math
import sys
from pathlib import Path

from doodle import (
    SW, arc, arrow, caret_block, check, chip, cover_svg, dot, ellipse, hashf,
    magnifier, mark, picture, progress, rect, seg, sheet, spark, text, white,
)

OUT = Path(__file__).resolve().parent.parent / "public" / "covers"
W, H = 1200, 630
M = 80
AW, AH = W - 2 * M, H - 2 * M          # 1040 x 470, y 80..550


# ---------------------------------------------------------------- cac canh


def chinese_wisdom():
    """AI co tac dung khi no BIEN MAT vao thoi quen san co. Nen ve mot ung
    dung nhan tin quen thuoc, trong danh sach hoi thoai co mot dong la agent —
    va ben canh la mot ung dung AI rieng biet khong ai mo, ve mo va nghieng."""
    b, t = [], []
    ax, aw = M + 340, AW - 340
    b.append(rect(ax, M, aw, AH, 1.0, SW * 1.9, r=14))
    b.append(seg(ax, M + 56, ax + aw, M + 56, 0.4, SW))
    t.append(text(ax + 26, M + 36, "Messages", 19, 0.85, 500))
    b.append(magnifier(ax + aw - 36, M + 28, 10, 0.35, SW * 0.85))
    rows = (("Sales group", "Quang: can we ship Friday?", "09:12", False),
            ("Content agent", "drafted 4 briefs, 2 need review", "09:20", True),
            ("Ha · design", "sent the file", "08:47", False),
            ("Client X", "meeting moved to 3pm", "Yesterday", False),
            ("Ops group", "checklist done for the week", "Yesterday", False))
    for i, (name, sub, when, is_agent) in enumerate(rows):
        y = M + 92 + i * 74
        if is_agent:
            b.append(rect(ax + 8, y - 26, aw - 16, 62, 0.0, SW, fill="0.06",
                          r=10))
        b.append(dot(ax + 40, y, 21, 0.45 if not is_agent else 0.9,
                     hollow=True))
        if is_agent:
            b.append(spark(ax + 40, y, 10, 0.95, SW * 0.8))
        t.append(text(ax + 74, y - 3, name, 17, 0.9 if is_agent else 0.7,
                      500 if is_agent else 400))
        t.append(text(ax + 74, y + 20, sub, 13.5, 0.42))
        t.append(text(ax + aw - 26, y - 3, when, 12.5, 0.32, anchor="end"))
        if is_agent:
            b.append(dot(ax + aw - 34, y + 16, 9, 0.0, hollow=False))
            b.append(rect(ax + aw - 46, y + 8, 24, 18, 0.0, SW, fill="0.85",
                          r=9))
            t.append(text(ax + aw - 34, y + 21, "2", 11, 0.0, 600,
                          anchor="middle"))

    # ung dung AI rieng: khong ai mo
    px = M + 20
    b.append(rect(px, M + 130, 200, 200, 0.3, SW * 1.3, r=32, dash="9 9"))
    b.append(spark(px + 100, M + 214, 30, 0.32, SW * 1.1))
    t.append(text(px + 100, M + 296, "a separate AI app", 15, 0.36,
                  anchor="middle"))
    t.append(text(px + 100, M + 318, "nobody opens", 15, 0.36,
                  anchor="middle"))
    b.append(arrow(px + 216, ax - 16, M + 230, 0.35))
    return "".join(b), "".join(t)


def vibe_code():
    """Mot cua so terminal that: cau lenh da go, mot lan chay dang do, va con
    so lam nen ca bai — muc tieu ton moi thang."""
    b, t = [], []
    b.append(rect(M, M, AW - 300, AH, 1.0, SW * 1.9, r=12))
    b.append(seg(M, M + 52, M + AW - 300, M + 52, 0.4, SW))
    for i in range(3):
        b.append(dot(M + 30 + i * 22, M + 26, 5.5, 0.4))
    t.append(text(M + 116, M + 32, "claude", 15, 0.45, mono=True))
    lines = [("> ship the pricing page, then wire", 1.0, 0),
             ("  it to the checkout flow", 1.0, 0),
             ("", 0, 0),
             ("· read src/pricing.tsx", 0.45, 1),
             ("· edited 3 files, ran the tests", 0.45, 1),
             ("· 42 tools used", 0.45, 1)]
    for i, (line, op, mono) in enumerate(lines):
        if not line:
            continue
        t.append(text(M + 34, M + 96 + i * 34, line, 17, op, mono=bool(mono)))
    b.append(spark(M + 40, M + 300, 12, 0.95))
    t.append(text(M + 62, M + 306, "Shipped. Nine products live.", 17, 0.75))
    b.append(caret_block(M + 62 + 28 * 8.7, M + 295, 0.9))

    rx = M + AW - 260
    t.append(text(rx, M + 60, "TOKENS THIS MONTH", 12, 0.35, 500))
    t.append(text(rx, M + 108, "$50,000", 42, 1.0, 600))
    t.append(text(rx, M + 138, "world's #1 consumer", 14, 0.4))
    t.append(text(rx, M + 214, "REVENUE A YEAR", 12, 0.35, 500))
    t.append(text(rx, M + 262, "$1M", 42, 1.0, 600))
    t.append(text(rx, M + 292, "nine products, one person", 14, 0.4))
    t.append(text(rx, M + 368, "LINES OF CODE HE WRITES", 12, 0.35, 500))
    t.append(text(rx, M + 416, "0", 42, 1.0, 600))
    return "".join(b), "".join(t)


def keyword_clustering():
    """Danh sach tu khoa tho di vao, ban do cac cum co ten di ra, va ba diem
    khong cum nao nhan."""
    b, t = [], []
    lw = 300
    b.append(rect(M, M, lw, AH, 0.5, SW * 1.3, r=8))
    t.append(text(M + 24, M + 42, "12,480 keywords", 18, 0.75, 500))
    b.append(seg(M, M + 62, M + lw, M + 62, 0.3, SW))
    raw = ("running shoes for men", "how to choose running shoes",
           "nike pegasus 40", "cheap running shoes", "running shoe size chart",
           "adidas ultraboost", "trail running shoes", "leather dress shoes",
           "best running shoes 2026", "high heels", "marathon racing shoes")
    for i, kw in enumerate(raw):
        t.append(text(M + 24, M + 96 + i * 34, kw, 15,
                      max(0.16, 0.55 - 0.035 * i)))
    b.append(arrow(M + lw + 24, M + lw + 74, M + AH / 2, 0.45))

    mx = M + lw + 110
    mw, mh = M + AW - mx, AH
    for gi, (cx, cy, rx_, ry_, label, n) in enumerate((
            (0.26, 0.28, 0.21, 0.20, "buy running shoes", 17),
            (0.74, 0.26, 0.20, 0.19, "how to choose", 15),
            (0.48, 0.74, 0.24, 0.20, "by brand", 16))):
        ccx, ccy = mx + cx * mw, M + cy * mh
        b.append(ellipse(ccx, ccy, rx_ * mw, ry_ * mh, 0.45, SW, dash="10 9"))
        for i in range(n):
            a = hashf(i, gi) * 2 * math.pi
            r = 0.42 + 0.55 * hashf(i + 40, gi)
            b.append(dot(ccx + math.cos(a) * rx_ * mw * r,
                         ccy + math.sin(a) * ry_ * mh * r, 6, 0.85))
        t.append(text(ccx, ccy - ry_ * mh - 16, label, 17, 0.9, 500,
                      anchor="middle"))
    for ox, oy in ((0.05, 0.88), (0.16, 0.97), (0.95, 0.72)):
        b.append(dot(mx + ox * mw, M + oy * mh, 7, 0.7, hollow=True))
    return "".join(b), "".join(t)


def web_crawling():
    """Google tim trang moi bang cach di theo lien ket. Nen ve chinh do thi
    lien ket — va mot trang khong ai tro toi, nam ngoai, mai mai khong duoc
    tim thay."""
    b, t = [], []
    nodes = {"a": (0.14, 0.30), "b": (0.36, 0.14), "c": (0.34, 0.58),
             "d": (0.58, 0.34), "e": (0.56, 0.78), "f": (0.78, 0.18),
             "g": (0.80, 0.60)}
    edges = (("a", "b"), ("a", "c"), ("b", "d"), ("c", "d"), ("c", "e"),
             ("d", "f"), ("d", "g"), ("e", "g"), ("b", "f"))
    P = {k: (M + 30 + x * (AW - 180), M + y * AH) for k, (x, y) in nodes.items()}
    for u, v in edges:
        (x0, y0), (x1, y1) = P[u], P[v]
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy)
        b.append(seg(x0 + dx / L * 26, y0 + dy / L * 26,
                     x1 - dx / L * 30, y1 - dy / L * 30, 0.4, SW * 0.9))
        b.append(seg(x1 - dx / L * 40 - dy / L * 6, y1 - dy / L * 40 + dx / L * 6,
                     x1 - dx / L * 30, y1 - dy / L * 30, 0.4, SW * 0.9))
        b.append(seg(x1 - dx / L * 40 + dy / L * 6, y1 - dy / L * 40 - dx / L * 6,
                     x1 - dx / L * 30, y1 - dy / L * 30, 0.4, SW * 0.9))
    for k, (x, y) in P.items():
        found = k != "a"
        b.append(rect(x - 30, y - 36, 60, 72, 0.9, SW * 1.5, r=5))
        for i in range(4):
            b.append(seg(x - 17, y - 18 + i * 15, x + 17 - i * 7, y - 18 + i * 15,
                         0.4, SW * 0.85))
    b.append(dot(P["a"][0], P["a"][1] - 44, 8, 0.9))
    t.append(text(P["a"][0], P["a"][1] - 58, "seed", 14, 0.6, 500,
                  anchor="middle"))

    ox, oy = M + AW - 320, M + AH * 0.93
    b.append(rect(ox - 24, oy - 28, 48, 56, 0.45, SW * 1.2, r=4, dash="7 7"))
    for i in range(3):
        b.append(seg(ox - 13, oy - 13 + i * 13, ox + 13 - i * 5, oy - 13 + i * 13,
                     0.25, SW * 0.8))
    t.append(text(ox + 40, oy - 6, "nothing links here,", 16, 0.5))
    t.append(text(ox + 40, oy + 18, "so it is never found", 16, 0.5))
    return "".join(b), "".join(t)


def crawler_design():
    """Vong lap cua trinh thu thap: Fetcher -> Parser -> Manager va quay lai.
    Truoc khi vao vong, no doc robots.txt; giua hai lan goi, no doi."""
    b, t = [], []
    cx, cy, r = M + 470, M + AH / 2, 186
    steps = (("Fetcher", 270), ("Parser", 30), ("Manager", 150))
    pts = []
    for name, ang in steps:
        a = math.radians(ang - 90)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        pts.append((x, y, name))
    for i, (x, y, name) in enumerate(pts):
        b.append(rect(x - 84, y - 30, 168, 60, 1.0, SW * 1.7, r=10))
        t.append(text(x, y + 7, name, 19, 0.95, 500, anchor="middle"))
    for i in range(3):
        x0, y0, _ = pts[i]
        x1, y1, _ = pts[(i + 1) % 3]
        mx_, my_ = (x0 + x1) / 2, (y0 + y1) / 2
        ddx, ddy = x1 - x0, y1 - y0
        L = math.hypot(ddx, ddy)
        b.append(seg(x0 + ddx / L * 92, y0 + ddy / L * 92,
                     x1 - ddx / L * 92, y1 - ddy / L * 92, 0.45, SW))
        ux, uy = ddx / L, ddy / L
        hx, hy = x1 - ux * 96, y1 - uy * 96
        b.append(seg(hx - ux * 12 - uy * 7, hy - uy * 12 + ux * 7, hx, hy, 0.45,
                     SW))
        b.append(seg(hx - ux * 12 + uy * 7, hy - uy * 12 - ux * 7, hx, hy, 0.45,
                     SW))

    b.append(sheet(M, M + 92, 170, 210, 0.55))
    t.append(text(M + 22, M + 134, "robots.txt", 17, 0.8, 500, mono=True))
    for i, line in enumerate(("User-agent: *", "Disallow: /admin",
                              "Crawl-delay: 1")):
        t.append(text(M + 22, M + 174 + i * 30, line, 13, 0.45, mono=True))
    b.append(arrow(M + 186, M + 240, M + 197, 0.4))

    # dong ho dat NGAY TREN canh Manager -> Fetcher: cho duy nhat co do tre
    mxp, myp, _ = pts[2]
    fxp, fyp, _ = pts[0]
    hx, hy = (mxp + fxp) / 2, (myp + fyp) / 2
    b.append(white(hx - 40, hy - 40, 80, 80, 40))
    b.append(dot(hx, hy, 34, 0.7, hollow=True, sw=SW * 1.3))
    b.append(seg(hx, hy, hx, hy - 22, 0.9, SW))
    b.append(seg(hx, hy, hx + 17, hy, 0.9, SW))
    t.append(text(hx - 52, hy + 6, "one second", 16, 0.6, 500, anchor="end"))
    t.append(text(hx - 52, hy + 30, "between requests", 16, 0.45,
                  anchor="end"))
    t.append(text(M + AW - 40, M + AH - 10, "a polite robot", 17, 0.4,
                  anchor="end"))
    return "".join(b), "".join(t)


def inverted_index():
    """Chinh cai bang tra: tu -> danh sach trang chua no. Hang xep theo tan
    suat nen cai nem Zipf hien ra ma khong can noi gi."""
    b, t = [], []
    terms = (("the", 22), ("football", 14), ("league", 11), ("goal", 8),
             ("penalty", 6), ("offside", 4), ("nutmeg", 2), ("rabona", 1))
    lx = M + 210
    colw = (AW - 230) / 24
    for i, (term, n) in enumerate(terms):
        y = M + 44 + i * 56
        t.append(text(M + 190, y + 7, term, 19, 0.9, 500, anchor="end",
                      mono=True))
        b.append(seg(lx, y, lx + 24 * colw, y, 0.16, SW * 0.7))
        # chon n cot bang ham bam: rai deu that, va chay lai van ra dung the
        cols = sorted(range(24), key=lambda c: hashf(c, i))[:n]
        for c in cols:
            b.append(dot(lx + c * colw + colw / 2, y, 7, 0.85))
    t.append(text(M + 190, M + 44 - 34, "term", 13, 0.35, 500, anchor="end"))
    t.append(text(lx, M + 44 - 34, "documents that contain it", 13, 0.35, 500))
    return "".join(b), "".join(t)


def bm25():
    """Duong bao hoa: nhac lai tu khoa lan thu hai an tien, lan thu hai muoi
    thi khong. Do la ca luan diem cua bai."""
    b, t = [], []
    ox, oy = M + 120, M + AH - 60
    ww, hh = AW - 340, AH - 130
    b.append(seg(ox, oy, ox + ww, oy, 0.45, SW))
    b.append(seg(ox, oy, ox, oy - hh, 0.45, SW))
    t.append(text(ox + ww / 2, oy + 44, "times the word appears on the page",
                  16, 0.45, anchor="middle"))
    t.append(text(ox - 26, oy - hh / 2, "score", 16, 0.45, anchor="middle"))

    pts = []
    for i in range(61):
        x = i / 60
        tf = x * 24
        y = tf / (tf + 1.6)
        pts.append((ox + x * ww, oy - y * hh * 0.94))
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    b.append(f'<path d="{d}" fill="none" stroke="currentColor" '
             f'stroke-opacity="1" stroke-width="{SW * 2.2}" '
             f'stroke-linecap="round"/>')
    kx, ky = pts[8]
    b.append(dot(kx, ky, 9, 1.0))
    b.append(seg(kx, ky, kx + 40, ky + 130, 0.4, SW * 0.9, dash="6 7"))
    t.append(text(kx + 48, ky + 150, "the second mention", 18, 0.8, 500))
    t.append(text(kx + 48, ky + 176, "still buys a lot", 18, 0.5))
    fx, fy = pts[52]
    b.append(dot(fx, fy, 9, 1.0))
    b.append(seg(fx, fy, fx - 60, fy + 78, 0.4, SW * 0.9, dash="6 7"))
    t.append(text(fx - 66, fy + 100, "the twentieth buys", 17, 0.75, 500,
                  anchor="end"))
    t.append(text(fx - 66, fy + 124, "almost nothing", 17, 0.5, anchor="end"))
    return "".join(b), "".join(t)


def pagerank():
    """Mot trang quan trong neu cac trang quan trong tro vao no. Nen ve do thi
    voi kich thuoc nut CHINH LA thu hang, va mui ten chi vao."""
    b, t = [], []
    nodes = {"A": (0.60, 0.46, 58), "B": (0.30, 0.22, 30), "C": (0.28, 0.72, 26),
             "D": (0.82, 0.24, 22), "E": (0.84, 0.74, 20),
             "F": (0.10, 0.46, 14), "G": (0.47, 0.90, 13),
             "H": (0.47, 0.06, 13)}
    edges = (("B", "A"), ("C", "A"), ("D", "A"), ("E", "A"), ("F", "B"),
             ("G", "C"), ("H", "B"), ("F", "C"), ("D", "E"))
    P = {k: (M + 30 + x * (AW - 200), M + y * AH, r * 1.35) for k, (x, y, r) in
         nodes.items()}
    for u, v in edges:
        x0, y0, r0 = P[u]
        x1, y1, r1 = P[v]
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy)
        ux, uy = dx / L, dy / L
        b.append(seg(x0 + ux * (r0 + 8), y0 + uy * (r0 + 8),
                     x1 - ux * (r1 + 14), y1 - uy * (r1 + 14), 0.35, SW * 0.9))
        hx, hy = x1 - ux * (r1 + 14), y1 - uy * (r1 + 14)
        b.append(seg(hx - ux * 13 - uy * 7, hy - uy * 13 + ux * 7, hx, hy, 0.35,
                     SW * 0.9))
        b.append(seg(hx - ux * 13 + uy * 7, hy - uy * 13 - ux * 7, hx, hy, 0.35,
                     SW * 0.9))
    for k, (x, y, r) in P.items():
        big = r > 40
        b.append(dot(x, y, r, 1.0 if big else 0.55, hollow=True,
                     sw=SW * (2.0 if big else 1.2)))
        if big:
            b.append(dot(x, y, r * 0.62, 0.14))
    t.append(text(P["A"][0], P["A"][1] + 8, "0.31", 22, 1.0, 600,
                  anchor="middle", mono=True))
    t.append(text(M + AW - 250, M + AH - 40,
                  "four important pages point here", 17, 0.55))
    return "".join(b), "".join(t)


def ai_overviews():
    """Query fan-out: mot cau hoi no ra thanh may cau hoi con, moi cau di lay
    ket qua rieng, roi tat ca tu lai thanh mot cau tra loi co trich nguon."""
    b, t = [], []
    qw = 520
    qx = M + (AW - qw) / 2
    b.append(rect(qx, M, qw, 54, 0.95, SW * 1.5, r=27))
    b.append(magnifier(qx + 32, M + 27, 10, 0.75))
    t.append(text(qx + 60, M + 34, "best running shoes for flat feet", 18,
                  0.9))

    subs = ("what is overpronation", "arch support in running shoes",
            "stability vs neutral shoes", "shoe reviews for flat feet")
    sy = M + 148
    for i, s in enumerate(subs):
        cw = 264
        cx = M + 20 + i * (cw - 20) * 1.0
        cx = M + 20 + i * 250
        b.append(rect(cx, sy, 234, 46, 0.5, SW * 1.1, r=23))
        t.append(text(cx + 117, sy + 29, s, 13.5, 0.62, anchor="middle"))
        b.append(seg(qx + qw / 2, M + 60, cx + 117, sy - 8, 0.3, SW * 0.9))
        b.append(seg(cx + 117, sy + 46, M + AW / 2, sy + 96, 0.3, SW * 0.9))

    py = sy + 104
    b.append(rect(M + 120, py, AW - 240, 176, 0.95, SW * 1.5, fill="0.045",
                  r=16))
    b.append(spark(M + 158, py + 42, 14, 0.95))
    t.append(text(M + 188, py + 50, "Look for stability shoes with a firm", 18,
                  0.72))
    t.append(text(M + 154, py + 82, "midsole; neutral shoes let a flat arch", 18,
                  0.72))
    t.append(text(M + 154, py + 114, "collapse further.", 18, 0.72))
    for i, (label, w_) in enumerate((("runrepeat.com", 132),
                                     ("podiatry.org", 122))):
        cx = M + 154 + i * 144
        cb, ct = chip(cx, py + 132, w_, 30, label, 13.5, 0.55, 0.65)
        b.append(cb)
        t.append(ct)
    return "".join(b), "".join(t)


def bert():
    """Truoc BERT, "to" la mot tu dung. Sau BERT no doi nghia ca cau. Nen ve
    dung hai truy van do, va mui ten huong di ma chu "to" quyet dinh."""
    b, t = [], []
    rows = (("2019 brazil traveler to usa need a visa", "Brazil", "USA",
             "the traveler is Brazilian"),
            ("2019 usa traveler to brazil need a visa", "USA", "Brazil",
             "the traveler is American"))
    for i, (q, a, bb, meaning) in enumerate(rows):
        y = M + 60 + i * 250
        t.append(text(M, y, q, 26, 0.95, 500, mono=True))
        # gach chan chu "to"
        pre = q.index(" to ") + 1
        x0 = M + pre * 15.6
        b.append(seg(x0, y + 14, x0 + 2 * 15.6, y + 14, 1.0, SW * 2.2))
        # huong di
        ay = y + 78
        b.append(rect(M + 40, ay, 190, 62, 0.85, SW * 1.5, r=10))
        t.append(text(M + 135, ay + 39, a, 22, 0.95, 500, anchor="middle"))
        b.append(rect(M + 420, ay, 190, 62, 0.85, SW * 1.5, r=10))
        t.append(text(M + 515, ay + 39, bb, 22, 0.95, 500, anchor="middle"))
        b.append(arrow(M + 246, M + 404, ay + 31, 0.8, SW * 1.4))
        t.append(text(M + 660, ay + 39, meaning, 18, 0.55))
    b.append(seg(M, M + 246, M + AW, M + 246, 0.22, SW))
    t.append(text(M + AW, M + 26, "the same six words", 16, 0.4, anchor="end"))
    t.append(text(M + AW, M + 276, "one word moved", 16, 0.4, anchor="end"))
    return "".join(b), "".join(t)


def ai_mode():
    """AI Mode nam BEN TRONG trang ket qua, khong phai mot tab chat rieng. Nen
    ve dung the: ket qua o duoi, cuoc doi dap o tren, chung mot trang."""
    b, t = [], []
    b.append(rect(M, M, AW, 56, 0.95, SW * 1.5, r=28))
    b.append(magnifier(M + 34, M + 28, 10, 0.75))
    t.append(text(M + 62, M + 35, "who won the 2022 world cup final", 19, 0.88))
    tx = M
    for name in ("All", "AI Mode", "Images", "News"):
        on = name == "AI Mode"
        t.append(text(tx, M + 100, name, 16, 1.0 if on else 0.4,
                      500 if on else 400))
        if on:
            b.append(seg(tx - 2, M + 114, tx + 74, M + 114, 1.0, SW * 1.2))
        tx += len(name) * 9.6 + 36

    b.append(rect(M, M + 138, AW, 210, 0.9, SW * 1.4, fill="0.045", r=18))
    b.append(spark(M + 34, M + 176, 12, 0.95))
    t.append(text(M + 64, M + 184, "Argentina beat France 4–2 on penalties.",
                  18, 0.72))
    b.append(rect(M + 480, M + 210, 320, 42, 0.5, SW, fill="0.07", r=15))
    t.append(text(M + 500, M + 237, "Who took the penalties?", 15, 0.6))
    t.append(text(M + 34, M + 288, "Messi, Paredes, Montiel and Dybala scored.",
                  18, 0.72))
    b.append(rect(M + 24, M + 306, AW - 48, 34, 0.32, SW, r=17))
    t.append(text(M + 46, M + 329, "Ask a follow-up", 14, 0.38))

    for i in range(2):
        y = M + 388 + i * 62
        b.append(dot(M + 10, y - 6, 8, 0.45, hollow=True))
        t.append(text(M + 30, y, "en.wikipedia.org › 2022 FIFA World Cup final"
                      if i == 0 else "fifa.com › tournaments › qatar-2022",
                      14, 0.45))
        t.append(text(M, y + 30, "2022 FIFA World Cup final" if i == 0
                      else "Final: Argentina 3–3 France", 21, 1.0, 500))
    return "".join(b), "".join(t)


def search_quality():
    """Do dong gop cua tung tang. Day la mot dai luong, nen bieu do cot la
    dung — va ket qua la BM25 gan nhu khong dong gop gi."""
    b, t = [], []
    rows = (("neural reranker", 0.23, True), ("PageRank", 0.06, False),
            ("AI Overviews", 0.05, False), ("BM25 keyword match", 0.01, False))
    bx = M + 330
    bw = AW - 430
    t.append(text(M, M + 6, "WHAT EACH STAGE IS WORTH", 14, 0.35, 500))
    t.append(text(M + AW, M + 6, "nDCG@10, 50 labelled queries", 14, 0.35,
                  anchor="end"))
    for i, (name, v, hero) in enumerate(rows):
        y = M + 92 + i * 104
        t.append(text(bx - 26, y + 9, name, 19, 0.95 if hero else 0.6,
                      500 if hero else 400, anchor="end"))
        b.append(rect(bx, y - 18, bw * (v / 0.25), 54, 0.9 if hero else 0.45,
                      SW * (1.6 if hero else 1.1),
                      fill="0.16" if hero else "0.06", r=6))
        t.append(text(bx + bw * (v / 0.25) + 20, y + 9, f"+{v:.2f}",
                      21 if hero else 18, 0.95 if hero else 0.5,
                      600 if hero else 400, mono=True))
    return "".join(b), "".join(t)


def team_failed():
    """Chinh cuoc doi thoai mo bai. Ba cau hoi, ba cau tra loi, va cau cuoi la
    mot o trong — do la toan bo bai viet."""
    b, t = [], []
    qa = (("How long have you been in charge of AI?", "Roughly a year."),
          ("Did our costs go down?", "No. They went up."),
          ("How many people have we replaced?", "None. We hired more."),
          ("So what have you been doing?", None))
    for i, (q, a) in enumerate(qa):
        y = M + 46 + i * 118
        b.append(rect(M, y - 32, 560, 62, 0.5, SW * 1.2, fill="0.04", r=14))
        t.append(text(M + 24, y + 6, q, 18, 0.7))
        if a:
            b.append(rect(M + 600, y - 32, 440, 62, 0.85, SW * 1.4, r=14))
            t.append(text(M + 624, y + 6, a, 18, 0.9, 500))
        else:
            b.append(rect(M + 600, y - 32, 440, 62, 0.7, SW * 1.4, r=14,
                          dash="9 8"))
            b.append(caret_block(M + 624, y - 6, 0.9))
    return "".join(b), "".join(t)


def blueprint():
    """Ve cac SAN PHAM chuan hoa, khong ve quy trinh cua nguoi: moi o la mot
    artifact, va agent duoc gan vao artifact ma no sinh ra. 55 o, 19 da co."""
    b, t = [], []
    cols, rows = 11, 5
    cw = (AW - 300) / cols
    ch = (AH - 60) / rows
    # 19 trong 55, chon bang ham bam nen rai khap luoi thay vi don mot goc
    built = set(sorted(range(cols * rows), key=lambda i: hashf(i, 11))[:19])
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            x, y = M + c * cw, M + 40 + r * ch
            on = i in built
            b.append(rect(x + 5, y + 5, cw - 12, ch - 12, 0.9 if on else 0.28,
                          SW * (1.4 if on else 0.9), r=5,
                          fill="0.09" if on else None))
            if on:
                b.append(spark(x + cw / 2, y + ch / 2, 9, 0.85, SW * 0.75))
    t.append(text(M, M + 12, "55 ARTIFACTS THE BUSINESS ALREADY PRODUCES", 14,
                  0.35, 500))
    rx = M + AW - 250
    t.append(text(rx, M + 96, "19", 62, 1.0, 600))
    t.append(text(rx, M + 130, "have an agent", 16, 0.5))
    t.append(text(rx, M + 210, "36", 62, 0.35, 600))
    t.append(text(rx, M + 244, "do not, yet", 16, 0.35))
    t.append(text(rx, M + 330, "the order comes from", 15, 0.42))
    t.append(text(rx, M + 354, "the artifact, not from", 15, 0.42))
    t.append(text(rx, M + 378, "anyone's job title", 15, 0.42))
    return "".join(b), "".join(t)


def agent_platform():
    """Moi agent moi re hon cai truoc. Cai moi nhat ton dung mot file Markdown
    va mot thu muc — nen ve dung mot thu muc, va duong chi phi di xuong."""
    b, t = [], []
    # duong chi phi moi agent
    ox, oy = M, M + AH - 40
    ww, hh = AW - 420, AH - 130
    b.append(seg(ox, oy, ox + ww, oy, 0.4, SW))
    b.append(seg(ox, oy, ox, oy - hh, 0.4, SW))
    pts = []
    for i in range(19):
        x = ox + (i / 18) * ww
        v = 1.0 / (1 + 0.42 * i) ** 0.9
        pts.append((x, oy - v * hh * 0.92))
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    b.append(f'<path d="{d}" fill="none" stroke="currentColor" '
             f'stroke-opacity="1" stroke-width="{SW * 2.2}" '
             f'stroke-linecap="round"/>')
    for x, y in pts:
        b.append(dot(x, y, 6, 0.85))
    t.append(text(ox, oy - hh - 14, "COST OF THE NEXT AGENT", 14, 0.35, 500))
    t.append(text(ox + ww, oy + 34, "nineteen agents in", 15, 0.4,
                  anchor="end"))

    # cai moi nhat: mot thu muc va mot file
    fx = M + AW - 340
    fy = M + 130
    b.append(f'<path d="M{fx},{fy + 44} L{fx},{fy} L{fx + 74},{fy} '
             f'L{fx + 92},{fy + 26} L{fx + 250},{fy + 26} L{fx + 250},'
             f'{fy + 216} L{fx},{fy + 216} Z" fill="none" stroke="currentColor" '
             f'stroke-opacity="0.95" stroke-width="{SW * 1.8}" '
             f'stroke-linejoin="round"/>')
    b.append(sheet(fx + 46, fy + 74, 118, 118, 0.7, fill="0.04"))
    t.append(text(fx + 105, fy + 118, "SKILL", 15, 0.75, 500, anchor="middle",
                  mono=True))
    t.append(text(fx + 105, fy + 146, ".md", 15, 0.5, anchor="middle",
                  mono=True))
    t.append(text(fx + 125, fy + 264, "the nineteenth agent", 17, 0.6, 500,
                  anchor="middle"))
    t.append(text(fx + 125, fy + 288, "cost one folder", 17, 0.45,
                  anchor="middle"))
    return "".join(b), "".join(t)


def cms_pipeline():
    """Google Doc vao, ban nhap WordPress ra, va o giua la mot lan goi model
    duy nhat de doc cau truc CMS."""
    b, t = [], []
    dw, dh = 150, 210
    dy = M + (AH - dh) / 2
    b.append(sheet(M, dy, dw, dh, 0.5))
    b.append(seg(M + 22, dy + 46, M + 22 + (dw - 60) * 0.8, dy + 46, 0.55,
                 SW * 1.5))
    for i, f in enumerate((0.86, 0.7, 0.9, 0.62, 0.8)):
        b.append(seg(M + 22, dy + 84 + i * 24, M + 22 + (dw - 48) * f,
                     dy + 84 + i * 24, 0.28, SW * 0.9))
    t.append(text(M + dw / 2, dy + dh + 34, "Google Docs", 16, 0.5,
                  anchor="middle"))
    b.append(arrow(M + dw + 22, M + dw + 66, M + AH / 2, 0.45))

    cx0, cw = M + 250, 320
    b.append(rect(cx0, M + 110, cw, 150, 0.95, SW * 1.8, fill="0.05", r=12))
    b.append(spark(cx0 + 32, M + 148, 13, 1.0))
    t.append(text(cx0 + 56, M + 156, "Map the CMS", 20, 0.95, 500))
    cb, ct = chip(cx0 + cw - 106, M + 132, 88, 28, "once", 13.5, 0.5, 0.6)
    b.append(cb)
    t.append(ct)
    for i, line in enumerate(("h2      → wp:heading", "figure  → wp:image")):
        t.append(text(cx0 + 32, M + 196 + i * 30, line, 15, 0.55, mono=True))
    for i, label in enumerate(("title tag under 60", "exactly one H1",
                               "three internal links")):
        y = M + 296 + i * 38
        b.append(rect(cx0 + 16, y, 20, 20, 0.55, SW, r=4))
        b.append(check(cx0 + 26, y + 10, 6, 0.55))
        t.append(text(cx0 + 48, y + 16, label, 15, 0.5))
    b.append(arrow(cx0 + cw + 22, cx0 + cw + 66, M + AH / 2, 0.45))

    ax = cx0 + cw + 90
    aw = M + AW - ax
    b.append(rect(ax, M, aw, AH, 1.0, SW * 1.9, r=10))
    b.append(seg(ax, M + 48, ax + aw, M + 48, 0.45, SW))
    for i in range(3):
        b.append(dot(ax + 24 + i * 18, M + 24, 5, 0.4))
    b.append(rect(ax + 84, M + 12, aw * 0.56, 24, 0.26, SW, r=12))
    t.append(text(ax + 26, M + 104, "How to choose running", 22, 1.0, 500))
    t.append(text(ax + 26, M + 134, "shoes for flat feet", 22, 1.0, 500))
    b.append(picture(ax + 26, M + 162, aw - 52, 110, 0.45))
    t.append(text(ax + 26, M + 316, "What to look for", 18, 0.85, 500))
    for i, f in enumerate((0.96, 0.86, 0.7)):
        b.append(seg(ax + 26, M + 344 + i * 22, ax + 26 + (aw - 52) * f,
                     M + 344 + i * 22, 0.28, SW * 0.9))
    return "".join(b), "".join(t)


def cross_encoder():
    """Kien truc cross-encoder: truy van va tai lieu noi lai thanh MOT chuoi,
    di qua mo hinh, ra mot diem duy nhat. Va diem cua ban tu train thi thap
    hon han ban co san."""
    b, t = [], []
    bx = M
    t.append(text(bx, M + 14, "[CLS]  query  [SEP]  document  [SEP]", 22, 0.9,
                  500, mono=True))
    for i in range(14):
        x = bx + 20 + i * 46
        b.append(rect(x, M + 44, 34, 34, 0.4, SW, r=4))
    b.append(rect(bx, M + 104, 660, 130, 0.95, SW * 1.8, r=12))
    t.append(text(bx + 330, M + 154, "cross-encoder", 22, 0.95, 500,
                  anchor="middle"))
    t.append(text(bx + 330, M + 186, "query and document read together", 15,
                  0.45, anchor="middle"))
    for i in range(14):
        x = bx + 20 + i * 46
        b.append(seg(x + 17, M + 78, x + 17, M + 104, 0.3, SW * 0.8))
    b.append(seg(bx + 330, M + 234, bx + 330, M + 268, 0.5, SW))
    b.append(seg(bx + 322, M + 258, bx + 330, M + 268, 0.5, SW))
    b.append(seg(bx + 338, M + 258, bx + 330, M + 268, 0.5, SW))
    b.append(rect(bx + 240, M + 274, 180, 56, 0.9, SW * 1.5, r=10))
    t.append(text(bx + 330, M + 310, "one score", 19, 0.9, 500,
                  anchor="middle"))

    rx = M + AW - 300
    t.append(text(rx, M + 60, "nDCG@10", 14, 0.35, 500))
    for i, (name, v, mine) in enumerate((("ms-marco MiniLM", 0.72, False),
                                         ("mine, from scratch", 0.31, True))):
        y = M + 110 + i * 130
        t.append(text(rx, y, name, 17, 0.9 if mine else 0.6,
                      500 if mine else 400))
        b.append(rect(rx, y + 16, 260 * v, 44, 0.9 if mine else 0.5,
                      SW * 1.3, fill="0.16" if mine else "0.06", r=6))
        t.append(text(rx + 260 * v + 16, y + 46, f"{v:.2f}", 20,
                      0.95 if mine else 0.5, 600, mono=True))
    t.append(text(rx, M + 400, "a week of work, and", 16, 0.45))
    t.append(text(rx, M + 424, "not close", 16, 0.45))
    return "".join(b), "".join(t)


def seo_history():
    """Bon the he trong hai nam, va nguong "dang duoc". Ba cai dau khong voi
    toi, cai thu tu vuot qua — do la ca bai."""
    b, t = [], []
    ox, oy = M + 60, M + AH - 70
    ww, hh = AW - 200, AH - 150
    bar = oy - hh * 0.82
    b.append(seg(ox - 30, bar, ox + ww + 30, bar, 0.85, SW * 1.6, dash="12 9"))
    t.append(text(ox + ww + 34, bar - 10, "what an expert", 15, 0.6, 500))
    t.append(text(ox + ww + 34, bar + 14, "would publish", 15, 0.45))
    gens = (("one prompt", 0.24, "2024"), ("fine-tuned", 0.46, "2025"),
            ("reasoning agent", 0.68, "2025"), ("app + agent", 1.0, "2026"))
    cw = ww / len(gens)
    for i, (name, v, when) in enumerate(gens):
        x = ox + i * cw + cw * 0.18
        w_ = cw * 0.62
        top = oy - hh * 0.82 * v
        hero = v >= 1.0
        b.append(rect(x, top, w_, oy - top, 0.95 if hero else 0.45,
                      SW * (1.7 if hero else 1.1),
                      fill="0.16" if hero else "0.05", r=6))
        t.append(text(x + w_ / 2, oy + 32, name, 16, 0.9 if hero else 0.55,
                      500 if hero else 400, anchor="middle"))
        t.append(text(x + w_ / 2, oy + 54, when, 13, 0.35, anchor="middle"))
        if hero:
            b.append(spark(x + w_ / 2, top - 30, 13, 0.95))
    b.append(seg(ox - 30, oy, ox + ww + 30, oy, 0.4, SW))
    t.append(text(M, M + 8, "TWO YEARS, FOUR ARCHITECTURES", 14, 0.35, 500))
    return "".join(b), "".join(t)


def wrong_quote():
    """Hai ban bao gia giong het nhau ve hinh dang. Mot cai dung, mot cai sai —
    va cho sai chi la mot con so. Do dung la ten bai."""
    b, t = [], []
    cw = (AW - 80) / 2
    rows = (("Technical audit", "18.000.000", "18.000.000"),
            ("Content, 12 a month", "96.000.000", "96.000.000"),
            ("Digital PR", "54.000.000", "54.000.000"),
            ("Reporting", "9.600.000", "9.600.000"))
    for side in (0, 1):
        x = M + side * (cw + 80)
        wrong = side == 1
        b.append(rect(x, M, cw, AH, 1.0 if wrong else 0.55,
                      SW * (1.9 if wrong else 1.4), r=10))
        t.append(text(x + 28, M + 48, "Quote", 22, 0.9 if wrong else 0.6, 500))
        t.append(text(x + cw - 28, M + 48, "Q-2026-118" if not wrong
                      else "Q-2026-119", 13, 0.4, anchor="end", mono=True))
        b.append(seg(x, M + 72, x + cw, M + 72, 0.3, SW))
        for i, (label, good, bad) in enumerate(rows):
            y = M + 116 + i * 52
            t.append(text(x + 28, y, label, 15, 0.55))
            val = bad if wrong else good
            if wrong and i == 2:
                val = "5.400.000"
            t.append(text(x + cw - 28, y, val, 15, 0.85 if not (wrong and i == 2)
                          else 1.0, anchor="end", mono=True))
            if wrong and i == 2:
                b.append(ellipse(x + cw - 92, y - 6, 84, 22, 1.0, SW * 1.6))
        b.append(seg(x + cw * 0.44, M + 344, x + cw - 28, M + 344, 0.4, SW))
        t.append(text(x + cw * 0.44, M + 386, "Total", 16, 0.7, 500))
        t.append(text(x + cw - 28, M + 386,
                      "177.600.000 ₫" if wrong else "189.600.000 ₫",
                      21, 1.0, 600, anchor="end"))
        t.append(text(x + 28, M + AH - 20, "wrong by one line" if wrong
                      else "right", 15, 0.5 if not wrong else 0.85,
                      500 if wrong else 400))
    return "".join(b), "".join(t)


def search_series():
    """Ca chuoi bai trong mot hang: thu thap, lap chi muc, xep hang, xep lai,
    tra loi. Nam chang, moi chang mot dau hieu rieng."""
    b, t = [], []
    stages = (("crawl", "pages fetched"), ("index", "word to pages"),
              ("rank", "BM25 + PageRank"), ("rerank", "a neural model"),
              ("answer", "with its sources"))
    n = len(stages)
    gap = 44
    cw = (AW - gap * (n - 1)) / n
    cy = M + AH / 2
    for i, (name, sub) in enumerate(stages):
        x = M + i * (cw + gap)
        b.append(rect(x, cy - 96, cw, 192, 0.95 if i == n - 1 else 0.6,
                      SW * (1.8 if i == n - 1 else 1.3), r=12,
                      fill="0.05" if i == n - 1 else None))
        gx, gy = x + cw / 2, cy - 34
        if i == 0:
            b.append(rect(gx - 22, gy - 26, 44, 52, 0.85, SW * 1.3, r=4))
            b.append(dot(gx + 34, gy + 20, 6, 0.5))
            b.append(seg(gx + 20, gy + 16, gx + 30, gy + 20, 0.5, SW * 0.9))
        elif i == 1:
            for r in range(3):
                for c in range(4):
                    if (r + c) % 2 == 0:
                        b.append(dot(gx - 26 + c * 18, gy - 16 + r * 18, 4.6,
                                     0.8))
        elif i == 2:
            for k, v in enumerate((0.9, 0.6, 0.35)):
                b.append(rect(gx - 30, gy - 22 + k * 18, 60 * v, 11, 0.0, SW,
                              fill="0.55", r=2))
        elif i == 3:
            b.append(seg(gx - 28, gy + 18, gx - 28, gy - 20, 0.75, SW * 1.4))
            b.append(seg(gx, gy + 18, gx, gy - 4, 0.5, SW * 1.4))
            b.append(seg(gx + 28, gy + 18, gx + 28, gy - 26, 0.9, SW * 1.4))
            b.append(arrow(gx + 12, gx + 34, gy - 34, 0.7, SW))
        else:
            b.append(spark(gx, gy - 4, 20, 0.95))
        t.append(text(x + cw / 2, cy + 42, name, 20, 0.95, 500,
                      anchor="middle"))
        t.append(text(x + cw / 2, cy + 66, sub, 13, 0.4, anchor="middle"))
        if i < n - 1:
            b.append(arrow(x + cw + 8, x + cw + gap - 8, cy, 0.45))
    t.append(text(M, M + 10, "A SEARCH ENGINE, END TO END", 14, 0.35, 500))
    return "".join(b), "".join(t)


COVERS = {
    "the-chinese-ai-wisdom": chinese_wisdom,
    "liu-xiaopai-and-chinese-vibe-code-rush": vibe_code,
    "agentic-keyword-clustering": keyword_clustering,
    "web-crawling-in-search-engines": web_crawling,
    "designing-the-web-crawler": crawler_design,
    "inverted-index": inverted_index,
    "ranking-with-bm25": bm25,
    "ranking-with-pagerank": pagerank,
    "ai-overviews": ai_overviews,
    "neural-reranking-with-bert": bert,
    "ai-mode": ai_mode,
    "measuring-search-quality": search_quality,
    "why-our-ai-team-failed": team_failed,
    "an-artifact-driven-ai-initiative-blueprint": blueprint,
    "an-agent-platform-on-the-claude-agent-sdk": agent_platform,
    "a-cms-adaptable-llm-pipeline-for-seo-compliant-content-publishing":
        cms_pipeline,
    "i-wrote-a-transformer-by-hand": cross_encoder,
    "a-brief-history-of-seo-content-writing-with-ai": seo_history,
    "a-wrong-quote-that-looks-like-a-right-one": wrong_quote,
    "series-building-a-mini-search-engine": search_series,
}


def main():
    want = sys.argv[1:]
    for name, fn in COVERS.items():
        if want and name not in want:
            continue
        strokes, labels = fn()
        p = OUT / f"{name}.svg"
        p.write_text(cover_svg(strokes, labels, W, H), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
