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


FIGURES = {
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
