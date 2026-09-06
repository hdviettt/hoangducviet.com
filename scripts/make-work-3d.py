"""Raymarcher SDF: render vat the co chat lieu that cho khe featured.

Khong co Blender o day, nhung thu tao ra ve "anh san pham" khong nam o phan mem.
No nam o bon phep tinh, va ca bon deu viet duoc bang numpy:

    bong mem              giu khoang cach nho nhat doc tia, khong phai co/khong
    che khuat moi truong  cang gan mat khac cang toi — hai vat cham nhau moi
                          doc ra la cham nhau
    vien Fresnel          mep sang o goc lia, thu lam vat the co "mat"
    xoa phong             pha net/nhoe theo khoang cach toi mat phang lay net

Mat vat the khong to mau tron ma DAN TEXTURE giao dien that: toa do diem cham
duoc doi ve he cua chinh vat, chuan hoa roi tra cuu vao anh. Nho vay moi canh
deu la san pham that chu khong phai mot khoi hinh hoc.

Moi du an mot bo cuc rieng — lap lai mot bo cuc bay lan thi bay tam deu la mot
tam. Xem SCENES o cuoi file.

    python scripts/make-work-3d.py            # ca bo, do phan giai that
    python scripts/make-work-3d.py 0.3        # ban nhap de xem nhanh
    python scripts/make-work-3d.py 0.3 search # mot canh
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "_src"
OUT = ROOT / "public" / "work"

W, H = 1400, 788
MAX_STEPS = 90
MAX_DIST = 40.0
SURF = 0.0018

PAPER = "#ffffff"
TINT = "#e9eefb"
BLUE = "#004aef"
GREEN = "#07ef9c"
INK = "#20304f"


def hexc(c):
    c = c.lstrip("#")
    return np.array([int(c[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], np.float32)


def norm(v):
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-9)


def rot_y(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], np.float32)


def rot_x(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], np.float32)


def rot_z(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], np.float32)


class Slab:
    """Khoi hop bo goc. Mat +Z la mat mang texture."""

    def __init__(self, pos, half, rot=None, colour=PAPER, tex=None, round_=0.012):
        self.pos = np.array(pos, np.float32)
        self.half = np.array(half, np.float32)
        R = np.eye(3, dtype=np.float32) if rot is None else rot
        self.inv = R.T.copy()
        self.colour = hexc(colour)
        self.tex = tex
        self.round = round_

    def sdf(self, p):
        q = (p - self.pos) @ self.inv.T
        d = np.abs(q) - self.half
        return (np.linalg.norm(np.maximum(d, 0.0), axis=-1)
                + np.minimum(np.max(d, axis=-1), 0.0) - self.round)

    def sample(self, p):
        if self.tex is None:
            return None
        q = (p - self.pos) @ self.inv.T
        u = np.clip(q[..., 0] / self.half[0] * 0.5 + 0.5, 0, 1)
        v = np.clip(0.5 - q[..., 1] / self.half[1] * 0.5, 0, 1)
        th, tw = self.tex.shape[:2]
        xi = np.clip((u * (tw - 1)).astype(np.int32), 0, tw - 1)
        yi = np.clip((v * (th - 1)).astype(np.int32), 0, th - 1)
        return self.tex[yi, xi], q[..., 2] > self.half[2] * 0.5


class Ball:
    """Hinh cau. Co no moi ve duoc cum diem — cai ma hop lam khong ra."""

    def __init__(self, pos, r, colour=BLUE):
        self.pos = np.array(pos, np.float32)
        self.r = float(r)
        self.colour = hexc(colour)
        self.tex = None

    def sdf(self, p):
        return np.linalg.norm(p - self.pos, axis=-1) - self.r

    def sample(self, p):
        return None


def scene_sdf(p, objs, floor_y):
    ds = np.stack([o.sdf(p) for o in objs] + [p[..., 1] - floor_y], axis=0)
    return np.min(ds, axis=0), np.argmin(ds, axis=0)


def march(ro, rd, objs, floor_y):
    t = np.zeros(rd.shape[:-1], np.float32)
    hit = np.zeros(t.shape, bool)
    idx = np.zeros(t.shape, np.int32)
    for _ in range(MAX_STEPS):
        d, i = scene_sdf(ro + rd * t[..., None], objs, floor_y)
        new = (d < SURF) & ~hit
        idx = np.where(new, i, idx)
        hit |= new
        t = np.where(hit | (t > MAX_DIST), t, t + np.maximum(d, SURF * 0.5))
    return t, hit, idx


def normal(p, objs, floor_y):
    e = 0.0016
    def f(o):
        return scene_sdf(p + o, objs, floor_y)[0]
    return norm(np.stack([
        f(np.float32([e, 0, 0])) - f(np.float32([-e, 0, 0])),
        f(np.float32([0, e, 0])) - f(np.float32([0, -e, 0])),
        f(np.float32([0, 0, e])) - f(np.float32([0, 0, -e])),
    ], axis=-1))


def soft_shadow(p, ld, objs, floor_y, k=13.0):
    res = np.ones(p.shape[:-1], np.float32)
    t = np.full(p.shape[:-1], 0.03, np.float32)
    for _ in range(30):
        d, _ = scene_sdf(p + ld * t[..., None], objs, floor_y)
        res = np.minimum(res, k * d / np.maximum(t, 1e-4))
        t += np.clip(d, 0.01, 0.5)
    return np.clip(res, 0.0, 1.0)


def ao(p, n, objs, floor_y):
    occ, sca = np.zeros(p.shape[:-1], np.float32), 1.0
    for i in range(1, 6):
        h = 0.02 + 0.12 * i / 5
        d, _ = scene_sdf(p + n * h, objs, floor_y)
        occ += (h - d) * sca
        sca *= 0.72
    return np.clip(1.0 - 2.4 * occ, 0.0, 1.0)


def sky(rd):
    t = np.clip(rd[..., 1] * 0.5 + 0.5, 0, 1)[..., None]
    return hexc("#8ea3cd") * (1 - t) + hexc("#eaf0fc") * t


def render(scn, scale):
    objs, eye, look, floor_y, fov, focus = scn
    w, h = int(W * scale), int(H * scale)
    fwd = norm(np.float32(look) - np.float32(eye))
    right = norm(np.cross(fwd, np.float32([0, 1, 0])))
    up = np.cross(right, fwd)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (x + 0.5) / w * 2 - 1
    v = 1 - (y + 0.5) / h * 2
    rd = norm(fwd + right * (u * (w / h) * fov)[..., None] + up * (v * fov)[..., None])
    ro = np.broadcast_to(np.float32(eye), rd.shape).copy()

    t, hit, idx = march(ro, rd, objs, floor_y)
    p = ro + rd * t[..., None]
    n = normal(p, objs, floor_y)

    base = np.zeros(p.shape, np.float32)
    for i, o in enumerate(objs):
        m = (idx == i)[..., None]
        base = np.where(m, o.colour[None, None, :], base)
        s = o.sample(p)
        if s is not None:
            texel, face = s
            base = np.where(m & face[..., None], texel, base)
    base = np.where((idx == len(objs))[..., None], hexc("#b9c7e2"), base)

    key = norm(np.float32([0.55, 0.85, 0.45]))
    fill = norm(np.float32([-0.7, 0.35, 0.5]))
    lit = base * (sky(n) * 0.55 + (
        1.02 * np.clip((n * key).sum(-1), 0, 1) * soft_shadow(p + n * 0.01, key, objs, floor_y)
        + 0.28 * np.clip((n * fill).sum(-1), 0, 1))[..., None]) * ao(p, n, objs, floor_y)[..., None]
    lit = lit + sky(rd) * (np.clip(1 - np.abs((n * -rd).sum(-1)), 0, 1) ** 3.2 * 0.55)[..., None]
    return np.clip(np.where(hit[..., None], lit, sky(rd)), 0, None), t, focus


def finish(img, t, focus, path):
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    soft = np.asarray(im.filter(ImageFilter.GaussianBlur(3.4))).astype(np.float32) / 255
    k = np.clip(np.abs(np.where(np.isfinite(t), t, 9.0) - focus) * 2.2, 0, 1)[..., None] ** 1.4
    img = img * (1 - k) + soft * k
    img = img / (1.0 + img * 0.22)
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx / w - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 2) ** 2) / 1.414
    img = img * (1 - 0.12 * d[..., None] ** 2.4)
    img = img + np.random.default_rng(4).normal(0, 0.0038, (h, w, 1)).astype(np.float32)
    out = (np.clip(img, 0, 1) ** (1 / 2.2) * 255).astype(np.uint8)
    im = Image.fromarray(out)
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    im.save(path, quality=93, method=6)
    print(f"  {path.name}  {im.size[0]}x{im.size[1]}  "
          f"{path.stat().st_size // 1024}KB")


def tex(name, box=None, w=700):
    im = Image.open(SRC / name).convert("RGB")
    if box:
        im = im.crop(box)
    im = im.resize((w, max(1, round(w * im.height / im.width))), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255.0


# --------------------------------------------------------------- canh dung
#
# Khong canh nao dan anh chup. Neu phai dan mot anh chup vao thi hinh khoi da
# khong noi duoc gi, va khi do cai can sua la hinh chu khong phai them anh.


def search():
    """Mot canh dong tai lieu, ba tam duoc nhac len va xep thu tu.

    Y: hang nghin trang vao, vai trang co thu tu di ra. Chieu cao chinh la thu
    hang — tam dau cao nhat, va no la tam duy nhat lay mau nhan."""
    rng = np.random.default_rng(3)
    objs = []
    for i in range(120):
        a = rng.uniform(0, 6.28318)
        r = 0.65 + rng.uniform(0, 1.0) ** 0.6 * 2.7
        x, z = np.cos(a) * r, np.sin(a) * r * 0.55 - 0.35
        objs.append(Slab([x, -0.66 + rng.uniform(0, 0.02), z],
                         [0.115, 0.012, 0.082], rot_y(rng.uniform(0, 3.14)), TINT))
    for i, (h, col) in enumerate(((0.62, GREEN), (0.40, BLUE), (0.22, BLUE))):
        objs.append(Slab([-0.42 + i * 0.44, -0.70 + h / 2, 0.62],
                         [0.20, h / 2, 0.14], rot_y(0.18 - i * 0.06),
                         PAPER if i else PAPER))
        objs.append(Slab([-0.42 + i * 0.44, -0.70 + h + 0.022, 0.62],
                         [0.20, 0.022, 0.14], rot_y(0.18 - i * 0.06), col, None, 0.01))
    return objs, [0.55, 1.24, 2.05], [0.02, -0.46, 0], -0.70, 0.48, 2.20


def platform():
    """Mot be do vuong, muoi chin khoi dung tren no theo luoi 5x4.

    Muoi chin la con so that, va hang cuoi thieu mot o. Ban truoc toi xep ca
    muoi chin thanh MOT HANG DAI — nhin tu goc nao cung ra mot dai mong, vi mot
    hang thi khong co be ngang de nhin. Luoi thi co."""
    objs = [Slab([0, -0.60, -0.10], [1.62, 0.05, 1.30], rot_y(0.10), PAPER)]
    rng = np.random.default_rng(9)
    tall = {2, 8, 13}
    for i in range(19):
        c, r = i % 5, i // 5
        x = -1.24 + c * 0.62
        z = 0.86 - r * 0.60
        h = 0.22 + (0.20 if i in tall else 0.0) + rng.uniform(0, 0.025)
        objs.append(Slab([x, -0.55 + h / 2, z], [0.20, h / 2, 0.155], rot_y(0.10), PAPER))
        objs.append(Slab([x, -0.55 + h + 0.020, z], [0.20, 0.020, 0.155], rot_y(0.10),
                         GREEN if i in tall else BLUE, None, 0.008))
    return objs, [0.55, 1.95, 2.35], [0, -0.40, 0], -0.60, 0.50, 2.55


def presentation():
    """Mot khoi dac, va chin tam DUNG tren canh, xoe dan ra.

    Hai lan truoc toi de cac to nam xuong san. Mat trang nam ngang tren nen
    trang thi gan nhu khong co canh nao de doc — ca quat bien mat. Dung tren
    canh thi moi tam co mot canh bat sang, va chuoi canh do chinh la hinh."""
    objs = [Slab([-1.62, -0.40, 0.30], [0.26, 0.24, 0.22], rot_y(0.30), BLUE)]
    for i in range(9):
        t = i / 8
        objs.append(Slab([-0.70 + t * 2.10, -0.40 + t * 0.06, 0.42 - t * 0.55],
                         [0.024, 0.24 + t * 0.10, 0.34],
                         rot_y(0.34 - t * 0.30),
                         PAPER if i % 2 == 0 else TINT))
    return objs, [0.40, 0.86, 2.25], [0.10, -0.34, 0], -0.64, 0.52, 2.25


def publishing():
    """Ban thao nam, mot bac xanh, va trang da dang dung len.

    Toi da thu nam lan ve mot cai cong that — hai tru va mot cai xa — va khong
    lan nao doc ra. Ly do hinh hoc: mat phang cua cong hoac song song voi huong
    nhin (dep thanh vach) hoac vuong goc voi hang khoi (khoi gan nhat che het).
    Bo cong di. Cung mot y, ve bang thu da chay duoc o canh khac: mot vat nam,
    mot vat dung, va mot bac mau danh dau cho chuyen doi giua chung."""
    objs = []
    for i in range(4):
        objs.append(Slab([-1.05 + i * 0.02, -0.62 + i * 0.045, 0.18 + i * 0.01],
                         [0.52, 0.020, 0.36], rot_y(0.20 + i * 0.02), TINT))
    objs.append(Slab([0.05, -0.52, 0.05], [0.26, 0.09, 0.30], rot_y(0.10), GREEN))
    objs.append(Slab([1.10, -0.22, 0.02], [0.46, 0.36, 0.024],
                     rot_y(-0.22) @ rot_x(-0.05), PAPER))
    objs.append(Slab([1.10, 0.12, 0.02], [0.46, 0.026, 0.024],
                     rot_y(-0.22) @ rot_x(-0.05), BLUE, None, 0.01))
    return objs, [0.30, 0.92, 2.25], [0.10, -0.34, 0], -0.66, 0.50, 2.20


def content():
    """Mot chong ban thao nam, mot ban duoc rut ra va dung len.

    Chon lua, ve bang mot vat the roi khoi chong — khong phai bang mot mui ten."""
    objs = []
    for i in range(7):
        objs.append(Slab([-0.75 + i * 0.012, -0.66 + i * 0.036, 0.10 + i * 0.008],
                         [0.62, 0.016, 0.42], rot_y(0.16 + i * 0.012), TINT))
    objs.append(Slab([0.95, -0.22, 0.20], [0.50, 0.36, 0.020],
                     rot_y(-0.26) @ rot_x(-0.06), PAPER))
    objs.append(Slab([0.95, 0.11, 0.20], [0.50, 0.028, 0.020],
                     rot_y(-0.26) @ rot_x(-0.06), GREEN, None, 0.01))
    return objs, [0.30, 1.26, 2.10], [0.10, -0.44, 0], -0.68, 0.50, 2.25


def keywords():
    """Sau muoi hat, ba cum. Canh duy nhat cua ban truoc da lam dung, giu lai."""
    rng = np.random.default_rng(5)
    objs = []
    for centre, spread, col, n in (
        ([-1.05, -0.34, 0.30], 0.50, BLUE, 26),
        ([0.45, -0.36, -0.10], 0.42, GREEN, 20),
        ([1.45, -0.32, 0.45], 0.30, INK, 12),
    ):
        for _ in range(n):
            d = rng.normal(0, spread, 3) * np.float32([1.0, 0.40, 0.65])
            objs.append(Ball(np.float32(centre) + d, rng.uniform(0.055, 0.105), col))
    # hai hat lac loai: thu no tu choi xep vao dau ca
    for pos in ([-0.20, -0.52, 1.05], [1.95, -0.50, -0.35]):
        objs.append(Ball(np.float32(pos), 0.07, TINT))
    return objs, [0.20, 1.05, 2.20], [0.10, -0.38, 0], -0.56, 0.50, 2.20


def quoting():
    """Mot day cot cao thap khac nhau, va mot thanh ngang chan qua tat ca.

    Bao gia la nhung dong tien; thanh ngang la cong bat bien — moi cot phai
    cham toi no truoc khi bao gia duoc phep di ra. Mot cot chua cham."""
    heights = (0.52, 0.40, 0.62, 0.30, 0.56, 0.44, 0.58)
    objs = []
    for i, h in enumerate(heights):
        x = -1.62 + i * 0.54
        short = i == 3
        objs.append(Slab([x, -0.66 + h / 2, 0.0], [0.17, h / 2, 0.17], rot_y(0.05),
                         TINT if short else PAPER))
        objs.append(Slab([x, -0.66 + h + 0.02, 0.0], [0.17, 0.02, 0.17], rot_y(0.05),
                         BLUE if not short else INK, None, 0.008))
    objs.append(Slab([0.0, -0.02, 0.30], [2.10, 0.022, 0.030], rot_y(0.05), GREEN,
                     None, 0.015))
    return objs, [0.30, 1.02, 2.25], [0.05, -0.40, 0], -0.66, 0.50, 2.30


SCENES = {
    "mini-search-engine": search,
    "agentic-ai-platform": platform,
    "agentic-presentation-system": presentation,
    "cms-publishing-pipeline": publishing,
    "content-seo-ai": content,
    "keyword-clustering": keywords,
    "seo-quoting-agent": quoting,
}


def main() -> int:
    args = sys.argv[1:]
    scale = float(args[0]) if args and args[0].replace(".", "").isdigit() else 1.0
    want = [a for a in args if a in SCENES] or list(SCENES)
    OUT.mkdir(parents=True, exist_ok=True)
    for slug in want:
        print(slug)
        img, t, focus = render(SCENES[slug](), scale)
        finish(img, t, focus, OUT / f"r3d-{slug}.webp")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
