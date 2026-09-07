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
    magnifier, person, rect, seg, sheet, spark, text,
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
    # Can giua o x=42 thi dong nay thua ra ngoai le trai; neo trai o 0.
    t.append(text(0, 178, "30 pages, 20 images", 10, 0.4))
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
    lai o mot.

    Ban truoc dat duong "onboarding only" cach truc hoanh dung 12px va viet
    nhan cua no BEN DUOI truc, nen ca hai doc ra nhu mot cai truc day len.
    Ban nay nang duong len 22px, danh dau diem xuat phat, va keo ca hai nhan
    ve cung phia phai o dung do cao cua duong no noi den."""
    b, t = [], []
    ox, oy, ww, hh = 40, 190, 400, 150
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
    t.append(text(ox + ww + 14, oy - hh + 2, "a model in each article", 12,
                  0.9, 500))
    t.append(text(ox + ww + 14, oy - hh + 19, "about 400 calls", 12, 0.5,
                  mono=True))

    flat = oy - 26
    b.append(seg(ox, flat, ox + ww, flat, 1.0, SW * 2.2))
    b.append(dot(ox, flat, 5, 0.9))
    t.append(text(ox + ww + 14, flat - 4, "onboarding only", 12, 0.9, 500))
    t.append(text(ox + ww + 14, flat + 13, "1 call, frozen", 12, 0.5,
                  mono=True))
    t.append(text(0, 24, "MODEL CALLS", 11, 0.35, 500))
    return "".join(b), "".join(t), 250, 640


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
        # mo ta dat ben phai: no dai hon cai hop o hai tang duoi. O x=420
        # thi dong dai nhat cham dung mep 640, nen lui ve 412 va thu chu.
        t.append(text(412, y + 18, how, 11.5, 0.5))
        t.append(text(412, y + 36, label, 12, 0.8, 500, mono=True))
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
    """Truoc khi co bat cu thu gi: ba tram, ba nguoi.

    Ban truoc ve nguoi bang mot vong tron rong — do la goi ten, khong phai ve.
    `person()` them vong cung vai, va do la toan bo su khac biet giua mot hinh
    tron va mot con nguoi."""
    b, t = [], []
    for i, (name, who, does) in enumerate(
            (("outline", "a strategist", "decides the shape"),
             ("article", "a writer", "writes every line"),
             ("edit", "an editor", "cuts and approves"))):
        x = 40 + i * 190
        b.append(rect(x, 30, 148, 62, 0.5, SW * 1.1, r=8))
        t.append(text(x + 74, 60, name, 14, 0.85, 500, anchor="middle"))
        b.append(seg(x + 74, 92, x + 74, 108, 0.25, SW * 0.8, dash="4 5"))
        b.append(person(x + 74, 122, 15, 0.6))
        t.append(text(x + 74, 168, who, 11.5, 0.6, 500, anchor="middle"))
        t.append(text(x + 74, 183, does, 10, 0.4, anchor="middle"))
        if i < 2:
            b.append(arrow(x + 150, x + 186, 61, 0.4))
    t.append(text(0, 16, "BEFORE ANY OF THIS", 11, 0.35, 500))
    t.append(text(310, 216, "Three stations, three people.", 12.5, 0.6, 500,
                  anchor="middle"))
    return "".join(b), "".join(t), 232, 640


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
    """Chuoi va agent, canh nhau.

    Ban truoc ve ben phai bang mot hinh bau duc co chu "loop" o trong. Do la
    GOI TEN cai vong lap, khong phai ve no: khong thay tool nao, khong thay
    vong quay o dau, khong thay luc nao thi thoat. Ban nay ve dung ba nut cua
    vong — nghi, lam, nhin — noi thanh mot vong kin co dau mui ten, cac cong
    cu treo duoi nut "lam", va mot loi ra chi mo khi muc tieu dat."""
    b, t = [], []

    # --- ben trai: chuoi. Code giu quyen, model duoc goi o cho co dinh.
    b.append(rect(0, 30, 236, 250, 0.4, SW, r=10))
    t.append(text(118, 56, "the chain", 13.5, 0.7, 500, anchor="middle"))
    seqn = (("code", False), ("model", True), ("code", False), ("model", True),
            ("out", False))
    for i, (kind, is_model) in enumerate(seqn):
        y = 78 + i * 38
        b.append(rect(76, y, 84, 28, 0.6 if is_model else 0.4,
                      SW * (1.2 if is_model else 0.95), r=6,
                      fill="0.05" if is_model else None))
        if is_model:
            b.append(spark(94, y + 14, 7, 0.8, SW * 0.7))
            t.append(text(108, y + 19, kind, 10.5, 0.75))
        else:
            t.append(text(118, y + 19, kind, 10.5, 0.5, anchor="middle"))
        if i < len(seqn) - 1:
            b.append(seg(118, y + 28, 118, y + 38, 0.3, SW * 0.85))
            b.append(seg(114, y + 33, 118, y + 38, 0.3, SW * 0.85))
            b.append(seg(122, y + 33, 118, y + 38, 0.3, SW * 0.85))
    t.append(text(118, 296, "the order was written before it ran", 10.5, 0.5,
                  anchor="middle"))

    # --- ben phai: agent. Vong lap duoc VE, khong duoc goi ten.
    ax = 264
    b.append(rect(ax, 30, 376, 250, 0.95, SW * 1.6, r=10, fill="0.035"))
    t.append(text(ax + 188, 56, "the agent", 13.5, 0.95, 500,
                  anchor="middle"))
    b.append(rect(ax + 14, 68, 228, 28, 0.9, SW * 1.3, r=14, fill="0.08"))
    t.append(text(ax + 128, 87, "goal: every checklist item passes", 10.5,
                  0.95, 500, anchor="middle"))
    b.append(rect(ax + 262, 68, 100, 28, 0.6, SW * 1.1, r=14, dash="5 5"))
    b.append(check(ax + 282, 82, 6, 0.7, SW * 1.1))
    t.append(text(ax + 300, 87, "done", 10.5, 0.7, 500))

    # ba nut cua vong, dat thanh tam giac
    nodes = ((ax + 188, 132, 108, 30, "reason"),
             (ax + 78, 208, 96, 30, "act"),
             (ax + 296, 208, 96, 30, "observe"))
    for nx, ny, nw, nh, label in nodes:
        b.append(rect(nx - nw / 2, ny - nh / 2, nw, nh, 0.9, SW * 1.3, r=7))
        t.append(text(nx, ny + 5, label, 11.5, 0.95, 500, anchor="middle"))

    def hop(a, c, bulge):
        """Mot canh cua vong, cong nhe, co dau mui ten o dau den."""
        x0, y0 = nodes[a][0], nodes[a][1]
        x1, y1 = nodes[c][0], nodes[c][1]
        dx, dy = x1 - x0, y1 - y0
        L = (dx * dx + dy * dy) ** 0.5
        ux, uy = dx / L, dy / L
        sx, sy = x0 + ux * 54, y0 + uy * 34
        ex, ey = x1 - ux * 54, y1 - uy * 34
        mx = (sx + ex) / 2 - uy * bulge
        my = (sy + ey) / 2 + ux * bulge
        out = [f'<path d="M{sx:.1f},{sy:.1f} Q{mx:.1f},{my:.1f} '
               f'{ex:.1f},{ey:.1f}" fill="none" stroke="currentColor" '
               f'stroke-opacity="0.65" stroke-width="{SW}" '
               f'stroke-linecap="round"/>']
        # dau mui ten huong theo tiep tuyen cuoi cung
        tx, ty = ex - mx, ey - my
        tl = (tx * tx + ty * ty) ** 0.5
        tx, ty = tx / tl, ty / tl
        for s in (1, -1):
            out.append(seg(ex - tx * 11 - s * ty * 6, ey - ty * 11 + s * tx * 6,
                           ex, ey, 0.65, SW))
        return "".join(out)

    b.append(hop(0, 1, 16))
    b.append(hop(1, 2, 16))
    b.append(hop(2, 0, 16))

    # cong cu treo duoi nut "act": cai vong nay cham vao the gioi that
    for i, tool in enumerate(("count_words", "read_outline", "check_links")):
        cx = ax + 22 + i * 118
        b.append(rect(cx, 246, 106, 22, 0.45, SW * 0.9, r=11))
        t.append(text(cx + 53, 261, tool, 9, 0.6, anchor="middle", mono=True))
        b.append(seg(cx + 53, 246, ax + 78, 224, 0.22, SW * 0.7))

    # loi ra: mot net dut duy nhat, va no chi mo khi muc tieu dat
    b.append(seg(ax + 242, 126, ax + 300, 100, 0.45, SW * 0.9, dash="5 6"))
    b.append(seg(ax + 292, 100, ax + 300, 100, 0.45, SW * 0.9))
    b.append(seg(ax + 298, 108, ax + 300, 100, 0.45, SW * 0.9))
    t.append(text(ax + 250, 118, "only when it passes", 9, 0.5))

    t.append(text(ax + 188, 296, "nobody wrote the order; it is decided each "
                  "turn", 10.5, 0.55, anchor="middle"))
    return "".join(b), "".join(t), 310, 640

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
    van o do — va do la cho giao dien dang dung.

    Ben trai la o tick: viec da thanh thu tuc. Ben phai truoc day cung la mot
    vong tron rong, doc ra nhu mot o tick CHUA tick — nguoc han y. Doi thanh
    `person()` thi hai cot noi dung hai loai viec, khong phai hai trang thai
    cua mot loai."""
    b, t = [], []
    b.append(rect(0, 30, 290, 214, 0.5, SW * 1.1, r=10))
    t.append(text(16, 56, "the procedure, as written down", 12, 0.7, 500))
    for i in range(6):
        y = 88 + i * 24
        b.append(rect(16, y - 12, 16, 16, 0.6, SW, r=3))
        b.append(check(24, y - 4, 5, 0.7))
        b.append(seg(44, y - 4, 44 + (200 - i * 14), y - 4, 0.3, SW * 0.9))
    t.append(text(16, 262, "the agent runs all of it", 11, 0.5))

    b.append(rect(330, 30, 290, 214, 0.95, SW * 1.5, r=10, fill="0.04"))
    t.append(text(346, 56, "what stayed in people", 12, 0.95, 500))
    for i, line in enumerate((
            "this client is touchy about that word",
            "this outline is over, and that is fine",
            "this brief says one thing and means another")):
        y = 96 + i * 50
        b.append(person(358, y - 12, 11, 0.6))
        t.append(text(380, y - 4, line, 10.5, 0.65))
        t.append(text(380, y + 11, "a person decides", 10, 0.4, 500))
    t.append(text(346, 262, "and that is where the interface now sits", 11,
                  0.5))
    return "".join(b), "".join(t), 278, 640


# ------------------------------ an-ml-and-llm-pipeline-for-keyword-... (12)


def kc_pipeline():
    """Tam chang cua duong ong, va chang duy nhat co model la chang dat ten."""
    b, t = [], []
    stages = (("Your keywords", "raw, unsorted", False),
              ("Vietnamese tokenization", "underthesea", False),
              ("Embeddings", "3,072 dimensions", False),
              ("Dimensionality reduction", "down to 30", False),
              ("HDBSCAN", "density-based", False),
              ("Post-process and refine", "outliers, oversized clusters",
               False),
              ("Labelling", "one cheap model call", True),
              ("Visualisation", "2D and 3D", False))
    for i, (name, sub, model) in enumerate(stages):
        y = 10 + i * 44
        b.append(rect(0, y, 34, 32, 0.45, SW * 0.95, r=6))
        t.append(text(17, y + 21, str(i + 1), 12, 0.6, 500, anchor="middle",
                      mono=True))
        b.append(rect(46, y, 420, 32, 0.95 if model else 0.5,
                      SW * (1.5 if model else 1.0), r=7,
                      fill="0.05" if model else None))
        if model:
            b.append(spark(66, y + 16, 8, 0.95, SW * 0.75))
            t.append(text(82, y + 21, name, 13, 0.95, 500))
        else:
            t.append(text(60, y + 21, name, 13, 0.72))
        t.append(text(478, y + 21, sub, 11, 0.42))
        if i < len(stages) - 1:
            b.append(seg(17, y + 32, 17, y + 44, 0.3, SW * 0.85))
    return "".join(b), "".join(t), 366, 640


def kc_tokenization():
    """Tieng Viet viet roi tung am tiet, nen bon am tiet co the la mot tu hoac
    bon tu. Tach sai thi moi thu phia sau deu sai."""
    b, t = [], []
    t.append(text(0, 16, "INPUT", 10.5, 0.4, 500))
    t.append(text(0, 44, '"dien thoai thong minh"', 17, 0.9, 500, mono=True))
    for i, syl in enumerate(("dien", "thoai", "thong", "minh")):
        x = i * 96
        b.append(rect(x, 62, 84, 34, 0.4, SW, r=6, dash="6 6"))
        t.append(text(x + 42, 84, syl, 12.5, 0.6, anchor="middle", mono=True))
    t.append(text(400, 84, "four syllables, ambiguous", 11.5, 0.45))
    b.append(seg(180, 108, 180, 134, 0.35, SW * 0.9))
    b.append(seg(175, 127, 180, 134, 0.35, SW * 0.9))
    b.append(seg(185, 127, 180, 134, 0.35, SW * 0.9))
    t.append(text(0, 166, "OUTPUT", 10.5, 0.4, 500))
    for i, (word, syls) in enumerate((("dien_thoai", 2), ("thong_minh", 2))):
        x = i * 190
        b.append(rect(x, 182, 176, 38, 0.95, SW * 1.5, r=7, fill="0.06"))
        t.append(text(x + 88, 206, word, 13.5, 0.95, 500, anchor="middle",
                      mono=True))
        t.append(text(x + 88, 238, "one word", 11, 0.5, anchor="middle"))
    t.append(text(400, 206, "properly tokenized", 11.5, 0.6, 500))
    return "".join(b), "".join(t), 254, 640


def kc_embeddings():
    """Moi tu khoa thanh mot day 3,072 so. Hai tu gan nghia cho ra hai day gan
    nhau; mot tu khac han cho ra mot day khac han."""
    b, t = [], []
    t.append(text(0, 16, "text-embedding-3-large", 11.5, 0.5, 500, mono=True))
    rows = (('"laptop"', "0.023  -0.041  0.018  0.092 ...", True),
            ('"may tinh"', "0.019  -0.038  0.021  0.089 ...", True),
            ('"banh mi"', "-0.052  0.067  -0.031  0.041 ...", False))
    for i, (kw, vec, near) in enumerate(rows):
        y = 46 + i * 62
        t.append(text(0, y + 24, kw, 13, 0.85, 500, mono=True))
        b.append(rect(112, y, 330, 40, 0.85 if near else 0.45,
                      SW * (1.3 if near else 1.0), r=6,
                      fill="0.06" if near else None))
        t.append(text(126, y + 18, vec, 10.5, 0.6, mono=True))
        t.append(text(126, y + 33, "3,072 numbers", 9.5, 0.4))
    b.append(rect(462, 46, 3, 102, 0.85, SW * 0.8))
    t.append(text(474, 92, "nearly the", 11.5, 0.75, 500))
    t.append(text(474, 108, "same vector", 11.5, 0.75, 500))
    b.append(rect(462, 170, 3, 40, 0.35, SW * 0.8))
    t.append(text(474, 194, "nothing alike", 11.5, 0.45))
    return "".join(b), "".join(t), 232, 640


def kc_cosine():
    """Do gan nghia do bang mot con so duy nhat: cosine giua hai vector."""
    b, t = [], []
    t.append(text(0, 16, "COSINE SIMILARITY", 11, 0.4, 500))
    rows = (('"laptop"', '"may tinh"', 0.89, "very similar"),
            ('"laptop"', '"ban phim"', 0.73, "related, both tech"),
            ('"laptop"', '"banh mi"', 0.12, "nothing in common"))
    for i, (a, c, v, note) in enumerate(rows):
        y = 48 + i * 64
        t.append(text(0, y + 6, a, 13, 0.8, 500, mono=True))
        t.append(text(196, y + 6, c, 13, 0.8, 500, mono=True))
        b.append(seg(84, y, 188, y, 0.25, SW * 0.9))
        b.append(hbar(320, y - 12, 200 * v, 20, v, 0.9 if v > 0.5 else 0.4,
                      "0.16" if v > 0.5 else "0.05"))
        t.append(text(320 + 200 * v + 12, y + 3, f"{v:.2f}", 12.5,
                      0.9 if v > 0.5 else 0.45, 600, mono=True))
        t.append(text(320, y + 26, note, 10.5, 0.4))
    return "".join(b), "".join(t), 228, 640


def kc_umap():
    """3,072 chieu khong the phan cum truc tiep. UMAP nen xuong 30 chieu ma giu
    nguyen hinh dang cua du lieu."""
    b, t = [], []
    for i in range(3072 // 96):
        b.append(seg(i * 12, 40, i * 12, 84, 0.5, SW * 0.9))
    t.append(text(0, 24, "3,072 DIMENSIONS", 12, 0.85, 500))
    b.append(seg(190, 110, 190, 142, 0.4, SW))
    b.append(seg(184, 134, 190, 142, 0.4, SW))
    b.append(seg(196, 134, 190, 142, 0.4, SW))
    t.append(text(206, 132, "UMAP", 13.5, 0.9, 500))
    t.append(text(206, 150, "about 99% smaller, same structure", 11.5, 0.5))
    for i in range(30 // 6):
        b.append(seg(i * 12, 176, i * 12, 220, 0.9, SW * 1.3))
    t.append(text(0, 244, "30 DIMENSIONS", 12, 0.85, 500))
    return "".join(b), "".join(t), 262, 640


def kc_hdbscan():
    """HDBSCAN phan cum theo MAT DO, nen no khong bat buoc phai xep moi diem
    vao mot cum. Diem qua thua thi duoc de yen."""
    b, t = [], []
    t.append(text(0, 16, "DENSITY-BASED CLUSTERING", 11, 0.4, 500))
    for gi, (cx, cy, rx_, ry_, n, label) in enumerate((
            (0.24, 0.48, 0.16, 0.30, 22, "dense cluster A"),
            (0.62, 0.42, 0.15, 0.28, 19, "dense cluster B"))):
        ccx, ccy = cx * 640, 40 + cy * 190
        b.append(ellipse(ccx, ccy, rx_ * 640, ry_ * 190, 0.45, SW, dash="8 8"))
        for i in range(n):
            a = hashf(i, gi) * 6.2832
            r = 0.4 + 0.55 * hashf(i + 30, gi)
            import math as _m
            b.append(dot(ccx + _m.cos(a) * rx_ * 640 * r,
                         ccy + _m.sin(a) * ry_ * 190 * r, 5, 0.85))
        t.append(text(ccx, ccy - ry_ * 190 - 12, label, 12, 0.8, 500,
                      anchor="middle"))
    for ox, oy in ((0.86, 0.24), (0.92, 0.68), (0.44, 0.88)):
        b.append(dot(ox * 640, 40 + oy * 190, 6, 0.7, hollow=True))
    t.append(text(556, 240, "outliers, left alone", 11, 0.5, anchor="end"))
    t.append(text(0, 268, "It is not required to place every point. That is "
                  "the point.", 12.5, 0.6))
    return "".join(b), "".join(t), 282, 640


def kc_eom_vs_leaf():
    """Hai cach cat cay phan cum. EOM cho phep cum to nho khac nhau; Leaf lay
    het la nen cum deu nhau va nho hon."""
    b, t = [], []
    for side, (name, note1, note2, leaf) in enumerate((
            ("EOM selection", "varied density levels",
             "allows mixed cluster sizes", False),
            ("Leaf selection", "all leaf nodes selected",
             "uniform, most granular", True))):
        x = side * 330
        b.append(rect(x, 30, 290, 206, 0.95 if leaf else 0.4,
                      SW * (1.5 if leaf else 1.0), r=10,
                      fill="0.04" if leaf else None))
        t.append(text(x + 145, 56, name, 13.5, 0.95 if leaf else 0.7, 500,
                      anchor="middle"))
        root = (x + 145, 78)
        mid = ((x + 90, 118), (x + 200, 118))
        leaves = ((x + 62, 158), (x + 118, 158), (x + 172, 158),
                  (x + 228, 158))
        for m in mid:
            b.append(seg(root[0], root[1] + 8, m[0], m[1] - 8, 0.35, SW * 0.9))
        for i, lf in enumerate(leaves):
            b.append(seg(mid[i // 2][0], mid[i // 2][1] + 8, lf[0], lf[1] - 8,
                         0.35, SW * 0.9))
        b.append(dot(root[0], root[1], 8, 0.4, hollow=True))
        for i, m in enumerate(mid):
            picked = not leaf and i == 0
            b.append(dot(m[0], m[1], 9, 0.95 if picked else 0.35,
                         hollow=not picked))
        for i, lf in enumerate(leaves):
            picked = leaf or i >= 2
            b.append(dot(lf[0], lf[1], 9, 0.95 if picked else 0.35,
                         hollow=not picked))
            t.append(text(lf[0], lf[1] + 26, "ABCD"[i], 10.5, 0.5,
                          anchor="middle"))
        t.append(text(x + 145, 208, note1, 10.5, 0.5, anchor="middle"))
        t.append(text(x + 145, 224, note2, 10.5, 0.4, anchor="middle"))
    t.append(text(0, 262, "EOM may swallow B and C into one cluster. Leaf "
                  "never does.", 12.5, 0.6))
    return "".join(b), "".join(t), 276, 640


def kc_outlier():
    """Mot diem lac loai duoc hoi lai nam hang xom gan nhat. Da so thang, nhung
    chi khi do gan vuot nguong."""
    b, t = [], []
    t.append(text(0, 16, "OUTLIER REASSIGNMENT", 11, 0.4, 500))
    cx, cy = 170, 130
    b.append(dot(cx, cy, 9, 0.95, hollow=True, sw=SW * 1.5))
    t.append(text(cx, cy - 22, "the outlier", 11, 0.7, 500, anchor="middle"))
    neigh = ((-70, -40, "A"), (-30, -66, "A"), (52, -30, "B"), (-64, 44, "A"),
             (40, 52, "B"))
    for dx, dy, grp in neigh:
        b.append(seg(cx, cy, cx + dx, cy + dy, 0.28, SW * 0.85, dash="4 5"))
        b.append(dot(cx + dx, cy + dy, 6.5, 0.85 if grp == "A" else 0.45))
        t.append(text(cx + dx, cy + dy + 20, grp, 10.5,
                      0.75 if grp == "A" else 0.4, anchor="middle"))
    t.append(text(300, 96, "five nearest neighbours", 12.5, 0.8, 500))
    t.append(text(300, 118, "three from A, two from B", 11.5, 0.5))
    t.append(text(300, 148, "majority vote: A", 12.5, 0.9, 500))
    b.append(rect(300, 168, 300, 44, 0.5, SW, r=8, dash="6 6"))
    t.append(text(314, 186, "but only if similarity > 0.3", 11.5, 0.6))
    t.append(text(314, 202, "otherwise it stays an outlier", 11, 0.42))
    return "".join(b), "".join(t), 236, 640


def kc_bisection():
    """Mot cum qua to thi khong dung duoc. Cat doi bang k-means, va cat tiep
    neu van con to."""
    b, t = [], []
    t.append(text(0, 16, "RECURSIVE BISECTION", 11, 0.4, 500))
    b.append(rect(190, 34, 260, 46, 0.95, SW * 1.5, r=8, fill="0.06"))
    t.append(text(320, 62, "one cluster, 500 keywords", 12.5, 0.95, 500,
                  anchor="middle"))
    b.append(seg(320, 80, 320, 100, 0.35, SW * 0.9))
    cb, ct = chip(266, 100, 108, 26, "k-means, k=2", 10.5, 0.5, 0.7)
    b.append(cb)
    t.append(ct)
    b.append(seg(320, 126, 320, 142, 0.35, SW * 0.9))
    b.append(seg(150, 142, 490, 142, 0.35, SW * 0.9))
    for i, x in enumerate((150, 490)):
        b.append(seg(x, 142, x, 162, 0.35, SW * 0.9))
        b.append(seg(x - 5, 155, x, 162, 0.35, SW * 0.9))
        b.append(seg(x + 5, 155, x, 162, 0.35, SW * 0.9))
        b.append(rect(x - 90, 166, 180, 42, 0.6, SW * 1.1, r=8))
        t.append(text(x, 192, "250 keywords", 12, 0.7, anchor="middle"))
        b.append(seg(x, 208, x, 226, 0.3, SW * 0.85, dash="5 5"))
        t.append(text(x, 244, "still too big?", 10.5, 0.45, anchor="middle"))
        t.append(text(x, 260, "split again", 10.5, 0.45, anchor="middle"))
    return "".join(b), "".join(t), 276, 640


def kc_refinement():
    """Sau khi phan cum, moi diem duoc hoi lai mot lan: no gan tam cum nao hon.
    Cum dang giu no duoc cong mot chut thien vi, de khong ai nhay lung tung.

    Ba lan hong lien tiep o day deu la mot loi: dat chu dung len net. Caption
    de len cau ket, roi net dan ket thuc trong ellipse, roi nhan phu "to A"
    nam dung tren duong A-X. Ban nay bo han nhan phu — hinh ve da noi ro dau
    la A dau la B — va moi con so nam HAN phia tren duong cua no, o khoang
    giua ellipse va diem X, cho khong co gi khac."""
    b, t = [], []
    t.append(text(0, 16, "REFINEMENT", 11, 0.4, 500))
    ax, ay, rx, ry = 116, 150, 88, 50
    bx, by = 524, 108
    b.append(ellipse(ax, ay, rx, ry, 0.4, SW, dash="8 8"))
    b.append(ellipse(bx, by, rx, ry, 0.4, SW, dash="8 8"))
    b.append(dot(ax, ay, 7, 0.6))
    b.append(dot(bx, by, 7, 0.6))
    t.append(text(ax, ay + ry + 26, "cluster A", 12, 0.6, 500,
                  anchor="middle"))
    t.append(text(ax, ay + ry + 41, "where X sits now", 10.5, 0.45,
                  anchor="middle"))
    t.append(text(bx, by - ry - 30, "cluster B", 12, 0.6, 500,
                  anchor="middle"))
    t.append(text(bx, by - ry - 15, "the nearer centre", 10.5, 0.45,
                  anchor="middle"))

    px, py = 320, 132
    b.append(seg(px - 11, py + 6, ax + rx + 4, ay - 4, 0.35, SW * 0.9))
    t.append(text(257, 126, "0.72", 12.5, 0.55, 600, anchor="middle",
                  mono=True))
    b.append(seg(px + 11, py - 6, bx - rx - 4, by + 6, 0.9, SW * 1.5))
    t.append(text(384, 98, "0.85", 12.5, 0.95, 600, anchor="middle",
                  mono=True))

    b.append(dot(px, py, 9, 0.95, hollow=True, sw=SW * 1.5))
    t.append(text(px, py + 32, "point X", 11.5, 0.85, 500, anchor="middle"))

    b.append(seg(0, 262, 640, 262, 0.15, SW * 0.7))
    t.append(text(0, 286, "0.72 + 0.05 for staying put is still under 0.85.",
                  12.5, 0.6))
    t.append(text(0, 308, "X moves to cluster B.", 12.5, 0.9, 500))
    return "".join(b), "".join(t), 322, 640


def kc_labeling():
    """Cho duy nhat model duoc goi: dat ten cho cum. No khong quyet dinh cum
    gom nhung gi — viec do da xong tu truoc."""
    b, t = [], []
    t.append(text(0, 16, "CLUSTER LABELLING", 11, 0.4, 500))
    b.append(rect(0, 34, 270, 150, 0.5, SW * 1.1, r=8))
    t.append(text(16, 60, "cluster #7", 12.5, 0.8, 500, mono=True))
    for i, kw in enumerate(("mua laptop dell", "may tinh xach tay gia re",
                            "laptop gaming asus", "notebook hp pavilion")):
        t.append(text(16, 88 + i * 24, kw, 11, 0.5))
    b.append(arrow(280, 316, 108, 0.4))
    b.append(rect(326, 66, 314, 86, 0.95, SW * 1.5, r=10, fill="0.05"))
    b.append(spark(350, 92, 9, 0.95, SW * 0.8))
    t.append(text(366, 97, "one cheap model call", 12.5, 0.95, 500))
    t.append(text(342, 122, '"Create a concise 2-5 word label..."', 11, 0.5,
                  mono=True))
    b.append(seg(483, 152, 483, 176, 0.35, SW * 0.9))
    b.append(seg(478, 169, 483, 176, 0.35, SW * 0.9))
    b.append(seg(488, 169, 483, 176, 0.35, SW * 0.9))
    b.append(rect(326, 182, 314, 40, 0.95, SW * 1.6, r=8))
    t.append(text(483, 207, "Laptop & May Tinh Xach Tay", 13, 0.95, 500,
                  anchor="middle"))
    t.append(text(0, 250, "The model names the cluster. It never decides what "
                  "is in it.", 12.5, 0.6))
    return "".join(b), "".join(t), 264, 640


def kc_presets():
    """Bon bo tham so san. Chung khong doi thuat toan, chung doi cau tra loi
    cho cau hoi "cum bao to thi goi la mot cum"."""
    b, t = [], []
    t.append(text(0, 16, "CLUSTERING PRESETS", 11, 0.4, 500))
    presets = (("BALANCED", "the default", "medium, well-separated", 3, 6,
                False),
               ("BROAD", "fewer, bigger", "comprehensive grouping", 2, 9,
                False),
               ("GRANULAR", "many, smaller", "specific subtopics", 6, 3,
                False),
               ("STRICT", "high coherence", "keeps uncertain ones out", 3, 4,
                True))
    for i, (name, sub, note, groups, per, strict) in enumerate(presets):
        x = i * 160
        b.append(rect(x, 34, 146, 200, 0.95 if strict else 0.45,
                      SW * (1.5 if strict else 1.0), r=9,
                      fill="0.04" if strict else None))
        t.append(text(x + 73, 58, name, 12, 0.95 if strict else 0.72, 500,
                      anchor="middle"))
        t.append(text(x + 73, 76, sub, 10.5, 0.45, anchor="middle"))
        import math as _m
        for g in range(groups):
            gx = x + 34 + (g % 2) * 76
            gy = 106 + (g // 2) * 44
            b.append(ellipse(gx, gy, 30, 17, 0.4, SW * 0.9, dash="5 5"))
            for k in range(per):
                a = hashf(k, g + i * 7) * 6.2832
                r = 0.35 + 0.5 * hashf(k + 20, g + i * 7)
                b.append(dot(gx + _m.cos(a) * 30 * r, gy + _m.sin(a) * 17 * r,
                             3.4, 0.8))
        if strict:
            for k, (ox, oy) in enumerate(((18, 208), (58, 216), (110, 210))):
                b.append(dot(x + ox, oy, 4.4, 0.7, hollow=True))
            t.append(text(x + 73, 230, "outliers kept out", 9.5, 0.5,
                          anchor="middle"))
        t.append(text(x + 73, 254, note, 10, 0.42, anchor="middle"))
    return "".join(b), "".join(t), 268, 640


# ------------------------------------------ a-wrong-quote-... (4, nhap)


def wq_build():
    """Ung dung giu trang thai, mot dong mot buoc. Agent chi dieu huong giua
    cac buoc — no khong bao gio tu tinh mot con so nao."""
    b, t = [], []
    t.append(text(0, 16, "HOW THE QUOTING AGENT IS BUILT", 11, 0.4, 500))
    b.append(rect(0, 36, 140, 46, 0.5, SW, r=8))
    t.append(text(70, 64, "operator", 12.5, 0.7, anchor="middle"))
    b.append(arrow(146, 176, 59, 0.4))
    b.append(rect(182, 36, 250, 46, 0.95, SW * 1.5, r=8, fill="0.05"))
    t.append(text(307, 58, "the app", 13, 0.95, 500, anchor="middle"))
    t.append(text(307, 74, "holds the state, one row per step", 10, 0.5,
                  anchor="middle"))
    b.append(rect(462, 36, 178, 46, 0.6, SW * 1.1, r=8))
    b.append(spark(486, 59, 8, 0.9, SW * 0.75))
    t.append(text(502, 64, "the agent", 12.5, 0.85, 500))
    # Dong nay bat dau o 462 va dai 183px, tuc vuot qua 640.
    t.append(text(462, 98, "navigates, never computes", 10.5, 0.55))
    t.append(text(462, 112, "a number itself", 10.5, 0.55))
    for i, tool in enumerate(("get_quote", "run_step", "set_route")):
        cb, ct = chip(462 + i * 58, 126, 54, 22, "", 9.5, 0.4, 0.6)
        b.append(cb)
        t.append(text(462 + i * 58 + 27, 141, tool, 8, 0.6, anchor="middle",
                      mono=True))
    t.append(text(0, 168, "NINE DETERMINISTIC STEPS", 10.5, 0.4, 500))
    steps = ("input", "check kw", "rankings", "pick rivals", "cluster",
             "volume", "effort", "rate card", "assemble")
    for i, name in enumerate(steps):
        x = i * 70
        b.append(rect(x, 182, 62, 44, 0.5, SW, r=6))
        t.append(text(x + 31, 202, str(i + 1), 10, 0.45, anchor="middle",
                      mono=True))
        t.append(text(x + 31, 218, name, 9, 0.6, anchor="middle"))
        if i < 8:
            b.append(seg(x + 63, 204, x + 69, 204, 0.25, SW * 0.8))
    b.append(seg(307, 82, 307, 176, 0.3, SW * 0.9, dash="6 6"))
    return "".join(b), "".join(t), 244, 640


def wq_workbench():
    """Cai cuoi cung o lai khong phai mot khung chat: no la mot cai bang tra
    cuu, va nguoi sua thang trong bang."""
    b, t = [], []
    b.append(rect(0, 20, 640, 250, 1.0, SW * 1.6, r=10))
    b.append(seg(0, 56, 640, 56, 0.3, SW))
    t.append(text(16, 44, "SEO Production Quote", 13, 0.85, 500))
    tabs = ("Run", "Quote", "Rivals", "Commitment", "Keywords", "Assumptions")
    x = 16
    for i, tab in enumerate(tabs):
        on = i == 1
        t.append(text(x, 80, tab, 11, 0.9 if on else 0.4, 500 if on else 400))
        if on:
            b.append(seg(x - 2, 90, x + len(tab) * 6.6, 90, 0.9, SW * 1.1))
        x += len(tab) * 6.6 + 24
    t.append(text(560, 80, "edit in the table", 10, 0.4, anchor="end"))
    cols = ((16, "Item"), (330, "Qty"), (420, "Unit"), (560, "Cost"))
    for cx, label in cols:
        t.append(text(cx, 116, label, 9.5, 0.35, 500))
    b.append(seg(0, 124, 640, 124, 0.2, SW * 0.8))
    rows = (("Content", None, None, None, True),
            ("New blog posts", "62", "post", "148.800.000", False),
            ("Product posts", "28", "post", "89.600.000", False),
            ("Off-page", None, None, None, True),
            ("Guest posts", "18", "link", "54.000.000", False),
            ("Technical", "1", "audit", "18.000.000", True))
    for i, (name, qty, unit, cost, group) in enumerate(rows):
        y = 148 + i * 22
        t.append(text(16 + (0 if group else 14), y, name, 11,
                      0.85 if group else 0.55, 500 if group else 400))
        for cx, val in ((330, qty), (420, unit)):
            if val:
                t.append(text(cx, y, val, 10.5, 0.5))
        if cost:
            t.append(text(624, y, cost, 10.5, 0.7, anchor="end", mono=True))
    return "".join(b), "".join(t), 286, 640


def wq_silent():
    """Mot buoc tra ve rong. Buoc sau khong phan biet duoc "khong co du lieu"
    voi "du lieu bang khong", nen ca lan chay van bao la xong."""
    b, t = [], []
    b.append(rect(0, 20, 640, 210, 1.0, SW * 1.6, r=10))
    b.append(seg(0, 54, 640, 54, 0.3, SW))
    t.append(text(16, 42, "Quote", 12.5, 0.85, 500))
    cb, ct = chip(540, 28, 88, 24, "9/9 done", 10.5, 0.7, 0.85)
    b.append(cb)
    t.append(ct)
    rows = (("Content", "62", "148.800.000", False),
            ("Product posts", "28", "89.600.000", False),
            ("Off-page (booking)", "", "", True),
            ("Technical", "1", "18.000.000", False),
            ("Personnel", "3", "42.000.000", False))
    for i, (name, qty, cost, gone) in enumerate(rows):
        y = 82 + i * 26
        if gone:
            b.append(rect(8, y - 15, 624, 24, 0.0, SW, fill="0.06", r=5))
        t.append(text(16, y, name, 11.5, 0.35 if gone else 0.7))
        if gone:
            t.append(text(200, y, "returned [ ]", 11, 0.9, 500, mono=True))
        else:
            t.append(text(360, y, qty, 11, 0.5))
            t.append(text(624, y, cost, 11, 0.7, anchor="end", mono=True))
    b.append(seg(360, 218, 624, 218, 0.35, SW * 0.9))
    t.append(text(360, 218 + 0, "", 10, 0.4))
    t.append(text(16, 218, "QUOTE TOTAL", 11.5, 0.85, 500))
    t.append(text(624, 218, "298.400.000", 13, 0.95, 600, anchor="end",
                  mono=True))
    t.append(text(0, 262, "A whole block, gone, and the run never noticed.",
                  13, 0.9, 500))
    return "".join(b), "".join(t), 276, 640


def wq_gate():
    """Cai cong phai hoi "buoc nay co ton tai khong", khong phai "gia tri cua
    no co that khong". Mot payload rong la that ve mat Python."""
    b, t = [], []
    for x, label in ((190, "full payload"), (330, "empty payload"),
                     (480, "missing step")):
        t.append(text(x, 20, label, 10.5, 0.4, 500, anchor="middle"))
        t.append(text(x, 38, {"full payload": "{ price, links }",
                              "empty payload": "{ }",
                              "missing step": "(absent)"}[label], 10, 0.45,
                      anchor="middle", mono=True))
    b.append(seg(0, 52, 640, 52, 0.22, SW * 0.8))
    rows = (("v1 · truthiness", "if not stages.get(step):",
             ("passes", "passes, slips through", "fires"), False),
            ("v2 · presence", "if step not in stages:",
             ("passes", "fires", "fires"), True))
    for i, (name, code, verdicts, good) in enumerate(rows):
        y = 84 + i * 78
        if good:
            b.append(rect(-8, y - 26, 656, 66, 0.0, SW, fill="0.05", r=8))
        t.append(text(0, y, name, 12, 0.9 if good else 0.6, 500))
        t.append(text(0, y + 20, code, 11, 0.6, mono=True))
        for k, v in enumerate(verdicts):
            cx = (190, 330, 480)[k]
            bad = "slips" in v
            t.append(text(cx, y + 6, v, 10.5, 0.9 if bad or good else 0.5,
                          500 if bad else 400, anchor="middle"))
            if bad:
                b.append(seg(cx - 58, y + 12, cx + 58, y + 12, 0.7, SW * 1.1))
    t.append(text(0, 246, "A test we ran backwards is what caught it.", 12.5,
                  0.6))
    return "".join(b), "".join(t), 260, 640


# ------------------------------------------ adding-a-data-analyst (2, nhap)


def da_sees():
    """Cai agent thuc su nhin thay: ba cot, ba dong mau. Ca file co khoang muoi
    nghin dong ma no khong bao gio cham vao."""
    b, t = [], []
    t.append(text(0, 16, "WHAT THE AGENT SEES", 11, 0.4, 500))
    b.append(rect(0, 32, 320, 132, 0.9, SW * 1.4, r=8, fill="0.04"))
    for x, label in ((16, "column"), (140, "type"), (220, "sample")):
        t.append(text(x, 54, label, 9.5, 0.35, 500))
    b.append(seg(0, 62, 320, 62, 0.2, SW * 0.8))
    for i, (c, ty, sa) in enumerate((("month", "text", "2026-03"),
                                     ("revenue", "number", "128,400"),
                                     ("channel", "text", "organic"))):
        y = 86 + i * 26
        t.append(text(16, y, c, 11, 0.75, mono=True))
        t.append(text(140, y, ty, 11, 0.45))
        t.append(text(220, y, sa, 11, 0.6, mono=True))
    t.append(text(0, 184, "three columns, three sample rows", 11, 0.5))
    t.append(text(360, 16, "WHAT IS IN THE FILE", 11, 0.4, 500))
    b.append(rect(360, 32, 280, 132, 0.35, SW, r=8, dash="6 6"))
    for i in range(11):
        b.append(seg(376, 50 + i * 11, 624 - (i % 3) * 30, 50 + i * 11, 0.2,
                     SW * 0.8))
    t.append(text(360, 184, "about ten thousand rows, continuing down", 11,
                  0.5))
    t.append(text(0, 218, "No system computes an average by looking at three "
                  "rows.", 12.5, 0.85, 500))
    return "".join(b), "".join(t), 232, 640


def da_ladder():
    """Bon buoc, va dieu quan trong nhat la buoc cuoi: tinh trong code, khong
    bao gio uoc luong tu mau."""
    b, t = [], []
    steps = (("Look", "tabs, columns, size"), ("Read a little",
                                               "a few rows, the format"),
             ("Read it properly", "the range that matters"),
             ("Compute", "in code, then answer"))
    for i, (name, sub) in enumerate(steps):
        x = i * 160
        last = i == 3
        b.append(rect(x, 40, 146, 62, 0.95 if last else 0.5,
                      SW * (1.5 if last else 1.0), r=8,
                      fill="0.05" if last else None))
        t.append(text(x + 73, 66, name, 12.5, 0.95 if last else 0.75, 500,
                      anchor="middle"))
        t.append(text(x + 73, 84, sub, 10, 0.45, anchor="middle"))
        if i < 3:
            b.append(arrow(x + 148, x + 158, 71, 0.35))
    b.append(seg(560, 102, 560, 126, 0.35, SW * 0.9))
    b.append(seg(560, 126, 60, 126, 0.35, SW * 0.9, dash="6 6"))
    b.append(seg(60, 126, 60, 106, 0.35, SW * 0.9))
    b.append(seg(55, 114, 60, 106, 0.35, SW * 0.9))
    b.append(seg(65, 114, 60, 106, 0.35, SW * 0.9))
    t.append(text(310, 144, "if a figure needs a second look", 11, 0.5,
                  anchor="middle"))
    t.append(text(0, 184, "Never read a number off a sample when the whole "
                  "column is right there.", 12.5, 0.85, 500))
    return "".join(b), "".join(t), 198, 640


# --------------------------------------- adding-an-seo-specialist (4, nhap)


def seo_tool():
    """Chuyen gia SEO la mot CONG CU cua deck agent, khong phai mot dong nghiep.
    No tra loi cau hoi va khong bao gio duoc cam but."""
    b, t = [], []
    b.append(rect(0, 40, 220, 90, 0.95, SW * 1.5, r=10, fill="0.05"))
    b.append(spark(26, 70, 9, 0.95, SW * 0.8))
    t.append(text(42, 75, "deck agent", 13.5, 0.95, 500))
    t.append(text(16, 100, "runs the loop", 11, 0.5))
    for i, tool in enumerate(("add_slide", "edit_slide", "set_theme",
                              "ask_specialist")):
        y = 40 + i * 34
        hero = i == 3
        b.append(rect(266, y, 150, 26, 0.95 if hero else 0.45,
                      SW * (1.4 if hero else 0.95), r=13,
                      fill="0.06" if hero else None))
        t.append(text(341, y + 18, tool, 10.5, 0.95 if hero else 0.55,
                      500 if hero else 400, anchor="middle", mono=True))
        b.append(seg(222, 85, 262, y + 13, 0.25, SW * 0.8))
    b.append(arrow(422, 460, 155, 0.5))
    b.append(rect(466, 118, 174, 74, 0.6, SW * 1.2, r=10))
    b.append(spark(492, 146, 8, 0.7, SW * 0.75))
    t.append(text(508, 151, "SEO expert", 12.5, 0.8, 500))
    t.append(text(482, 176, "its own model", 10.5, 0.5))
    t.append(text(466, 210, "cannot write the deck", 11, 0.55))
    t.append(text(0, 246, "A question out, an answer back. The deck agent "
                  "never learns it is a model.", 12.5, 0.6))
    return "".join(b), "".join(t), 260, 640


def seo_ladder():
    """Bon tang, va khong tang nao dang de tan cong khi tang duoi no chua
    dung."""
    b, t = [], []
    t.append(text(0, 16, "EACH LAYER ONLY MATTERS ONCE THE ONE BELOW HOLDS",
                  11, 0.4, 500))
    layers = (("Title and snippet earn the click", "polish", False),
              ("Content answers the query", "substance", False),
              ("Structure is real: headings, landmarks", "shape", False),
              ("A crawler can read the page at all", "foundation", True))
    for i, (name, tag, base) in enumerate(layers):
        y = 40 + i * 54
        b.append(rect(60, y, 480, 44, 0.95 if base else 0.5,
                      SW * (1.5 if base else 1.0), r=8,
                      fill="0.05" if base else None))
        t.append(text(80, y + 27, name, 12.5, 0.95 if base else 0.7,
                      500 if base else 400))
        t.append(text(520, y + 27, tag, 10.5, 0.4, anchor="end"))
        if base:
            b.append(check(34, y + 20, 8, 0.9, SW * 1.3))
        else:
            b.append(dot(34, y + 22, 8, 0.3, hollow=True))
    b.append(seg(566, 60, 566, 240, 0.4, SW * 0.9))
    b.append(seg(561, 72, 566, 60, 0.4, SW * 0.9))
    b.append(seg(571, 72, 566, 60, 0.4, SW * 0.9))
    t.append(text(578, 156, "checked", 10.5, 0.5))
    t.append(text(578, 172, "bottom up", 10.5, 0.5))
    t.append(text(0, 274, "You cannot skip up a rung. Optimising the title of "
                  "a page a crawler cannot read is nothing.", 12, 0.6))
    return "".join(b), "".join(t), 288, 640


def seo_bound():
    """Mot con so go tay va mot con so buoc vao o tinh trong duoi giong het
    nhau. Chi mot trong hai co the sai ma moi buoc kiem van qua."""
    b, t = [], []
    for side, (kind, val, label, note1, note2, safe) in enumerate((
            ("typed", "54%", "organic revenue",
             "identical whether right or wrong;",
             "the one error every check survives", False),
            ("bound", "{$bind}", "contract total",
             "read out of the sheet at build time;",
             "cannot be mistyped, cannot go stale", True))):
        x = side * 330
        b.append(rect(x, 34, 288, 108, 0.95 if safe else 0.5,
                      SW * (1.5 if safe else 1.0), r=10,
                      fill="0.05" if safe else None))
        t.append(text(x + 20, 58, kind, 10.5, 0.5, 500, mono=True))
        t.append(text(x + 144, 100, val, 28, 0.95, 600, anchor="middle",
                      mono=(side == 1)))
        t.append(text(x + 144, 124, label, 10.5, 0.5, anchor="middle"))
        t.append(text(x, 164, note1, 11, 0.55))
        t.append(text(x, 182, note2, 11, 0.55))
    b.append(seg(0, 210, 640, 210, 0.2, SW * 0.8))
    t.append(text(0, 236, "And when a real total will not fit its tile:", 12,
                  0.6))
    for i, (what, ok) in enumerate((("trim it, so a different number ships",
                                     False),
                                    ("refuse, and keep the truth", True))):
        y = 264 + i * 30
        if ok:
            b.append(check(10, y - 4, 8, 0.9, SW * 1.3))
        else:
            b.append(seg(4, y - 10, 18, y + 4, 0.6, SW * 1.2))
            b.append(seg(18, y - 10, 4, y + 4, 0.6, SW * 1.2))
        t.append(text(32, y, what, 12, 0.9 if ok else 0.45, 500 if ok else 400))
    return "".join(b), "".join(t), 312, 640


def seo_config():
    """Cho mot nguoi khong phai ky su chinh chuyen gia: huong dan, tai lieu
    tham chieu, model, bat tat, va mot cho de thu."""
    b, t = [], []
    t.append(text(0, 16, "WHERE A NON-ENGINEER CONFIGURES A SPECIALIST", 11,
                  0.4, 500))
    b.append(rect(0, 32, 640, 250, 1.0, SW * 1.6, r=10))
    b.append(seg(0, 66, 640, 66, 0.3, SW))
    t.append(text(16, 54, "/agents", 12, 0.55, mono=True))
    t.append(text(100, 54, "SEO strategist", 12.5, 0.9, 500))
    cb, ct = chip(556, 40, 68, 22, "on", 10.5, 0.7, 0.85)
    b.append(cb)
    t.append(ct)
    t.append(text(16, 92, "INSTRUCTIONS", 9.5, 0.35, 500))
    for i in range(3):
        b.append(seg(16, 106 + i * 14, 16 + (300 - i * 40), 106 + i * 14, 0.25,
                     SW * 0.85))
    t.append(text(16, 172, "REFERENCE DOCUMENTS", 9.5, 0.35, 500))
    for i, doc in enumerate(("brand-voice.md", "seo-rules.pdf", "past decks")):
        cb, ct = chip(16 + i * 108, 182, 100, 24, doc, 9.5, 0.45, 0.65)
        b.append(cb)
        t.append(ct)
    t.append(text(16, 236, "MODEL", 9.5, 0.35, 500))
    cb, ct = chip(16, 246, 110, 24, "Claude", 10.5, 0.5, 0.7)
    b.append(cb)
    t.append(ct)
    t.append(text(360, 92, "PLAYGROUND", 9.5, 0.35, 500))
    b.append(rect(360, 102, 264, 34, 0.4, SW, r=8, fill="0.05"))
    t.append(text(374, 124, "Is this title good for search?", 10.5, 0.6))
    b.append(spark(374, 158, 8, 0.9, SW * 0.75))
    t.append(text(390, 163, "Too vague. Lead with the metric.", 10.5, 0.7))
    t.append(text(0, 306, "Nobody opens a repository to change how the "
                  "specialist thinks.", 12.5, 0.6))
    return "".join(b), "".join(t), 320, 640


# ---------------------------------------------- agent-orchestration (4, nhap)


def orch_wall():
    """Nguoi doc noi chuyen voi orchestrator. Khong mot dong chat nao di qua
    buc tuong — cac agent phia sau chi nhan viec."""
    b, t = [], []
    b.append(rect(0, 60, 110, 48, 0.5, SW, r=8))
    t.append(text(55, 90, "reader", 12, 0.7, anchor="middle"))
    b.append(arrow(116, 150, 84, 0.4))
    b.append(rect(156, 48, 168, 72, 0.95, SW * 1.5, r=10, fill="0.05"))
    b.append(spark(180, 78, 9, 0.95, SW * 0.8))
    t.append(text(196, 83, "Orchestrator", 12.5, 0.95, 500))
    t.append(text(172, 104, "holds the conversation", 10, 0.5))
    b.append(seg(348, 24, 348, 258, 0.7, SW * 1.6, dash="9 7"))
    t.append(text(348, 18, "none of the chat crosses this", 10, 0.55, 500,
                  anchor="middle"))
    for i, (name, sub) in enumerate((("Outline agent", "what the deck argues"),
                                     ("Slide agent", "builds each slide"),
                                     ("Specialists", "SEO, Data: advise only"))):
        y = 40 + i * 62
        b.append(rect(380, y, 260, 48, 0.55, SW * 1.1, r=8))
        t.append(text(396, y + 22, name, 12, 0.8, 500))
        t.append(text(396, y + 39, sub, 10, 0.45))
        b.append(seg(330, 84, 376, y + 24, 0.28, SW * 0.85))
    b.append(rect(0, 250, 640, 40, 0.9, SW * 1.4, r=8, fill="0.06"))
    t.append(text(320, 275, "Engine  ·  computes every pixel", 12.5, 0.9, 500,
                  anchor="middle"))
    return "".join(b), "".join(t), 300, 640


def orch_stream():
    """Doi ca cau tra loi thi mot ket noi im lang ba tram giay se bi cat. Chay
    dong thi tieu de ve trong khoang mot giay."""
    b, t = [], []
    for i, (name, first, dead, bad) in enumerate((
            ("wait for the whole answer", 300, True, True),
            ("stream the answer", 1, False, False))):
        y = 40 + i * 96
        t.append(text(0, y, name, 13, 0.9 if not bad else 0.6, 500))
        b.append(seg(0, y + 26, 600, y + 26, 0.22, SW * 0.9))
        if bad:
            for k in range(20):
                b.append(seg(k * 30, y + 26, k * 30 + 14, y + 26, 0.5,
                             SW * 1.6))
            b.append(seg(560, y + 12, 576, y + 40, 0.9, SW * 1.6))
            b.append(seg(576, y + 12, 560, y + 40, 0.9, SW * 1.6))
            t.append(text(600, y + 58, "300s abort", 11, 0.75, 500,
                          anchor="end"))
        else:
            b.append(seg(0, y + 26, 600, y + 26, 0.95, SW * 1.8))
            b.append(dot(14, y + 26, 7, 0.95))
            t.append(text(14, y + 52, "headers at about 1s", 11, 0.75, 500))
    t.append(text(0, 218, "And while it streams it is emitting signs of life "
                  "the whole time.", 12.5, 0.6))
    return "".join(b), "".join(t), 232, 640


def orch_watchdogs():
    """Ba con cho canh, ba lan giet nham. Cai cuoi cung tat mac dinh."""
    b, t = [], []
    t.append(text(0, 16, "THREE WATCHDOGS, THREE WRONG KILLS", 11, 0.4, 500))
    rows = (("total time", "15 min", "killed the biggest working deck", False),
            ("silence only", "512s", "killed a model that was thinking",
             False),
            ("part-type match", "650s", "killed a run building 58 slides",
             False),
            ("a hard cap only", "off by default", "as a backstop, nothing more",
             True))
    for i, (name, limit, what, keep) in enumerate(rows):
        y = 48 + i * 56
        if keep:
            b.append(rect(-8, y - 26, 656, 46, 0.0, SW, fill="0.05", r=8))
        t.append(text(0, y, name, 12.5, 0.95 if keep else 0.7, 500))
        t.append(text(190, y, limit, 11.5, 0.6, mono=True))
        t.append(text(300, y, what, 11.5, 0.85 if keep else 0.5))
        if not keep:
            b.append(seg(624, y - 8, 636, y + 4, 0.6, SW * 1.2))
            b.append(seg(636, y - 8, 624, y + 4, 0.6, SW * 1.2))
        else:
            b.append(check(628, y - 2, 7, 0.9, SW * 1.2))
    t.append(text(0, 278, "Silence and thinking look identical. Only the wire "
                  "tells them apart.", 12.5, 0.6))
    return "".join(b), "".join(t), 292, 640


def orch_ownership():
    """Lan chay thuoc ve BAI TRINH BAY, khong thuoc ve tab trinh duyet. Dong
    tab lai roi mo ra thi ban noi lai duoc."""
    b, t = [], []
    t.append(text(0, 16, "GIVE THE RUN TO THE DECK, NOT TO THE BROWSER TAB",
                  11, 0.4, 500))
    for side, (title, mid, outcome, good) in enumerate((
            ("owned by the HTTP request", "HTTP connection",
             ("the tab reloads, the connection drops",
              "the run dies, and Stop does nothing"), False),
            ("owned by the deck", "the deck",
             ("connections attach and detach",
              "reload, close, come back: you rejoin"), True))):
        x = side * 330
        b.append(rect(x, 36, 288, 200, 0.95 if good else 0.45,
                      SW * (1.5 if good else 1.0), r=10,
                      fill="0.04" if good else None))
        t.append(text(x + 144, 62, title, 12, 0.95 if good else 0.7, 500,
                      anchor="middle"))
        b.append(rect(x + 70, 80, 148, 34, 0.55, SW, r=7))
        t.append(text(x + 144, 102, mid, 11, 0.6, anchor="middle"))
        b.append(seg(x + 144, 114, x + 144, 138, 0.35, SW * 0.9,
                     dash=None if good else "5 5"))
        b.append(rect(x + 70, 138, 148, 34, 0.9, SW * 1.3, r=7,
                      fill="0.06" if good else None))
        t.append(text(x + 144, 160, "the run", 11.5, 0.9, 500,
                      anchor="middle"))
        for k, line in enumerate(outcome):
            t.append(text(x + 144, 196 + k * 18, line, 10, 0.55,
                          anchor="middle"))
    t.append(text(0, 264, "Orphaned runs are marked interrupted on the next "
                  "boot, and a client that rejoins is told so.", 12, 0.55))
    return "".join(b), "".join(t), 278, 640


# ------------------------------------------------- dynamic-outlines (3, nhap)


def do_cards():
    """Dan bai la nhung the co the doc va sua truoc khi bat cu slide nao duoc
    dung."""
    b, t = [], []
    claims = ("Traffic fell 40% after three pages dropped out",
              "Demand is seasonal, not shrinking",
              "One rival took the category head term",
              "Recovery rebuilds the category pages first")
    for i, claim in enumerate(claims):
        y = 24 + i * 58
        b.append(rect(0, y, 520, 46, 0.6, SW * 1.1, r=8))
        t.append(text(18, y + 22, claim, 12.5, 0.85))
        t.append(text(18, y + 38, "one claim, one slide", 9.5, 0.4))
        t.append(text(538, y + 28, f"0{i + 1}", 11, 0.4, mono=True))
    b.append(rect(160, 268, 200, 36, 0.95, SW * 1.5, r=18, fill="0.06"))
    t.append(text(260, 291, "Generate slides", 12, 0.95, 500,
                  anchor="middle"))
    t.append(text(376, 291, "built only on approval", 11, 0.5))
    return "".join(b), "".join(t), 318, 640


def do_typed():
    """Truoc khi con so co the buoc vao o tinh, go tay la duong duy nhat. Dan
    bai la cho re nhat de bat mot con so sai."""
    b, t = [], []
    b.append(rect(0, 30, 520, 60, 0.6, SW * 1.1, r=8))
    t.append(text(18, 56, "Traffic fell", 13, 0.85))
    b.append(rect(102, 38, 62, 26, 0.95, SW * 1.5, r=5, fill="0.09"))
    t.append(text(133, 57, "40%", 13, 0.95, 600, anchor="middle", mono=True))
    t.append(text(172, 56, "after three pages dropped out", 13, 0.85))
    t.append(text(18, 78, "typed by the model, from memory", 9.5, 0.5))
    b.append(seg(133, 92, 133, 122, 0.4, SW * 0.9, dash="5 6"))
    t.append(text(133, 142, "the only cheap place to catch it", 11.5, 0.7,
                  500, anchor="middle"))
    b.append(rect(0, 168, 520, 60, 0.4, SW, r=8, dash="6 6"))
    t.append(text(18, 194, "the sheet says", 12.5, 0.5))
    t.append(text(122, 194, "38.4%", 12.5, 0.9, 600, mono=True))
    t.append(text(18, 216, "nobody would have checked it on a finished slide",
                  9.5, 0.5))
    return "".join(b), "".join(t), 246, 640


def do_depth():
    """Kiem do day: no cham diem theo the O GIUA, vi mot bai duoc phep co mot
    the thua, con mot bai co the giua mong thi la mot bai mong."""
    b, t = [], []
    t.append(text(0, 16, "DEPTH CHECK", 11, 0.4, 500))
    cards = (("Demand is seasonal, not shrinking", "two sources under it",
              True),
             ("Recovery rebuilds the category pages", "one source", True),
             ("A section on the market", "restates its neighbour", False),
             ("One rival took the head term", "no evidence under it", False))
    for i, (claim, note, ok) in enumerate(cards):
        y = 40 + i * 52
        b.append(rect(0, y, 470, 40, 0.9 if ok else 0.4,
                      SW * (1.3 if ok else 1.0), r=7,
                      fill=None, dash=None if ok else "6 6"))
        t.append(text(16, y + 18, claim, 12, 0.9 if ok else 0.45))
        t.append(text(16, y + 33, note, 9.5, 0.45))
        if ok:
            b.append(check(496, y + 18, 7, 0.85, SW * 1.2))
        else:
            t.append(text(496, y + 24, "refused", 11, 0.7, 500))
    t.append(text(0, 268, "It judges by the median card. A deck is allowed one "
                  "spare slide;", 12, 0.6))
    t.append(text(0, 288, "a deck whose middle card is thin is just a thin "
                  "deck.", 12, 0.6))
    return "".join(b), "".join(t), 302, 640


# ------------------------------------- why-ai-sucks-at-presentations (3)


def wp_three_fights():
    """Mot slide la ba tran danh cung luc. Cho ba vong tron chong nhau moi la
    cho khong the giai bang cach lam tot tung cai mot."""
    b, t = [], []
    cx, cy, r = 320, 150, 96
    centres = ((cx - 62, cy - 26), (cx + 62, cy - 26), (cx, cy + 62))
    names = ("the data", "the argument", "the design")
    subs = ("every figure right", "each slide earns its place",
            "readable from the back")
    for i, (px, py) in enumerate(centres):
        b.append(dot(px, py, r, 0.55, hollow=True, sw=SW * 1.4))
    for i, (px, py) in enumerate(centres):
        lx = px + (-150 if i == 0 else (150 if i == 1 else 0))
        ly = py + (-70 if i < 2 else 122)
        t.append(text(lx, ly, names[i], 13.5, 0.9, 500, anchor="middle"))
        t.append(text(lx, ly + 18, subs[i], 10.5, 0.5, anchor="middle"))
    b.append(rect(cx - 44, cy + 4, 88, 56, 0.95, SW * 1.7, r=6, fill="0.10"))
    t.append(text(cx, cy + 38, "one slide", 12, 0.95, 500, anchor="middle"))
    t.append(text(0, 372, "Each one is solvable alone. The slide is where "
                  "all three have to be true at once.", 12.5, 0.65))
    return "".join(b), "".join(t), 386, 640


def wp_wrong_number():
    """Con so dung va con so sai trong giong het nhau. Model nhat mot dong tong
    phu nam gan dau bang va dat no len slide o co bon muoi."""
    b, t = [], []
    t.append(text(0, 16, "THE SHEET", 10.5, 0.4, 500))
    b.append(rect(0, 30, 260, 210, 0.5, SW * 1.1, r=8))
    rows = (("Q1 organic", "128,400", False), ("Q1 paid", "46,200", False),
            ("Subtotal Q1", "174,600", True), ("Q2 organic", "151,900", False),
            ("Q2 paid", "52,800", False), ("Q3 organic", "168,300", False),
            ("Q3 paid", "58,100", False), ("TOTAL", "605,700", False))
    for i, (label, val, grabbed) in enumerate(rows):
        y = 52 + i * 24
        if grabbed:
            b.append(rect(8, y - 14, 244, 22, 0.95, SW * 1.4, r=4,
                          fill="0.09"))
        t.append(text(16, y, label, 10.5, 0.9 if grabbed else 0.5,
                      500 if grabbed else 400))
        t.append(text(244, y, val, 10.5, 0.9 if grabbed else 0.5,
                      anchor="end", mono=True))
    b.append(seg(258, 100, 330, 128, 0.6, SW * 1.2))
    b.append(seg(320, 118, 330, 128, 0.6, SW * 1.2))
    b.append(seg(326, 112, 330, 128, 0.6, SW * 1.2))
    t.append(text(268, 92, "grabbed", 10.5, 0.6, 500))
    b.append(rect(350, 40, 290, 190, 1.0, SW * 1.7, r=8))
    t.append(text(374, 76, "REVENUE", 10.5, 0.5, 500))
    t.append(text(495, 148, "174,600", 40, 0.95, 600, anchor="middle"))
    t.append(text(495, 176, "total for the year", 11.5, 0.5, anchor="middle"))
    t.append(text(0, 268, "Nothing about the slide looks wrong. A right "
                  "number and a wrong one are", 12.5, 0.65))
    t.append(text(0, 288, "visually identical, and this one is off by a "
                  "factor of three.", 12.5, 0.65))
    return "".join(b), "".join(t), 302, 640


def wp_unreadable():
    """Mot bieu do dung moi luat van co the khong doc duoc. Ba muoi cot day mot
    pixel troi tren mot slide trong, va moi phep kiem tu dong deu bao dat."""
    b, t = [], []
    b.append(rect(0, 30, 380, 210, 1.0, SW * 1.6, r=8))
    base = 200
    for i in range(30):
        x = 40 + i * 10
        h = 20 + 50 * abs(((i * 7) % 13) / 13 - 0.2)
        b.append(seg(x, base, x, base - h, 0.85, SW * 0.35))
    b.append(seg(34, base, 350, base, 0.35, SW * 0.8))
    t.append(text(40, 66, "Revenue by week", 11, 0.6, 500))
    t.append(text(40, 224, "thirty bars, about one pixel each", 9, 0.4))
    checks = ("data is correct", "axes are labelled", "colours are on-brand",
              "no text overflows", "contrast passes")
    t.append(text(414, 52, "EVERY CHECK PASSES", 10.5, 0.5, 500))
    for i, c in enumerate(checks):
        y = 84 + i * 30
        b.append(check(422, y - 4, 7, 0.9, SW * 1.2))
        t.append(text(440, y, c, 11.5, 0.7))
    t.append(text(414, 236, "and nobody can read it", 12, 0.9, 500))
    return "".join(b), "".join(t), 260, 640


# ------------------------------ making-ai-generated-slides-interactive (5)


def ms_vocabulary():
    """Agent chi viet duoc mot tu vung bo cuc rat hep. Moi pixel that la do mot
    engine tinh, va model khong bao gio nhin thay engine do."""
    b, t = [], []
    t.append(text(0, 16, "WHAT THE AGENT WRITES", 10.5, 0.4, 500))
    b.append(rect(0, 30, 250, 214, 0.5, SW * 1.1, r=8))
    lines = (("col · gap lg", 0), ("statementBlock", 1), ("title + body", 2),
             ("row · gap lg", 1), ("metricTile", 2), ("metricTile", 2),
             ("chartCard", 2), ("series: volume", 3))
    for i, (line, depth) in enumerate(lines):
        t.append(text(16 + depth * 16, 56 + i * 24, line, 11, 0.7, mono=True))
    b.append(arrow(258, 296, 130, 0.45))
    b.append(rect(304, 100, 92, 60, 0.95, SW * 1.6, r=8, fill="0.06"))
    t.append(text(350, 126, "ENGINE", 11.5, 0.95, 500, anchor="middle"))
    t.append(text(350, 144, "computes", 10, 0.5, anchor="middle"))
    t.append(text(350, 176, "the model never", 10, 0.45, anchor="middle"))
    t.append(text(350, 192, "sees this", 10, 0.45, anchor="middle"))
    b.append(arrow(404, 440, 130, 0.45))
    t.append(text(448, 16, "WHAT THE READER SEES", 10.5, 0.4, 500))
    b.append(rect(448, 30, 192, 214, 1.0, SW * 1.7, r=8))
    t.append(text(468, 58, "MARKET", 9.5, 0.5, 500))
    t.append(text(468, 86, "Search demand is", 13, 0.9, 500))
    t.append(text(468, 104, "seasonal, not shrinking", 13, 0.9, 500))
    t.append(text(468, 152, "2.1x", 26, 0.95, 600))
    t.append(text(468, 170, "peak vs trough", 9.5, 0.45))
    for i, v in enumerate((0.4, 0.62, 0.9, 0.7)):
        b.append(rect(552 + i * 20, 216 - 40 * v, 14, 40 * v, 0.7, SW * 0.9,
                      fill="0.14"))
    return "".join(b), "".join(t), 258, 640


def ms_slack():
    """Chieu cao thua duoc phat cho nhung phan tu that su tot hon khi co them
    cho, khong phai chia deu cho tat ca."""
    b, t = [], []
    for side, (title, note, tall) in enumerate((
            ("A chart left at its floor", "nothing gave it the room", False),
            ("The same chart, handed the slack", "the engine gave it to the "
             "one that improves", True))):
        x = side * 330
        b.append(rect(x, 34, 290, 214, 0.95 if tall else 0.45,
                      SW * (1.5 if tall else 1.0), r=8))
        t.append(text(x + 16, 60, title, 12, 0.9 if tall else 0.6, 500))
        h = 150 if tall else 56
        b.append(rect(x + 20, 226 - h, 250, h, 0.6, SW, r=6))
        base = 220
        for i, v in enumerate((0.45, 0.7, 0.55, 0.95, 0.62)):
            bh = (h - 24) * v
            b.append(rect(x + 40 + i * 46, base - bh, 30, bh, 0.75,
                          SW * 0.9, fill="0.14"))
        if not tall:
            b.append(rect(x + 20, 82, 250, 84, 0.3, SW * 0.9, r=6,
                          dash="7 7"))
            t.append(text(x + 145, 130, "left blank underneath", 10.5, 0.45,
                          anchor="middle"))
        t.append(text(x + 16, 266, note, 10.5, 0.5))
    return "".join(b), "".join(t), 282, 640


def ms_leading():
    """Khoang dong tinh tu CHIEU CAO MUC THAT, khong tu co chu. Tieng Viet co
    dau chong dau, nen mot dong bien thanh hai dong dinh nhau."""
    b, t = [], []
    for side, (title, lead, gap, ok) in enumerate((
            ("Leading from font size", "1.12em", 2, False),
            ("Leading from the ink", "1.321em", 13, True))):
        x = side * 330
        b.append(rect(x, 34, 290, 176, 0.95 if ok else 0.45,
                      SW * (1.5 if ok else 1.0), r=8,
                      fill="0.04" if ok else None))
        t.append(text(x + 16, 60, title, 12, 0.9 if ok else 0.6, 500))
        t.append(text(x + 200, 60, lead, 11, 0.7, 500, anchor="end",
                      mono=True))
        y1 = 110
        y2 = y1 + 22 + gap
        t.append(text(x + 20, y1, "Nhu cầu theo mùa,", 17, 0.9, 500))
        t.append(text(x + 20, y2, "không thu hẹp", 17, 0.9, 500))
        b.append(seg(x + 236, y1 - 12, x + 236, y2 + 4, 0.5, SW * 0.9))
        t.append(text(x + 244, y1 + 10, "ink meets" if not ok else "clear gap",
                      10, 0.6))
        t.append(text(x + 16, 190, "two lines nearly touch" if not ok
                      else "the gap the marks actually need", 10.5, 0.5))
    t.append(text(0, 240, "Vietnamese stacks a mark above and a mark below the "
                  "same letter.", 12.5, 0.65))
    return "".join(b), "".join(t), 254, 640


def ms_freeze():
    """Khi mot nguoi keo mot phan tu, moi thu khac phai dung yen. Mot cong cu
    tu chay lai duoi tay nguoi dung la mot cong cu khong tin duoc."""
    b, t = [], []
    for side, (title, note, frozen) in enumerate((
            ("before", "drag one, the others reflow to fill the gap", False),
            ("after the freeze", "only the one you grab moves", True))):
        x = side * 330
        b.append(rect(x, 40, 290, 150, 0.95 if frozen else 0.45,
                      SW * (1.5 if frozen else 1.0), r=8,
                      fill="0.04" if frozen else None))
        t.append(text(x + 16, 30, title, 11.5, 0.9 if frozen else 0.55, 500))
        offs = (0, 0, 0) if frozen else (0, -26, -26)
        for i in range(3):
            bx = x + 20 + i * 88
            by = 74 + offs[i]
            moved = i == 1
            b.append(rect(bx, by, 76, 60, 0.95 if moved else 0.5,
                          SW * (1.5 if moved else 1.0), r=6,
                          fill="0.08" if moved else None))
            if moved:
                b.append(seg(bx + 38, by + 66, bx + 38, by + 84, 0.5,
                             SW * 0.9, dash="4 5"))
        t.append(text(x + 16, 210, note, 10.5, 0.55))
    return "".join(b), "".join(t), 226, 640


def ms_one_layout():
    """Mot bo cuc, ve ra hai duong. Chung khong the lech nhau vi khong co gi de
    lech KHOI — ca hai doc cung mot ket qua tinh."""
    b, t = [], []
    t.append(text(0, 16, "ONE LAYOUT, DRAWN TWO WAYS, SO THEY CANNOT DRIFT",
                  11, 0.4, 500))
    b.append(rect(230, 36, 180, 52, 0.95, SW * 1.7, r=8, fill="0.06"))
    t.append(text(320, 60, "layout()", 14, 0.95, 500, anchor="middle",
                  mono=True))
    t.append(text(320, 78, "computed once", 10, 0.5, anchor="middle"))
    b.append(seg(320, 88, 320, 106, 0.4, SW * 0.9))
    b.append(seg(140, 106, 500, 106, 0.4, SW * 0.9))
    for x in (140, 500):
        b.append(seg(x, 106, x, 126, 0.4, SW * 0.9))
        b.append(seg(x - 5, 119, x, 126, 0.4, SW * 0.9))
        b.append(seg(x + 5, 119, x, 126, 0.4, SW * 0.9))
    for x, name, uses in ((140, "interactive HTML",
                           ("editor", "live viewer", "edit in place")),
                          (500, "static SVG",
                           ("thumbnail", "image", "PowerPoint"))):
        b.append(rect(x - 130, 130, 260, 52, 0.6, SW * 1.2, r=8))
        t.append(text(x, 162, name, 12.5, 0.85, 500, anchor="middle"))
        for i, u in enumerate(uses):
            cb, ct = chip(x - 120 + i * 82, 196, 74, 24, u, 9.5, 0.4, 0.6)
            b.append(cb)
            t.append(ct)
    t.append(text(0, 258, "There is nothing to drift from: one layout, drawn "
                  "twice.", 12.5, 0.65))
    return "".join(b), "".join(t), 272, 640


# ----------------------------------------------- ranking-with-pagerank (1)


def pr_graph():
    """Do thi PageRank: kich thuoc nut chinh la thu hang, va mui ten chi VAO
    trang duoc tro toi.

    Hai dieu phai dung cung luc. Mot: hai nut lon can cho, nen chung nam o hai
    goc doi dien va phan tram viet TRONG ruot chung. Hai: nhan cua nut nho
    khong duoc nam tren duong dan vao chinh no — nen cho dat nhan duoc TINH,
    theo huong trung binh cua moi canh cham vao nut, roi dat ve phia nguoc
    lai. Truoc day moi nhan deu dong cung ben duoi, va nut nao co canh di len
    tu duoi thi nhan bi duong xuyen qua."""
    b, t = [], []
    import math as _m
    nodes = {"B": (0.13, 0.26, 38.4), "C": (0.44, 0.74, 34.3),
             "D": (0.36, 0.09, 3.9), "E": (0.60, 0.40, 8.1),
             "F": (0.80, 0.62, 3.9), "A": (0.90, 0.16, 3.3),
             "G": (0.17, 0.83, 1.6), "H": (0.94, 0.88, 1.6)}
    edges = (("D", "B"), ("E", "B"), ("F", "B"), ("A", "B"), ("G", "C"),
             ("H", "C"), ("E", "C"), ("B", "C"), ("C", "E"), ("A", "E"))
    P = {k: (34 + x * 560, 34 + y * 300, 10 + v * 1.45)
         for k, (x, y, v) in nodes.items()}
    for u, v in edges:
        x0, y0, r0 = P[u]
        x1, y1, r1 = P[v]
        dx, dy = x1 - x0, y1 - y0
        L = _m.hypot(dx, dy)
        ux, uy = dx / L, dy / L
        hx, hy = x1 - ux * (r1 + 11), y1 - uy * (r1 + 11)
        b.append(seg(x0 + ux * (r0 + 6), y0 + uy * (r0 + 6), hx, hy, 0.3,
                     SW * 0.9))
        b.append(seg(hx - ux * 12 - uy * 6, hy - uy * 12 + ux * 6, hx, hy, 0.3,
                     SW * 0.9))
        b.append(seg(hx - ux * 12 + uy * 6, hy - uy * 12 - ux * 6, hx, hy, 0.3,
                     SW * 0.9))

    segs = []
    for u, v in edges:
        x0, y0, r0 = P[u]
        x1, y1, r1 = P[v]
        segs.append((x0, y0, x1, y1))

    def label_pos(k, r, pad=18):
        """Cho dat nhan phan tram cua mot nut nho: xa MOI canh nhat.

        Xet cac canh cham vao chinh nut la chua du. Nhan cua E tung bi mot
        duong khong lien quan gi toi E — canh F->B — di xuyen qua, vi no chi
        tinh cac lang gieng cua E. Bay gio moi huong ung vien duoc cham bang
        khoang cach toi DOAN THANG gan nhat trong ca do thi."""
        x, y, _ = P[k]

        def d2seg(px, py, x0, y0, x1, y1):
            dx, dy = x1 - x0, y1 - y0
            L2 = dx * dx + dy * dy or 1
            t = max(0.0, min(1.0, ((px - x0) * dx + (py - y0) * dy) / L2))
            return _m.hypot(px - x0 - t * dx, py - y0 - t * dy)

        best, best_clear = (x, y + r + pad + 4), -1.0
        for i in range(24):
            a = i * _m.pi / 12
            lx = x + _m.cos(a) * (r + pad)
            ly = y + _m.sin(a) * (r + pad)
            if not (24 <= lx <= 616 and 30 <= ly <= 360):
                continue
            clear = min(d2seg(lx, ly, *sg) for sg in segs)
            if clear > best_clear:
                best_clear, best = clear, (lx, ly + 4)
        return best

    for k, (x, y, r) in P.items():
        big = r > 40
        b.append(dot(x, y, r, 1.0 if big else 0.5, hollow=True,
                     sw=SW * (1.8 if big else 1.1)))
        if big:
            b.append(dot(x, y, r * 0.62, 0.10))
            t.append(text(x, y - 2, k, 17, 0.95, 600, anchor="middle"))
            t.append(text(x, y + 20, f"{nodes[k][2]}%", 12.5, 0.8, 600,
                          anchor="middle", mono=True))
        else:
            t.append(text(x, y + 4, k, 11, 0.6, 500, anchor="middle"))
            lx, ly = label_pos(k, r)
            t.append(text(lx, ly, f"{nodes[k][2]}%", 10, 0.45,
                          anchor="middle", mono=True))
    t.append(text(0, 16, "RANK IS THE SIZE OF THE NODE", 11, 0.35, 500))
    b.append(seg(0, 376, 640, 376, 0.15, SW * 0.7))
    t.append(text(0, 400, "B is large because C points at it, and C is large "
                  "because B does.", 12.5, 0.65))
    t.append(text(0, 420, "The definition is circular, and that is exactly "
                  "what makes it hard to game.", 12.5, 0.65))
    return "".join(b), "".join(t), 434, 640
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
    "an-ml-and-llm-pipeline-for-keyword-clustering-in-seo": [
        kc_pipeline, kc_tokenization, kc_embeddings, kc_cosine, kc_umap,
        kc_hdbscan, kc_eom_vs_leaf, kc_outlier, kc_bisection, kc_refinement,
        kc_labeling, kc_presets,
    ],
    "a-wrong-quote-that-looks-like-a-right-one": [
        wq_build, wq_workbench, wq_silent, wq_gate,
    ],
    "adding-a-data-analyst-agent": [da_sees, da_ladder],
    "adding-an-seo-specialist-agent": [
        seo_tool, seo_ladder, seo_bound, seo_config,
    ],
    "agent-orchestration": [
        orch_wall, orch_stream, orch_watchdogs, orch_ownership,
    ],
    "dynamic-outlines": [do_cards, do_typed, do_depth],
    "why-ai-sucks-at-presentations": [
        wp_three_fights, wp_wrong_number, wp_unreadable,
    ],
    "making-ai-generated-slides-interactive": [
        ms_vocabulary, ms_slack, ms_leading, ms_freeze, ms_one_layout,
    ],
    "ranking-with-pagerank": [pr_graph],
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
