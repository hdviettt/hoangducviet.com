"""Doodle ban hai: giu net ve tay, sua ba thu da lam ban mot that bai.

Ban mot bi bac vi "khong creative, khong dep". Ba nguyen nhan, deu goi ten
duoc, va deu do may vong thu nghiem sau do lam ro:

  1. KHONG MAU. Ca buc chi co muc va mot net xanh. Net khong lam nen mot buc
     tranh; mang mau moi lam.
  2. KHONG TIEU DIEM. Muoi chin o bang nhau tren mot luoi — mat khong biet dat
     vao dau. Viet noi dung cai lam thiet ke cua Google sang la focus.
  3. KHONG CO TUONG PHAN CO. Moi vat mot co, nen khong co gi de doc truoc.

Ban nay:

  * Mang mau to LECH khoi net, nhu ban in luoi bi xe ban. Do la thu lam mot
    hinh vector trong nhu duoc in ra, ma khong can hat nhieu — Viet noi ro
    khong noise moi sang.
  * MOT vat bay len khoi hang, co bong rieng: tieu diem.
  * Nen am (giay), khong phai trang.

    python scripts/make-work-doodle2.py
"""

import numpy as np
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 1600, 900

PAPER = "#F6F1E8"
INK = "#1F2124"
MINT = "#7DE0BE"
BLUE = "#93B6FF"
CORAL = "#FFB29B"
SUN = "#FFD98A"
LILAC = "#C9B8FF"

SW = 5.0
SW_THIN = 3.0


def rrect_path(x, y, w, h, r):
    return (
        f"M{x + r:.1f},{y:.1f} H{x + w - r:.1f} A{r},{r} 0 0 1 {x + w:.1f},{y + r:.1f} "
        f"V{y + h - r:.1f} A{r},{r} 0 0 1 {x + w - r:.1f},{y + h:.1f} "
        f"H{x + r:.1f} A{r},{r} 0 0 1 {x:.1f},{y + h - r:.1f} "
        f"V{y + r:.1f} A{r},{r} 0 0 1 {x + r:.1f},{y:.1f} Z"
    )


def hand(el, rng, amp=0.55):
    """Xoay rat nhe quanh tam: dat tay, khong phai run tay."""
    rot = rng.normal(0, amp)
    return rot


def shape(x, y, w, h, r, fill, rng, dx=9, dy=11, ink=True, sw=SW):
    """Mot vat: mang mau to lech, roi net di chinh xac ben tren.

    Do lech la ca hieu ung: mat doc ra la hai lan in khong khop, tuc la co ban
    tay o day. Neu to trung khit thi no lai thanh mot hinh vector sach bong."""
    rot = rng.normal(0, 0.6)
    cx, cy = x + w / 2, y + h / 2
    g = [f'<g transform="rotate({rot:.2f} {cx:.0f} {cy:.0f})">']
    g.append(f'<path d="{rrect_path(x + dx, y + dy, w, h, r)}" fill="{fill}"/>')
    if ink:
        g.append(
            f'<path d="{rrect_path(x, y, w, h, r)}" fill="none" stroke="{INK}" '
            f'stroke-width="{sw}" stroke-linejoin="round"/>'
        )
    g.append("</g>")
    return "".join(g), rot


def line(x1, y1, x2, y2, rng, color=INK, sw=SW_THIN, bow=6.0):
    d = np.hypot(x2 - x1, y2 - y1)
    nx, ny = -(y2 - y1) / d, (x2 - x1) / d
    b = rng.normal(0, bow)
    cx, cy = (x1 + x2) / 2 + nx * b, (y1 + y2) / 2 + ny * b
    return (
        f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" '
        f'fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>'
    )


def spark(cx, cy, s, fill=INK):
    return (
        f'<g transform="translate({cx - 50 * s:.0f},{cy - 43 * s:.0f}) scale({s})">'
        f'<path d="M50,0 L62,31 L93,43 L62,55 L50,86 L38,55 L7,43 L38,31 Z" '
        f'fill="{fill}"/></g>'
    )


def svg(body, zoom=1.14):
    """Phong nhe quanh tam: bo cuc goc de lai vien qua rong o ba phia."""
    tx = W / 2 * (1 - zoom)
    ty = H / 2 * (1 - zoom) + 26
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">'
        f'<rect width="{W}" height="{H}" fill="{PAPER}"/>'
        f'<g transform="translate({tx:.1f},{ty:.1f}) scale({zoom})">{body}</g></svg>'
    )


def platform():
    """Mot be dai, cac the dung tren no, va MOT the bay len.

    The bay la tieu diem: no to hon, no la vat duy nhat khong cham be, no co
    bong rieng duoi dat, va no la cho duy nhat co tia sang."""
    rng = np.random.default_rng(12)
    out = []

    # be do: vat rong nhat, mau tram nhat
    s, _ = shape(150, 640, 1180, 86, 43, LILAC, rng, dx=12, dy=14)
    out.append(s)

    # cac the dung tren be: cao thap khac nhau, mau xen ke
    cards = [
        (232, 470, 150, 172, CORAL),
        (410, 396, 158, 246, BLUE),
        (596, 452, 150, 190, SUN),
        (960, 424, 156, 218, BLUE),
        (1140, 492, 140, 150, CORAL),
    ]
    for x, y, w, h, fill in cards:
        sh, _ = shape(x, y, w, h, 26, fill, rng)
        out.append(sh)
        # hai vach noi dung
        out.append(line(x + 24, y + 46, x + w - 46, y + 46, rng, bow=2.2))
        out.append(line(x + 24, y + 78, x + w - 72, y + 78, rng, bow=2.2))

    # o trong: cho the vua bay len, ve bang net dut
    out.append(
        f'<path d="{rrect_path(786, 500, 150, 142, 26)}" fill="none" stroke="{INK}" '
        f'stroke-width="{SW_THIN}" stroke-dasharray="12 14" opacity="0.55"/>'
    )

    # TIEU DIEM: the bay len, to hon moi the khac
    sh, rot = shape(742, 168, 236, 250, 34, MINT, rng, dx=13, dy=15, sw=SW + 0.6)
    out.append(sh)
    out.append(line(772, 232, 918, 232, rng, bow=2.2, sw=SW_THIN + 0.4))
    out.append(line(772, 272, 880, 272, rng, bow=2.2, sw=SW_THIN + 0.4))
    out.append(spark(1006, 196, 0.86))

    # bong cua the bay, roi vao dung o trong: cai neo no vao khong gian
    out.append(
        '<ellipse cx="861" cy="588" rx="86" ry="17" fill="#1F2124" opacity="0.10"/>'
    )

    # Khong them net trang tri. Ban truoc co mot cung va hai cham "cho co
    # khong gian" — chung khong noi gi, va mat doc ra la nhieu chu khong phai
    # bo cuc. Cho tho nam o khoang trong, khong o cac dau cham.
    return "".join(out)


SCENES = {"agentic-ai-platform": platform}


def main():
    for slug, fn in SCENES.items():
        p = OUT / f"dd2-{slug}.svg"
        p.write_text(svg(fn()), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
