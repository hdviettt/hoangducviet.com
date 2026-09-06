"""Anh og:image cho Work: trang /work va bay trang du an.

Cac trang bai viet co cover, va render-og.cjs da dung san mot ban PNG cho moi
cover. Work thi khong: hinh minh hoa nam o public/work/fld-*.svg, va Facebook,
LinkedIn, X deu bo qua SVG — chia se ra la mot the trang khong anh.

Cach lam o day khong doan bo cuc. Moi hinh duoc render mot lan de DO khung
chua net that (pixel khong trang), roi moi cat theo dung khung do va dat giua
khung 1200x630. Bay canh khac nhau ve hinh dang; mot ty le cat cung se de vien
lech o cai nay va cat mat net o cai kia.

    python scripts/make-og-work.py

Ket qua:
    public/og/fld-<slug>.png   the chia se cua /work/<slug>
    public/og/work.png         the chia se cua chinh trang /work
"""

import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "work"
OUT = ROOT / "public" / "og"
CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"

# Hinh goc ve tren khung 960x540; the ngoai 1200x630 la kich thuoc og:image.
ART_W, ART_H = 960, 640
OG_W, OG_H = 1200, 630
# Le trang quanh net. Rong hon mot chut o hai ben vi khung og be ngang hon 16:9.
PAD_X, PAD_Y = 84, 62
# Dem them quanh khung do duoc, tinh theo don vi cua hinh goc: net co do rong,
# va bo loc rough con day net ra ngoai vai pixel nua.
BLEED = 10


def shoot(svg: Path, png: Path, w: int, h: int) -> None:
    subprocess.run(
        [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-prefers-reduced-motion",
            f"--window-size={w},{h}",
            "--virtual-time-budget=2000",
            f"--screenshot={png}",
            f"file:///{svg.as_posix()}",
        ],
        check=True,
        capture_output=True,
    )


def ink_box(png: Path) -> tuple[float, float, float, float]:
    """Khung chua net, doi ve he toa do cua hinh goc."""
    im = Image.open(png).convert("L")
    box = im.point(lambda v: 255 if v < 250 else 0).getbbox()
    if box is None:
        raise SystemExit(f"{png.name}: khong co net nao")
    sx, sy = ART_W / im.width, ART_H / im.height
    return box[0] * sx, box[1] * sy, box[2] * sx, box[3] * sy


def wrap(art: str, x: float, y: float, w: float, h: float) -> str:
    """Long hinh goc vao khung 1200x630, cat theo khung net da do."""
    art = art.strip()
    # File nguon bat dau bang khai bao XML (can cho chu tieng Viet). Cat no ra
    # truoc, khong thi `index(">")` lai tra ve cuoi khai bao chu khong phai
    # cuoi the <svg>.
    if art.startswith("<?xml"):
        art = art[art.index("?>") + 2 :].lstrip()
    head, body = art[: art.index(">") + 1], art[art.index(">") + 1 :]
    for attr in ("width", "height", "viewBox"):
        head = re.sub(r'\s%s="[^"]*"' % attr, "", head)
    head = head.replace(
        "<svg ",
        f'<svg x="{PAD_X}" y="{PAD_Y}" width="{OG_W - 2 * PAD_X}" '
        f'height="{OG_H - 2 * PAD_Y}" viewBox="{x:.1f} {y:.1f} {w:.1f} {h:.1f}" '
        'preserveAspectRatio="xMidYMid meet" ',
        1,
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {OG_W} {OG_H}" '
        f'width="{OG_W}" height="{OG_H}">'
        f'<rect width="{OG_W}" height="{OG_H}" fill="#FFFFFF"/>'
        f"{head}{body}</svg>"
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(SRC.glob("fld-*.svg"))
    if not files:
        raise SystemExit("khong tim thay public/work/fld-*.svg")

    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        for svg in files:
            probe = tmpdir / f"{svg.stem}-probe.png"
            shoot(svg, probe, ART_W, ART_H)
            x0, y0, x1, y1 = ink_box(probe)
            page = tmpdir / f"{svg.stem}-og.svg"
            page.write_text(
                wrap(
                    svg.read_text(encoding="utf-8"),
                    x0 - BLEED,
                    y0 - BLEED,
                    (x1 - x0) + 2 * BLEED,
                    (y1 - y0) + 2 * BLEED,
                ),
                encoding="utf-8",
            )
            png = OUT / f"{svg.stem}.png"
            shoot(page, png, OG_W, OG_H)
            print(f"{svg.name} -> og/{png.name}  {png.stat().st_size} bytes")

        # Trang /work dung chinh hinh cua du an lon nhat.
        index = OUT / "fld-agentic-ai-platform.png"
        (OUT / "work.png").write_bytes(index.read_bytes())
        print(f"og/work.png  {(OUT / 'work.png').stat().st_size} bytes")


if __name__ == "__main__":
    main()
