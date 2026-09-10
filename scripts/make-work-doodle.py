"""Illustration cho tung du an o /work, ve theo loi 'clean doodle'.

Vi sao lai la net ve chu khong phai 3D: ban 3D truoc dep nhung kho, va cai kho
nam o cho no phai *that* thi moi khong gia. Mot net ve khong hua hen la anh
chup, nen no duoc phep truu tuong, va cai duy nhat no phai lam dung la ve dung
CO CHE cua du an.

Ba luat cua bo nay:

  1. Ve chinh cai co che, khong ve mot bieu tuong cua no. Cum tu khoa thi ve
     hat va vong; nen tang thi ve mot thanh ray va nhung khoi dung tren no.
     Neu bo cai chu thich di ma nguoi ta van doan duoc dang noi ve cai gi thi
     hinh do dat.
  2. Mot muc, mot mau nhan. Muc #1F2124, nhan xanh SEONGON #004AEF, va chi mot
     cho duy nhat trong moi hinh duoc dung mau nhan.
  3. Tay ve chu khong phai tay run. Net lech mot chut de no am, nhung hinh
     hoc phia duoi phai chuan: hang thang hang, khoang deu nhau.

Deterministic: moi hinh mot seed co dinh, chay lai ra dung file cu.

    python scripts/make-work-doodle.py            # tat ca
    python scripts/make-work-doodle.py platform   # mot vai canh
"""

import math
import sys
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "public" / "work"

W, H = 1600, 900

INK = "#1F2124"
MUTED = "#9AA0A6"
ACCENT = "#004AEF"
GREEN = "#07EF9C"
GROUND = "#F6F7F9"

SW = 3.4  # net chinh
SW_THIN = 2.2  # net phu


# --------------------------------------------------------------- net ve tay


def jitter(pts, rng, amp=2.6):
    """Day tung diem lech mot chut theo phuong vuong goc voi huong di."""
    pts = np.asarray(pts, dtype=float)
    if len(pts) < 2:
        return pts
    out = pts.copy()
    for i in range(len(pts)):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, len(pts) - 1)]
        d = b - a
        n = np.array([-d[1], d[0]])
        ln = np.hypot(*n)
        if ln > 1e-6:
            out[i] = pts[i] + n / ln * rng.normal(0, amp)
    return out


def smooth_path(pts, closed=False):
    """Duong cong di qua trung diem cac doan: muot ma khong 'may tinh'."""
    pts = np.asarray(pts, dtype=float)
    if len(pts) == 2:
        return f"M{pts[0][0]:.1f},{pts[0][1]:.1f} L{pts[1][0]:.1f},{pts[1][1]:.1f}"
    if closed:
        pts = np.vstack([pts, pts[:1]])
    d = [f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"]
    for i in range(1, len(pts) - 1):
        mx = (pts[i][0] + pts[i + 1][0]) / 2
        my = (pts[i][1] + pts[i + 1][1]) / 2
        d.append(f"Q{pts[i][0]:.1f},{pts[i][1]:.1f} {mx:.1f},{my:.1f}")
    d.append(f"L{pts[-1][0]:.1f},{pts[-1][1]:.1f}")
    return " ".join(d)


def resample(p0, p1, n=6):
    p0 = np.asarray(p0, dtype=float)
    p1 = np.asarray(p1, dtype=float)
    return np.array([p0 + (p1 - p0) * t for t in np.linspace(0, 1, n)])


def line(p0, p1, rng, amp=2.0, color=INK, w=SW, dash=None, cap="round"):
    """Mot doan thang, cong nhe MOT nhip.

    Khac biet giua 've tay' va 'tay run' nam o day: mot cung nhe doc theo ca
    doan doc ra la co nguoi cam but, con nhieu buou lien tiep tren cung mot
    canh thi doc ra la tay khong vung. Bien do tinh theo do dai, nen doan ngan
    gan nhu thang.
    """
    p0 = np.asarray(p0, dtype=float)
    p1 = np.asarray(p1, dtype=float)
    d = p1 - p0
    ln = float(np.hypot(*d))
    if ln < 1e-6:
        return ""
    n = np.array([-d[1], d[0]]) / ln
    bow = rng.normal(0, min(amp, ln * 0.012))
    c = (p0 + p1) / 2 + n * bow
    extra = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<path d="M{p0[0]:.1f},{p0[1]:.1f} Q{c[0]:.1f},{c[1]:.1f} '
        f'{p1[0]:.1f},{p1[1]:.1f}" fill="none" stroke="{color}" '
        f'stroke-width="{w}" stroke-linecap="{cap}"{extra}/>'
    )


def rrect(x, y, w, h, r, rng, amp=1.8, color=INK, sw=SW, fill="none"):
    """Chu nhat bo goc THAT: canh thang, goc la cung tron.

    Chat 've tay' den tu mot goc xoay rat nho va ban kinh goc lech mot chut
    o moi hinh, khong den tu viec lam meo tung canh. Xoay quanh tam nen ca
    luoi van thang hang khi nhin tong the.
    """
    rot = rng.normal(0, 0.55 * min(amp, 1.6))
    rr = r * rng.uniform(0.88, 1.12)
    dx, dy = rng.normal(0, 0.6, 2)
    d = (
        f"M{x + rr:.1f},{y:.1f} H{x + w - rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {x + w:.1f},{y + rr:.1f} "
        f"V{y + h - rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {x + w - rr:.1f},{y + h:.1f} "
        f"H{x + rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {x:.1f},{y + h - rr:.1f} "
        f"V{y + rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {x + rr:.1f},{y:.1f} Z"
    )
    cx, cy = x + w / 2, y + h / 2
    return (
        f'<g transform="translate({dx:.2f},{dy:.2f}) rotate({rot:.2f} {cx:.1f} {cy:.1f})">'
        f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{sw}" '
        f'stroke-linejoin="round" stroke-linecap="round"/></g>'
    )


def blob(cx, cy, rx, ry, rng, amp=6.0, color=INK, sw=SW, fill="none", n=22):
    """Vong tron ve tay: dung de khoanh nhom, dung de lam khung."""
    ang = np.linspace(0, 2 * math.pi, n, endpoint=False)
    pts = np.stack([cx + np.cos(ang) * rx, cy + np.sin(ang) * ry], 1)
    pts = pts + rng.normal(0, amp, pts.shape)
    return (
        f'<path d="{smooth_path(pts, closed=True)}Z" fill="{fill}" '
        f'stroke="{color}" stroke-width="{sw}" stroke-linejoin="round"/>'
    )


def dot(cx, cy, r, color=INK, fill=None):
    f = fill if fill is not None else color
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{f}"/>'


def arrow(p0, p1, rng, color=INK, w=SW):
    """Mui ten: than cong nhe, dau la hai net ngan."""
    p0 = np.asarray(p0, dtype=float)
    p1 = np.asarray(p1, dtype=float)
    d = p1 - p0
    ln = np.hypot(*d)
    u = d / ln
    n = np.array([-u[1], u[0]])
    body = line(p0, p1 - u * 10, rng, amp=1.4, color=color, w=w)
    tip = p1
    a = tip - u * 26 + n * 13
    b = tip - u * 26 - n * 13
    head = (
        f'<path d="M{a[0]:.1f},{a[1]:.1f} L{tip[0]:.1f},{tip[1]:.1f} '
        f'L{b[0]:.1f},{b[1]:.1f}" fill="none" stroke="{color}" '
        f'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
    )
    return body + head


def label(x, y, text, size=26, color=MUTED, anchor="middle", weight=500):
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" '
        f'font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" '
        f'font-size="{size}" font-weight="{weight}" fill="{color}">{text}</text>'
    )


def svg(body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">'
        f'<rect width="{W}" height="{H}" fill="{GROUND}"/>'
        f"{body}</svg>"
    )


# ------------------------------------------------------------------- canh


def platform():
    """Mot be do, va muoi chin o vuong dung tren no.

    Y: khong phai 19 cong cu roi nhau, ma 19 agent tren MOT nen. Ban truoc xep
    19 khoi thanh mot hang rao — o kich thuoc the no chi con la mot dai rang
    cua. Luoi thi doc ra "nhieu cai cung loai" ngay ca khi be, va con cho de
    ba o duoc to mau khong bi lac."""
    rng = np.random.default_rng(11)
    out = []

    # Luoi 5x4, thieu mot o o goc duoi cung => 19.
    cols, rows_n = 5, 4
    cw, ch = 168, 104
    gx, gy = 42, 34
    gw = cols * cw + (cols - 1) * gx
    x0 = (W - gw) / 2
    y0 = 118
    accent = {(0, 3), (2, 1), (3, 1)}

    n = 0
    for r in range(rows_n):
        for c in range(cols):
            if r == rows_n - 1 and c == cols - 1:
                continue  # 19, khong phai 20: con so that
            n += 1
            x = x0 + c * (cw + gx)
            y = y0 + r * (ch + gy)
            col = ACCENT if (r, c) in accent else INK
            out.append(rrect(x, y, cw, ch, 16, rng, amp=0.7, color=col, sw=SW))
            # hai vach: mot the co noi dung, khong phai mot o trong
            out.append(line((x + 24, y + 38), (x + cw - 52, y + 38), rng,
                            amp=0.8, color=col, w=SW_THIN))
            out.append(line((x + 24, y + 66), (x + cw - 90, y + 66), rng,
                            amp=0.8, color=MUTED, w=SW_THIN))
    assert n == 19, n

    # Be do: mot thanh duy nhat chay suot duoi ca luoi.
    # Khong co khe ho: cac o DUNG tren be, khong lo lung ben tren no.
    bar_y = y0 + rows_n * ch + (rows_n - 1) * gy + 8
    out.append(rrect(x0 - 34, bar_y, gw + 68, 62, 22, rng, amp=0.6, color=INK))

    # Cong noi: gan thang vao mat duoi cua be. Ban truoc de chung lung lung
    # duoi mot doan day, va o kich thuoc the no doc ra la banh xe cua mot cai
    # xe day chu khong phai cong cua mot nen tang.
    for i in range(5):
        x = x0 + 96 + i * (gw - 192) / 4
        out.append(rrect(x - 30, bar_y + 60, 60, 26, 8, rng, amp=0.5,
                         color=MUTED, sw=SW_THIN))

    return "".join(out)


def keywords():
    """Sau muoi hat, ba vong, va hai hat khong vong nao nhan.

    Canh duy nhat cua ban 3D truoc doc ra ngay la cai gi, vi o day HINH chinh
    la y: hat la tu khoa, vong la cum, hat ngoai vong la thu no tu choi xep."""
    rng = np.random.default_rng(5)
    out = []

    groups = [
        (470, 400, 210, 150, 24, INK),
        (900, 560, 165, 120, 18, INK),
        (1170, 330, 140, 105, 14, ACCENT),
    ]
    for cx, cy, rx, ry, n, col in groups:
        pts = rng.normal(0, 0.42, (n, 2)) * np.array([rx, ry])
        keep = np.hypot(pts[:, 0] / rx, pts[:, 1] / ry) < 0.92
        pts = pts[keep]
        for px, py in pts:
            out.append(dot(cx + px, cy + py, 9.5, col))
        out.append(
            blob(cx, cy, rx, ry, rng, amp=7, color=col, sw=SW, fill="none")
        )

    # hai hat lac loai: vong tron rong, khong to ruot
    for px, py in ((1330, 690), (300, 690)):
        out.append(
            f'<circle cx="{px}" cy="{py}" r="10" fill="none" stroke="{MUTED}" '
            f'stroke-width="{SW_THIN}"/>'
        )
    return "".join(out)


SCENES = {
    "agentic-ai-platform": platform,
    "keyword-clustering": keywords,
}


def main(argv):
    want = argv or list(SCENES)
    for key in want:
        matches = [k for k in SCENES if key in k]
        if not matches:
            print(f"khong co canh nao khop '{key}'")
            continue
        for slug in matches:
            body = SCENES[slug]()
            path = OUT / f"dood-{slug}.svg"
            path.write_text(svg(body), encoding="utf-8")
            print(f"{path.relative_to(OUT.parent.parent)}  {len(path.read_bytes())} bytes")


if __name__ == "__main__":
    main(sys.argv[1:])
