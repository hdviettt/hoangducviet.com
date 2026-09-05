"""Anh featured tam cho bon agent con, lay tu chinh cover bai viet cua chung.

Bon du an con chua co media nao, nen khoi featured cua chung rot ve bang so.
Thay vi ve them mot bo hinh thu bay, dung lai dung cai da co: moi agent deu co
mot bai viet, va moi bai viet deu co mot cover trong bo hinh dang chay tren
blog. Cung bang mau, cung ngon ngu ve, va lien quan truc tiep ve noi dung.

Ba viec o day, deu la viec ma dung SVG goc se lam sai:

1. LAY BAN PNG, KHONG PHAI SVG. Cover SVG co animation lap vo han. O khe hero
   canh mot khoi chu tinh, ba hinh cung chay la ba thu tranh mat nguoi doc.
   `render-og.cjs` da xuat san ban PNG dung o khung cuoi cua animation.
2. CAT VE 16:9. Cover la 1200x630 (1.905), khe hero la 16:9 (1.778). De nguyen
   thi `object-cover` tu cat hai ben, va no cat mu — cat o day thi kiem duoc.
3. XUAT WEBP. PNG cua cover nang 240-355KB moi cai vi toan vung mau phang lon.
   WebP chat luong 90 xuong con mot phan muoi ma khong thay khac.

    python scripts/make-agent-media.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OG = ROOT / "og"
SRC = ROOT / "public" / "og"
OUT = ROOT / "public" / "work"

# agent -> bai viet cua chinh no
PAIRS = {
    "cms-publishing-pipeline":
        "a-cms-adaptable-llm-pipeline-for-seo-compliant-content-publishing",
    "content-seo-ai": "a-brief-history-of-seo-content-writing-with-ai",
    "keyword-clustering": "agentic-keyword-clustering",
    "seo-quoting-agent": "a-wrong-quote-that-looks-like-a-right-one",
}

RATIO = 16 / 9


def ink_crop(im: Image.Image) -> Image.Image:
    """Cat sat phan co muc, roi mo rong ra dung 16:9.

    Bo cover nay ve cho khung og 1200x630 nen quanh net ve luon con mot vanh
    nen. Vanh do nam trong file thi o khe hero no bien thanh khoang trong, va
    net ve doc ra nho di — dung cai loi vua tim thay o anh nguoi dung tu up.

    Nen khong phai trang tuyet doi ma la mot gradient rat nhat, nen "co muc"
    do bang do lech so voi mau nen lay tu vien anh, khong phai bang nguong
    trang co dinh."""
    a = np.asarray(im).astype(int)
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(edge, axis=0)
    ink = np.abs(a - bg).sum(2) > 18
    ys, xs = np.nonzero(ink)
    if len(xs) == 0:
        return im
    pad = round(im.width * 0.02)
    l = max(int(xs.min()) - pad, 0)
    r = min(int(xs.max()) + pad, im.width)
    t = max(int(ys.min()) - pad, 0)
    b = min(int(ys.max()) + pad, im.height)

    # Mo rong ve 16:9 bang cach lay them nen, khong cat vao noi dung.
    w, h = r - l, b - t
    if w / h < RATIO:
        want = round(h * RATIO)
        l = max(l - (want - w) // 2, 0)
        r = min(l + want, im.width)
        l = max(r - want, 0)
    else:
        want = round(w / RATIO)
        t = max(t - (want - h) // 2, 0)
        b = min(t + want, im.height)
        t = max(b - want, 0)
    out = im.crop((l, t, r, b))

    # Con thieu bao nhieu thi day them bang chinh hang pixel o mep.
    #
    # Khong the de nguyen 1.905: khe hero la 16:9 va no dung `object-cover`,
    # nen bay phan tram be ngang bi cat mu o hai ben — o tam quoting agent do
    # dung la cai panel ben phai. Cung khong the day bang mot mau phang, vi
    # nen cua bo cover nay la gradient, va mot mang phang canh gradient thi lo
    # duong noi. Nhan doi hang mep thi gradient chay tiep.
    return pad_to_ratio(out)


def pad_to_ratio(im: Image.Image) -> Image.Image:
    if abs(im.width / im.height - RATIO) < 0.005:
        return im
    a = np.asarray(im)
    if im.width / im.height > RATIO:
        need = round(im.width / RATIO) - im.height
        top, bot = need // 2, need - need // 2
        a = np.concatenate(
            [np.repeat(a[:1], top, 0), a, np.repeat(a[-1:], bot, 0)], axis=0)
    else:
        need = round(im.height * RATIO) - im.width
        lft, rgt = need // 2, need - need // 2
        a = np.concatenate(
            [np.repeat(a[:, :1], lft, 1), a, np.repeat(a[:, -1:], rgt, 1)], axis=1)
    return Image.fromarray(a)



def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, cover in PAIRS.items():
        src = SRC / f"{cover}.png"
        if not src.exists():
            print(f"THIEU {src.name} — chay `node scripts/render-og.cjs` truoc")
            return 1
        im = ink_crop(Image.open(src).convert("RGB"))
        dst = OUT / f"agent-{slug}.webp"
        im.save(dst, "WEBP", quality=90, method=6)
        print(f"{dst.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}  "
              f"{dst.stat().st_size // 1024}KB  <- {cover}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
