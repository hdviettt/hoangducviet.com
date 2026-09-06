"""Featured media cua Work: giao dien that cua tung du an, ve tay.

Moi net ve nam trong scripts/doodle.py — cung mot bo voi anh bia va hinh trong
bai, vi ca ba phai la mot ngon ngu.

    python scripts/make-work-field.py
"""

import math
from pathlib import Path

from doodle import (  # noqa: F401
    AH, AW, H, INK, M, SW, W, agent_panel, arc, arrow, caret_block, check,
    chip, cursor, dot, ellipse, filechip, hashf, magnifier, mark, picture,
    progress, rect, seg, sheet, spark, text, white, work_svg,
)

OUT = Path(__file__).resolve().parent.parent / "public" / "work"


# ------------------------------------------------------------------- canh


def platform():
    """Nen tang, ve dung nhu mot nen tang: mot THU VIEN GIAI PHAP. Cot trai la
    dieu huong that, giua la cac agent bay tren luoi the, va cot phai la ho so
    day du cua mot agent — model nao, noi vao dau, ai duoc dung, het bao nhieu
    tien, va ban do nhiet cua muc dung.

    Mot danh sach cong viec thi Notion cung co. Cai chi mot nen tang moi co la
    ho so cua tung agent va so lieu chay kem no."""
    b, t = [], []
    x0, y0, w, h = M, 72, AW, AH
    b.append(rect(x0, y0, w, h, 1.0, SW * 1.9, r=10))
    b.append(seg(x0, y0 + 44, x0 + w, y0 + 44, 0.4, SW))
    for i in range(3):
        b.append(dot(x0 + 24 + i * 17, y0 + 22, 4.5, 0.4))
    t.append(text(x0 + 92, y0 + 27, "AI platform · SEONGON", 13, 0.45))
    for i in range(4):
        cx = x0 + w - 96 + i * 24
        b.append(dot(cx, y0 + 22, 9, 0.45 if i < 3 else 0.85, hollow=True))
        if i == 3:
            b.append(spark(cx, y0 + 22, 5.4, 0.85, SW * 0.65))

    # ------- cot dieu huong
    nav = x0 + 138
    b.append(seg(nav, y0 + 44, nav, y0 + h, 0.3, SW * 0.9))
    t.append(text(x0 + 24, y0 + 76, "WORKSPACE", 9.5, 0.3, 500))
    for i, (label, kind) in enumerate((("Library", "tag"), ("Runs", "flow"),
                                       ("Datasets", "deck"),
                                       ("Connectors", "link"),
                                       ("Usage", "cluster"),
                                       ("Access", "pen"))):
        y = y0 + 106 + i * 32
        on = i == 0
        if on:
            b.append(rect(x0 + 12, y - 14, 116, 26, 0.0, SW, fill="0.10", r=7))
        b.append(mark(kind, x0 + 30, y - 4, 7, 0.9 if on else 0.4))
        t.append(text(x0 + 46, y, label, 12.5, 0.9 if on else 0.45,
                      500 if on else 400))
    b.append(seg(x0, y0 + h - 62, nav, y0 + h - 62, 0.25, SW * 0.9))
    b.append(dot(x0 + 30, y0 + h - 34, 9, 0.45, hollow=True))
    t.append(text(x0 + 46, y0 + h - 30, "Viet · Owner", 11.5, 0.45))

    # ------- thu vien
    lib = nav
    t.append(text(lib + 24, y0 + 82, "Solution library", 17, 1.0, 500))
    t.append(text(lib + 24, y0 + 102, "23 in production · 4 running now", 11,
                  0.4))
    cb, ct = chip(lib + 236, y0 + 62, 132, 26, "Search", 11.5, 0.3, 0.35)
    b.append(cb)
    b.append(magnifier(lib + 252, y0 + 75, 6, 0.3, SW * 0.8))
    t.append(text(lib + 266, y0 + 79, "Search", 11.5, 0.3))
    for i, (label, on) in enumerate((("All", True), ("Agents", False),
                                     ("Workflows", False), ("ML", False))):
        wl = len(label) * 6.6 + 22
        cx = lib + 24 + sum(len(l) * 6.6 + 32 for l, _ in
                            (("All", True), ("Agents", False),
                             ("Workflows", False), ("ML", False))[:i])
        cb, ct = chip(cx, y0 + 118, wl, 22, label, 11, 0.75 if on else 0.28,
                      0.9 if on else 0.4)
        b.append(cb)
        t.append(ct)

    cards = (("Keyword clustering", "cluster", "1,240 runs", False),
             ("Content writer", "pen", "running now", True),
             ("Quoting agent", "tag", "312 runs", False),
             ("Internal linking", "link", "6,900 runs", False),
             ("Deck builder", "deck", "148 runs", False),
             ("Publishing pipeline", "flow", "2,014 runs", False))
    for i, (name, kind, meta, on) in enumerate(cards):
        cx = lib + 22 + (i % 2) * 194
        cy = y0 + 158 + (i // 2) * 96
        b.append(rect(cx, cy, 178, 80, 1.0 if on else 0.35,
                      SW * (1.7 if on else 1.0), r=9,
                      fill="0.05" if on else None))
        b.append(mark(kind, cx + 26, cy + 26, 10, 0.95 if on else 0.5))
        t.append(text(cx + 46, cy + 31, name, 12.5, 0.95 if on else 0.6,
                      500 if on else 400))
        t.append(text(cx + 20, cy + 60, meta, 10.5, 0.5 if on else 0.32))
        b.append(dot(cx + 158, cy + 22, 4, 0.9 if on else 0.25))

    # ------- ho so cua agent dang chon
    rx = lib + 416
    b.append(seg(rx, y0 + 44, rx, y0 + h, 0.3, SW * 0.9))
    b.append(mark("pen", rx + 30, y0 + 78, 12, 0.95))
    t.append(text(rx + 52, y0 + 76, "Content writer", 16, 1.0, 500))
    b.append(dot(rx + 54, y0 + 94, 4, 0.85))
    t.append(text(rx + 64, y0 + 98, "running · 7 of 12", 11, 0.5))
    b.append(seg(rx + 20, y0 + 116, x0 + w - 20, y0 + 116, 0.22, SW * 0.9))

    t.append(text(rx + 22, y0 + 142, "MODEL", 9.5, 0.3, 500))
    cb, ct = chip(rx + 22, y0 + 152, 132, 24, "claude-sonnet", 11, 0.45, 0.75,
                  mono_=True)
    b.append(cb)
    t.append(ct)

    t.append(text(rx + 22, y0 + 202, "CONNECTORS", 9.5, 0.3, 500))
    for i, (label, wl) in enumerate((("Google Docs", 82), ("WordPress", 76),
                                     ("DataForSEO", 80))):
        cx = rx + 22 + (0 if i < 2 else 0) + (i % 2) * 88
        cy = y0 + 212 + (i // 2) * 30
        cb, ct = chip(cx, cy, wl, 24, label, 10.5, 0.4, 0.6)
        b.append(cb)
        t.append(ct)

    t.append(text(rx + 22, y0 + 292, "ACCESS", 9.5, 0.3, 500))
    t.append(text(rx + 22, y0 + 314, "30 teams · 120 people", 12.5, 0.7))
    t.append(text(rx + 22, y0 + 348, "COST THIS MONTH", 9.5, 0.3, 500))
    t.append(text(rx + 22, y0 + 372, "$412", 19, 0.95, 500))
    t.append(text(rx + 78, y0 + 372, "−18% vs last", 11, 0.4))

    t.append(text(rx + 22, y0 + 396, "USAGE · LAST 5 WEEKS", 9.5, 0.3, 500))
    t.append(text(x0 + w - 22, y0 + 396, "Mon – Sun", 9.5, 0.28,
                  anchor="end"))
    for r in range(5):
        for c in range(7):
            v = hashf(r * 7 + c, 5)
            b.append(rect(rx + 22 + c * 17, y0 + 408 + r * 17, 13, 13, 0.0,
                          SW, fill=f"{0.07 + 0.78 * v * v:.2f}", r=2))
    return "".join(b), "".join(t)


def search():
    """Trang ket qua that: cau tra loi AI keo het chieu ngang, ba nguon trich,
    va o hoi tiep NAM TRONG chinh khoi tra loi do — vi cuoc doi dap thuoc ve
    cau tra loi, khong phai mot o roi ben duoi."""
    b, t = [], []
    b.append(rect(M, 72, AW, 54, 0.95, SW * 1.4, r=27))
    b.append(magnifier(M + 34, 99, 10, 0.8))
    t.append(text(M + 62, 106, "who won the 2022 world cup final", 19, 0.88))
    b.append(seg(M + 372, 86, M + 372, 112, 0.5, SW * 1.2))

    tx = M
    for name in ("All", "AI Mode", "Images", "News"):
        on = name == "AI Mode"
        t.append(text(tx, 158, name, 14.5, 1.0 if on else 0.4,
                      500 if on else 400))
        if on:
            b.append(seg(tx - 2, 171, tx + 66, 171, 1.0, SW * 1.1))
        tx += len(name) * 8.6 + 32

    b.append(rect(M, 190, AW, 190, 0.9, SW * 1.3, fill="0.045", r=16))
    b.append(spark(M + 30, 222, 11, 0.95))
    t.append(text(M + 56, 228,
                  "Argentina beat France 4–2 on penalties after a 3–3 draw in",
                  15.5, 0.72))
    t.append(text(M + 30, 252,
                  "Lusail. Messi scored twice and Mbappé took a hat-trick, the",
                  15.5, 0.72))
    t.append(text(M + 30, 276,
                  "first in a final since 1966.", 15.5, 0.72))
    for i, (label, w_) in enumerate((("fifa.com", 84), ("espn.com", 88),
                                     ("wikipedia.org", 108))):
        cx = M + 28 + i * 106
        cb, ct = chip(cx, 294, w_, 24, label, 12.5, 0.6, 0.7)
        b.append(cb)
        t.append(ct)
    # o hoi tiep, nam trong khoi tra loi
    b.append(seg(M + 20, 330, M + AW - 20, 330, 0.2, SW * 0.9))
    b.append(rect(M + 20, 342, AW - 40, 30, 0.35, SW * 0.95, r=15))
    t.append(text(M + 40, 362, "Ask a follow-up", 12.5, 0.38))
    b.append(seg(M + AW - 48, 357, M + AW - 38, 357, 0.8, SW * 0.9))
    b.append(seg(M + AW - 42, 353, M + AW - 38, 357, 0.8, SW * 0.9))
    b.append(seg(M + AW - 42, 361, M + AW - 38, 357, 0.8, SW * 0.9))

    for y, url, title, snips in (
        (420, "en.wikipedia.org › 2022 FIFA World Cup final",
         "2022 FIFA World Cup final",
         ("Argentina won their third title, and Messi his first, in a",
          "final decided on penalties after extra time.")),
        (528, "fifa.com › tournaments › qatar-2022",
         "Final: Argentina 3–3 France (4–2 pens)",
         ("Match report, line-ups and the penalty order.",)),
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
    dw, dh = 116, 168
    dy = 246
    b.append(sheet(M, dy, dw, dh, 0.5))
    b.append(seg(M + 18, dy + 34, M + 18 + (dw - 44) * 0.8, dy + 34, 0.55,
                 SW * 1.3))
    for i, f in enumerate((0.86, 0.7, 0.9, 0.62, 0.78)):
        b.append(seg(M + 18, dy + 62 + i * 19, M + 18 + (dw - 36) * f,
                     dy + 62 + i * 19, 0.28, SW * 0.85))
    t.append(text(M + dw / 2, dy + dh + 26, "Google Docs", 12.5, 0.5,
                  anchor="middle"))
    b.append(arrow(M + dw + 14, M + dw + 50, dy + dh / 2, 0.45))

    cx0, cw = M + 176, 258
    mid = cx0 + cw / 2
    b.append(rect(cx0, 96, cw, 40, 0.45, SW, r=8))
    t.append(text(cx0 + 18, 122, "GET /pub → HTML", 12.5, 0.6, mono=True))
    for y0_ in (136, 288):
        b.append(seg(mid, y0_, mid, y0_ + 24, 0.4, SW * 0.9))
        b.append(seg(mid - 5, y0_ + 17, mid, y0_ + 24, 0.4, SW * 0.9))
        b.append(seg(mid + 5, y0_ + 17, mid, y0_ + 24, 0.4, SW * 0.9))

    b.append(rect(cx0, 168, cw, 120, 0.95, SW * 1.7, fill="0.05", r=10))
    b.append(spark(cx0 + 24, 196, 10, 1.0))
    t.append(text(cx0 + 42, 201, "Map the CMS", 14.5, 0.95, 500))
    cb, ct = chip(cx0 + cw - 92, 184, 80, 22, "once", 11.5, 0.5, 0.6)
    b.append(cb)
    t.append(ct)
    for i, line in enumerate(("h2      → wp:heading",
                              "figure  → wp:image",
                              "table   → wp:table")):
        t.append(text(cx0 + 24, 230 + i * 22, line, 12, 0.55, mono=True))

    for i, label in enumerate(("title tag under 60", "exactly one H1",
                               "alt text on every image",
                               "three internal links",
                               "canonical set", "schema validates")):
        y = 330 + i * 30
        b.append(rect(cx0 + 8, y, 16, 16, 0.6 - 0.04 * i, SW * 0.95, r=3))
        b.append(check(cx0 + 16, y + 8, 5, 0.6 - 0.04 * i))
        t.append(text(cx0 + 36, y + 13, label, 12.5, 0.5))
    t.append(text(mid, 540, "nine checks · zero model calls", 12, 0.42,
                  anchor="middle"))
    b.append(arrow(cx0 + cw + 14, cx0 + cw + 50, 320, 0.45))

    ax = cx0 + cw + 68
    aw = M + AW - ax
    ay, ah = 76, 488
    ix, iw = ax + 26, aw - 52
    b.append(rect(ax, ay, aw, ah, 1.0, SW * 1.9, r=8))
    b.append(seg(ax, ay + 42, ax + aw, ay + 42, 0.45, SW))
    for i in range(3):
        b.append(dot(ax + 20 + i * 16, ay + 21, 4.5, 0.4))
    b.append(rect(ax + 74, ay + 10, aw * 0.62, 22, 0.26, SW * 0.9, r=11))
    t.append(text(ax + 86, ay + 26, "clientx.io/blog/running-shoes", 11, 0.45))
    t.append(text(ix, ay + 88, "How to choose running", 21, 1.0, 500))
    t.append(text(ix, ay + 115, "shoes for flat feet", 21, 1.0, 500))
    t.append(text(ix, ay + 142, "12 min read · updated today", 11.5, 0.4))
    b.append(picture(ix, ay + 158, iw, 108, 0.45))
    t.append(text(ix, ay + 300, "What to look for", 16.5, 0.85, 500))
    for i, f in enumerate((0.98, 0.9, 0.72)):
        b.append(seg(ix, ay + 322 + i * 19, ix + iw * f, ay + 322 + i * 19,
                     0.28, SW * 0.9))
    t.append(text(ix, ay + 408, "Arch support", 16.5, 0.85, 500))
    for i, f in enumerate((0.96, 0.86)):
        b.append(seg(ix, ay + 430 + i * 19, ix + iw * f, ay + 430 + i * 19,
                     0.28, SW * 0.9))
    return "".join(b), "".join(t)


def content():
    """Bai dang duoc viet, the goi y AI noi len tren doan chu, va ben phai la
    cau tra loi cua model dang chay ra."""
    b, t = [], []
    px, pw = M, 468
    py, ph = 72, AH
    ix, iw = px + 30, pw - 60
    b.append(rect(px, py, pw, ph, 1.0, SW * 1.9, r=6))
    t.append(text(ix, py + 50, "Running shoes for flat feet:", 21, 1.0, 500))
    t.append(text(ix, py + 78, "how to choose", 21, 1.0, 500))
    t.append(text(ix, py + 106, "Draft · 1,240 words · 9 of 9 H2s", 11.5, 0.4))
    t.append(text(ix, py + 146, "What to look for", 16.5, 0.88, 500))
    for i, f in enumerate((0.98, 0.9, 0.96, 0.64)):
        b.append(seg(ix, py + 174 + i * 21, ix + iw * f, py + 174 + i * 21,
                     0.26, SW * 0.9))

    hy, hh = py + 290, 178
    b.append(rect(px + 10, hy, pw - 20, hh, 0.0, SW, fill="0.055", r=8))
    b.append(seg(px + 14, hy + 8, px + 14, hy + hh - 8, 0.95, SW * 2.2))
    b.append(spark(ix + 4, hy + 24, 7, 0.9, SW * 0.75))
    t.append(text(ix + 18, hy + 28, "writing", 11, 0.7, 500))
    t.append(text(ix, hy + 62, "Arch support", 16.5, 0.95, 500))
    for i, f in enumerate((0.94, 0.86, 0.9)):
        b.append(seg(ix, hy + 92 + i * 21, ix + iw * f, hy + 92 + i * 21, 0.42,
                     SW * 0.95))
    b.append(seg(ix, hy + 155, ix + iw * 0.40, hy + 155, 0.5, SW * 1.1))
    b.append(caret_block(ix + iw * 0.40 + 8, hy + 146, 0.95))

    anchor_x, anchor_y = ix + iw * 0.28, py + 216
    b.append(dot(anchor_x, anchor_y - 5, 5.0, 0.85, hollow=True))
    cx0, cw, chh, cy0 = px + 200, 256, 104, py + 122
    b.append(white(cx0, cy0, cw, chh, 12))
    b.append(rect(cx0, cy0, cw, chh, 0.95, SW * 1.4, fill="0.05", r=12))
    b.append(spark(cx0 + 22, cy0 + 28, 9, 0.95, SW * 0.8))
    t.append(text(cx0 + 38, cy0 + 32, "Suggested edit", 12.5, 0.85, 500))
    t.append(text(cx0 + 18, cy0 + 56, "Cut the hedge, name the test", 11.5,
                  0.6))
    cb, ct = chip(cx0 + 18, cy0 + 68, 58, 24, "Apply", 11, 0.55, 0.8)
    b.append(cb)
    t.append(ct)
    cb, ct = chip(cx0 + 86, cy0 + 68, 70, 24, "Rewrite", 11, 0.3, 0.5)
    b.append(cb)
    t.append(ct)
    b.append(seg(cx0 + 10, cy0 + chh, anchor_x + 8, anchor_y - 10, 0.4,
                 SW * 0.85, dash="6 7"))

    rx, rw = 568, M + AW - 568
    rb, rt, anchor = agent_panel(
        rx, py, rw, ph, "Content agent", "Thought for 3s",
        'outline.read("flat-feet")', "9 H2s · intent ordered",
        ("Arch support is the section readers",
         "bounce on, so it opens with the test",
         "they can do at home, then the two",
         "shoe features that follow from it"),
        foot="checklist: 11 of 12 passing",
        tool2=('links.search("arch support")', "12 candidates · 3 kept"))
    b.append(rb)
    t.append(rt)
    b.append(seg(rx, anchor + 176, px + pw - 10, hy + 80, 0.35, SW * 0.85,
                 dash="6 7"))
    return "".join(b), "".join(t)


def presentation():
    """Dau vao that la mot cau lenh: thanh chat o tren voi hai file du lieu
    dinh kem. Ben duoi la bo slide dang duoc dung, voi vung agent dang viet
    khoanh lai, va cau tra loi cua model chay ra ben phai."""
    b, t = [], []
    b.append(rect(M, 72, AW, 96, 0.9, SW * 1.4, r=16, fill="0.03"))
    t.append(text(M + 24, 108,
                  "Create an SEO proposal for Client X from the attached data "
                  "files", 15.5, 0.85))
    fb, ft = filechip(M + 24, 122, 152, "traffic-2026.xlsx")
    b.append(fb)
    t.append(ft)
    fb, ft = filechip(M + 188, 122, 140, "keywords-q3.csv")
    b.append(fb)
    t.append(ft)
    b.append(rect(M + AW - 56, 106, 32, 32, 0.7, SW, r=16))
    b.append(seg(M + AW - 40, 130, M + AW - 40, 113, 0.9, SW))
    b.append(seg(M + AW - 46, 119, M + AW - 40, 113, 0.9, SW))
    b.append(seg(M + AW - 34, 119, M + AW - 40, 113, 0.9, SW))

    sx, sw_ = M, 500
    sy, sh = 196, 268
    b.append(rect(sx, sy, sw_, sh, 1.0, SW * 1.9, r=6))
    t.append(text(sx + 30, sy + 50, "Where the traffic will", 21, 1.0, 500))
    t.append(text(sx + 30, sy + 76, "come from", 21, 1.0, 500))
    t.append(text(sx + 30, sy + 100, "Client X · organic, 12 months", 12, 0.42))
    for i, line in enumerate(("Ten pages already on page two",
                              "62% of revenue sits in them",
                              "Two clusters still unranked")):
        yy = sy + 140 + i * 26
        b.append(dot(sx + 38, yy - 5, 4.2, 0.5))
        t.append(text(sx + 52, yy, line, 12.5, 0.6))
    gx, gy, gw_, gh = sx + 268, sy + 116, 200, 124
    b.append(rect(gx, gy, gw_, gh, 0.85, SW * 1.1, r=6, dash="7 6"))
    for hx, hy in ((gx, gy), (gx + gw_, gy), (gx, gy + gh),
                   (gx + gw_, gy + gh)):
        b.append(rect(hx - 4.5, hy - 4.5, 9, 9, 0.95, SW * 0.9))
    base = gy + gh - 24
    for i, (v, mon) in enumerate(((0.36, "Q1"), (0.60, "Q2"), (0.92, "Q3"))):
        bh = 74 * v
        bx = gx + 32 + i * 48
        b.append(rect(bx, base - bh, 28, bh, 0.7, SW * 0.95, fill="0.14"))
        t.append(text(bx + 14, base + 16, mon, 10.5, 0.4, anchor="middle"))
    b.append(seg(gx + 18, base, gx + gw_ - 18, base, 0.4, SW * 0.9))
    t.append(text(gx, gy - 9, "drafting", 11, 0.75, 500))

    tw, gap = 116, 12
    ty, th = 484, 76
    for i in range(4):
        tx = sx + i * (tw + gap)
        on = i == 2
        b.append(rect(tx, ty, tw, th, 1.0 if on else 0.3,
                      SW * (1.4 if on else 1.0), r=4))
        b.append(seg(tx + 12, ty + 24, tx + 12 + (tw - 24) * 0.7, ty + 24,
                     0.5 if on else 0.2, SW * 0.9))
        b.append(seg(tx + 12, ty + 44, tx + 12 + (tw - 24) * 0.44, ty + 44,
                     0.4 if on else 0.16, SW * 0.85))
        t.append(text(tx + tw - 10, ty + th - 10, str(i + 1), 10.5,
                      0.6 if on else 0.28, anchor="end", mono=True))

    rx, rw = 600, M + AW - 600
    rb, rt, anchor = agent_panel(
        rx, 196, rw, 364, "Deck agent", "Thought for 5s",
        'sheets.read("traffic-2026")', "3 sheets · 14 months",
        ("Slide 3 carries the argument: the",
         "opportunity is the ten pages that",
         "already rank on page two, not the",
         "ones that rank nowhere"),
        tool2=('chart.build("quarterly")', "3 series · geometry checked"))
    b.append(rb)
    t.append(rt)
    b.append(seg(rx, anchor + 176, gx + gw_ + 6, gy + 40, 0.35, SW * 0.85,
                 dash="6 7"))
    return "".join(b), "".join(t)


def keywords():
    """Ba chang, va o chang giua la HINH THU CUA DU LIEU tai tung buoc: tu khoa
    thanh mot vector, vector nen xuong hai chieu, hai chieu tu chum lai, chum
    duoc dat ten."""
    b, t = [], []
    lw = 196
    b.append(rect(M, 76, lw, 488, 0.5, SW * 1.2, r=6))
    t.append(text(M + 16, 104, "12,480 keywords", 13.5, 0.7, 500))
    b.append(seg(M, 118, M + lw, 118, 0.28, SW * 0.9))
    raw = ("running shoes for men", "how to choose running shoes",
           "nike pegasus 40", "cheap running shoes", "running shoe size chart",
           "running shoes for women", "adidas ultraboost",
           "trail running shoes", "best running shoes 2026",
           "marathon racing shoes", "running shoes for flat feet",
           "carbon plate shoes", "leather dress shoes", "high heels",
           "running shoes for kids", "hoka clifton 10")
    for i, kw in enumerate(raw):
        t.append(text(M + 14, 144 + i * 26, kw, 11.5,
                      max(0.14, 0.5 - 0.023 * i)))

    px, pw = M + 218, 168
    pmid = px + pw / 2
    for i, (label, tool) in enumerate((("embed", "voyage-3-large"),
                                       ("reduce", "UMAP"),
                                       ("cluster", "HDBSCAN"),
                                       ("name", "one cheap call"))):
        y = 92 + i * 120
        model = i == 3
        b.append(rect(px, y, pw, 92, 0.9 if model else 0.5,
                      SW * (1.6 if model else 1.1), r=8,
                      fill="0.05" if model else None))
        if model:
            b.append(spark(px + 20, y + 24, 8, 0.95, SW * 0.75))
            t.append(text(px + 34, y + 28, label, 13.5, 0.95, 500))
        else:
            t.append(text(px + 16, y + 28, label, 13.5, 0.75, 500))
        t.append(text(px + 16, y + 46, tool, 10.5, 0.42, mono=True))

        gy = y + 60
        if i == 0:
            for k in range(14):
                b.append(rect(px + 16 + k * 9.8, gy, 7.5, 18, 0.0, SW,
                              fill=f"{0.14 + 0.62 * hashf(k, 3):.2f}"))
        elif i == 1:
            for k in range(2):
                b.append(rect(px + 16 + k * 24, gy, 20, 18, 0.0, SW,
                              fill=f"{0.3 + 0.4 * k:.2f}"))
            t.append(text(px + 74, gy + 13, "→ (x, y)", 11, 0.42, mono=True))
        elif i == 2:
            for k in range(10):
                b.append(dot(px + 24 + (k % 5) * 12 + (k // 5) * 68,
                             gy + 8 + 7 * hashf(k, 7), 3.6, 0.75))
        else:
            cb, ct = chip(px + 16, gy - 2, 128, 22, "buy running shoes", 10.5,
                          0.6, 0.75)
            b.append(cb)
            t.append(ct)
        if i < 3:
            b.append(seg(pmid, y + 92, pmid, y + 112, 0.35, SW * 0.9))
            b.append(seg(pmid - 5, y + 105, pmid, y + 112, 0.35, SW * 0.9))
            b.append(seg(pmid + 5, y + 105, pmid, y + 112, 0.35, SW * 0.9))
    b.append(arrow(px + pw + 14, px + pw + 46, 320, 0.45))

    mx, my = px + pw + 64, 76
    mw, mh = M + AW - mx, 488
    for gi, (cx, cy, rx_, ry_, label, n) in enumerate((
            (0.28, 0.24, 0.20, 0.135, "buy running shoes", 16),
            (0.74, 0.30, 0.19, 0.135, "how to choose", 15),
            (0.46, 0.71, 0.23, 0.15, "by brand", 14))):
        ccx, ccy = mx + cx * mw, my + cy * mh
        b.append(ellipse(ccx, ccy, rx_ * mw, ry_ * mh, 0.45, SW * 0.9,
                         dash="8 8"))
        for i in range(n):
            a = hashf(i, gi) * 2 * math.pi
            r = 0.42 + 0.55 * hashf(i + 40, gi)
            b.append(dot(ccx + math.cos(a) * rx_ * mw * r,
                         ccy + math.sin(a) * ry_ * mh * r, 4.6, 0.85))
        t.append(text(ccx, ccy - ry_ * mh - 14, label, 13, 0.85, 500,
                      anchor="middle"))
    for ox, oy in ((0.05, 0.90), (0.16, 0.97), (0.94, 0.66)):
        b.append(dot(mx + ox * mw, my + oy * mh, 5.6, 0.7, hollow=True))
    t.append(text(mx + 0.02 * mw, my + 0.83 * mh, "3 outliers", 11.5, 0.45))
    return "".join(b), "".join(t)


def quoting():
    """Ban bao gia cua mot khach hang co ten, co dau, co ten mien; mot bang so
    tom tat o dau; hang muc chia thanh nhom va hang muc con; nhom dang duoc
    dinh gia to nen. Ben phai la cau tra loi cua model dang chay ra."""
    b, t = [], []
    px, pw = M, 468
    b.append(rect(px, 72, pw, AH, 1.0, SW * 1.9, r=6))

    lx, ly = px + 28, 96
    b.append(rect(lx, ly, 36, 36, 0.95, SW * 1.6, r=9))
    b.append(seg(lx + 9, ly + 27, lx + 27, ly + 9, 0.95, SW * 1.6))
    b.append(dot(lx + 26, ly + 26, 4.2, 0.95))
    t.append(text(lx + 50, ly + 17, "Client X", 20, 1.0, 500))
    t.append(text(lx + 50, ly + 34, "clientx.io", 11, 0.45, mono=True))
    t.append(text(px + pw - 28, ly + 17, "Quote Q-2026-118", 11.5, 0.5,
                  anchor="end", mono=True))
    t.append(text(px + pw - 28, ly + 34, "12 months · organic search", 11, 0.4,
                  anchor="end"))

    b.append(seg(px, 152, px + pw, 152, 0.3, SW * 0.9))
    for i, (v, label) in enumerate((("48", "articles"), ("12", "months"),
                                    ("18", "clusters"), ("41→58", "DR"))):
        cx = px + 32 + i * 108
        t.append(text(cx, 190, v, 21, 0.95, 500))
        t.append(text(cx, 208, label, 10.5, 0.4))
    bx, bw = px + 32, pw - 64
    for frac, off, op in ((0.506, 0.0, 1.0), (0.285, 0.506, 0.55),
                          (0.209, 0.791, 0.28)):
        b.append(seg(bx + bw * off, 228, bx + bw * (off + frac) - 6, 228, op,
                     SW * 2.8))
    for i, (label, off) in enumerate((("Content", 0.0), ("Authority", 0.506),
                                      ("Technical", 0.791))):
        t.append(text(bx + bw * off, 248, label, 10, 0.4))
    b.append(seg(px, 264, px + pw, 264, 0.3, SW * 0.9))

    for label, ax_, anch in (("Scope", px + 32, "start"),
                             ("Qty", px + pw * 0.70, "end"),
                             ("Amount", px + pw * 0.94, "end")):
        t.append(text(ax_, 288, label, 11, 0.38, anchor=anch))

    rows = (
        ("Technical audit", None, "18.000.000", 0, False),
        ("Crawl and log audit", "1", None, 1, False),
        ("Core Web Vitals", "1", None, 1, False),
        ("Schema rollout", "1", None, 1, False),
        ("Content programme", None, None, 0, True),
        ("Articles · 12 a month", "48", None, 1, True),
        ("Briefs and outlines", "48", None, 1, True),
        ("Internal linking passes", "12", None, 1, True),
        ("Authority", None, "54.000.000", 0, False),
        ("Digital PR placements", "6", None, 1, False),
        ("Monthly reporting", "12", "9.600.000", 0, False),
    )
    live_y = None
    for i, (label, qty, amount, depth, live) in enumerate(rows):
        y = 306 + i * 20
        if live and depth == 0:
            b.append(rect(px + 14, y - 15, pw - 28, 85, 0.0, SW, fill="0.07",
                          r=6))
            live_y = y + 20
        t.append(text(px + 32 + depth * 16, y, label,
                      12.5 if depth == 0 else 11.5,
                      (0.9 if live else 0.72) if depth == 0 else 0.45,
                      500 if depth == 0 else 400))
        if qty:
            t.append(text(px + pw * 0.70, y, qty, 11.5, 0.45, anchor="end"))
        if amount:
            t.append(text(px + pw * 0.94, y, amount, 12, 0.7, anchor="end",
                          mono=True))
        elif live and depth == 0:
            b.append(progress(px + pw * 0.94 - 84, y - 4, 84, 0.55))

    for ry in (520, 528):
        b.append(seg(px + pw * 0.50, ry, px + pw * 0.94, ry, 0.4, SW * 0.9))
    t.append(text(px + pw * 0.50, 552, "Total", 15.5, 0.8, 500))
    t.append(text(px + pw * 0.94, 552, "189.600.000 ₫", 20, 1.0, 600,
                  anchor="end"))

    rx, rw = 568, M + AW - 568
    rb, rt, anchor = agent_panel(
        rx, 72, rw, AH, "Quoting agent", "Thought for 6s",
        'serp.top10("seo agency hanoi")', "10 results · depth scored",
        ("Content is the biggest line here.",
         "The top three publish 11–14 pieces",
         "a month, so 12 holds parity without",
         "pricing the client out"),
        foot="two model calls, both bounded",
        tool2=('rates.card("content")', "agency rate card · 2026"))
    b.append(rb)
    t.append(rt)
    if live_y:
        b.append(seg(rx, anchor + 176, px + pw - 10, live_y, 0.35, SW * 0.85,
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
        p.write_text(work_svg(strokes, labels), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
