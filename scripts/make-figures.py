"""Hinh trong long bai viet, ve tay, cung ngon ngu voi bia va voi Work.

Cach dung:

    python scripts/make-figures.py <slug> [...]      -> scripts/_figures.json
    railway run --service database node scripts/push-figures.cjs \\
        scripts/_figures.json

Hai luat rieng cua hinh trong bai, khac hoan toan voi bia:

  1. MAU LAY TU TRANG. `article_svg` dat color = primary cua site, moi net va
     moi chu deu la `currentColor`, nen hinh tu doi khi trang sang che do toi.
     Bia thi nguoc lai: no nam trong <img> nen phai in cung mau.
  2. ID BO LOC MANG TEN RIENG. Mot bai co the co muoi lam hinh nam chung mot
     trang; hai cai cung dat id="rough" thi cai sau an theo dinh nghia cua cai
     dau.

Va mot luat chung voi ca hai: doc doan van dan vao hinh truoc khi ve. Mot hinh
ve lai ma khong noi dung y cua doan van do chi la doi kieu, khong phai ve lai.
"""

import json
import sys
from pathlib import Path

from doodle import (
    SW, arrow, article_svg, caret_block, check, chip, dot, ellipse, hashf,
    magnifier, rect, seg, sheet, spark, text,
)

OUT = Path(__file__).resolve().parent / "_figures.json"


# ------------------------------------------------------------- khoi chung


def hbar(x, y, w, h, v, op=0.9, fill="0.16", hatch=False):
    """Mot cot ngang ve tay. `hatch` danh dau day la CHI PHI chu khong phai
    thanh tich — trong mot bo hinh mot mau, gach cheo la cach duy nhat noi
    "cai nay cang dai cang te" ma khong phai doi mau."""
    b = [rect(x, y, max(2.0, w), h, op, SW * (0.85 if not hatch else 0.85),
              fill=None if hatch else fill, r=3)]
    if hatch:
        k = 0
        while k * 9 < w - 4:
            b.append(seg(x + 4 + k * 9, y + h - 2, x + 4 + k * 9 + h - 4, y + 2,
                         op * 0.5, SW * 0.55))
            k += 1
    return "".join(b)


def axis(x0, x1, y, ticks, op=0.3):
    b = [seg(x0, y, x1, y, op, SW * 0.8)]
    t = []
    for frac, label in ticks:
        xx = x0 + (x1 - x0) * frac
        b.append(seg(xx, y, xx, y + 5, op, SW * 0.8))
        t.append(text(xx, y + 20, label, 11, 0.4, anchor="middle"))
    return "".join(b), "".join(t)


# ------------------------------------------- measuring-search-quality (9)


def msq_by_intent():
    """nDCG theo tung loai truy van. Hai loai duoi cung mo hon: do la hai loai
    may bi tra loi te nhat."""
    b, t = [], []
    rows = (("stopword heavy", 0.960, True), ("multi-term", 0.817, True),
            ("entity", 0.753, True), ("informational", 0.722, True),
            ("navigational", 0.640, False), ("misspelled", 0.622, False))
    lx, bx, bw = 118, 130, 400
    for i, (name, v, strong) in enumerate(rows):
        y = 14 + i * 32
        t.append(text(lx, y + 12, name, 12.5, 0.75 if strong else 0.5,
                      anchor="end"))
        b.append(hbar(bx, y, bw * v, 17, v, 0.9 if strong else 0.5,
                      "0.16" if strong else "0.07"))
        t.append(text(bx + bw * v + 12, y + 13, f"{v:.3f}", 12,
                      0.9 if strong else 0.5, 500, mono=True))
    ab, at = axis(bx, bx + bw, 14 + 6 * 32 + 4,
                  ((0, "0"), (0.5, "0.5"), (1.0, "1.0")))
    b.append(ab)
    t.append(at)
    return "".join(b), "".join(t), 244, 640


def msq_kubernetes():
    """Bon tu cua mot truy van Kubernetes chay rieng le tren chi muc bong da.
    Ba tu dau khong co gi; tu thu tu keo ve 1,422 tai lieu — va do la ly do ca
    truy van tra ve 1,429 ket qua khong lien quan."""
    b, t = [], []
    rows = (("kubernetes", 0, "0"), ("ingress", 0, "0"),
            ("annotations", 20, "20"), ("controller", 1422, "1,422"))
    lx, bx, bw = 122, 134, 400
    for i, (name, v, label) in enumerate(rows):
        y = 12 + i * 34
        t.append(text(lx, y + 13, name, 13, 0.6, anchor="end", mono=True))
        w = bw * (v / 1422) if v else 0
        if v:
            b.append(hbar(bx, y, w, 18, v, 0.9 if v > 100 else 0.45,
                          "0.16" if v > 100 else "0.06"))
        else:
            b.append(seg(bx, y + 2, bx, y + 16, 0.28, SW * 0.9))
        t.append(text(bx + max(w, 4) + 12, y + 14, label, 12.5,
                      0.9 if v > 100 else 0.45, 600 if v > 100 else 400,
                      mono=True))
    b.append(seg(0, 160, 620, 160, 0.22, SW * 0.8))
    t.append(text(0, 184, "The whole query returns 1,429 results,", 13.5, 0.8))
    t.append(text(0, 206, "none of them about Kubernetes.", 13.5, 0.5))
    return "".join(b), "".join(t), 220, 640


def msq_tokenizer():
    """Chuoi xu ly chu pha nat "serie a": tach tu, bo stopword, rut gon. Sau ba
    buoc, mot trong nam giai dau chau Au con lai "seri"."""
    b, t = [], []
    stages = (('"serie a"', None),
              ('["serie", "a"]', "lowercase, strip punctuation"),
              ('["serie"]', 'drop stopwords — "a" is one of them'),
              ('["seri"]', "Porter stemmer"))
    for i, (val, how) in enumerate(stages):
        y = 26 + i * 62
        last = i == len(stages) - 1
        if last:
            # buoc cuoi la ket qua, nen no duoc dong khung — khong ve lai lan
            # thu hai o duoi, do la loi cua ban truoc
            b.append(rect(0, y - 22, 128, 34, 0.9, SW * 1.3, r=6))
            t.append(text(64, y + 1, val, 15, 0.95, 500, anchor="middle",
                          mono=True))
            t.append(text(148, y - 6, "matches series, serious, serial —", 13,
                          0.6))
            t.append(text(148, y + 16, "and not the league you asked for.", 13,
                          0.6))
        else:
            t.append(text(0, y, val, 15, 0.95, 500, mono=True))
            b.append(seg(9, y + 12, 9, y + 42, 0.35, SW * 0.9))
            b.append(seg(4, y + 35, 9, y + 42, 0.35, SW * 0.9))
            b.append(seg(14, y + 35, 9, y + 42, 0.35, SW * 0.9))
        if how:
            t.append(text(26, y - 26, how, 12.5, 0.5))
    return "".join(b), "".join(t), 232, 620


def msq_reranker():
    """Bat va tat cross-encoder tren cung nam muoi truy van. Hai cot dau la
    thanh tich nen to dac; cot do tre la CHI PHI nen gach cheo — cang dai cang
    te, khong the ve giong hai cai tren."""
    b, t = [], []
    groups = (("nDCG@10", 0.7394, 0.5689, "0.7394", "0.5689", 0.74, False),
              ("MRR", 0.6259, 0.3407, "0.6259", "0.3407", 0.63, False),
              ("latency p50", 1325, 167, "1,325 ms", "167 ms", 1.0, True))
    bx, bw = 118, 380
    for gi, (name, on, off, lon, loff, scale, cost) in enumerate(groups):
        y = 16 + gi * 82
        t.append(text(0, y + 12, name, 13, 0.9, 500))
        for k, (v, label) in enumerate(((on, lon), (off, loff))):
            yy = y + k * 26
            frac = v / (1425 if cost else 1.0)
            w = bw * (frac if cost else v)
            t.append(text(bx - 12, yy + 13, "on" if k == 0 else "off", 11.5,
                          0.45, anchor="end"))
            b.append(hbar(bx, yy, w, 17, v, 0.9 if k == 0 else 0.45,
                          "0.16" if k == 0 else "0.06", hatch=cost))
            t.append(text(bx + w + 12, yy + 13, label, 12,
                          0.9 if k == 0 else 0.5, 500, mono=True))
    t.append(text(0, 254, "The reranker is worth 23% of nDCG", 13.5, 0.8))
    t.append(text(0, 274, "and eight times the latency.", 13.5, 0.5))
    return "".join(b), "".join(t), 292, 620


def box(x, y, w, h, title, sub=None, strong=False, r=8, dash=None):
    """Mot o co nhan. Tra ve (net, chu) de nguoi goi tu gop."""
    b = [rect(x, y, w, h, 0.95 if strong else 0.45,
              SW * (1.5 if strong else 1.0), r=r, dash=dash,
              fill="0.05" if strong else None)]
    t = [text(x + w / 2, y + (h / 2 + 5 if not sub else h / 2 - 3), title,
              12.5, 0.95 if strong else 0.7, 500 if strong else 400,
              anchor="middle")]
    if sub:
        t.append(text(x + w / 2, y + h / 2 + 15, sub, 10.5, 0.4,
                      anchor="middle"))
    return "".join(b), "".join(t)


def down(x, y0, y1, op=0.35):
    return (seg(x, y0, x, y1, op, SW * 0.9)
            + seg(x - 5, y1 - 7, x, y1, op, SW * 0.9)
            + seg(x + 5, y1 - 7, x, y1, op, SW * 0.9))


# ------------------------------------------------ a-cms-adaptable-... (8)


def cms_by_hand():
    """Cong viec truoc khi co agent: mot Doc 30 trang, dan vao CMS thi mat het
    dinh dang, roi dung lai bang tay tren sau lop — va lam lai tung ay viec cho
    hai muoi anh."""
    b, t = [], []
    t.append(text(0, 12, "THE WORK - BY HAND - NO AGENT", 11, 0.35, 500))
    b.append(sheet(0, 34, 84, 108, 0.55))
    for i, f in enumerate((0.8, 0.62, 0.86, 0.55)):
        b.append(seg(12, 62 + i * 18, 12 + 60 * f, 62 + i * 18, 0.28,
                     SW * 0.8))
    t.append(text(42, 162, "Google Doc", 11.5, 0.6, 500, anchor="middle"))
    t.append(text(42, 178, "30 pages, 20 images", 10, 0.4, anchor="middle"))
    b.append(arrow(96, 136, 88, 0.4))
    t.append(text(148, 82, "Copy-paste into the CMS", 13.5, 0.85, 500))
    t.append(text(148, 102, "raw HTML, styling lost", 11.5, 0.45))
    t.append(text(148, 138, "Rebuild the formatting by hand,", 12.5, 0.6))
    t.append(text(148, 156, "on every article", 12.5, 0.6))

    layers = (("headings", "wrap and style each"),
              ("paragraphs", "re-align every one"),
              ("spans", "bold / italic by hand"),
              ("anchors", "strip the Docs styles"),
              ("tables", "set width 100%"),
              ("wrappers", "add div containers"))
    for i, (name, what) in enumerate(layers):
        y = 214 + i * 26
        t.append(text(96, y, name, 12, 0.8, 500, anchor="end", mono=True))
        t.append(text(112, y, what, 12, 0.45))
    b.append(seg(0, 384, 620, 384, 0.22, SW * 0.8))
    t.append(text(0, 408, "For each of 20 images", 12.5, 0.8, 500))
    for i, (name, how) in enumerate((("download", "from the Doc"),
                                     ("resize", "to 800px"),
                                     ("convert", "JPEG q92"),
                                     ("rename", "by hand"),
                                     ("alt + caption", "one at a time"))):
        x = i * 124
        bb, tt = box(x, 422, 112, 42, name, how)
        b.append(bb)
        t.append(tt)
        if i < 4:
            b.append(arrow(x + 114, x + 122, 443, 0.3))
    t.append(text(0, 486, "twenty times, on every article", 11.5, 0.4))
    return "".join(b), "".join(t), 500, 640


def cms_architecture():
    """Hai giai doan. Tren: hoc mot lan cho moi website, va do la cho duy nhat
    co model. Duoi: xuat ban tung bai, khong mot lan goi model nao."""
    b, t = [], []
    b.append(rect(0, 22, 620, 214, 0.3, SW * 0.9, r=10, dash="7 7"))
    t.append(text(12, 16, "I - ONBOARDING, ONCE PER WEBSITE", 11, 0.4, 500))
    bb, tt = box(16, 44, 128, 46, "Source sample", "Google Doc HTML")
    b.append(bb)
    t.append(tt)
    bb, tt = box(16, 100, 128, 46, "Target sample", "published WP HTML")
    b.append(bb)
    t.append(tt)
    b.append(arrow(150, 182, 95, 0.4))

    b.append(rect(190, 60, 130, 70, 0.95, SW * 1.6, r=10, fill="0.05"))
    b.append(spark(210, 84, 9, 0.95, SW * 0.8))
    t.append(text(224, 88, "1 Claude call", 12.5, 0.95, 500))
    t.append(text(255, 112, "sonnet, 4k tok, 60s", 10, 0.45, anchor="middle"))
    b.append(down(255, 132, 156))

    b.append(rect(150, 158, 340, 66, 0.5, SW, r=8))
    t.append(text(164, 176, "DETERMINISTIC DETECTORS", 9.5, 0.4, 500))
    for i, (verb, layers, fate) in enumerate((
            ("REPLACE", "paragraph, span, anchor", "drop the model's"),
            ("APPEND", "wrapper, table", "keep and add to it"))):
        y = 196 + i * 20
        t.append(text(164, y, verb, 11, 0.9, 500, mono=True))
        t.append(text(232, y, layers, 11, 0.55))
        t.append(text(478, y, fate, 10.5, 0.4, anchor="end"))
    b.append(arrow(496, 528, 191, 0.4))
    bb, tt = box(500, 150, 120, 82, "Pattern store", None, strong=True)
    b.append(bb)
    t.append(tt)
    t.append(text(560, 206, "html_configs", 10, 0.45, anchor="middle",
                  mono=True))
    t.append(text(560, 220, "frozen per site", 10, 0.4, anchor="middle"))

    b.append(rect(0, 268, 620, 128, 0.3, SW * 0.9, r=10, dash="7 7"))
    t.append(text(12, 262, "II - PUBLISH, EVERY ARTICLE, 0 MODEL CALLS", 11,
                  0.4, 500))
    t.append(text(16, 296, "publish_run.py", 12, 0.7, 500, mono=True))
    t.append(text(16, 312, "332 lines, no model", 10.5, 0.4))
    for i, (name, how) in enumerate((("Read the Doc", "gdocs connector"),
                                     ("prep_doc", "apply patterns"),
                                     ("process_images", "800px, q92"),
                                     ("upload", "WP media library"))):
        x = 150 + i * 120
        bb, tt = box(x, 290, 108, 48, name, how)
        b.append(bb)
        t.append(tt)
        if i < 3:
            b.append(arrow(x + 110, x + 118, 314, 0.35))
    b.append(down(255, 236, 264, 0.3))
    return "".join(b), "".join(t), 410, 640


def cms_calls():
    """So lan goi model theo so bai. Mot kien truc cong don, mot kien truc dung
    lai o mot."""
    b, t = [], []
    ox, oy, ww, hh = 40, 176, 420, 140
    b.append(seg(ox, oy, ox + ww, oy, 0.35, SW * 0.9))
    b.append(seg(ox, oy, ox, oy - hh, 0.35, SW * 0.9))
    for frac, label in ((0.5, "200"), (1.0, "400")):
        b.append(seg(ox + ww * frac, oy, ox + ww * frac, oy + 5, 0.3,
                     SW * 0.8))
        t.append(text(ox + ww * frac, oy + 20, label, 10.5, 0.4,
                      anchor="middle"))
    t.append(text(ox + ww / 2, oy + 40, "articles published", 11, 0.4,
                  anchor="middle"))
    b.append(seg(ox, oy, ox + ww, oy - hh, 1.0, SW * 2.2))
    t.append(text(ox + ww + 14, oy - hh + 4, "a model in each article", 12,
                  0.9, 500))
    t.append(text(ox + ww + 14, oy - hh + 22, "about 400 calls", 12, 0.5,
                  mono=True))
    b.append(seg(ox, oy - 12, ox + ww, oy - 12, 1.0, SW * 2.2))
    t.append(text(ox + ww + 14, oy - 8, "onboarding only", 12, 0.9, 500))
    t.append(text(ox + ww + 14, oy + 10, "1 call, frozen", 12, 0.5, mono=True))
    t.append(text(0, 24, "MODEL CALLS", 11, 0.35, 500))
    return "".join(b), "".join(t), 240, 640


def cms_drift():
    """Tam lan chay lai cung mot Doc. Ban co model trong duong ong lech dan;
    ban thuan code ra dung mot ket qua ca tam lan."""
    b, t = [], []
    ox, oy, ww, hh = 60, 170, 400, 120
    b.append(seg(ox, oy, ox + ww, oy, 0.35, SW * 0.9))
    for i in range(8):
        x = ox + ww * i / 7
        b.append(seg(x, oy, x, oy + 5, 0.25, SW * 0.8))
        t.append(text(x, oy + 20, str(i + 1), 10, 0.35, anchor="middle"))
    t.append(text(ox + ww / 2, oy + 40, "eight re-runs of one Doc", 11, 0.4,
                  anchor="middle"))
    drift = (0, 0.18, 0.12, 0.42, 0.30, 0.62, 0.55, 0.78)
    pts = [(ox + ww * i / 7, oy - hh * v) for i, v in enumerate(drift)]
    for i in range(7):
        b.append(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.95,
                     SW * 2.0))
    for x, y in pts:
        b.append(dot(x, y, 5, 0.9))
    t.append(text(ox + ww + 14, pts[-1][1] + 4, "model in the loop", 12, 0.9,
                  500))
    b.append(seg(ox, oy - 6, ox + ww, oy - 6, 0.5, SW * 1.8))
    for i in range(8):
        b.append(dot(ox + ww * i / 7, oy - 6, 5, 0.5, hollow=True))
    t.append(text(ox + ww + 14, oy - 2, "deterministic", 12, 0.55))
    t.append(text(0, 24, "DRIFT FROM THE FIRST RUN", 11, 0.35, 500))
    return "".join(b), "".join(t), 240, 640


def cms_layers():
    """Nam lop, va tren moi lop ai thang: detector hay model."""
    b, t = [], []
    for x, label in ((0, "LAYER"), (118, "DETECTOR"), (216, "THE MODEL'S"),
                     (330, "WHY")):
        t.append(text(x, 14, label, 9.5, 0.35, 500))
    b.append(seg(0, 24, 620, 24, 0.25, SW * 0.8))
    rows = (("paragraph", "REPLACE", "dropped",
             "the detector reads it off the target"),
            ("span", "REPLACE", "dropped", "regular structure"),
            ("anchor", "REPLACE", "dropped", "anchors are consistent"),
            ("div / wrapper", "APPEND", "kept",
             "novel layout, the model infers intent"),
            ("table", "APPEND", "kept",
             "intent the detector cannot see"))
    for i, (layer, verb, fate, why) in enumerate(rows):
        y = 48 + i * 32
        keep = verb == "APPEND"
        t.append(text(0, y, layer, 12, 0.85, 500, mono=True))
        t.append(text(118, y, verb, 11.5, 0.9 if keep else 0.6, 500,
                      mono=True))
        t.append(text(216, y, fate, 11.5, 0.85 if keep else 0.4))
        t.append(text(330, y, why, 11.5, 0.45))
        if i < len(rows) - 1:
            b.append(seg(0, y + 12, 620, y + 12, 0.12, SW * 0.7))
    return "".join(b), "".join(t), 200, 640


def cms_handoff():
    """Sau khi dinh dang xong, con mot nga re khong thuoc ve chung toi: khach
    co cho API hay khong."""
    b, t = [], []
    t.append(text(0, 14, "AFTER FORMATTING, THE CLIENT'S CALL", 11, 0.35, 500))
    bb, tt = box(180, 34, 260, 52, "Deterministic formatting",
                 "identical for every client", strong=True)
    b.append(bb)
    t.append(tt)
    b.append(seg(310, 86, 310, 106, 0.35, SW * 0.9))
    b.append(seg(120, 106, 500, 106, 0.35, SW * 0.9))
    for x in (120, 500):
        b.append(down(x, 106, 128, 0.35))
    for x, label in ((60, "API GRANTED"), (440, "NO API ACCESS")):
        cb, ct = chip(x, 132, 120, 26, label, 11, 0.55, 0.8)
        b.append(cb)
        t.append(ct)
    bb, tt = box(20, 178, 200, 62, "Draft in their CMS",
                 "images uploaded, status=draft", strong=True)
    b.append(bb)
    t.append(tt)
    bb, tt = box(400, 178, 200, 62, "Formatted HTML back",
                 "a person places it by hand", dash="7 6")
    b.append(bb)
    t.append(tt)
    return "".join(b), "".join(t), 258, 640


def cms_filenames():
    """Mot ten file qua hai lan xuat ban. Ten do duong ong tu dat thi duoc keo
    ve nguyen trang; ten do khach tu go thi khong ai dong vao."""
    b, t = [], []
    t.append(text(0, 14, "ONE FILENAME, ACROSS TWO PUBLISHES", 11, 0.35, 500))
    for i, h in enumerate(("first publish", "on republish", "after normalize")):
        t.append(text(150 + i * 158 + 66, 38, h, 10.5, 0.4, anchor="middle"))
    rows = (("a name the pipeline chose",
             ("keyword-01.webp", "keyword-01-1.webp", "keyword-01.webp"),
             "restored", True),
            ("a name the client typed",
             ("banner-1.jpg", "banner-1.jpg", "banner-1.jpg"),
             "left alone", False))
    for r, (who, names, verdict, fixed) in enumerate(rows):
        y = 58 + r * 96
        t.append(text(0, y + 26, who, 11.5, 0.6))
        for i, name in enumerate(names):
            x = 150 + i * 158
            drifted = fixed and i == 1
            b.append(rect(x, y, 132, 34, 0.9 if drifted else 0.45,
                          SW * (1.4 if drifted else 1.0), r=6,
                          fill="0.06" if drifted else None))
            t.append(text(x + 66, y + 22, name, 10.5,
                          0.95 if drifted else 0.6, 500 if drifted else 400,
                          anchor="middle", mono=True))
            if i < 2:
                b.append(arrow(x + 134, x + 150, y + 17, 0.35))
        t.append(text(614, y + 56, verdict, 11, 0.55, 500, anchor="end"))
    t.append(text(0, 250, "It only touches filenames the pipeline itself "
                  "chose. That clause is the whole fix.", 11.5, 0.45))
    return "".join(b), "".join(t), 264, 640


def cms_minutes():
    """Thoi gian cho mot bai, truoc va sau."""
    b, t = [], []
    rows = (("By hand", 150, "about 150 min", "reformat and images", True),
            ("With the agent", 2, "about 2 min", "paste and review", False))
    bx, bw = 130, 380
    for i, (name, v, label, sub, slow) in enumerate(rows):
        y = 30 + i * 62
        t.append(text(118, y + 14, name, 13, 0.9, 500, anchor="end"))
        b.append(hbar(bx, y, bw * v / 180, 22, v, 0.9,
                      "0.08" if slow else "0.16", hatch=slow))
        t.append(text(bx + bw * v / 180 + 12, y + 15, label, 12.5, 0.9, 600,
                      mono=True))
        t.append(text(118, y + 32, sub, 10.5, 0.4, anchor="end"))
    ab, at = axis(bx, bx + bw, 154,
                  ((0, "0"), (1 / 3, "60"), (2 / 3, "120"), (1.0, "180 min")))
    b.append(ab)
    t.append(at)
    return "".join(b), "".join(t), 190, 640


# ------------------------------------ i-tried-to-train-a-cross-encoder (5)


def ce_funnel():
    """Pheu xep hang: moi tang cham hon va thong minh hon tang tren no, va so
    ung vien tut xuong theo."""
    b, t = [], []
    stages = (("BM25", "counts words, understands none", "5,131 pages", 1.0),
              ("bi-encoder", "embeds each side once, ahead of time",
               "500 candidates", 0.58),
              ("cross-encoder", "reads query and document together",
               "40 candidates", 0.30))
    for i, (name, how, label, frac) in enumerate(stages):
        y = 26 + i * 92
        w = 400 * frac
        x = 200 - w / 2
        last = i == len(stages) - 1
        b.append(rect(x, y, w, 40, 0.95 if last else 0.5,
                      SW * (1.6 if last else 1.1), r=8,
                      fill="0.05" if last else None))
        t.append(text(200, y + 25, name, 13.5, 0.95 if last else 0.75, 500,
                      anchor="middle"))
        # mo ta dat ben phai: no dai hon cai hop o hai tang duoi
        t.append(text(420, y + 18, how, 12, 0.5))
        t.append(text(420, y + 36, label, 12, 0.8, 500, mono=True))
        if not last:
            b.append(down(200, y + 40, y + 84, 0.35))
    t.append(text(0, 16, "SLOWER AND SMARTER, ONE STAGE AT A TIME", 11, 0.35,
                  500))
    return "".join(b), "".join(t), 296, 640


def ce_architecture():
    """Cai lam nen cross-encoder: truy van va tai lieu noi thanh MOT chuoi, va
    attention di qua duoc dau [SEP]. Mot mo hinh nhung doc hai ben roi rac nen
    "messi" khong bao gio nhin thay "Argentine"."""
    b, t = [], []
    toks = ("[CLS]", "lionel", "messi", "[SEP]", "Lionel", "Messi", "is", "an",
            "Argentine", "[SEP]")
    x = 0
    xs = []
    for i, tok in enumerate(toks):
        w = max(42, len(tok) * 7.4 + 14)
        sep = tok == "[SEP]"
        b.append(rect(x, 40, w, 30, 0.85 if sep else 0.45,
                      SW * (1.3 if sep else 0.95), r=4,
                      fill="0.07" if sep else None))
        t.append(text(x + w / 2, 60, tok, 10.5, 0.9 if sep else 0.6,
                      500 if sep else 400, anchor="middle", mono=True))
        xs.append(x + w / 2)
        x += w + 6
    b.append(seg(0, 82, xs[3] + 20, 82, 0.4, SW))
    b.append(seg(xs[3] + 26, 82, x - 6, 82, 0.4, SW))
    t.append(text(xs[1], 98, "segment 0, the query", 10.5, 0.45,
                  anchor="middle"))
    t.append(text((xs[4] + xs[8]) / 2, 98, "segment 1, the document", 10.5,
                  0.45, anchor="middle"))
    for a, c in ((2, 5), (2, 8), (1, 4)):
        x0, x1 = xs[a], xs[c]
        b.append(f'<path d="M{x0:.1f},36 Q{(x0 + x1) / 2:.1f},'
                 f'{4 - abs(x1 - x0) * 0.04:.1f} {x1:.1f},36" fill="none" '
                 f'stroke="currentColor" stroke-opacity="0.6" '
                 f'stroke-width="{SW * 0.9}"/>')
    t.append(text(0, 130, "Attention crosses the [SEP]. That is the whole "
                  "difference.", 12.5, 0.8, 500))
    t.append(text(0, 152, "An embedding model reads the two apart, so "
                  '"messi" never sees "Argentine".', 12, 0.45))

    for i, (label, sub) in enumerate((
            ("token + position + segment embeddings", None),
            ("4 x encoder block", "pre-norm, multi-head, FFN, residual"),
            ("read [CLS], one linear layer", "one score"))):
        y = 186 + i * 62
        bb, tt = box(120, y, 380, 48, label, sub, strong=(i == 2))
        b.append(bb)
        t.append(tt)
        if i < 2:
            b.append(down(310, y + 48, y + 60, 0.35))
    return "".join(b), "".join(t), 380, 640


def ce_loss():
    """Duong loss khi huan luyen. No nam yen o 1.202 — dung bang diem cua mot
    bo doan hang so — suot bay tram buoc, roi moi bat dau di xuong."""
    b, t = [], []
    ox, oy, ww, hh = 60, 196, 440, 150
    b.append(seg(ox, oy, ox + ww, oy, 0.35, SW * 0.9))
    b.append(seg(ox, oy, ox, oy - hh, 0.35, SW * 0.9))
    for frac, label in ((0, "0"), (0.49, "2,600"), (1.0, "5,282")):
        b.append(seg(ox + ww * frac, oy, ox + ww * frac, oy + 5, 0.3,
                     SW * 0.8))
        t.append(text(ox + ww * frac, oy + 20, label, 10.5, 0.4,
                      anchor="middle"))
    t.append(text(ox + ww / 2, oy + 40, "training step", 11, 0.4,
                  anchor="middle"))
    for v, label in ((1.24, "1.24"), (1.20, "1.20"), (1.16, "1.16")):
        y = oy - hh * (v - 1.14) / 0.12
        b.append(seg(ox - 5, y, ox, y, 0.3, SW * 0.8))
        t.append(text(ox - 12, y + 4, label, 10.5, 0.4, anchor="end",
                      mono=True))
    flat = oy - hh * (1.202 - 1.14) / 0.12
    b.append(seg(ox, flat, ox + ww, flat, 0.3, SW * 0.9, dash="7 6"))
    t.append(text(ox + ww, flat - 8, "1.202, what a constant predictor scores",
                  10.5, 0.42, anchor="end"))
    pts = []
    for i in range(41):
        f = i / 40
        if f < 0.135:
            v = 1.202
        else:
            v = 1.202 - 0.050 * ((f - 0.135) / 0.865) ** 0.8
        pts.append((ox + ww * f, oy - hh * (v - 1.14) / 0.12))
    for i in range(len(pts) - 1):
        b.append(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.95,
                     SW * 1.9))
    b.append(seg(ox, oy - hh - 6, ox + ww * 0.135, oy - hh - 6, 0.5, SW))
    t.append(text(ox + ww * 0.07, oy - hh - 14, "flat for 700 steps", 11, 0.6,
                  500, anchor="middle"))
    t.append(text(ox + ww, pts[-1][1] + 26, "then slowly downward", 11,
                  0.6, anchor="end"))
    t.append(text(0, 22, "TRAINING LOSS", 11, 0.35, 500))
    return "".join(b), "".join(t), 262, 640


def ce_scores():
    """Nam cach xep hang tren cung 800 truy van MS MARCO. Ban tu viet nhinh hon
    dem tu khoa mot chut, va con xa ban co san."""
    b, t = [], []
    rows = (("random shuffle", 0.5096, False, False),
            ("no reranking", 0.5160, False, False),
            ("count keywords", 0.5725, False, False),
            ("mine, written by hand", 0.5963, True, False),
            ("ms-marco-MiniLM", 0.7196, False, True))
    bx, bw = 168, 340
    for i, (name, v, mine, best) in enumerate(rows):
        y = 34 + i * 40
        strong = mine or best
        t.append(text(156, y + 14, name, 12.5, 0.95 if strong else 0.5,
                      500 if strong else 400, anchor="end"))
        b.append(hbar(bx, y, bw * (v - 0.45) / 0.32, 20, v,
                      0.95 if strong else 0.4,
                      "0.16" if best else ("0.10" if mine else "0.05")))
        t.append(text(bx + bw * (v - 0.45) / 0.32 + 12, y + 15, f"{v:.4f}", 12,
                      0.95 if strong else 0.45, 600 if strong else 400,
                      mono=True))
    t.append(text(0, 20, "nDCG@10 - 800 QUERIES, HUMAN JUDGEMENTS", 11, 0.35,
                  500))
    t.append(text(0, 262, "A week of work sits one place above counting "
                  "keywords, and far below the model it was meant to replace.",
                  11.5, 0.45))
    return "".join(b), "".join(t), 282, 640


def ce_gap():
    """Khoang cach so voi ban co san, tach theo loai truy van. Cang ve trai
    cang thua dam. Navigational thua nang nhat; multi-term gan nhu ngang."""
    b, t = [], []
    rows = (("navigational", "guardian football", -0.198),
            ("misspelled", "lionel mesi", -0.113),
            ("entity", "cristiano ronaldo", -0.067),
            ("informational", "offside rule", -0.044),
            ("multi-term", "world cup final results history", -0.017))
    zero = 560
    scale = 1900
    for i, (kind, example, gap) in enumerate(rows):
        y = 30 + i * 42
        w = abs(gap) * scale
        t.append(text(0, y + 14, kind, 12.5, 0.85, 500))
        t.append(text(0, y + 30, example, 10.5, 0.4, mono=True))
        b.append(hbar(zero - w, y, w, 20, gap, 0.9 if i == 0 else 0.5,
                      "0.16" if i == 0 else "0.06"))
        t.append(text(zero - w - 10, y + 15, f"{gap:.3f}", 11.5,
                      0.9 if i == 0 else 0.5, 600 if i == 0 else 400,
                      anchor="end", mono=True))
    b.append(seg(zero, 22, zero, 232, 0.5, SW))
    t.append(text(zero, 16, "level with the incumbent", 10.5, 0.45,
                  anchor="end"))
    return "".join(b), "".join(t), 246, 640


# --------------------------------- a-brief-history-of-seo-content-... (15)


def hist_three_people():
    """Truoc khi co bat cu thu gi: ba tram, ba nguoi."""
    b, t = [], []
    for i, (name, who) in enumerate((("outline", "a strategist"),
                                     ("article", "a writer"),
                                     ("edit", "an editor"))):
        x = 40 + i * 190
        b.append(rect(x, 30, 148, 62, 0.5, SW * 1.1, r=8))
        t.append(text(x + 74, 60, name, 14, 0.85, 500, anchor="middle"))
        b.append(dot(x + 74, 116, 15, 0.45, hollow=True))
        t.append(text(x + 74, 152, who, 11, 0.45, anchor="middle"))
        if i < 2:
            b.append(arrow(x + 150, x + 186, 61, 0.4))
    t.append(text(0, 16, "BEFORE ANY OF THIS", 11, 0.35, 500))
    t.append(text(310, 186, "Three stations, three people.", 12.5, 0.6, 500,
                  anchor="middle"))
    return "".join(b), "".join(t), 202, 640


def hist_chain():
    """Ban dau tien: mot chuoi tren n8n. Code giu quyen dieu khien, model duoc
    goi o nhung diem co dinh, va co mot vong quay lai cho toi khi qua."""
    b, t = [], []
    t.append(text(0, 14, "CODE HOLDS THE CONTROL FLOW", 11, 0.35, 500))
    steps = (("outline agent", "structure"), ("writing agent", "optimizer"),
             ("review agent", "evaluator"))
    for i, (name, role) in enumerate(steps):
        x = i * 158
        b.append(rect(x, 40, 138, 56, 0.6, SW * 1.2, r=8))
        b.append(spark(x + 20, 68, 8, 0.8, SW * 0.75))
        t.append(text(x + 34, 64, name, 12, 0.85, 500))
        t.append(text(x + 34, 82, role, 10, 0.42))
        if i < 2:
            b.append(arrow(x + 140, x + 156, 68, 0.4))
    b.append(arrow(456, 476, 68, 0.4))
    bb, tt = box(482, 40, 138, 56, "article", "shipped", strong=True)
    b.append(bb)
    t.append(tt)
    b.append(seg(385, 96, 385, 130, 0.4, SW * 0.9))
    b.append(seg(385, 130, 69, 130, 0.4, SW * 0.9))
    b.append(seg(69, 130, 69, 100, 0.4, SW * 0.9))
    b.append(seg(64, 108, 69, 100, 0.4, SW * 0.9))
    b.append(seg(74, 108, 69, 100, 0.4, SW * 0.9))
    t.append(text(227, 148, "revise until it passes", 11.5, 0.5,
                  anchor="middle"))
    t.append(text(0, 178, "The model is called at fixed points. It never "
                  "decides what happens next.", 12, 0.5))
    return "".join(b), "".join(t), 196, 640


def hist_rag():
    """RAG quyet dinh AI thuc su nhin thay gi. Xay mot lan: tai lieu thanh
    doan, doan thanh vector. Khi hoi: nhung doan diem cao duoc lay, doan diem
    thap bi bo lai — va do la van de."""
    b, t = [], []
    t.append(text(0, 14, "HOW RAG DECIDES WHAT THE MODEL ACTUALLY SEES", 11,
                  0.35, 500))
    t.append(text(0, 42, "built once", 10.5, 0.4, 500))
    for i, (name, w) in enumerate((("your docs", 96), ("chunks", 78),
                                   ("vectors", 78), ("the store", 92))):
        x = 0 + i * 108
        b.append(rect(x, 52, w, 34, 0.45, SW, r=6))
        t.append(text(x + w / 2, 74, name, 11, 0.6, anchor="middle"))
        if i < 3:
            b.append(arrow(x + w + 2, x + 106, 69, 0.35))
    b.append(seg(0, 106, 620, 106, 0.18, SW * 0.8))
    t.append(text(0, 130, "a question", 12.5, 0.85, 500))
    b.append(arrow(84, 118, 126, 0.4))
    cb, ct = chip(126, 114, 70, 26, "embed", 11, 0.5, 0.7)
    b.append(cb)
    t.append(ct)
    b.append(arrow(200, 234, 126, 0.4))
    cb, ct = chip(238, 114, 70, 26, "match", 11, 0.5, 0.7)
    b.append(cb)
    t.append(ct)
    t.append(text(330, 130, "your checklist, stored as chunks", 11, 0.45))
    hits = (("tone-of-voice rules", 0.89, True), ("how to write the intro",
                                                  0.81, True),
            ("heading structure", 0.74, True), ("internal-link policy", 0.43,
                                                False),
            ("image alt-text rules", 0.31, False))
    for i, (name, score, kept) in enumerate(hits):
        y = 160 + i * 30
        b.append(rect(330, y, 220, 24, 0.85 if kept else 0.3,
                      SW * (1.2 if kept else 0.9), r=5,
                      fill="0.07" if kept else None, dash=None if kept
                      else "5 5"))
        t.append(text(340, y + 17, name, 11, 0.85 if kept else 0.35))
        t.append(text(566, y + 17, f"{score:.2f}", 11, 0.85 if kept else 0.35,
                      500, mono=True))
    t.append(text(330, 322, "top 3 come back. The other two do not.", 11.5,
                  0.5))
    return "".join(b), "".join(t), 336, 640


def hist_finetune():
    """Fine-tune that ra la gi: mot bo vi du, mot mo hinh nen dong bang, va mot
    mieng adapter nho la thu duy nhat duoc hoc."""
    b, t = [], []
    t.append(text(0, 14, "WHAT FINE-TUNING ACTUALLY DOES", 11, 0.35, 500))
    b.append(rect(0, 34, 220, 132, 0.5, SW * 1.1, r=8))
    t.append(text(14, 56, "seongon_travel", 12, 0.8, 500, mono=True))
    t.append(text(14, 74, "528 examples", 10.5, 0.4))
    for i, (role, what) in enumerate((("system", "our writing rules"),
                                      ("user", "keyword + outline"),
                                      ("assistant", "the article we shipped"))):
        y = 100 + i * 22
        t.append(text(14, y, role, 10.5, 0.7, 500, mono=True))
        t.append(text(84, y, what, 10.5, 0.45))
    b.append(arrow(226, 256, 100, 0.4))
    b.append(rect(264, 44, 170, 52, 0.4, SW, r=8, dash="6 6"))
    t.append(text(349, 66, "base model", 12, 0.55, anchor="middle"))
    t.append(text(349, 84, "Mistral-Small 24B, frozen", 10, 0.4,
                  anchor="middle"))
    b.append(rect(264, 108, 170, 52, 0.95, SW * 1.6, r=8, fill="0.06"))
    t.append(text(349, 130, "adapter (QLoRA)", 12, 0.95, 500,
                  anchor="middle"))
    t.append(text(349, 148, "the only part that trains", 10, 0.5,
                  anchor="middle"))
    b.append(arrow(440, 470, 100, 0.4))
    bb, tt = box(478, 62, 142, 76, "your model", "writes in your voice",
                 strong=True)
    b.append(bb)
    t.append(tt)
    t.append(text(0, 196, "About fifty optimizer steps, one A100, an "
                  "afternoon.", 12, 0.5))
    return "".join(b), "".join(t), 210, 640


def hist_fifty_steps():
    """Ca lan fine-tune rong dung ngan nay: nam muoi vach, muoi vach dau la
    warmup."""
    b, t = [], []
    t.append(text(0, 14, "528 EXAMPLES, EFFECTIVE BATCH 32, THREE EPOCHS", 11,
                  0.35, 500))
    for i in range(50):
        x = 40 + i * 9
        warm = i < 10
        b.append(seg(x, 46, x, 86, 0.32 if warm else 0.9,
                     SW * (0.9 if warm else 1.2)))
    b.append(seg(40, 100, 40 + 9 * 9, 100, 0.4, SW))
    t.append(text(40 + 40, 118, "warmup", 11, 0.5, anchor="middle"))
    t.append(text(496, 70, "one tick is", 11, 0.45))
    t.append(text(496, 86, "one optimizer step", 11, 0.45))
    t.append(text(0, 150, "The entire fine-tune is this wide.", 13, 0.85, 500))
    return "".join(b), "".join(t), 164, 640


def hist_frozen():
    """Ban dong bang o mot thoi diem. Duong bien gioi thi khong."""
    b, t = [], []
    ox, oy, ww, hh = 40, 190, 430, 150
    b.append(seg(ox, oy, ox + ww, oy, 0.35, SW * 0.9))
    b.append(seg(ox, oy, ox, oy - hh, 0.35, SW * 0.9))
    t.append(text(ox + ww / 2, oy + 24, "time", 11, 0.4, anchor="middle"))
    t.append(text(0, 24, "MODEL CAPABILITY, OVER TIME", 11, 0.35, 500))
    fy = oy - hh * 0.52
    b.append(seg(ox, fy, ox + ww, fy, 0.9, SW * 2.0))
    t.append(text(ox + ww + 12, fy + 4, "your fine-tune, frozen", 11.5, 0.9,
                  500))
    pts = [(ox + ww * i / 30, oy - hh * (0.12 + 0.80 * (i / 30) ** 0.85))
           for i in range(31)]
    for i in range(30):
        b.append(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.55,
                     SW * 2.0))
    t.append(text(ox + ww + 12, pts[-1][1] + 4, "frontier models", 11.5, 0.6))
    cross = next(p for p in pts if p[1] < fy)
    b.append(dot(cross[0], fy, 7, 0.95))
    b.append(seg(cross[0], fy - 8, cross[0] + 22, fy - 40, 0.35, SW * 0.85,
                 dash="5 6"))
    t.append(text(cross[0] + 28, fy - 44, "a system prompt catches up", 11,
                  0.6))
    t.append(text(0, 250, "You froze at one moment. The frontier did not.",
                  13, 0.85, 500))
    return "".join(b), "".join(t), 264, 640


def hist_chain_vs_agent():
    """Chuoi va agent, canh nhau. Ben trai code giu quyen; ben phai model giu
    quyen va lap cho toi khi dat muc tieu."""
    b, t = [], []
    for side in (0, 1):
        x = side * 330
        agent = side == 1
        b.append(rect(x, 30, 290, 176, 0.35 if not agent else 0.9,
                      SW * (1.0 if not agent else 1.5), r=10,
                      fill="0.04" if agent else None))
        t.append(text(x + 145, 54, "the agent" if agent else "the chain", 13.5,
                      0.95 if agent else 0.7, 500, anchor="middle"))
        if agent:
            b.append(rect(x + 90, 78, 110, 40, 0.9, SW * 1.3, r=8))
            b.append(spark(x + 112, 98, 8, 0.9, SW * 0.75))
            t.append(text(x + 128, 102, "model", 12, 0.9, 500))
            b.append(ellipse(x + 145, 150, 74, 30, 0.55, SW, dash="7 6"))
            t.append(text(x + 145, 155, "loop", 11.5, 0.6, anchor="middle"))
            b.append(seg(x + 145, 118, x + 145, 120, 0.4, SW))
            t.append(text(x + 145, 194, "the model drives, until the goal",
                          10.5, 0.5, anchor="middle"))
        else:
            for i, (kind, lbl) in enumerate((("c", "code"), ("m", "model"),
                                             ("c", "code"), ("m", "model"))):
                cx = x + 32 + i * 62
                if kind == "m":
                    b.append(rect(cx, 100, 46, 34, 0.6, SW, r=6))
                    b.append(spark(cx + 23, 117, 7, 0.7, SW * 0.7))
                else:
                    b.append(rect(cx, 100, 46, 34, 0.35, SW * 0.9, r=6))
                    t.append(text(cx + 23, 121, "code", 10, 0.45,
                                  anchor="middle"))
                if i < 3:
                    b.append(arrow(cx + 48, cx + 60, 117, 0.3))
            t.append(text(x + 145, 194, "code drives, model at fixed points",
                          10.5, 0.5, anchor="middle"))
    return "".join(b), "".join(t), 218, 640


def hist_frameworks():
    """Duong di qua cac framework. Cai nao cung thu, va chi hai cai cuoi o
    lai."""
    b, t = [], []
    t.append(text(0, 14, "FRAMEWORKS, IN ORDER", 11, 0.35, 500))
    items = (("LangChain", "hard to start", False), ("DSPy", "", False),
             ("smolagents", "", False), ("OpenAI SDK", "", False),
             ("Agno", "", False), ("Claude SDK", "skills, the unlock", True),
             ("Vercel AI", "in production", True))
    for i, (name, note, kept) in enumerate(items):
        x = i * 90
        b.append(rect(x, 40, 80, 40, 0.9 if kept else 0.3,
                      SW * (1.5 if kept else 0.9), r=7,
                      fill="0.06" if kept else None))
        t.append(text(x + 40, 64, name, 10.5, 0.95 if kept else 0.42,
                      500 if kept else 400, anchor="middle"))
        if note:
            t.append(text(x + 40, 98, note, 10, 0.5, anchor="middle"))
        if i < len(items) - 1:
            b.append(seg(x + 82, 60, x + 88, 60, 0.25, SW * 0.8))
    b.append(seg(0, 120, 400, 120, 0.25, SW * 0.8, dash="6 6"))
    t.append(text(0, 142, "tried and dropped", 11, 0.4))
    b.append(seg(450, 120, 620, 120, 0.6, SW))
    t.append(text(620, 142, "still in use", 11, 0.6, 500, anchor="end"))
    return "".join(b), "".join(t), 156, 640


def hist_loop():
    """Vong lap that cua mot reasoning agent, ghi lai bon luot: dem chu, cat,
    cat nua, va lan cuoi thi qua."""
    b, t = [], []
    t.append(text(0, 14, "THE AGENT'S OWN RUN", 11, 0.35, 500))
    t.append(text(0, 40, "goal: pass every checklist item", 12.5, 0.85, 500,
                  mono=True))
    for i, (verb, x) in enumerate((("reason", 20), ("act", 176), ("observe",
                                                                  332))):
        b.append(rect(x, 60, 128, 38, 0.55, SW * 1.1, r=8))
        t.append(text(x + 64, 84, verb, 11.5, 0.75, anchor="middle"))
        if i < 2:
            b.append(arrow(x + 130, x + 172, 79, 0.35))
    b.append(seg(460, 79, 492, 79, 0.35, SW * 0.9))
    b.append(seg(492, 79, 492, 124, 0.35, SW * 0.9))
    b.append(seg(492, 124, 84, 124, 0.35, SW * 0.9))
    b.append(seg(84, 124, 84, 102, 0.35, SW * 0.9))
    b.append(seg(79, 110, 84, 102, 0.35, SW * 0.9))
    b.append(seg(89, 110, 84, 102, 0.35, SW * 0.9))
    t.append(text(506, 83, "it keeps looping", 10.5, 0.45))
    turns = (("turn 1", "count the words", "1,180 - over the cap", False),
             ("turn 2", "trim a whole section", "1,040 - still over", False),
             ("turn 3", "tighten the intro and CTA", "980 - under 1,000", True))
    for i, (turn, act, obs, ok) in enumerate(turns):
        y = 156 + i * 34
        t.append(text(0, y, turn, 11, 0.5, 500, mono=True))
        t.append(text(66, y, act, 11.5, 0.75))
        t.append(text(320, y, obs, 11.5, 0.9 if ok else 0.45, mono=True))
        if ok:
            b.append(check(560, y - 4, 7, 0.95, SW * 1.2))
        else:
            b.append(seg(554, y - 10, 566, y + 2, 0.4, SW))
            b.append(seg(566, y - 10, 554, y + 2, 0.4, SW))
    return "".join(b), "".join(t), 264, 640


def hist_checklist():
    """Truy van theo diem tra ve ba trong muoi hai muc. Mot checklist khong co
    muc "lien quan nhat" — hoac ca muoi hai, hoac khong gi ca."""
    b, t = [], []
    for side, (title, sub) in enumerate((("retrieval", "three of twelve, "
                                          "chosen by score"),
                                         ("a skill", "twelve of twelve, or "
                                          "nothing"))):
        x = side * 330
        keep = side == 1
        t.append(text(x, 16, title, 13, 0.95 if keep else 0.6, 500))
        t.append(text(x, 36, sub, 11, 0.45))
        for i in range(12):
            cx = x + (i % 4) * 34
            cy = 56 + (i // 4) * 34
            on = keep or i < 3
            b.append(rect(cx, cy, 26, 26, 0.9 if on else 0.22,
                          SW * (1.3 if on else 0.9), r=5,
                          fill="0.14" if on else None))
            if not keep and i < 3:
                t.append(text(cx + 13, cy + 44, ("0.78", "0.54", "0.36")[i],
                              9.5, 0.5, anchor="middle", mono=True))
    t.append(text(0, 210, "A checklist has no most relevant item.", 13, 0.85,
                  500))
    return "".join(b), "".join(t), 226, 640


def hist_hybrid():
    """Giao dien lai: mot bang trang thai giu state, va agent la mot cot ben
    canh. Nguoi co the tu bam vao bang, hoac bao agent lam."""
    b, t = [], []
    b.append(rect(0, 24, 400, 250, 1.0, SW * 1.6, r=10))
    b.append(seg(0, 62, 400, 62, 0.35, SW))
    t.append(text(16, 50, "Articles", 13, 0.85, 500))
    rows = (("Best CRM for SMEs", "Draft, 940w", False),
            ("How to pick a POS", "Review", True),
            ("SEO audit checklist", "Draft", False),
            ("Landing page tips", "Published", False))
    for i, (name, status, moved) in enumerate(rows):
        y = 82 + i * 46
        if moved:
            b.append(rect(8, y - 14, 384, 40, 0.0, SW, fill="0.07", r=6))
        t.append(text(18, y + 6, name, 11.5, 0.75))
        cb, ct = chip(276, y - 8, 106, 26, status, 10.5,
                      0.7 if moved else 0.35, 0.85 if moved else 0.5)
        b.append(cb)
        t.append(ct)
    b.append(rect(424, 24, 196, 250, 0.75, SW * 1.3, r=10, fill="0.028"))
    b.append(spark(448, 52, 9, 0.95, SW * 0.8))
    t.append(text(466, 57, "Agent", 12.5, 0.9, 500))
    b.append(seg(424, 72, 620, 72, 0.24, SW * 0.9))
    b.append(rect(444, 92, 158, 40, 0.5, SW, fill="0.06", r=10))
    t.append(text(456, 116, "Move row 2 to Review", 10.5, 0.6))
    t.append(text(444, 160, "Done, it is in Review now.", 10.5, 0.7))
    b.append(caret_block(444 + 25 * 5.4, 149, 0.85))
    t.append(text(444, 240, "you can still click the", 10.5, 0.4))
    t.append(text(444, 256, "row yourself", 10.5, 0.4))
    return "".join(b), "".join(t), 286, 640


def hist_where_person():
    """Nguoi ngoi o dau, qua bon kien truc. Chi kien truc cuoi cung dat nguoi
    NGAY BEN CANH trong suot qua trinh."""
    b, t = [], []
    t.append(text(0, 14, "WHERE THE PERSON SITS", 11, 0.35, 500))
    rows = (("workflow", "at the end, reviewing", 0.82),
            ("fine-tuned", "nowhere", 1.0),
            ("reasoning agent", "at the end, waiting", 0.82),
            ("app-agent hybrid", "beside it, throughout", 0.30))
    for i, (name, where, pos) in enumerate(rows):
        y = 44 + i * 52
        last = i == 3
        t.append(text(0, y + 6, name, 12.5, 0.95 if last else 0.6,
                      500 if last else 400))
        b.append(seg(158, y, 420, y, 0.3, SW))
        if where != "nowhere":
            b.append(dot(158 + 262 * pos, y, 9, 0.95 if last else 0.5,
                         hollow=True, sw=SW * (1.5 if last else 1.0)))
        t.append(text(436, y + 5, where, 11, 0.85 if last else 0.45,
                      500 if last else 400))
    t.append(text(158, 246, "start", 10.5, 0.35))
    t.append(text(420, 246, "shipped", 10.5, 0.35, anchor="end"))
    t.append(text(0, 276, "The conversation did not retreat. The interface "
                  "did.", 13, 0.85, 500))
    return "".join(b), "".join(t), 290, 640


def hist_seven_loops():
    """Bay lan cat roi khoi phuc. Agent co luat nhung khong co bien do cho
    phep, nen no quay vong quanh mot con so."""
    b, t = [], []
    ox, oy, ww, hh = 60, 200, 420, 130
    b.append(seg(ox, oy, ox + ww, oy, 0.3, SW * 0.9))
    b.append(seg(ox, oy, ox, oy - hh, 0.3, SW * 0.9))
    for v, label in ((1000, "1,000"), (900, "900"), (850, "850")):
        y = oy - hh * (v - 820) / 210
        b.append(seg(ox - 5, y, ox, y, 0.3, SW * 0.8))
        t.append(text(ox - 12, y + 4, label, 10.5, 0.4, anchor="end",
                      mono=True))
    lim = oy - hh * (1000 - 820) / 210
    b.append(seg(ox, lim, ox + ww, lim, 0.55, SW, dash="7 6"))
    vals = (1040, 890, 1030, 880, 1020, 870, 1010, 860)
    pts = [(ox + ww * i / 7, oy - hh * (v - 820) / 210)
           for i, v in enumerate(vals)]
    for i in range(len(pts) - 1):
        b.append(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.95,
                     SW * 1.9))
    for i, (x, y) in enumerate(pts):
        b.append(dot(x, y, 5.5, 0.9))
        t.append(text(x, y + (-14 if vals[i] > 950 else 20),
                      "trim" if vals[i] > 950 else "restore", 9.5, 0.45,
                      anchor="middle"))
    t.append(text(0, 24, "WORDS IN THE EXPANDED OUTLINE", 11, 0.35, 500))
    t.append(text(ox + ww + 12, lim + 4, "the cap", 11, 0.5))
    t.append(text(0, 254, "Seven rounds. It had the rule and not the "
                  "tolerance.", 13, 0.85, 500))
    return "".join(b), "".join(t), 268, 640


def hist_rewrite_rule():
    """Cung mot luat, viet cho nguoi va viet cho agent. Nguoi doc ra ca phan
    khong viet ra; agent doc dung chu."""
    b, t = [], []
    for side in (0, 1):
        x = side * 330
        good = side == 1
        b.append(rect(x, 30, 290, 240, 0.9 if good else 0.35,
                      SW * (1.5 if good else 1.0), r=10,
                      fill="0.04" if good else None))
        t.append(text(x + 16, 54, "written for people" if not good
                      else "rewritten for the agent", 12, 0.9 if good else 0.55,
                      500))
        if not good:
            t.append(text(x + 16, 88, "Keep articles under 1,000 words.", 11,
                          0.8, mono=True))
            t.append(text(x + 16, 122, "a person also reads, unwritten:", 10.5,
                          0.4))
            t.append(text(x + 16, 144, "...but 1,050 is fine when a", 11, 0.6))
            t.append(text(x + 16, 162, "section needs the room.", 11, 0.6))
            t.append(text(x + 16, 196, "the agent reads it literally:", 10.5,
                          0.4))
            t.append(text(x + 16, 218, "cuts a real section to hit 999.", 11,
                          0.75))
            b.append(seg(x + 250, 208, x + 264, 222, 0.6, SW * 1.3))
            b.append(seg(x + 264, 208, x + 250, 222, 0.6, SW * 1.3))
        else:
            for i, line in enumerate((
                    "Target 1,000 words or fewer.",
                    "Up to about 10% over is acceptable",
                    "when a required section would",
                    "otherwise be cut.",
                    "Never drop a checklist section",
                    "to hit the number.")):
                t.append(text(x + 16, 88 + i * 20, line, 11,
                              0.85 if i == 0 else 0.65, mono=(i == 0)))
            t.append(text(x + 16, 226, "the agent, still literal:", 10.5, 0.4))
            t.append(text(x + 16, 248, "keeps every section, 1,050 words.", 11,
                          0.8))
            b.append(check(x + 258, 240, 8, 0.95, SW * 1.3))
    t.append(text(0, 292, "The rule was never the real rule. We had to write "
                  "the rest of it down.", 12.5, 0.6))
    return "".join(b), "".join(t), 306, 640


def hist_what_stayed():
    """Cai gi viet ra duoc thi agent lam. Cai gi con lai trong dau nguoi thi
    van o do — va do la cho giao dien dang dung."""
    b, t = [], []
    b.append(rect(0, 30, 290, 200, 0.5, SW * 1.1, r=10))
    t.append(text(16, 56, "the procedure, as written down", 12, 0.7, 500))
    for i in range(6):
        y = 84 + i * 24
        b.append(rect(16, y - 12, 16, 16, 0.6, SW, r=3))
        b.append(check(24, y - 4, 5, 0.7))
        b.append(seg(44, y - 4, 44 + (200 - i * 14), y - 4, 0.3, SW * 0.9))
    t.append(text(16, 246, "the agent runs all of it", 11, 0.5))

    b.append(rect(330, 30, 290, 200, 0.95, SW * 1.5, r=10, fill="0.04"))
    t.append(text(346, 56, "what stayed in people", 12, 0.95, 500))
    for i, line in enumerate((
            "this client is touchy about that word",
            "this outline is over, and that is fine",
            "this brief says one thing and means another")):
        y = 92 + i * 44
        b.append(dot(346, y - 4, 7, 0.5, hollow=True))
        t.append(text(362, y, line, 10.5, 0.6))
        t.append(text(362, y + 18, "a person decides", 10, 0.4, 500))
    t.append(text(346, 246, "and that is where the interface now sits", 11,
                  0.5))
    return "".join(b), "".join(t), 262, 640


FIGURES = {
    "a-cms-adaptable-llm-pipeline-for-seo-compliant-content-publishing": [
        cms_by_hand, cms_architecture, cms_calls, cms_drift, cms_layers,
        cms_handoff, cms_filenames, cms_minutes,
    ],
    "i-tried-to-train-a-cross-encoder-from-scratch": [
        ce_funnel, ce_architecture, ce_loss, ce_scores, ce_gap,
    ],
    "a-brief-history-of-seo-content-writing-with-ai": [
        hist_three_people, hist_chain, hist_rag, hist_finetune,
        hist_fifty_steps, hist_frozen, hist_chain_vs_agent, hist_frameworks,
        hist_loop, hist_checklist, hist_hybrid, hist_where_person,
        hist_seven_loops, hist_rewrite_rule, hist_what_stayed,
    ],
    "measuring-search-quality": [
        msq_by_intent, msq_kubernetes, msq_tokenizer, msq_reranker,
    ],
}


def main():
    want = sys.argv[1:] or list(FIGURES)
    payload = {}
    for slug in want:
        if slug not in FIGURES:
            raise SystemExit(f"chua co hinh cho bai {slug}")
        svgs = []
        for i, fn in enumerate(FIGURES[slug]):
            strokes, labels, h, maxw = fn()
            svgs.append(article_svg(f"{slug}-{i}", strokes, labels, 640, h,
                                    maxw))
        payload[slug] = svgs
        print(f"{slug}: {len(svgs)} hinh")
    OUT.write_text(json.dumps(payload, indent=1), encoding="utf-8")
    print(f"-> {OUT.name}")


if __name__ == "__main__":
    main()
