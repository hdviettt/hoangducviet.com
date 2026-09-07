"""Soat loi hinh hoc tren moi hinh da sinh ra.

Ba loi ma mat thuong bo qua nhung may tim duoc chac chan:

  TRAN   net cham vao mep khung — nghia la co thu da bi cat mat
  LECH   khung nhin lon hon nhieu so voi phan co net, tuc la thua cho trong
  RONG   mot vung lon khong co gi, thuong la dau hieu bo cuc bi vo

Chay tren file SVG (bia, /figures) va tren tung khoi trong scripts/_figures.json.

    python scripts/check-figures.py
"""

import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"


def shoot(svg_path, png, w, h):
    subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
         "--blink-settings=preferredColorScheme=1", f"--window-size={w},{h}",
         "--virtual-time-budget=2500", f"--screenshot={png}",
         f"file:///{svg_path.as_posix()}"],
        check=True, capture_output=True)


def viewbox(svg):
    m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    return (int(float(m.group(1))), int(float(m.group(2)))) if m else None


PAD = 40


def measure(png, w, h):
    a = np.asarray(Image.open(png).convert("L")).astype(int)
    ink = a < 246
    if not ink.any():
        return None
    rows = np.where(ink.any(axis=1))[0]
    cols = np.where(ink.any(axis=0))[0]
    return cols.min(), cols.max(), rows.min(), rows.max()


def verdict(name, box, w, h):
    """`box` la khung chua net, do trong mot anh da chua san le PAD moi ben."""
    if box is None:
        print(f"  {name}: TRONG RONG")
        return
    left, right, top, bot = box
    over = []
    if left < PAD - 2:
        over.append(f"trai {PAD - left}px")
    if right > PAD + w + 1:
        over.append(f"phai {right - PAD - w}px")
    if top < PAD - 2:
        over.append(f"tren {PAD - top}px")
    if bot > PAD + h + 1:
        over.append(f"duoi {bot - PAD - h}px")
    issues = []
    if over:
        issues.append("TRAN RA NGOAI: " + ", ".join(over))
    if (PAD + h) - bot > h * 0.18:
        issues.append(f"thua duoi {(PAD + h) - bot}px")
    if (PAD + w) - right > w * 0.26:
        issues.append(f"thua phai {(PAD + w) - right}px")
    if issues:
        print(f"  {name}: " + " · ".join(issues))


def report_file(name, svg, tmp):
    """Hinh la mot file doc lap: noi viewBox ra roi ve o kich thuoc that."""
    vb = viewbox(svg)
    if not vb:
        return
    w, h = vb
    head_end = svg.index(">", svg.index("<svg"))
    head, body = svg[: head_end + 1], svg[head_end + 1 :]
    for attr in ("viewBox", "width", "height"):
        head = re.sub(r'\s%s="[^"]*"' % attr, "", head)
    head = head.replace(
        "<svg ",
        f'<svg viewBox="{-PAD} {-PAD} {w + 2 * PAD} {h + 2 * PAD}" '
        f'width="{w + 2 * PAD}" height="{h + 2 * PAD}" ', 1)
    f = tmp / "one.svg"
    f.write_text(head + body, encoding="utf-8")
    png = tmp / "one.png"
    shoot(f, png, w + 2 * PAD, h + 2 * PAD)
    verdict(name, measure(png, w, h), w, h)


def report_inline(name, svg, tmp):
    """Hinh nam trong bai: do dung cach no hien tren trang — trong mot trang
    HTML rong bang khung cong le. Ve thang file SVG cho ket qua sai vi may nay
    co ty le hien thi khac 1."""
    vb = viewbox(svg)
    if not vb:
        return
    w, h = vb
    page = tmp / "one.html"
    page.write_text(
        '<!doctype html><meta charset=utf-8>'
        '<style>html,body{margin:0;background:#fff}'
        '--x{}</style>'
        f'<div style="width:{w}px;padding:{PAD}px;'
        '--md-sys-color-primary:221 100% 47%">' + svg + "</div>",
        encoding="utf-8")
    png = tmp / "one.png"
    shoot(page, png, w + 2 * PAD, h + 2 * PAD)
    verdict(name, measure(png, w, h), w, h)


def main():
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        print("== anh bia ==")
        for p in sorted((ROOT / "public" / "covers").glob("*.svg")):
            report_file(p.name, p.read_text(encoding="utf-8"), tmp)
        print("== hinh file ==")
        for p in sorted((ROOT / "public" / "figures").glob("platform-*.svg")):
            report_file(p.name, p.read_text(encoding="utf-8"), tmp)
        for p in sorted((ROOT / "public" / "figures").glob("webinar-*.svg")):
            report_file(p.name, p.read_text(encoding="utf-8"), tmp)
        print("== hinh trong bai ==")
        jf = ROOT / "scripts" / "_figures.json"
        if jf.exists():
            for slug, svgs in json.loads(jf.read_text(encoding="utf-8")).items():
                for i, svg in enumerate(svgs):
                    report_inline(f"{slug} #{i}", svg, tmp)


if __name__ == "__main__":
    main()
