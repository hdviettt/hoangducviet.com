"""Dung anh og:image cho trang /work.

Cac trang bai viet lay og:image tu cover cua chinh no (render-og.cjs). Trang
/work khong co cover, nen o day lay mot trong bay hinh minh hoa du an, cat sat
vao phan co net roi dat giua khung 1200x630 trang.

Vi sao phai la PNG: cac trinh doc og:image (Facebook, LinkedIn, Slack, X)
khong render SVG.

    python scripts/make-og-work.py
"""

import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "work" / "fld-agentic-ai-platform.svg"
OUT = ROOT / "public" / "og" / "work.png"
CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"

# Khung nhin cat sat muc, do bang cach render mot lan roi soi vien anh.
CROP = "60 -16 840 412"


def wrap(art: str) -> str:
    art = art.strip()
    head, body = art[: art.index(">") + 1], art[art.index(">") + 1 :]
    for attr in ("width", "height", "viewBox"):
        head = re.sub(r'\s%s="[^"]*"' % attr, "", head)
    head = head.replace(
        "<svg ",
        f'<svg x="90" y="80" width="1020" height="470" viewBox="{CROP}" '
        'preserveAspectRatio="xMidYMid meet" ',
        1,
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" '
        'width="1200" height="630">'
        '<rect width="1200" height="630" fill="#FFFFFF"/>'
        f"{head}{body}</svg>"
    )


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "og-work.svg"
        page.write_text(wrap(SRC.read_text(encoding="utf-8")), encoding="utf-8")
        subprocess.run(
            [
                CHROME,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--force-prefers-reduced-motion",
                "--window-size=1200,630",
                "--virtual-time-budget=2000",
                f"--screenshot={OUT}",
                f"file:///{page.as_posix()}",
            ],
            check=True,
            capture_output=True,
        )
    print(f"{OUT.relative_to(ROOT)}  {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
