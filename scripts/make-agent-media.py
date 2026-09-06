"""Anh featured cho platform va bon agent con, cat tu thu vien agent that.

Nguon la mot anh Viet tu up qua CMS — `agentplatform.png`, anh chup thu vien
agent cua chinh platform: 2282x1121, moi the la mot agent that dang chay. No da
nam san trong media library nhung khong duoc gan vao du an nao, vi dong media
cua `agentic-ai-platform` luu hut thanh `{"src": "", "type": "video"}` — mot the
video khong co nguon. Do la ly do khoi featured cua platform tren prod trong
tron chu khong phai vi thieu hinh.

Nen o day khong ve gi ca. Platform lay ca thu vien; moi agent con lay dung the
cua chinh no, kem mot the ben canh de con doc ra boi canh.

Toa do the do bang cach do ranh trang giua cac the, khong gan cung: anh chup lai
o kich thuoc khac thi mot bo toa do cung se lech im lang.

    python scripts/make-agent-media.py

Hai anh con lai cua bo featured khong sinh o day vi chung khong can cat theo
luoi — chung chi can dung dinh dang. Ca hai nam san tren R2, va day la lenh:

    B=https://pub-21eb6bdd475e49679838e54eabfd619a.r2.dev

    # ban ghi man hinh search engine: GIF 2.0MB -> MP4 753KB
    curl -s -o /tmp/d.gif $B/1774660284404-20260328081046_rec_.gif
    ffmpeg -i /tmp/d.gif -movflags +faststart -pix_fmt yuv420p       -vf "scale=1600:-2:flags=lanczos" -c:v libx264 -preset slow -crf 26       -an public/work/search-engine-demo.mp4

    # man hinh dau presentation agent: PNG 789KB -> WebP 92KB, cat sat le
    curl -s -o /tmp/p.png $B/1788647728847-presentation-agent.png
    # roi cat theo vien muc va dem ve 16:9 nhu `to_ratio` duoi day
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "_src" / "agentplatform.png"
OUT = ROOT / "public" / "work"
RATIO = 16 / 9

# slug -> (hang, cot, so cot lay kem, ten the that tren anh)
CARDS = {
    "seo-quoting-agent": (0, 0, 2, "Agent provides SEO production quotes"),
    "cms-publishing-pipeline": (0, 1, 2, "Agent for posting articles on the website"),
    "content-seo-ai": (1, 1, 2, "SEO Outline Agent + SEO Project Research Agent"),
    "keyword-clustering": (1, 3, 2, "SEO Keyword Agent"),
}


def runs(mask, least=6):
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None:
            start = i
        elif not v and start is not None:
            if i - start >= least:
                out.append((start + i) // 2)
            start = None
    if start is not None and len(mask) - start >= least:
        out.append((start + len(mask)) // 2)
    return out


def columns(im: Image.Image) -> list[int]:
    """Ranh doc giua cac cot: dai pixel trang tuyet doi chay suot chieu cao."""
    a = np.asarray(im.convert("L")).astype(int)
    return runs((a > 246).mean(axis=0) > 0.97)


# Ranh ngang thi khong do duoc: nen trang cua the va nen trang cua trang la mot
# mau, nen khong co tin hieu nao tach chung. Hai moc duoi do bang mat tren dung
# tam anh nay, va `assert` ben duoi giu cho no khong am tham lech khi anh doi.
SIZE = (2282, 1121)
ROW_SPANS = ((8, 492), (508, 978))


def to_ratio(im: Image.Image) -> Image.Image:
    """Dem ve dung 16:9 bang cach nhan doi hang pixel o mep.

    Khe featured dung `object-cover`, nen mot anh lech ti le se bi cat mu o hai
    ben — dem o day thi kiem duoc bang mat."""
    w, h = im.size
    if abs(w / h - RATIO) < 0.005:
        return im
    a = np.asarray(im)
    if w / h > RATIO:
        need = round(w / RATIO) - h
        t, b = need // 2, need - need // 2
        a = np.concatenate([np.repeat(a[:1], t, 0), a, np.repeat(a[-1:], b, 0)], 0)
    else:
        need = round(h * RATIO) - w
        l, r = need // 2, need - need // 2
        a = np.concatenate([np.repeat(a[:, :1], l, 1), a, np.repeat(a[:, -1:], r, 1)], 1)
    return Image.fromarray(a)


def main() -> int:
    if not SRC.exists():
        print(f"THIEU {SRC}")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.open(SRC).convert("RGB")
    assert (im.width, im.height) == SIZE, (
        f"anh nguon doi kich thuoc ({im.width}x{im.height}), do lai ROW_SPANS")
    # Danh sach do duoc CHINH LA canh cua cac the — khong chen them moc 0 vao
    # dau, khong thi moi o lech mot cot va anh cat ra la agent ben canh.
    cx = columns(im)
    print(f"nguon {im.width}x{im.height}  canh cot {cx}")

    full = to_ratio(im)
    full.save(OUT / "agent-platform.webp", "WEBP", quality=88, method=6)
    print(f"agent-platform.webp  {full.width}x{full.height}  "
          f"{(OUT / 'agent-platform.webp').stat().st_size // 1024}KB  <- ca thu vien")

    for slug, (r, c, span, name) in CARDS.items():
        top, bot = ROW_SPANS[r]
        right = cx[min(c + span, len(cx) - 1)]
        crop = to_ratio(im.crop((cx[c], top, right, bot)))
        assert crop.width > 700, f"{slug}: cat hut, chi rong {crop.width}px"
        dst = OUT / f"agent-{slug}.webp"
        crop.save(dst, "WEBP", quality=90, method=6)
        print(f"{dst.name}  {crop.width}x{crop.height}  "
              f"{dst.stat().st_size // 1024}KB  <- {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
