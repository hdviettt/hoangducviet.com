"""Ve lai 26 so do trong series search engine.

Cac hinh cu la anh raster: hop bo tron pastel tim/xanh/do, chu Inter, do ai
khac ve roi chup man hinh dan vao. Chung khong theo he doodle cua blog, khong
doi mau theo che do sang/toi, va khong phong to duoc.

Ban nay ve lai bang chinh thu vien doodle, xuat ra SVG inline. Noi dung giu
nguyen — cung con so, cung nhan, cung y — chi doi cach ve.

    python scripts/make-search-figures.py
    railway run --service database node scripts/push-image-figures.cjs \
        scripts/_search-figures.json
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from doodle import (  # noqa: E402
    SW, arc, arrow, article_svg, caret_block, chip, dot, ellipse, magnifier,
    person, rect, seg, sheet, spark, text,
)

OUT = Path(__file__).resolve().parent / "_search-figures.json"
W = 640


# ----------------------------------------------------------- khoi dung chung

def cap(y, s, size=11, op=0.35):
    """Tieu de nho chu hoa o dau mot khoi."""
    return text(0, y, s, size, op, 500)


def box(x, y, w, h, title, sub=None, strong=False, r=8, dash=None,
        tsize=12.5):
    """Mot hop co ten, va co the co mot dong phu ben duoi ten."""
    b = [rect(x, y, w, h, 0.95 if strong else 0.5, SW * (1.5 if strong else 1),
              r=r, fill="0.05" if strong else None, dash=dash)]
    t = [text(x + w / 2, y + (h / 2 + 4 if not sub else h / 2 - 3), title,
              tsize, 0.95 if strong else 0.8, 500, anchor="middle")]
    if sub:
        t.append(text(x + w / 2, y + h / 2 + 13, sub, 10, 0.5,
                      anchor="middle"))
    return "".join(b), "".join(t)


def down(x, y0, y1, op=0.35, sw=None):
    """Mui ten doc, dau quay xuong."""
    w = sw or SW * 0.9
    return (seg(x, y0, x, y1, op, w) + seg(x - 5, y1 - 6, x, y1, op, w)
            + seg(x + 5, y1 - 6, x, y1, op, w))


def up(x, y0, y1, op=0.35, sw=None):
    w = sw or SW * 0.9
    return (seg(x, y0, x, y1, op, w) + seg(x - 5, y1 + 6, x, y1, op, w)
            + seg(x + 5, y1 + 6, x, y1, op, w))


def diag(x0, y0, x1, y1, op=0.35, sw=None, dash=None):
    """Mui ten cheo, dau tinh theo huong that cua doan."""
    w = sw or SW * 0.9
    dx, dy = x1 - x0, y1 - y0
    L = (dx * dx + dy * dy) ** 0.5 or 1
    ux, uy = dx / L, dy / L
    out = [seg(x0, y0, x1, y1, op, w, dash=dash)]
    for s in (1, -1):
        out.append(seg(x1 - ux * 11 - s * uy * 5.5, y1 - uy * 11 + s * ux * 5.5,
                       x1, y1, op, w))
    return "".join(out)


def wrap(txt, n):
    """Cat mot cau thanh nhieu dong, theo TU.

    Ban truoc cat bang txt[:52] va txt[52:], va no cat dung giua chu
    "still" -> "st" + "ll". Mot lan cat sai la mot dong chu vo nghia."""
    out, line = [], ""
    for w in txt.split():
        if line and len(line) + 1 + len(w) > n:
            out.append(line)
            line = w
        else:
            line = f"{line} {w}".strip()
    if line:
        out.append(line)
    return out


def curve(x0, y0, x1, y1, lift, op=0.6, sw=None, dash=None):
    """Mot canh cong co dau mui ten that o dau den.

    `arc()` chi ve cung tron va khong co dau; hai canh cua mot vong hai nut
    ve bang arc() doc ra thanh mot hinh tron, khong ra hai chieu di."""
    w = sw or SW * 1.2
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2 - lift
    d = f'M{x0:.1f},{y0:.1f} Q{mx:.1f},{my:.1f} {x1:.1f},{y1:.1f}'
    out = [f'<path d="{d}" fill="none" stroke="currentColor" '
           f'stroke-opacity="{op:.2f}" stroke-width="{w:.2f}" '
           f'stroke-linecap="round"'
           + (f' stroke-dasharray="{dash}"' if dash else "") + '/>']
    tx, ty = x1 - mx, y1 - my
    L = (tx * tx + ty * ty) ** 0.5 or 1
    tx, ty = tx / L, ty / L
    for k in (1, -1):
        out.append(seg(x1 - tx * 12 - k * ty * 6, y1 - ty * 12 + k * tx * 6,
                       x1, y1, op, w))
    return "".join(out)


def rule(y, op=0.15):
    return seg(0, y, W, y, op, SW * 0.7)


def bar(x, y, w, h, frac, op=0.9, fill="0.14"):
    """Thanh ngang: khung mo, phan da day dam."""
    out = [rect(x, y, w, h, 0.3, SW * 0.8, r=3)]
    if frac > 0:
        out.append(rect(x, y, max(w * frac, 3), h, op, SW * 1.1, r=3,
                        fill=fill))
    return "".join(out)


def urlbox(x, y, w, label, op=0.5, h=24, mono=True, size=9.5):
    return (rect(x, y, w, h, op, SW * 0.9, r=5),
            text(x + 10, y + h / 2 + 3.5, label, size, op + 0.15, mono=mono))


def browser(x, y, w, h, op=0.5):
    """Khung cua so trinh duyet: mot thanh tren va ba cham."""
    out = [rect(x, y, w, h, op, SW, r=8),
           seg(x, y + 22, x + w, y + 22, op * 0.7, SW * 0.8)]
    for i in range(3):
        out.append(dot(x + 14 + i * 11, y + 11, 2.6, op * 0.8))
    return "".join(out)


# =========================================================== web-crawling (3)

def wc_without_with():
    """Khong co may tim kiem thi phai biet san dia chi. Co roi thi go y dinh.

    Ban truoc dung hai khung 300 va 400 tren mot canvas 640, nen mot nua hinh
    bo trong va cac dong chu chu thich troi ra le phai — trong do dong "already
    know" bi cat cut o mep khung. Bay gio ca hai bang deu rong het 640, va moi
    cau chu thich nam duoi bang cua no thay vi ben canh."""
    b, t = [], []
    t.append(cap(16, "WITHOUT A SEARCH ENGINE"))
    b.append(browser(0, 30, 640, 112))
    b.append(rect(14, 44, 500, 26, 0.45, SW * 0.9, r=13))
    t.append(text(26, 61, "https://", 10, 0.35, mono=True))
    b.append(caret_block(80, 53, 0.55))
    t.append(text(626, 61, "no query box", 9.5, 0.4, anchor="end"))
    t.append(text(320, 108, "?", 26, 0.55, 600, anchor="middle"))
    t.append(text(320, 130, "nothing loads until you type an exact address",
                  10, 0.4, anchor="middle"))

    t.append(text(0, 168, "The pages that answer you already exist:", 11,
                  0.55))
    for i, u in enumerate(("yonex.com/rackets/az900", "badmintonhq.co/gear",
                           "lining.com/products/blade")):
        x = i * 214
        b.append(rect(x, 180, 200, 26, 0.3, SW * 0.9, r=5))
        t.append(text(x + 12, 197, u, 9, 0.45, mono=True))
    t.append(text(0, 228, "You just have to know which one, and how it is "
                  "spelled.", 12, 0.65))

    b.append(rule(256))
    t.append(cap(284, "WITH A SEARCH ENGINE"))
    b.append(browser(0, 298, 640, 250))
    b.append(rect(14, 312, 500, 32, 0.9, SW * 1.4, r=16))
    b.append(magnifier(36, 328, 7, 0.8, SW * 0.9))
    t.append(text(54, 333, "badminton racket", 12.5, 0.95, 500, mono=True))
    t.append(text(626, 333, "a query", 9.5, 0.45, anchor="end"))
    t.append(text(14, 364, "About 4,120,000 results", 9.5, 0.35))
    res = (("yonex.com > rackets > az900", "Astrox 99 Pro Badminton Racket",
            "Head-heavy frame for steep smashes. In stock, ships today."),
           ("badmintonhq.co > gear", "Best Badminton Rackets 2026",
            "We tested 31 rackets over four months. Here is what won."),
           ("lining.com > products", "Li-Ning Blade Series",
            "Carbon shaft, 4U weight, even balance for all-round play."))
    for i, (url, title, snip) in enumerate(res):
        y = 384 + i * 52
        t.append(text(14, y, url, 9, 0.4, mono=True))
        t.append(text(14, y + 15, title, 12, 0.95, 500))
        t.append(text(14, y + 30, snip, 9.5, 0.45))
        if i == 0:
            b.append(rect(496, y - 10, 130, 22, 0.6, SW * 0.9, r=11))
            t.append(text(561, y + 5, "ranked first", 9, 0.7, 500,
                          anchor="middle"))
    t.append(text(0, 574, "You type what you want. Which of the three you see "
                  "first is the engine's answer,", 12, 0.65))
    t.append(text(0, 594, "not something you had to know.", 12, 0.9, 500))
    return "".join(b), "".join(t), 608, 640


def wc_two_steps():
    """Bang duoc dung truoc, roi cau hoi moi doi chieu voi no.

    Hai cho hong o ban truoc. Mot: "the table" la mot o rieng rong 108px ep
    sat mep phai, trong khi chinh cai bang ngay ben duoi moi la thu no goi
    ten — nen bo o do di, va lay dong tieu de cua bang lam ten. Hai: ba dong
    BM25/PageRank/BERT nam NGOAI o "ranking engine", noi vao bang mot cai
    cuong 10px, doc ra nhu ba dong roi; gio chung nam trong o."""
    b, t = [], []
    t.append(cap(16, "STEP 1 - BUILT BEFORE ANYONE SEARCHES"))
    stages = (("the web", "billions of pages"), ("crawler", "downloads them"),
              ("indexer", "organises the text"))
    for i, (name, sub_) in enumerate(stages):
        x = i * 225
        bb, tt = box(x, 32, 190, 50, name, sub_)
        b.append(bb)
        t.append(tt)
        if i < 2:
            b.append(arrow(x + 194, x + 221, 57, 0.4))
    b.append(down(320, 84, 106, 0.4))

    b.append(rect(0, 112, 640, 150, 0.95, SW * 1.4, r=8, fill="0.03"))
    t.append(text(14, 134, "the table", 13, 0.95, 500))
    t.append(text(84, 134, "one row per page, built once", 10, 0.45))
    b.append(seg(14, 146, 626, 146, 0.2, SW * 0.7))
    t.append(text(14, 164, "url", 9.5, 0.4, 600, mono=True))
    t.append(text(210, 164, "what it is about", 9.5, 0.4, 600, mono=True))
    t.append(text(556, 164, "rank", 9.5, 0.4, 600, mono=True))
    rows = (("yonex.com/rackets", "badminton, racket, carbon, pro series",
             "8.4"),
            ("badmintonhq.co/gear", "racket, review, best, shuttlecock",
             "7.1"),
            ("wikipedia.org/tennis", "tennis, history, sport, court, ball",
             "2.0"))
    for i, (u, c, r_) in enumerate(rows):
        y = 186 + i * 22
        t.append(text(14, y, u, 9.5, 0.75, mono=True))
        t.append(text(210, y, c, 9.5, 0.5))
        t.append(text(556, y, r_, 9.5, 0.75, mono=True))
    t.append(text(14, 248, "... and about a billion more rows", 9.5, 0.35))

    b.append(rule(290))
    t.append(cap(318, "STEP 2 - WHEN SOMEONE SEARCHES"))
    # Khoi nay tung duoc day xuong 18px bang cach thay tung con so mot, va
    # duong ke ngang thi tut vao dung dong PageRank trong khi cot ket qua o
    # ben phai khong tut theo. Viet lai bang toa do tuong minh.
    b.append(rect(0, 352, 190, 32, 0.9, SW * 1.3, r=16))
    b.append(magnifier(20, 368, 6.5, 0.75, SW * 0.85))
    t.append(text(36, 373, "badminton racket", 10.5, 0.9, 500, mono=True))
    b.append(arrow(196, 216, 368, 0.4))

    b.append(rect(222, 322, 200, 124, 0.95, SW * 1.6, r=8, fill="0.04"))
    t.append(text(322, 346, "ranking engine", 12, 0.95, 500,
                  anchor="middle"))
    b.append(seg(236, 356, 408, 356, 0.2, SW * 0.7))
    for i, (nm, what) in enumerate((("BM25", "does the word appear"),
                                    ("PageRank", "who links to it"),
                                    ("BERT", "does it mean the same"))):
        y = 378 + i * 22
        t.append(text(236, y, nm, 9.5, 0.85, 500, mono=True))
        t.append(text(300, y, what, 9, 0.5))
    b.append(arrow(428, 448, 368, 0.4))

    for i in range(3):
        y = 331 + i * 38
        b.append(rect(456, y, 184, 30, 0.95 - i * 0.22,
                      SW * (1.4 - i * 0.25), r=5,
                      fill="0.07" if i == 0 else None))
        t.append(text(468, y + 20, f"#{i + 1}", 9.5, 0.6, 600, mono=True))
        t.append(text(492, y + 20, ("yonex.com/rackets", "badmintonhq.co/gear",
                                    "lining.com/products")[i], 9,
                      0.85 - i * 0.2, mono=True))
    t.append(text(0, 480, "The table is built once, in advance. A query never "
                  "touches the web —", 12, 0.65))
    t.append(text(0, 500, "it only reads the table.", 12, 0.9, 500))
    return "".join(b), "".join(t), 514, 640


def wc_depth():
    """Do sau cua cuoc bo: mot hat giong, roi lien ket cua no, roi lien ket
    cua chung.

    Ban truoc co ba loi. Nhan "depth 2" nam DUOI hang no goi ten. Chin o o
    hang duoi deu ghi mot chu "url" — goi ten thay vi ve, dung cai loi da phai
    sua o cho khac. Va khoi cot ben duoi lap lai y nguyen ba nhan depth 0/1/2
    da co o tren. Gio so trang di thang vao nhan cua tung hang, chin o mang
    duong dan that, va khoi cot bien mat."""
    b, t = [], []
    t.append(cap(16, "ONE SEED, THEN EVERYTHING IT POINTS AT"))
    LX, TX, TW = 0, 100, 540

    rows = ((44, "depth 0", "1 page"), (150, "depth 1", "about 20 pages"),
            (250, "depth 2", "about 400 pages"))
    for y, nm, n in rows:
        t.append(text(LX, y + 14, nm, 11, 0.6, 500))
        t.append(text(LX, y + 29, n, 9.5, 0.4, mono=True))

    seed_x, seed_y = TX + TW / 2, 58
    b.append(dot(seed_x, seed_y, 25, 0.95, hollow=True, sw=SW * 1.7))
    t.append(text(seed_x, seed_y + 4, "seed", 11, 0.95, 500,
                  anchor="middle"))

    d1 = (("semrush.com", "/blog"), ("moz.com", "/seo-guide"),
          ("ahrefs.com", "/tools"), ("google.com", "/search/docs"))
    d1x = []
    for i, (dom, path) in enumerate(d1):
        x = TX + i * 138
        d1x.append(x + 62)
        b.append(diag(seed_x, seed_y + 27, x + 62, 146, 0.35, SW * 1.05))
        b.append(rect(x, 152, 124, 34, 0.7, SW * 1.15, r=5))
        t.append(text(x + 62, 167, dom, 9.5, 0.85, 500, anchor="middle",
                      mono=True))
        t.append(text(x + 62, 180, path, 8.5, 0.5, anchor="middle",
                      mono=True))

    # Cac duong dan nay tung dai hon roi bi cat con 9 ky tu khi ve, ra
    # "/soo-basi" va "/link-exp". Chon duong dan von da du ngan.
    d2 = (("/seo-101", "/keywords"), ("/beginner", "/links"),
          ("/backlink", "/audit"), ("/crawling", "/sitemaps"))
    for i, pair in enumerate(d2):
        for j, path in enumerate(pair):
            x = TX + i * 138 + j * 66
            b.append(diag(d1x[i], 188, x + 28, 248, 0.22, SW * 0.9))
            b.append(rect(x, 254, 56, 26, 0.4, SW * 0.95, r=4))
            t.append(text(x + 28, 270, path, 7.5, 0.55, anchor="middle",
                          mono=True))
    # Dau ba cham tung dat o TX+TW+6 = 646, tuc ngoai khung. Nhan
    # "about 400 pages" ben trai da noi dieu no dinh noi, nen bo.

    b.append(rule(310))
    t.append(text(0, 336, "Each page carries links, and each of those carries "
                  "more. Twenty at each step", 12, 0.65))
    t.append(text(0, 356, "is four hundred after two.", 12, 0.65))
    t.append(text(0, 384, "A page nothing links to may never be reached at "
                  "all.", 12, 0.9, 500))
    return "".join(b), "".join(t), 398, 640


# ================================================== designing-the-crawler (3)

def dc_pipeline():
    """Ba bo phan va mot vong quay lai hang doi."""
    b, t = [], []
    t.append(cap(16, "THE LOOP, AND WHERE IT CLOSES"))
    parts = (("crawl queue", "BFS order"), ("fetcher", "downloads HTML"),
             ("parser", "cleans, extracts"), ("manager", "decides what next"))
    for i, (nm, sub) in enumerate(parts):
        x = i * 162
        bb, tt = box(x, 34, 142, 50, nm, sub, strong=(i == 1))
        b.append(bb)
        t.append(tt)
        if i < 3:
            b.append(arrow(x + 146, x + 158, 59, 0.4))
    # vong quay lai: tu manager ve hang doi
    b.append(seg(557, 84, 557, 112, 0.5, SW))
    b.append(seg(557, 112, 71, 112, 0.5, SW))
    b.append(seg(71, 112, 71, 90, 0.5, SW))
    b.append(seg(66, 96, 71, 90, 0.5, SW))
    b.append(seg(76, 96, 71, 90, 0.5, SW))
    b.append(rect(252, 100, 128, 24, 0.7, SW * 1.1, r=12, fill="0.05"))
    t.append(text(316, 116, "new URLs, queued", 10, 0.85, 500,
                  anchor="middle"))

    b.append(rule(148))
    t.append(cap(174, "WHAT ONE URL TURNS INTO"))
    steps = ("a URL", "raw HTML", "clean text", "new links", "back in Postgres")
    for i, s in enumerate(steps):
        x = i * 128
        b.append(rect(x, 188, 112, 28, 0.45 + i * 0.1, SW * (0.95 + i * 0.12),
                      r=5, fill="0.06" if i == 4 else None))
        t.append(text(x + 56, 206, s, 9.5, 0.5 + i * 0.1, anchor="middle",
                      mono=True))
        if i < 4:
            b.append(arrow(x + 114, x + 126, 202, 0.35))
    t.append(text(0, 244, "The queue lives in Postgres, so a crash resumes "
                  "instead of restarting.", 12, 0.65))
    t.append(text(0, 264, "Breadth-first, so near pages are crawled before "
                  "deep ones.", 12, 0.65))
    return "".join(b), "".join(t), 278, 640


def dc_fetcher():
    """Nam cua ai, ba trong so do co the tra ve tay khong."""
    b, t = [], []
    t.append(cap(16, "THE FETCHER - FIVE GATES BEFORE ANY HTML COMES BACK"))
    b.append(rect(120, 32, 240, 30, 0.5, SW, r=6))
    t.append(text(240, 52, "a URL to fetch", 11.5, 0.7, 500, anchor="middle"))
    gates = (("1. robots.txt", "is this path allowed?", "blocked", "skip it"),
             ("2. rate limit", "1.5s since this domain?", "too soon", "wait"),
             ("3. HTTP GET", "with a real User-Agent", None, None),
             ("4. content-type", "is it actually HTML?", "not HTML",
              "skip it"))
    for i, (nm, q, exit_, what) in enumerate(gates):
        y = 78 + i * 62
        b.append(down(240, y - 16, y - 4, 0.35))
        b.append(rect(120, y, 240, 44, 0.9 if exit_ is None else 0.6,
                      SW * (1.4 if exit_ is None else 1.05), r=6,
                      fill="0.05" if exit_ is None else None))
        t.append(text(240, y + 19, nm, 11.5, 0.9, 500, anchor="middle"))
        t.append(text(240, y + 34, q, 9.5, 0.5, anchor="middle"))
        if exit_:
            b.append(diag(364, y + 22, 424, y + 22, 0.4, SW * 0.9))
            b.append(rect(430, y + 8, 92, 28, 0.5, SW, r=14, dash="6 5"))
            t.append(text(476, y + 27, exit_, 10, 0.7, 500, anchor="middle"))
            t.append(text(532, y + 27, what, 10, 0.45))
    b.append(down(240, 326, 338, 0.35))
    bb, tt = box(120, 342, 240, 40, "HTML, and only then", strong=True)
    b.append(bb)
    t.append(tt)
    b.append(rule(408))
    t.append(text(0, 432, "Three of the five gates end the request. That is "
                  "the point of them:", 12, 0.65))
    t.append(text(0, 452, "a bare bot name gets blocked, and no delay crashes "
                  "small sites.", 12, 0.65))
    return "".join(b), "".join(t), 466, 640


def dc_parser():
    """HTML tho di vao, hai thu di ra: chu sach va lien ket da chuan hoa."""
    b, t = [], []
    t.append(cap(16, "THE PARSER - WHAT IT THROWS AWAY, AND WHAT IT KEEPS"))
    b.append(rect(0, 32, 246, 156, 0.5, SW, r=8))
    t.append(text(14, 54, "raw HTML", 12, 0.75, 500))
    tags = (("<script>", False), ("<style>", False), ("<nav>", False),
            ("<footer>", False), ("<title>", True), ("<body>", True),
            ("<a href>", True))
    for i, (tag, keep) in enumerate(tags):
        x = 14 + (i % 2) * 116
        y = 70 + (i // 2) * 28
        b.append(rect(x, y, 104, 22, 0.75 if keep else 0.3,
                      SW * (1.15 if keep else 0.85), r=4,
                      fill="0.06" if keep else None))
        t.append(text(x + 52, y + 15, tag, 9.5, 0.85 if keep else 0.62,
                      anchor="middle", mono=True))
        if not keep:
            # Gach ngang o dung giua chu, tren nen mo 0.4, lam the tag khong
            # doc duoc nua. Ha gach xuong duoi chan chu va nang do dam len.
            b.append(seg(x + 12, y + 18, x + 92, y + 18, 0.5, SW * 0.9))

    b.append(diag(252, 84, 322, 66, 0.35, SW * 0.9))
    b.append(rect(330, 44, 310, 46, 0.35, SW, r=6, dash="6 6"))
    t.append(text(344, 64, "thrown away", 11, 0.5, 500))
    t.append(text(344, 80, "scripts, styles, nav, header, footer", 9.5, 0.4))
    b.append(diag(252, 128, 322, 146, 0.7, SW * 1.1))
    b.append(rect(330, 122, 310, 62, 0.95, SW * 1.5, r=6, fill="0.05"))
    t.append(text(344, 142, "kept", 11, 0.9, 500))
    t.append(text(344, 158, "the title, the body text, every outgoing link",
                  9.5, 0.55))
    t.append(text(344, 174, "and a hash of the content, to spot duplicates",
                  9.5, 0.55))

    b.append(rule(212))
    t.append(cap(238, "AND THE LINKS ARE MADE USABLE BEFORE THEY QUEUE"))
    fixes = (("/wiki/SEO", "https://en.wikipedia.org/wiki/SEO", True),
             ("page.html#section1", "page.html", True),
             ("javascript:void(0)", "dropped, not http", False))
    for i, (a, bnd, ok) in enumerate(fixes):
        y = 254 + i * 32
        b.append(rect(0, y, 236, 26, 0.3, SW * 0.9, r=4))
        t.append(text(10, y + 17, a, 9.5, 0.5, mono=True))
        b.append(arrow(242, 288, y + 13, 0.35))
        b.append(rect(296, y, 344, 26, 0.85 if ok else 0.3,
                      SW * (1.2 if ok else 0.9), r=4, dash=None if ok else "6 5"))
        t.append(text(306, y + 17, bnd, 9.5, 0.8 if ok else 0.45, mono=True))
    t.append(text(0, 372, "Only absolute http links reach the queue, and the "
                  "content hash", 12, 0.65))
    t.append(text(0, 392, "catches two URLs that serve the same page.", 12,
                  0.65))
    return "".join(b), "".join(t), 406, 640


# ========================================================= inverted-index (4)

def ix_where():
    """Lap chi muc nam giua thu thap va xep hang, va no doi don vi thoi gian."""
    b, t = [], []
    t.append(cap(16, "WHERE THE INDEX SITS"))
    for i, (nm, sub, hero) in enumerate((("crawling", "download pages", False),
                                         ("indexing", "organise for search",
                                          True),
                                         ("ranking", "BM25, PageRank",
                                          False))):
        x = 24 + i * 208
        bb, tt = box(x, 32, 176, 50, nm, sub, strong=hero)
        b.append(bb)
        t.append(tt)
        if i < 2:
            b.append(arrow(x + 180, x + 220, 57, 0.4))
    b.append(rule(110))
    t.append(cap(136, "AND WHAT IT BUYS"))
    for i, (nm, how, val, frac) in enumerate((
            ("without an index", "every search reads every page",
             "minutes", 1.0),
            ("with an index", "every search is one lookup",
             "milliseconds", 0.004))):
        y = 152 + i * 74
        t.append(text(0, y + 14, nm, 12, 0.9 if i else 0.5, 500))
        t.append(text(0, y + 30, how, 10, 0.45))
        b.append(bar(232, y, 300, 24, frac, 0.9 if i else 0.45))
        t.append(text(544, y + 17, val, 11, 0.9 if i else 0.5, 500,
                      mono=True))
    t.append(text(0, 306, "The indexer reads every page once, so that no "
                  "query ever has to.", 12, 0.65))
    return "".join(b), "".join(t), 320, 640


def ix_forward_vs_inverted():
    """Hai chieu cua cung mot bang, va cai gia cua moi chieu khi tra cuu."""
    b, t = [], []
    t.append(cap(16, "THE SAME DATA, STORED TWO WAYS"))
    t.append(text(0, 44, "forward index", 12.5, 0.55, 500))
    t.append(text(0, 60, "page -> words", 10, 0.4, mono=True))
    fwd = ("page 1 -> search, engine, SEO, rank",
           "page 2 -> robots, crawl, sitemap",
           "page 3 -> pagerank, link, authority",
           "... 747 more pages")
    for i, r_ in enumerate(fwd):
        y = 76 + i * 28
        b.append(rect(0, y, 300, 24, 0.3, SW * 0.9, r=4))
        t.append(text(10, y + 16, r_, 9.5, 0.45 if i < 3 else 0.3, mono=True))

    t.append(text(340, 44, "inverted index", 12.5, 0.95, 500))
    t.append(text(340, 60, "word -> pages", 10, 0.55, mono=True))
    inv = ('"search"   -> 1, 4, 17, 203', '"robots"   -> 2, 4, 89',
           '"pagerank" -> 3, 4, 156', '"authority"-> 3, 78')
    for i, r_ in enumerate(inv):
        y = 76 + i * 28
        b.append(rect(340, y, 300, 24, 0.85, SW * 1.2, r=4, fill="0.04"))
        t.append(text(350, y + 16, r_, 9.5, 0.8, mono=True))

    b.append(rule(210))
    t.append(cap(236, 'SEARCHING FOR "ROBOTS"'))
    b.append(rect(0, 250, 300, 106, 0.4, SW, r=8))
    t.append(text(14, 272, "scan all of them", 11.5, 0.6, 500))
    for i, ln in enumerate(("page 1: has robots? no",
                            "page 2: has robots? yes",
                            "page 3: has robots? no",
                            "... 747 more times")):
        t.append(text(14, 292 + i * 17, ln, 9.5, 0.45, mono=True))
    b.append(rect(0, 368, 148, 26, 0.5, SW, r=13))
    t.append(text(74, 385, "750 lookups", 10, 0.65, 500, anchor="middle"))
    t.append(text(160, 385, "O(N)", 11, 0.5, 600, mono=True))

    b.append(rect(340, 250, 300, 106, 0.95, SW * 1.5, r=8, fill="0.04"))
    t.append(text(354, 272, "one lookup", 11.5, 0.95, 500))
    t.append(text(354, 296, '"robots" -> 2, 4, 89', 10.5, 0.85, mono=True))
    t.append(text(354, 322, "done.", 10.5, 0.55))
    b.append(rect(340, 368, 148, 26, 0.95, SW * 1.4, r=13, fill="0.07"))
    t.append(text(414, 385, "1 lookup", 10, 0.95, 500, anchor="middle"))
    t.append(text(500, 385, "O(1)", 11, 0.85, 600, mono=True))
    t.append(text(0, 424, "This is the structure under every search engine "
                  "ever built.", 12, 0.65))
    t.append(text(0, 444, '"Get your pages indexed" means: be a row on the '
                  "right.", 12, 0.9, 500))
    return "".join(b), "".join(t), 458, 640


def ix_three_tables():
    """Ba van de, ba bang. Khong bang nao thua."""
    b, t = [], []
    t.append(cap(16, "THREE PROBLEMS, THREE TABLES"))
    specs = (
        ("words repeat everywhere", "terms", "the vocabulary",
         ("id 1 -> \"search\"", "id 2 -> \"engine\"", "id 3 -> \"robots\""),
         "145,736 unique terms, stored once as ids"),
        ("yes/no is not enough", "postings", "the index itself",
         ("term 3, page 2, freq 15", "term 3, page 89, freq 3",
          "term 1, page 4, freq 8"),
         "term_id + page_id + count, read straight into BM25"),
        ("long docs win by accident", "doc_stats", "the length of each page",
         ("page 1: 2,340 tokens", "page 2: 8,750 tokens",
          "page 3: 1,024 tokens"),
         "what BM25 divides by, so length stops being an advantage"))
    for i, (prob, name, what, rows, foot) in enumerate(specs):
        y = 34 + i * 132
        b.append(rect(0, y, 178, 46, 0.45, SW, r=6, dash="6 6"))
        t.append(text(89, y + 22, f"problem {i + 1}", 10, 0.5, 500,
                      anchor="middle"))
        t.append(text(89, y + 37, prob, 9.5, 0.65, anchor="middle"))
        b.append(arrow(184, 212, y + 23, 0.35))
        b.append(rect(220, y - 4, 420, 124, 0.9, SW * 1.4, r=8, fill="0.03"))
        t.append(text(234, y + 18, name, 12.5, 0.95, 500, mono=True))
        t.append(text(234 + len(name) * 8 + 12, y + 18, what, 10, 0.45))
        for j, r_ in enumerate(rows):
            yy = y + 32 + j * 22
            b.append(rect(234, yy, 250, 18, 0.5, SW * 0.85, r=3))
            t.append(text(242, yy + 13, r_, 9, 0.6, mono=True))
        t.append(text(234, y + 112, foot, 9.5, 0.45))
    t.append(text(0, 446, "The vocabulary, the index, and the yardstick. "
                  "Nothing else is stored.", 12, 0.65))
    return "".join(b), "".join(t), 460, 640


def ix_tokenizer():
    """Mot cau di qua bon buoc va thanh sau token."""
    b, t = [], []
    t.append(cap(16, "ONE LINE OF TEXT, FOUR STEPS, SIX TOKENS"))
    stages = (
        (None, '"Search Engine Optimization (SEO) - a guide to ranking #1"'),
        ("lowercase", '"search engine optimization (seo) - a guide to '
         'ranking #1"'),
        ("strip non-alphanumeric", '"search engine optimization seo a guide '
         'to ranking 1"'),
        ("split on whitespace", None))
    y = 34
    for i, (step, line) in enumerate(stages):
        if step:
            b.append(down(320, y, y + 16, 0.3))
            b.append(rect(200, y + 20, 240, 26, 0.6, SW * 1.05, r=13))
            t.append(text(320, y + 37, step, 10, 0.75, 500, anchor="middle"))
            y += 58
        if line:
            b.append(rect(0, y, 640, 28, 0.35, SW * 0.9, r=5))
            t.append(text(12, y + 19, line, 9.5, 0.55, mono=True))
            y += 40
    toks = (("search", True), ("engine", True), ("optimization", True),
            ("seo", True), ("a", False), ("guide", True), ("to", False),
            ("ranking", True), ("1", False))
    x = 0
    for tok, keep in toks:
        w = max(len(tok) * 7.4 + 22, 40)
        b.append(rect(x, y, w, 26, 0.75 if keep else 0.3,
                      SW * (1.1 if keep else 0.85), r=13,
                      dash=None if keep else "5 5"))
        t.append(text(x + w / 2, y + 17, tok, 9.5, 0.8 if keep else 0.4,
                      anchor="middle", mono=True))
        x += w + 8
    y += 42
    b.append(down(320, y, y + 16, 0.3))
    b.append(rect(160, y + 20, 320, 26, 0.6, SW * 1.05, r=13))
    t.append(text(320, y + 37, "drop stopwords and single characters", 10,
                  0.75, 500, anchor="middle"))
    y += 62
    x = 0
    for tok in ("search", "engine", "optimization", "seo", "guide", "ranking"):
        w = len(tok) * 7.8 + 26
        b.append(rect(x, y, w, 30, 0.95, SW * 1.5, r=15, fill="0.06"))
        t.append(text(x + w / 2, y + 20, tok, 10.5, 0.95, 500,
                      anchor="middle", mono=True))
        x += w + 9
    t.append(text(0, y + 62, "Six tokens go into the index. "
                  '"SEO" and "seo" now answer the same query.', 12, 0.65))
    return "".join(b), "".join(t), y + 76, 640


# ======================================================== ranking-with-bm25(5)

def bm_league():
    """Dem chu thuan tuy chon sai tai lieu. BM25 sua ba cho."""
    b, t = [], []
    t.append(cap(16, 'THE QUERY IS "LEAGUE"'))
    b.append(rect(0, 32, 300, 96, 0.95, SW * 1.5, r=8, fill="0.05"))
    t.append(text(16, 56, "document A", 12.5, 0.95, 500))
    t.append(text(16, 76, "a 3-word title", 10.5, 0.6))
    t.append(text(16, 96, '"league" appears once', 10.5, 0.6))
    t.append(text(16, 116, "every third word is the query", 9.5, 0.45))

    b.append(rect(340, 32, 300, 96, 0.5, SW, r=8))
    t.append(text(356, 56, "document B", 12.5, 0.7, 500))
    t.append(text(356, 76, "a 10,000-word article", 10.5, 0.55))
    t.append(text(356, 96, '"league" appears twice', 10.5, 0.55))
    t.append(text(356, 116, "one word in five thousand", 9.5, 0.45))

    # Moi ket luan phai nam duoi tai lieu no noi den. Ban truoc dat
    # "B wins" duoi cot A va "A wins" duoi cot B, tuc nguoc ca hai.
    b.append(rect(0, 144, 300, 30, 0.95, SW * 1.4, r=6, fill="0.06"))
    t.append(text(150, 164, "BM25 picks this one", 10.5, 0.95, 500,
                  anchor="middle"))
    b.append(rect(340, 144, 300, 30, 0.4, SW, r=6, dash="6 5"))
    t.append(text(490, 164, "counting words picks this one, 2 > 1", 10.5,
                  0.55, anchor="middle"))

    b.append(rule(202))
    t.append(cap(228, "BM25 FIXES THREE FAILURES OF COUNTING"))
    fixes = (("IDF", "how rare is this term?", "common words score near zero"),
             ("TF saturation", "diminishing returns",
              "the 100th mention is not worth the 1st"),
             ("length norm", "penalise long documents",
              "a focused page beats a bloated one"))
    for i, (nm, what, why) in enumerate(fixes):
        x = i * 214
        b.append(rect(x, 244, 196, 76, 0.85, SW * 1.3, r=8))
        t.append(text(x + 98, 268, nm, 12, 0.95, 500, anchor="middle"))
        t.append(text(x + 98, 286, what, 9.5, 0.55, anchor="middle"))
        t.append(text(x + 98, 304, why, 9, 0.4, anchor="middle"))
    t.append(text(0, 356, "score = sum over query terms of  IDF  x  TF "
                  "saturation  x  length norm", 12, 0.9, 500, mono=True))
    t.append(text(0, 378, "Each term is scored on its own, then the terms are "
                  "added up.", 12, 0.6))
    return "".join(b), "".join(t), 392, 640


def bm_idf():
    """Tu hiem duoc nhan to; tu pho bien gan nhu bi bo qua."""
    b, t = [], []
    t.append(cap(16, "IDF - HOW RARE IS THIS TERM ACROSS ALL 750 DOCUMENTS"))
    for i, (term, df, idf, frac, hero) in enumerate((
            ("geotargeting", 14, "3.9", 14 / 750, True),
            ("search", 600, "0.2", 600 / 750, False))):
        y = 40 + i * 118
        t.append(text(0, y + 18, f'"{term}"', 14, 0.95 if hero else 0.6, 500,
                      mono=True))
        t.append(text(0, y + 38, f"appears in {df} of 750 documents", 10.5,
                      0.5))
        b.append(bar(0, y + 50, 420, 22, frac, 0.95 if hero else 0.45))
        t.append(text(0, y + 92, f"df = {df}", 10, 0.45, mono=True))
        b.append(rect(440, y + 40, 200, 40, 0.95 if hero else 0.4,
                      SW * (1.5 if hero else 1), r=6,
                      fill="0.06" if hero else None))
        t.append(text(540, y + 65, f"IDF = {idf}", 12.5, 0.95 if hero else 0.6,
                      600, anchor="middle", mono=True))
        t.append(text(540, y + 96, "a strong signal" if hero
                      else "almost no signal", 10, 0.6 if hero else 0.4,
                      anchor="middle"))
    b.append(rule(288))
    t.append(text(0, 314, 'This is why "the" returns nothing useful and '
                  '"messi" returns something.', 12, 0.65))
    t.append(text(0, 334, "Long-tail keywords win because fewer documents "
                  "contain them.", 12, 0.65))
    return "".join(b), "".join(t), 348, 640


def bm_saturation():
    """Duong bao hoa: nhac them mai cung khong tang duoc bao nhieu."""
    b, t = [], []
    t.append(cap(16, "TF SATURATION - MORE MENTIONS HELP, THEN STOP HELPING"))
    ox, oy, ww, hh = 46, 268, 540, 190
    b.append(seg(ox, oy, ox + ww, oy, 0.3, SW * 0.9))
    b.append(seg(ox, oy, ox, oy - hh - 12, 0.3, SW * 0.9))
    t.append(text(4, oy - hh - 4, "score", 10, 0.4))
    pts = ((0.45, "1x"), (0.63, "2x"), (0.81, "5x"), (0.89, "10x"),
           (0.98, "50x"), (0.99, "100x"))
    xs = []
    for i, (v, lbl) in enumerate(pts):
        x = ox + 44 + i * 84
        xs.append((x, oy - hh * v))
        b.append(rect(x - 26, oy - hh * v, 52, hh * v, 0.55, SW * 1.05, r=3,
                      fill="0.08"))
        t.append(text(x, oy - hh * v - 10, f"{v:.2f}", 10, 0.8, 600,
                      anchor="middle", mono=True))
        t.append(text(x, oy + 18, lbl, 10, 0.5, anchor="middle", mono=True))
    # duong noi dinh cac cot: cho thay no phang dan
    for i in range(len(xs) - 1):
        b.append(seg(xs[i][0], xs[i][1], xs[i + 1][0], xs[i + 1][1], 0.85,
                     SW * 1.3))
    b.append(seg(ox, oy - hh, ox + ww, oy - hh, 0.25, SW * 0.8, dash="6 6"))
    t.append(text(ox + ww + 4, oy - hh + 4, "1.0", 10, 0.4, mono=True))
    t.append(text(ox + ww / 2, oy + 38, "times the term appears in the "
                  "document", 10.5, 0.45, anchor="middle"))
    t.append(text(0, 44, "k1 = 1.2 sets how fast the curve flattens", 11, 0.5))
    b.append(rule(330))
    t.append(text(0, 356, "1x to 2x is a real gain. 50x to 100x is worth "
                  "0.01.", 12, 0.65))
    t.append(text(0, 376, "Keyword stuffing hits a mathematical ceiling, not "
                  "a policy one.", 12, 0.9, 500))
    return "".join(b), "".join(t), 390, 640


def bm_length():
    """Ba tai lieu nhac cung mot tu 15 lan, va bi chia cho ba so khac nhau."""
    b, t = [], []
    t.append(cap(16, "LENGTH NORMALISATION - avgdl = 3,736 TOKENS, b = 0.75"))
    docs = (("focused", "2,000 tokens", "0.54", "0.60", True),
            ("average", "3,736 tokens", "1.00", "1.20", False),
            ("bloated", "70,000 tokens", "18.7", "14.3", False))
    for i, (nm, toks, ratio, pen, hero) in enumerate(docs):
        x = i * 214
        b.append(rect(x, 36, 196, 108, 0.95 if hero else 0.45,
                      SW * (1.5 if hero else 1), r=8,
                      fill="0.05" if hero else None))
        t.append(text(x + 98, 62, nm, 12.5, 0.95 if hero else 0.7, 500,
                      anchor="middle"))
        t.append(text(x + 98, 82, toks, 10.5, 0.6, anchor="middle",
                      mono=True))
        t.append(text(x + 98, 104, 'mentions "robots.txt"', 9.5, 0.45,
                      anchor="middle"))
        t.append(text(x + 98, 120, "15 times either way", 9.5, 0.45,
                      anchor="middle"))
        t.append(text(x + 98, 168, f"|d| / avgdl = {ratio}", 10.5, 0.55,
                      anchor="middle", mono=True))
        b.append(down(x + 98, 176, 192, 0.3))
        b.append(rect(x + 28, 198, 140, 32, 0.95 if hero else 0.5,
                      SW * (1.5 if hero else 1.05), r=6,
                      fill="0.07" if hero else None))
        t.append(text(x + 98, 219, f"divide by {pen}", 11, 0.95 if hero
                      else 0.65, 500, anchor="middle", mono=True))
    b.append(rule(258))
    t.append(text(0, 284, "The same 15 mentions score three different ways, "
                  "because length is the divisor.", 12, 0.65))
    t.append(text(0, 304, '"Write 10,000-word articles" is advice that '
                  "argues with the formula.", 12, 0.9, 500))
    return "".join(b), "".join(t), 318, 640


def bm_flow():
    """Ba he so nhan vao nhau cho ra mot diem, cho moi tu trong truy van."""
    b, t = [], []
    t.append(cap(16, "SCORING ONE TERM AGAINST ONE DOCUMENT"))
    parts = (("the query term", '"robots"', None),
             ("IDF", "how rare", "x"),
             ("TF saturation", "how often, damped", "x"),
             ("length norm", "how long the doc is", "/"))
    # Bon o 132 cach nhau 28 la 612, cong o diem nua thi vuot han 640.
    # Thu o xuong 108 va khoang cach xuong 22.
    x = 0
    for i, (nm, sub_, op) in enumerate(parts):
        w = 108
        b.append(rect(x, 40, w, 54, 0.5 + i * 0.13, SW * (1 + i * 0.15), r=7))
        t.append(text(x + w / 2, 64, nm, 10.5, 0.6 + i * 0.11, 500,
                      anchor="middle"))
        t.append(text(x + w / 2, 80, sub_, 9, 0.45, anchor="middle"))
        if op:
            t.append(text(x - 11, 72, op, 13, 0.6, 600, anchor="middle",
                          mono=True))
        x += w + 22
    t.append(text(x - 11, 72, "=", 13, 0.75, 600, anchor="middle", mono=True))
    b.append(rect(x, 40, 640 - x, 54, 0.95, SW * 1.6, r=7, fill="0.06"))
    t.append(text(x + (640 - x) / 2, 72, "a score", 12, 0.95, 500,
                  anchor="middle"))
    b.append(seg(0, 108, 640, 108, 0.2, SW * 0.7, dash="6 6"))
    t.append(text(0, 130, "then repeat for every term in the query, and add "
                  "the scores up", 11, 0.55))

    b.append(rule(164))
    t.append(cap(190, "AND WHY THE LOOKUP IS CHEAP ENOUGH TO DO THAT"))
    t.append(text(0, 218, "forward index", 12, 0.5, 500))
    for i, r_ in enumerate(("doc 1 -> SEO, links, rank",
                            "doc 2 -> links, crawl, cache",
                            "doc 3 -> rank, index, SEO",
                            "... 747 more")):
        y = 232 + i * 24
        b.append(rect(0, y, 290, 20, 0.28, SW * 0.85, r=3))
        t.append(text(8, y + 14, r_, 9, 0.45, mono=True))
    b.append(rect(0, 334, 160, 26, 0.45, SW, r=13, dash="6 5"))
    t.append(text(80, 351, "scan all 750", 10, 0.6, anchor="middle"))
    t.append(text(174, 351, "O(N) per query", 10, 0.45, mono=True))

    t.append(text(340, 218, "inverted index", 12, 0.95, 500))
    for i, r_ in enumerate(('"links" -> 1, 2, 750', '"SEO"   -> 1, 3',
                            '"rank"  -> 1, 3', '"crawl" -> 2, 750')):
        y = 232 + i * 24
        b.append(rect(340, y, 290, 20, 0.8, SW * 1.15, r=3, fill="0.04"))
        t.append(text(348, y + 14, r_, 9, 0.75, mono=True))
    b.append(rect(340, 334, 160, 26, 0.95, SW * 1.4, r=13, fill="0.07"))
    t.append(text(420, 351, "one lookup", 10, 0.95, 500, anchor="middle"))
    t.append(text(514, 351, "O(1) per term", 10, 0.7, mono=True))
    return "".join(b), "".join(t), 372, 640


# ==================================================== ranking-with-pagerank(8)

def pr_votes():
    """Ba lien ket, ba gia tri. Do day cua mui ten la suc nang phieu bau."""
    b, t = [], []
    t.append(cap(16, "EVERY LINK IS A VOTE, AND VOTES ARE NOT EQUAL"))
    # Do mo la de phan biet suc nang phieu bau, khong phai de giau chu.
    # 0.3 tren nen trang la khoang 6% tuong phan: hang thu ba bien mat.
    voters = (("a news site", "PR 9.0", "3 outlinks", "3.000", 5.0, 0.95),
              ("a partner blog", "PR 4.0", "20 outlinks", "0.200", 2.2, 0.7),
              ("a mega directory", "PR 3.0", "1,000 outlinks", "0.003", 0.9,
               0.55))
    for i, (nm, pr, out, val, thick, op) in enumerate(voters):
        y = 42 + i * 84
        b.append(rect(0, y, 190, 60, op, SW * (1.5 if i == 0 else 1), r=8,
                      fill="0.05" if i == 0 else None))
        t.append(text(14, y + 24, nm, 12, op, 500))
        t.append(text(14, y + 42, f"{pr}  ·  {out}", 9.5, op * 0.75,
                      mono=True))
        b.append(diag(196, y + 30, 386, 168, op * 0.85, thick))
        b.append(rect(230, y + 12, 88, 26, op, SW * 1.1, r=13,
                      fill="0.06" if i == 0 else None))
        t.append(text(274, y + 29, val, 10.5, op, 600, anchor="middle",
                      mono=True))
    b.append(rect(396, 138, 200, 60, 0.95, SW * 1.7, r=8, fill="0.06"))
    t.append(text(496, 164, "your page", 13, 0.95, 500, anchor="middle"))
    t.append(text(496, 182, "receives all three", 9.5, 0.6, anchor="middle"))
    b.append(down(496, 202, 224, 0.4))
    b.append(rect(396, 230, 200, 40, 0.95, SW * 1.5, r=6))
    t.append(text(496, 255, "total  3.203", 13, 0.95, 600, anchor="middle",
                  mono=True))
    t.append(text(396, 294, "The news site alone is worth", 10, 0.5))
    t.append(text(396, 310, "a thousand directory links.", 10, 0.5))
    b.append(rule(324))
    t.append(text(0, 350, "Arrow thickness is the vote: PR of the linker, "
                  "divided by how many", 12, 0.65))
    t.append(text(0, 370, "pages it links to.", 12, 0.65))
    return "".join(b), "".join(t), 384, 640


def pr_split():
    """Cung mot phieu, chia cho ba hay cho mot nghin."""
    b, t = [], []
    t.append(cap(16, "ONE VOTE, SPLIT AMONG EVERY LINK ON THE PAGE"))
    b.append(rect(20, 34, 220, 52, 0.9, SW * 1.4, r=8, fill="0.05"))
    t.append(text(130, 56, "a curated blog", 12, 0.95, 500, anchor="middle"))
    t.append(text(130, 74, "PR 9.0, three links", 9.5, 0.55, anchor="middle"))
    for i in range(3):
        x = 40 + i * 68
        b.append(diag(130, 90, x + 26, 126, 0.6, SW * 1.2))
        b.append(rect(x, 132, 52, 32, 0.9, SW * 1.4, r=6, fill="0.06"))
        t.append(text(x + 26, 153, "3.00", 10.5, 0.95, 600, anchor="middle",
                      mono=True))
    t.append(text(130, 190, "big slices", 12, 0.9, 500, anchor="middle"))

    t.append(text(300, 110, "vs", 12, 0.4, 500, anchor="middle"))

    b.append(rect(360, 34, 260, 52, 0.45, SW, r=8))
    t.append(text(490, 56, "a mega directory", 12, 0.65, 500,
                  anchor="middle"))
    t.append(text(490, 74, "PR 3.0, a thousand links", 9.5, 0.45,
                  anchor="middle"))
    for i in range(9):
        x = 366 + i * 29
        b.append(diag(490, 90, x + 11, 126, 0.16, SW * 0.7))
        b.append(rect(x, 132, 22, 22, 0.3, SW * 0.8, r=3))
    t.append(text(490, 172, "...and 991 more", 9.5, 0.35, anchor="middle"))
    t.append(text(490, 190, "crumbs, 0.003 each", 12, 0.55, 500,
                  anchor="middle"))
    b.append(rule(216))
    t.append(text(0, 242, "A footer stuffed with links dilutes every vote the "
                  "page casts,", 12, 0.65))
    t.append(text(0, 262, "including the ones you wanted to count.", 12,
                  0.9, 500))
    return "".join(b), "".join(t), 276, 640


def pr_hops():
    """Moi chang lai chia tiep. Kien truc phang thang."""
    b, t = [], []
    t.append(cap(16, "DEEP - RANK IS DIVIDED AGAIN AT EVERY HOP"))
    chain = (("home", "8.0"), ("category", "0.8"), ("sub-category", "0.08"),
             ("the page", "0.008"))
    for i, (nm, v) in enumerate(chain):
        x = i * 162
        # 0.95 - 3*0.22 = 0.29, gan nhu vo hinh. Buoc 0.15 giu duoc ca hai:
        # van thay thu hang giam dan, va van doc duoc o cuoi.
        op = 0.95 - i * 0.15
        b.append(rect(x, 34, 140, 52, op, SW * (1.6 - i * 0.3), r=8,
                      fill="0.06" if i == 0 else None))
        t.append(text(x + 70, 56, nm, 11.5, op, 500, anchor="middle"))
        t.append(text(x + 70, 74, v, 11, op, 600, anchor="middle", mono=True))
        if i < 3:
            b.append(arrow(x + 144, x + 158, 60, 0.45 - i * 0.08,
                           SW * (1.3 - i * 0.3)))
            t.append(text(x + 151, 104, "/10", 9, 0.4, anchor="middle",
                          mono=True))
    t.append(text(0, 132, "Three hops at ten links each: a thousandth of what "
                  "the homepage had.", 11, 0.55))

    b.append(rule(160))
    t.append(cap(186, "FLAT - ONE HOP, AND THE RANK IS STILL THERE"))
    b.append(rect(0, 204, 140, 52, 0.95, SW * 1.6, r=8, fill="0.06"))
    t.append(text(70, 226, "home", 11.5, 0.95, 500, anchor="middle"))
    t.append(text(70, 244, "8.0", 11, 0.95, 600, anchor="middle", mono=True))
    b.append(arrow(146, 452, 230, 0.85, SW * 1.6))
    b.append(rect(210, 208, 172, 26, 0.7, SW * 1.05, r=13))
    t.append(text(296, 225, "one hop, /10", 10, 0.75, 500, anchor="middle"))
    b.append(rect(460, 204, 180, 52, 0.95, SW * 1.6, r=8, fill="0.06"))
    t.append(text(550, 226, "the same page", 11.5, 0.95, 500,
                  anchor="middle"))
    t.append(text(550, 244, "0.80", 11, 0.95, 600, anchor="middle",
                  mono=True))
    t.append(text(0, 296, "A hundred times the rank, for the same page, "
                  "because it is one click", 12, 0.65))
    t.append(text(0, 316, "from the homepage instead of three.", 12, 0.9,
                  500))
    return "".join(b), "".join(t), 330, 640


def pr_surfer():
    """Nguoi luot ngau nhien: 85 phan tram theo lien ket, 15 phan tram nhay."""
    b, t = [], []
    t.append(cap(16, "THE RANDOM SURFER"))
    cx, cy = 300, 148
    b.append(dot(cx, cy, 46, 0.95, hollow=True, sw=SW * 1.7))
    b.append(dot(cx, cy, 30, 0.10))
    t.append(text(cx, cy - 2, "the page", 11, 0.95, 500, anchor="middle"))
    t.append(text(cx, cy + 14, "they are on", 9.5, 0.6, anchor="middle"))
    for i in range(3):
        y = 62 + i * 86
        b.append(rect(0, y, 150, 40, 0.8, SW * 1.25, r=7))
        t.append(text(75, y + 25, "a linked page", 10.5, 0.8, anchor="middle"))
        b.append(diag(cx - 50, cy + (i - 1) * 24, 158, y + 20, 0.7,
                      SW * 1.35))
    for i in range(4):
        y = 44 + i * 62
        b.append(rect(490, y, 150, 34, 0.35, SW * 0.9, r=7, dash="6 5"))
        t.append(text(565, y + 22, "any page at all", 10, 0.45,
                      anchor="middle"))
        b.append(diag(cx + 50, cy + (i - 1.5) * 20, 482, y + 17, 0.25,
                      SW * 0.8, dash="5 6"))
    b.append(rect(74, 296, 200, 32, 0.95, SW * 1.5, r=16, fill="0.06"))
    t.append(text(174, 317, "85% follow a link", 11.5, 0.95, 500,
                  anchor="middle"))
    b.append(rect(390, 296, 200, 32, 0.45, SW, r=16, dash="6 5"))
    t.append(text(490, 317, "15% type a new URL", 11.5, 0.6, 500,
                  anchor="middle"))
    b.append(rule(354))
    t.append(text(0, 380, "That 15% is why every page has a floor: "
                  "(1 - 0.85) / 750 = 0.0002,", 12, 0.65))
    t.append(text(0, 400, "whether or not anything links to it.", 12, 0.65))
    return "".join(b), "".join(t), 414, 640


def pr_loop():
    """Vong lien ket kin giu het thu hang, cho den khi co cu nhay ngau nhien."""
    b, t = [], []
    t.append(cap(16, "WITHOUT THE RANDOM JUMP"))
    for i, nm in enumerate(("page A", "page B")):
        x = 60 + i * 190
        b.append(dot(x, 82, 38, 0.95, hollow=True, sw=SW * 1.6))
        b.append(dot(x, 82, 24, 0.12))
        t.append(text(x, 80, nm, 11, 0.95, 500, anchor="middle"))
        t.append(text(x, 96, "rank piles up", 8.5, 0.55, anchor="middle"))
    # Hai cung tron dong tam doc ra thanh MOT hinh tron co hai nut nam
    # tren no, khong ra hai chieu di rieng. Hai duong cong co dau mui ten
    # thi ro la A cho B va B cho A.
    b.append(curve(100, 62, 210, 62, 34, 0.75, SW * 1.3))
    b.append(curve(210, 102, 100, 102, -34, 0.75, SW * 1.3))
    b.append(dot(480, 82, 34, 0.3, hollow=True, sw=SW))
    t.append(text(480, 80, "page C", 10.5, 0.4, anchor="middle"))
    t.append(text(480, 96, "rank 0", 8.5, 0.35, anchor="middle", mono=True))
    t.append(text(480, 142, "nothing links here,", 9.5, 0.4, anchor="middle"))
    t.append(text(480, 156, "so it does not exist", 9.5, 0.4, anchor="middle"))
    b.append(rect(0, 168, 300, 28, 0.5, SW, r=6, dash="6 5"))
    t.append(text(150, 187, "rank trapped in the loop forever", 10, 0.6,
                  anchor="middle"))

    b.append(rule(220))
    t.append(cap(246, "WITH THE RANDOM JUMP, d = 0.85"))
    for i, nm in enumerate(("page A", "page B")):
        x = 60 + i * 190
        b.append(dot(x, 312, 34, 0.7, hollow=True, sw=SW * 1.2))
        t.append(text(x, 310, nm, 10.5, 0.75, 500, anchor="middle"))
        t.append(text(x, 326, "lower now", 8.5, 0.5, anchor="middle"))
    b.append(curve(104, 296, 206, 296, 30, 0.5, SW * 1.05))
    b.append(curve(206, 328, 104, 328, -30, 0.5, SW * 1.05))
    b.append(diag(230, 276, 448, 288, 0.35, SW * 0.9, dash="6 5"))
    t.append(text(330, 262, "15% leaks out every pass", 10, 0.55,
                  anchor="middle"))
    b.append(dot(480, 312, 34, 0.85, hollow=True, sw=SW * 1.4))
    b.append(dot(480, 312, 22, 0.08))
    t.append(text(480, 310, "page C", 10.5, 0.9, 500, anchor="middle"))
    t.append(text(480, 326, "0.0002", 8.5, 0.7, anchor="middle", mono=True))
    t.append(text(0, 386, "The jump drains closed loops and gives every page "
                  "a floor.", 12, 0.65))
    t.append(text(0, 406, "Both effects come from the same 15%.", 12, 0.9,
                  500))
    return "".join(b), "".join(t), 420, 640


def pr_damping():
    """Mot thanh chia 85/15, va ba he qua doc thang tu no."""
    b, t = [], []
    t.append(cap(16, "d = 0.85 - WHERE THE RANK COMES FROM"))
    b.append(rect(0, 34, 544, 40, 0.95, SW * 1.5, r=6, fill="0.10"))
    t.append(text(272, 59, "85% flows through links", 12.5, 0.95, 500,
                  anchor="middle"))
    b.append(rect(544, 34, 96, 40, 0.5, SW, r=6, dash="6 5"))
    t.append(text(592, 59, "15%", 12.5, 0.6, 500, anchor="middle"))
    t.append(text(0, 92, "the part you earn", 10, 0.5))
    t.append(text(544, 92, "the part given", 10, 0.5))

    b.append(rule(120))
    cases = (("new pages are not invisible", "base rank = 0.0002",
              "A page published this morning with zero backlinks still has a "
              "rank, and can still appear."),
             ("links still decide", "85% via backlinks",
              "The floor is tiny. You cannot compete on the random jump "
              "alone - real links are required."),
             ("link loops do not work", "15% always leaks",
              "Tight circles built to trap rank lose a seventh of it every "
              "pass, forever."))
    for i, (nm, num, why) in enumerate(cases):
        y = 146 + i * 92
        b.append(rect(0, y, 210, 52, 0.9, SW * 1.35, r=7))
        t.append(text(105, y + 22, nm, 11, 0.95, 500, anchor="middle"))
        t.append(text(105, y + 40, num, 9.5, 0.6, anchor="middle", mono=True))
        for k, ln in enumerate(wrap(why, 50)):
            t.append(text(228, y + 20 + k * 16, ln, 10.5, 0.55))
    t.append(text(0, 434, "Links matter most, and the system still cannot be "
                  "gamed or starved.", 12, 0.9, 500))
    return "".join(b), "".join(t), 448, 640


def pr_dangling_lost():
    """Trang khong co lien ket ra lam thu hang bien mat moi vong lap."""
    b, t = [], []
    t.append(cap(16, "A DEAD END, AND WHAT IT COSTS"))
    for i, (nm, pr, dead) in enumerate((("page A", "2.0", False),
                                        ("page B", "1.5", False),
                                        ("dead end", "3.0", True))):
        x = i * 216
        b.append(rect(x, 34, 190, 56, 0.95 if dead else 0.6,
                      SW * (1.6 if dead else 1.1), r=8,
                      fill="0.05" if dead else None))
        t.append(text(x + 95, 58, nm, 12, 0.95 if dead else 0.7, 500,
                      anchor="middle"))
        t.append(text(x + 95, 77, f"PR {pr}" + ("  ·  0 outlinks" if dead
                                                else ""), 9.5, 0.55,
                      anchor="middle", mono=True))
        if i < 2:
            b.append(arrow(x + 194, x + 212, 62, 0.5, SW * 1.2))
    b.append(seg(527, 94, 527, 132, 0.4, SW, dash="6 5"))
    b.append(rect(438, 138, 178, 30, 0.4, SW, r=6, dash="6 5"))
    t.append(text(527, 158, "3.0 goes nowhere", 10.5, 0.6, anchor="middle"))
    t.append(text(0, 122, "No outlinks means rank has nowhere to flow,", 11,
                  0.55))
    t.append(text(0, 140, "so it leaves the graph instead.", 11, 0.55))

    b.append(rule(192))
    t.append(cap(218, "AND THE WHOLE GRAPH SHRINKS, PASS BY PASS"))
    for i, (lbl, v, frac) in enumerate((("pass 1", "6.5", 1.0),
                                        ("pass 2", "3.5", 0.54),
                                        ("pass 3", "1.8", 0.28))):
        y = 236 + i * 40
        t.append(text(0, y + 17, lbl, 10.5, 0.5, 500, mono=True))
        b.append(bar(64, y, 440, 24, frac, 0.85 - i * 0.2))
        t.append(text(516, y + 17, v, 11, 0.8 - i * 0.15, 600, mono=True))
    t.append(text(0, 384, "Login walls, pages that only link out, removed "
                  "pages that still get links -", 12, 0.65))
    t.append(text(0, 404, "in a bounded crawl, most pages are dead ends.",
                  12, 0.65))
    return "".join(b), "".join(t), 418, 640


def pr_dangling_kept():
    """Gom thu hang cua cac diem cut lai roi chia deu."""
    b, t = [], []
    t.append(cap(16, "STEP 1 - COLLECT WHAT THE DEAD ENDS HOLD"))
    for i, (nm, v) in enumerate((("dead end X", "1.2"), ("dead end Y", "0.8"),
                                 ("dead end Z", "2.0"))):
        x = i * 150
        b.append(rect(x, 34, 132, 48, 0.5, SW, r=7, dash="6 6"))
        t.append(text(x + 66, 56, nm, 11, 0.65, 500, anchor="middle"))
        t.append(text(x + 66, 73, f"PR {v}", 9.5, 0.5, anchor="middle",
                      mono=True))
        b.append(diag(x + 132, 58, 496, 100, 0.3, SW * 0.9))
    b.append(rect(504, 76, 136, 48, 0.95, SW * 1.6, r=7, fill="0.06"))
    t.append(text(572, 98, "pool D", 12, 0.95, 500, anchor="middle"))
    t.append(text(572, 115, "= 4.0", 10.5, 0.9, 600, anchor="middle",
                  mono=True))
    t.append(text(0, 108, "D = 1.2 + 0.8 + 2.0", 10.5, 0.5, mono=True))

    b.append(rule(152))
    t.append(cap(178, "STEP 2 - HAND IT BACK, EVENLY, TO EVERY PAGE"))
    b.append(rect(180, 194, 280, 36, 0.95, SW * 1.5, r=7, fill="0.05"))
    t.append(text(320, 217, "d x D / N  =  0.85 x 4.0 / 750", 11.5, 0.95, 500,
                  anchor="middle", mono=True))
    b.append(down(320, 234, 254, 0.35))
    b.append(rect(238, 258, 164, 28, 0.7, SW * 1.1, r=14))
    t.append(text(320, 277, "0.0045 per page", 10.5, 0.85, 500,
                  anchor="middle", mono=True))
    for i, nm in enumerate(("page 1", "page 2", "page 3", "page N")):
        x = 12 + i * 164
        b.append(diag(320, 290, x + 66, 322, 0.3, SW * 0.9))
        b.append(rect(x, 328, 132, 44, 0.75, SW * 1.15, r=6))
        t.append(text(x + 66, 349, nm, 10.5, 0.75, 500, anchor="middle"))
        t.append(text(x + 66, 365, "+0.0045", 9.5, 0.6, anchor="middle",
                      mono=True))
    t.append(text(320, 396, "...", 12, 0.35, anchor="middle"))
    t.append(text(0, 426, "Nothing is lost at a dead end. The surfer who "
                  "hits one just types a new URL,", 12, 0.65))
    t.append(text(0, 446, "which is the same thing the 15% was already "
                  "doing.", 12, 0.65))
    return "".join(b), "".join(t), 460, 640


# =================================================== neural-reranking-bert (3)

def bert_bidirectional():
    """Doc mot chieu khong thay tu phia sau; BERT thay ca hai phia."""
    b, t = [], []
    toks = ("I", "went", "to", "the", "bank", "to", "fish")
    xs = [0]
    for tok in toks[:-1]:
        xs.append(xs[-1] + max(len(tok) * 9 + 30, 56) + 10)
    widths = [max(len(tok) * 9 + 30, 56) for tok in toks]

    t.append(cap(16, "READING LEFT TO RIGHT ONLY"))
    for i, tok in enumerate(toks):
        hero = i == 4
        after = i > 4
        b.append(rect(xs[i], 34, widths[i], 34, 0.2 if after
                      else (0.95 if hero else 0.5),
                      SW * (1.5 if hero else 0.95), r=6,
                      fill="0.06" if hero else None))
        t.append(text(xs[i] + widths[i] / 2, 56, tok, 11.5,
                      0.25 if after else (0.95 if hero else 0.7),
                      500 if hero else 400, anchor="middle"))
        if i < 4:
            b.append(diag(xs[i] + widths[i] + 1, 51, xs[i + 1] - 2, 51, 0.4,
                          SW * 0.9))
    t.append(text(xs[5], 92, "not read yet", 9.5, 0.35))
    b.append(rect(xs[4] - 6, 108, 220, 30, 0.5, SW, r=6, dash="6 5"))
    t.append(text(xs[4] + 104, 128, "bank = money? river?", 10.5, 0.65,
                  anchor="middle"))
    t.append(text(0, 168, 'The word "fish" is three tokens away and has not '
                  "been reached.", 11.5, 0.55))

    b.append(rule(196))
    t.append(cap(222, "BERT - BOTH DIRECTIONS AT ONCE"))
    y = 300
    for i, tok in enumerate(toks):
        hero = i == 4
        b.append(rect(xs[i], y, widths[i], 34, 0.95 if hero else 0.6,
                      SW * (1.6 if hero else 1.05), r=6,
                      fill="0.06" if hero else None))
        t.append(text(xs[i] + widths[i] / 2, y + 22, tok, 11.5,
                      0.95 if hero else 0.75, 500 if hero else 400,
                      anchor="middle"))
    # cung chu y tu "bank" toi moi tu khac, do day theo trong so
    src = xs[4] + widths[4] / 2
    weights = (0.12, 0.2, 0.14, 0.3, 0, 0.35, 0.95)
    for i, w in enumerate(weights):
        if i == 4:
            continue
        dst = xs[i] + widths[i] / 2
        mid = (src + dst) / 2
        lift = 34 + abs(src - dst) * 0.20
        b.append(f'<path d="M{src:.1f},{y - 2:.1f} Q{mid:.1f},{y - lift:.1f} '
                 f'{dst:.1f},{y - 2:.1f}" fill="none" stroke="currentColor" '
                 f'stroke-opacity="{0.15 + w * 0.6:.2f}" '
                 f'stroke-width="{SW * (0.5 + w * 1.4):.2f}" '
                 f'stroke-linecap="round"/>')
    b.append(rect(xs[4] - 6, y + 46, 220, 30, 0.95, SW * 1.4, r=6,
                  fill="0.06"))
    t.append(text(xs[4] + 104, y + 66, "bank = riverbank", 10.5, 0.95, 500,
                  anchor="middle"))
    t.append(text(0, y + 106, "Thickness is attention weight. The heaviest "
                  'line runs to "fish",', 11.5, 0.55))
    t.append(text(0, y + 126, "which is four words to the right.", 11.5,
                  0.9, 500))
    return "".join(b), "".join(t), y + 140, 640


def bert_rerank():
    """BERT chay sau cung, tren nam ung vien, va no doi thu tu."""
    b, t = [], []
    t.append(cap(16, "BERT RUNS LAST, ON FIVE CANDIDATES"))
    b.append(rect(220, 32, 200, 34, 0.9, SW * 1.3, r=17))
    b.append(magnifier(240, 49, 6.5, 0.75, SW * 0.85))
    t.append(text(256, 54, "the user's query", 11, 0.9, 500))
    for i, (nm, sub, x) in enumerate((("BM25", "keyword match", 40),
                                      ("PageRank", "authority", 400))):
        b.append(diag(320, 70, x + 100, 96, 0.35, SW * 0.9))
        b.append(rect(x, 102, 200, 44, 0.6, SW * 1.1, r=7)),
        t.append(text(x + 100, 122, nm, 11.5, 0.8, 500, anchor="middle"))
        t.append(text(x + 100, 138, sub, 9.5, 0.5, anchor="middle"))
        b.append(diag(x + 100, 176, 320, 194, 0.35, SW * 0.9))
    # Hai nhan nay tung nam o y=166, dung tren hai duong cheo di xuong o
    # duoi. Dua chung len ngang than hai hop, ben ngoai duong.
    # Hai nhan nay khong con cho o le trai va le phai: 640 la het khung, va
    # "computed" bi cat mat mot nua. Dua chung vao trong, ngay duoi hop ma
    # chung noi den.
    t.append(text(140, 166, "scans all 750 pages", 9.5, 0.4,
                  anchor="middle"))
    t.append(text(500, 166, "authority, pre-computed", 9.5, 0.4,
                  anchor="middle"))
    b.append(rect(200, 200, 240, 32, 0.55, SW, r=6))
    t.append(text(320, 221, "five candidates, in this order", 10.5, 0.65,
                  anchor="middle"))
    order = (("#1", "8.4"), ("#2", "7.1"), ("#3", "6.8"), ("#4", "5.9"),
             ("#5", "5.2"))
    for i, (nm, sc) in enumerate(order):
        x = i * 130
        b.append(rect(x, 246, 114, 40, 0.5, SW, r=6))
        t.append(text(x + 57, 265, nm, 11, 0.7, 500, anchor="middle"))
        t.append(text(x + 57, 280, sc, 9.5, 0.5, anchor="middle", mono=True))
    b.append(down(320, 292, 312, 0.35))
    b.append(rect(120, 318, 400, 50, 0.95, SW * 1.7, r=8, fill="0.05"))
    b.append(spark(150, 343, 9, 0.9, SW * 0.8))
    t.append(text(172, 340, "BERT cross-encoder", 12.5, 0.95, 500))
    t.append(text(172, 357, "reads the query and the page together", 9.5,
                  0.55))
    b.append(down(320, 374, 394, 0.35))
    after = (("#3", "0.94", 2), ("#1", "0.87", 0), ("#5", "0.72", 4),
             ("#2", "0.61", 1), ("#4", "0.38", 3))
    # Cham theo QUANG DUONG di, khong theo "co di hay khong": moi ket qua
    # deu doi cho, nen `was != i` dung cho ca nam va khong con lam noi bat
    # duoc gi. Hai cai nhay xa nhat moi la cai bai viet dang noi den.
    for i, (nm, sc, was) in enumerate(after):
        x = i * 130
        jump = abs(was - i)
        b.append(rect(x, 400, 114, 40, 0.45 + jump * 0.25,
                      SW * (0.95 + jump * 0.25), r=6,
                      fill="0.05" if jump >= 2 else None))
        t.append(text(x + 57, 419, nm, 11, 0.55 + jump * 0.2, 500,
                      anchor="middle"))
        t.append(text(x + 57, 434, sc, 9.5, 0.45 + jump * 0.13,
                      anchor="middle", mono=True))
        if jump >= 2:
            t.append(text(x + 57, 454, "up 2" if was > i else "down 2", 9,
                          0.6, anchor="middle"))
    t.append(text(0, 492, "The third result became the first: better meaning, "
                  "despite a lower keyword score.", 12, 0.65))
    t.append(text(0, 512, "The fourth fell to last: the words matched and the "
                  "meaning did not.", 12, 0.65))
    return "".join(b), "".join(t), 526, 640


def bert_crossencoder():
    """Truy van va tai lieu di vao cung mot chuoi, nen chu y bat cheo duoc."""
    b, t = [], []
    t.append(cap(16, "ONE SEQUENCE: THE QUERY, A SEPARATOR, THE DOCUMENT"))
    q = ("how", "does", "caching", "work")
    d = ("CDN", "stores", "copies", "...")
    xs, widths = [], []
    x = 0
    for tok in q + ("[SEP]",) + d:
        w = max(len(tok) * 8.6 + 24, 48)
        xs.append(x)
        widths.append(w)
        x += w + 9
    for i, tok in enumerate(q + ("[SEP]",) + d):
        sep = i == 4
        b.append(rect(xs[i], 34, widths[i], 32, 0.85 if sep else 0.6,
                      SW * (1.4 if sep else 1.05), r=6,
                      fill="0.06" if sep else None))
        t.append(text(xs[i] + widths[i] / 2, 55, tok, 10.5, 0.9 if sep
                      else 0.75, 500, anchor="middle", mono=sep))
    b.append(rect(0, 76, xs[3] + widths[3], 20, 0.4, SW * 0.85, r=10))
    t.append(text((xs[3] + widths[3]) / 2, 90, "the query", 9.5, 0.55,
                  anchor="middle"))
    b.append(rect(xs[5], 76, xs[8] + widths[8] - xs[5], 20, 0.4, SW * 0.85,
                  r=10))
    t.append(text((xs[5] + xs[8] + widths[8]) / 2, 90, "the document", 9.5,
                  0.55, anchor="middle"))

    # chu y bat cheo: "caching" trong truy van toi "CDN"/"stores"/"copies"
    # Cac cung tung uon LEN tu y=130, tuc di thang qua hai vien "the
    # query" / "the document" o y=76..96. Cho chung uon XUONG, duoi ca hai.
    src = xs[2] + widths[2] / 2
    for i, w in ((5, 0.9), (6, 0.7), (7, 0.55)):
        dst = xs[i] + widths[i] / 2
        mid = (src + dst) / 2
        b.append(f'<path d="M{src:.1f},104 Q{mid:.1f},{104 + 44:.1f} '
                 f'{dst:.1f},104" fill="none" stroke="currentColor" '
                 f'stroke-opacity="{0.25 + w * 0.5:.2f}" '
                 f'stroke-width="{SW * (0.5 + w * 1.2):.2f}" '
                 f'stroke-linecap="round"/>')
    t.append(text(0, 158, "cross-attention", 10, 0.5, 500))
    b.append(down(320, 166, 190, 0.35))
    b.append(rect(80, 196, 480, 56, 0.95, SW * 1.6, r=8, fill="0.05"))
    t.append(text(320, 220, "the transformer layers", 12.5, 0.95, 500,
                  anchor="middle"))
    t.append(text(320, 239, "every token attends to every other token, across "
                  "both halves", 9.5, 0.55, anchor="middle"))
    b.append(down(320, 256, 282, 0.35))
    b.append(rect(220, 288, 200, 40, 0.95, SW * 1.6, r=8, fill="0.07"))
    t.append(text(320, 314, "relevance 0.94", 12.5, 0.95, 600,
                  anchor="middle", mono=True))
    b.append(rule(358))
    t.append(text(0, 384, 'It sees "caching" in the query and "CDN stores '
                  'copies" in the page,', 12, 0.65))
    t.append(text(0, 404, "and scores them as the same idea. They share no "
                  "words at all.", 12, 0.9, 500))
    return "".join(b), "".join(t), 418, 640


# ============================================================ ai-overviews(3)

def aio_build():
    """Mot lan bo, ba nhanh dung: chi muc nguoc, thu hang, va kho vector.

    Ban cu ve bang hop pastel bon mau, moi mau mot y nghia khong ai giai
    thich. O day chi co mot mau, va cai phan biet la vi tri: hang giua la
    viec dang chay, hang duoi la thu con lai tren dia."""
    b, t = [], []
    t.append(cap(16, "ONE CRAWL, THREE THINGS BUILT FROM IT"))
    bb, tt = box(240, 32, 160, 44, "the crawler", strong=True)
    b.append(bb)
    t.append(tt)
    b.append(down(320, 78, 96, 0.35))
    bb, tt = box(240, 100, 160, 40, "pages, as parsed")
    b.append(bb)
    t.append(tt)

    lanes = (("indexer", "every word, once", "inverted index",
              "what BM25 reads"),
             ("PageRank", "the link graph", "rank scores",
              "who links to whom"),
             ("chunker", "700-token pieces", "vector store",
              "what the overview reads"))
    for i, (mid, midsub, store, storesub) in enumerate(lanes):
        x = i * 220
        b.append(diag(320, 142, x + 90, 176, 0.3, SW * 0.9))
        bb, tt = box(x, 182, 180, 44, mid, midsub)
        b.append(bb)
        t.append(tt)
        if i == 2:
            b.append(down(x + 90, 228, 248, 0.3))
            bb, tt = box(x, 254, 180, 40, "embedder", "Voyage voyage-3-lite")
            b.append(bb)
            t.append(tt)
            b.append(down(x + 90, 296, 316, 0.3))
        else:
            b.append(down(x + 90, 228, 316, 0.28))
        b.append(rect(x, 322, 180, 46, 0.95, SW * 1.5, r=7, fill="0.05"))
        t.append(text(x + 90, 344, store, 12, 0.95, 500, anchor="middle"))
        t.append(text(x + 90, 359, storesub, 9.5, 0.55, anchor="middle"))
    t.append(text(0, 420, "The same parsed pages feed all three. Only the "
                  "third one has a model in it.", 12, 0.65))
    return "".join(b), "".join(t), 434, 640


def aio_rag():
    """Mot trang thanh nhieu manh, moi manh thanh mot vector, roi vao kho."""
    b, t = [], []
    t.append(cap(16, "HOW A PAGE BECOMES SOMETHING A MODEL CAN LOOK UP"))
    b.append(sheet(0, 40, 96, 118, 0.6))
    t.append(text(48, 176, "one page", 10.5, 0.65, 500, anchor="middle"))
    t.append(text(48, 191, "10,000 words", 9.5, 0.4, anchor="middle"))

    for i in range(3):
        y = 46 + i * 44
        b.append(diag(102, 99, 156, y + 16, 0.3, SW * 0.85))
        b.append(rect(162, y, 122, 32, 0.7, SW * 1.1, r=5))
        t.append(text(223, y + 20, f"chunk {i + 1}", 10, 0.75,
                      anchor="middle", mono=True))
        b.append(arrow(290, 320, y + 16, 0.3))
        b.append(rect(326, y, 176, 32, 0.55, SW, r=5))
        vals = (("0.31", "0.08", "0.42", "0.11"),
                ("0.04", "0.27", "0.66", "0.19"),
                ("0.52", "0.13", "0.09", "0.38"))[i]
        for j, v in enumerate(vals):
            t.append(text(336 + j * 38, y + 20, v, 8.5, 0.55, mono=True))
        t.append(text(494, y + 20, "...", 8.5, 0.4, anchor="end"))
    t.append(text(223, 194, "700 tokens each", 9.5, 0.4, anchor="middle"))
    t.append(text(414, 194, "1,024 numbers each", 9.5, 0.4, anchor="middle"))
    t.append(text(414, 210, "voyage-3-lite", 9.5, 0.55, anchor="middle",
                  mono=True))

    b.append(rect(520, 40, 120, 118, 0.95, SW * 1.5, r=7, fill="0.04"))
    t.append(text(580, 62, "the vector store", 10, 0.95, 500,
                  anchor="middle"))
    pts = ((0.30, 0.62), (0.36, 0.70), (0.44, 0.66), (0.70, 0.34),
           (0.76, 0.42), (0.62, 0.30), (0.52, 0.86), (0.84, 0.74))
    for j, (px, py) in enumerate(pts):
        b.append(dot(532 + px * 96, 78 + py * 66, 3.4 if j < 3 else 2.6,
                     0.85 if j < 3 else 0.35))
    for i in range(3):
        b.append(diag(508, 62 + i * 44, 526, 92 + i * 6, 0.3, SW * 0.85))
    t.append(text(580, 176, "near things sit near", 9.5, 0.5,
                  anchor="middle"))
    b.append(rule(234))
    t.append(text(0, 260, "The chunks and their vectors are stored side by "
                  "side, with the page they came from.", 12, 0.65))
    t.append(text(0, 280, "Nothing here is a search yet. All of it happens "
                  "before anyone asks anything.", 12, 0.9, 500))
    return "".join(b), "".join(t), 294, 640


def aio_two_paths():
    """Mot truy van, hai duong chay song song, hai ket qua khac nhau."""
    b, t = [], []
    t.append(cap(16, "ONE QUERY, TWO PATHS, RUN AT THE SAME TIME"))
    b.append(rect(220, 32, 200, 32, 0.95, SW * 1.4, r=16, fill="0.05"))
    b.append(magnifier(242, 48, 6.5, 0.8, SW * 0.85))
    t.append(text(258, 53, "ronaldo", 11.5, 0.95, 500, mono=True))
    b.append(diag(300, 68, 156, 96, 0.35, SW * 0.9))
    b.append(diag(340, 68, 484, 96, 0.35, SW * 0.9))
    t.append(text(150, 88, "the search path", 10, 0.5, 500, anchor="middle"))
    t.append(text(490, 88, "the overview path", 10, 0.5, 500,
                  anchor="middle"))

    left = (("tokenize", "[ronaldo]"),
            ("index lookup", "93 docs match"),
            ("BM25 + PageRank", "score every one"),
            ("combine", "one ordered list"))
    for i, (nm, sub_) in enumerate(left):
        y = 102 + i * 62
        b.append(rect(30, y, 240, 44, 0.6, SW * 1.1, r=7))
        t.append(text(150, y + 20, nm, 11.5, 0.8, 500, anchor="middle"))
        t.append(text(150, y + 35, sub_, 9.5, 0.5, anchor="middle",
                      mono=True))
        if i < 3:
            b.append(down(150, y + 46, y + 60, 0.3))
    b.append(down(150, 350, 366, 0.35))
    b.append(rect(30, 372, 240, 44, 0.95, SW * 1.5, r=7, fill="0.05"))
    t.append(text(150, 392, "ranked links", 12, 0.95, 500, anchor="middle"))
    t.append(text(150, 407, "93 results", 9.5, 0.6, anchor="middle",
                  mono=True))

    right = (("query fan-out", "one query becomes five"),
             ("embed each one", "voyage-3-lite again"),
             ("vector search", "nearest chunks, by meaning"),
             ("LLM synthesis", "write it, cite the chunks"))
    for i, (nm, sub_) in enumerate(right):
        y = 102 + i * 62
        b.append(rect(370, y, 240, 44, 0.6, SW * 1.1, r=7))
        t.append(text(490, y + 20, nm, 11.5, 0.8, 500, anchor="middle"))
        t.append(text(490, y + 35, sub_, 9.5, 0.5, anchor="middle"))
        if i < 3:
            b.append(down(490, y + 46, y + 60, 0.3))
    b.append(spark(388, 122, 8, 0.8, SW * 0.7))
    b.append(spark(388, 308, 8, 0.8, SW * 0.7))
    b.append(down(490, 350, 366, 0.35))
    b.append(rect(370, 372, 240, 44, 0.95, SW * 1.5, r=7, fill="0.05"))
    t.append(text(490, 392, "the AI Overview", 12, 0.95, 500,
                  anchor="middle"))
    t.append(text(490, 407, "one paragraph, with citations", 9.5, 0.6,
                  anchor="middle"))

    b.append(seg(320, 96, 320, 424, 0.18, SW * 0.8, dash="6 7"))
    t.append(text(320, 440, "neither path waits for the other", 10, 0.45,
                  anchor="middle"))
    b.append(rule(462))
    t.append(text(0, 488, "The two stars are the only model calls: one "
                  "expands the query, one writes the answer.", 12, 0.65))
    t.append(text(0, 508, "Everything else is the same machinery the links "
                  "already used.", 12, 0.65))
    return "".join(b), "".join(t), 522, 640


# ------------------------------------------------------------------ so dang ky

FIGURES = {
    "web-crawling-in-search-engines": [
        ("1774721767508", wc_without_with),
        ("1774721808232", wc_two_steps),
        ("1774721961356", wc_depth),
    ],
    "designing-the-web-crawler": [
        ("1774722089564", dc_pipeline),
        ("1774722115306", dc_fetcher),
        ("1774722152206", dc_parser),
    ],
    "inverted-index": [
        ("1774721551959", ix_where),
        ("1774721592556", ix_forward_vs_inverted),
        ("1774721629982", ix_three_tables),
        ("1774721655408", ix_tokenizer),
    ],
    "ranking-with-bm25": [
        ("1774721328456", bm_league),
        ("1774721357555", bm_idf),
        ("1774721386295", bm_saturation),
        ("1774721413898", bm_length),
        ("1774721446689", bm_flow),
    ],
    "ranking-with-pagerank": [
        ("1774720616760", pr_votes),
        ("1774720630732", pr_split),
        ("1774720666488", pr_hops),
        ("1774720755309", pr_surfer),
        ("1774720777570", pr_loop),
        ("1774720800020", pr_damping),
        ("1774720885476", pr_dangling_lost),
        ("1774720911707", pr_dangling_kept),
    ],
    "ai-overviews": [
        ("1774358526049", aio_build),
        ("1774358914549", aio_rag),
        ("1774361030372", aio_two_paths),
    ],
    "neural-reranking-with-bert": [
        ("1774721022675", bert_bidirectional),
        ("1774721061500", bert_rerank),
        ("1774721114491", bert_crossencoder),
    ],
}


def main():
    payload = {}
    total = 0
    for slug, items in FIGURES.items():
        out = []
        for i, (src, fn) in enumerate(items):
            strokes, labels, h, maxw = fn()
            uid = f"{slug[:14].replace('-', '')}{i}"
            out.append({"src": src,
                        "svg": article_svg(uid, strokes, labels, W, h, maxw)})
        payload[slug] = out
        total += len(out)
        print(f"{slug}: {len(out)} hinh")
    OUT.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"\n-> {OUT.name}  ({total} hinh)")


if __name__ == "__main__":
    main()
