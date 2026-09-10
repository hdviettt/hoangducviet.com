"""Raymarcher the he hai: them dung nhung thu tao ra CHIEU SAU.

Ban dau (make-work-3d.py) da co bong mem, che khuat moi truong va xoa phong,
nhung anh van "phang" vi thieu bon thu, va bon thu do moi la cai mat nguoi doc
ra la khong gian that:

  1. SAN PHAN CHIEU. Vat the soi xuong nen. Day la tin hieu chieu sau manh
     nhat ma mot mang mau phang khong bao gio gia duoc: no gan vat the vao san,
     va no cho ta thay mat duoi cua vat.
  2. HAI NGUON SANG LECH TONG. Key am, rim lanh. Anh sang mot tong thi moi mat
     cua khoi deu mot mau; hai tong thi moi mat co nhiet do rieng.
  3. DOM SANG GGX. Ban truoc chi co khuech tan, nen be mat khong co "chat".
     Dom sang la thu noi cho nguoi xem biet vat nay bong hay mo.
  4. HOP SANG TRONG MOI TRUONG. Phan chieu chi dep khi co gi de phan chieu.
     Bau troi o day co mot vung sang hinh chu nhat, dung nhu softbox trong
     studio chup san pham.
  5. TRUYEN SANG. Vat lieu kinh mo: anh sang di xuyen, dong lai o mep.

Va bo mot thu: hat nhieu o khau hau ky. Viet noi ro khong noise moi sang.

    python scripts/make-work-3d2.py 0.35     # ban nhap, nhanh
    python scripts/make-work-3d2.py          # do phan giai that
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "work"

W, H = 1600, 900
MAX_STEPS = 96
MAX_DIST = 42.0
SURF = 0.0018


def hexc(c):
    c = c.lstrip("#")
    return np.array([int(c[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], np.float32)


def norm(v):
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-9)


def rot_y(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], np.float32)


class Slab:
    def __init__(self, pos, half, rot=None, colour="#ffffff", rough=0.32,
                 glass=0.0, emit=0.0, round_=0.03):
        self.pos = np.array(pos, np.float32)
        self.half = np.array(half, np.float32)
        R = np.eye(3, dtype=np.float32) if rot is None else rot
        self.inv = R.T.copy()
        self.colour = hexc(colour)
        self.rough = float(rough)
        self.glass = float(glass)
        self.emit = float(emit)
        self.round = round_

    def sdf(self, p):
        q = (p - self.pos) @ self.inv.T
        d = np.abs(q) - self.half
        return (np.linalg.norm(np.maximum(d, 0.0), axis=-1)
                + np.minimum(np.max(d, axis=-1), 0.0) - self.round)


class Ball:
    def __init__(self, pos, r, colour="#004aef", rough=0.25, glass=0.0, emit=0.0):
        self.pos = np.array(pos, np.float32)
        self.r = float(r)
        self.colour = hexc(colour)
        self.rough = float(rough)
        self.glass = float(glass)
        self.emit = float(emit)

    def sdf(self, p):
        return np.linalg.norm(p - self.pos, axis=-1) - self.r


FLOOR_Y = -0.62


def scene_sdf(p, objs):
    ds = np.stack([o.sdf(p) for o in objs] + [p[..., 1] - FLOOR_Y], axis=0)
    return np.min(ds, axis=0), np.argmin(ds, axis=0)


def march(ro, rd, objs, steps=MAX_STEPS):
    t = np.zeros(rd.shape[:-1], np.float32)
    hit = np.zeros(t.shape, bool)
    idx = np.zeros(t.shape, np.int32)
    for _ in range(steps):
        d, i = scene_sdf(ro + rd * t[..., None], objs)
        new = (d < SURF) & ~hit
        idx = np.where(new, i, idx)
        hit |= new
        t = np.where(hit | (t > MAX_DIST), t, t + np.maximum(d, SURF * 0.5))
    return t, hit, idx


def normal(p, objs):
    e = 0.0016

    def f(o):
        return scene_sdf(p + o, objs)[0]

    return norm(np.stack([
        f(np.float32([e, 0, 0])) - f(np.float32([-e, 0, 0])),
        f(np.float32([0, e, 0])) - f(np.float32([0, -e, 0])),
        f(np.float32([0, 0, e])) - f(np.float32([0, 0, -e])),
    ], axis=-1))


def soft_shadow(p, ld, objs, k=15.0):
    res = np.ones(p.shape[:-1], np.float32)
    t = np.full(p.shape[:-1], 0.035, np.float32)
    for _ in range(28):
        d, _ = scene_sdf(p + ld * t[..., None], objs)
        res = np.minimum(res, k * d / np.maximum(t, 1e-4))
        t += np.clip(d, 0.012, 0.5)
    return np.clip(res, 0.0, 1.0)


def ao(p, n, objs):
    occ, sca = np.zeros(p.shape[:-1], np.float32), 1.0
    for i in range(1, 6):
        h = 0.02 + 0.13 * i / 5
        d, _ = scene_sdf(p + n * h, objs)
        occ += (h - d) * sca
        sca *= 0.72
    return np.clip(1.0 - 2.5 * occ, 0.0, 1.0)


# --------------------------------------------------------------- moi truong


SKY_LO = hexc("#070a1c")
SKY_HI = hexc("#6d7cad")
BOX_DIR = norm(np.float32([0.34, 0.80, 0.50]))


def env(rd, direct=False):
    """Bau troi co mot HOP SANG. Phan chieu chi dep khi co gi de soi vao.

    `direct=True` la tia di thang tu may vao hau canh: khi do hop sang bi tat.
    Trong studio, den soi vao vat chu khong duoc lot vao khung hinh — de no
    hien ra thi no thanh mot vet trang mo boc len sau vat, dung nhu ban truoc.
    """
    t = np.clip(rd[..., 1] * 0.5 + 0.5, 0, 1)[..., None]
    base = SKY_LO * (1 - t) + SKY_HI * t
    # nghieng gradient sang mot ben: bau troi doi xung thi hau canh phang lì
    lean = np.clip(rd[..., 0] * 0.5 + 0.5, 0, 1)[..., None]
    base = base * (0.78 + 0.34 * lean)
    # softbox: mot vung sang gon quanh huong BOX_DIR
    c = np.clip((rd * BOX_DIR).sum(-1), 0, 1)
    if direct:
        return base
    box = (np.clip((c - 0.86) / 0.14, 0, 1) ** 1.6)[..., None]
    return base + box * np.float32([0.95, 0.92, 0.86])


KEY = norm(np.float32([0.42, 0.74, 0.52]))
RIM = norm(np.float32([-0.78, 0.28, -0.42]))
KEY_COL = hexc("#fff0d8") * 1.92   # am
RIM_COL = hexc("#9dc4ff") * 1.35   # lanh
FLOOR_COL = hexc("#161a2e")


def ggx(n, v, l, rough):
    """Dom sang. Khong co no thi be mat nao cung ra nhu giay."""
    h = norm(l + v)
    a = np.maximum(rough, 0.045) ** 2
    ndh = np.clip((n * h).sum(-1), 0, 1)
    d = a ** 2 / (np.pi * (ndh ** 2 * (a ** 2 - 1) + 1) ** 2 + 1e-7)
    f = 0.045 + 0.955 * (1 - np.clip((h * v).sum(-1), 0, 1)) ** 5
    return np.clip(d * f, 0, 26.0)


def shade(p, n, rd, idx, objs, depth=0):
    """Mot lan do bong. depth=1 la tia phan chieu, khong di sau hon."""
    nobj = len(objs)
    base = np.zeros(p.shape, np.float32)
    rough = np.full(p.shape[:-1], 0.4, np.float32)
    glass = np.zeros(p.shape[:-1], np.float32)
    emit = np.zeros(p.shape[:-1], np.float32)
    for i, o in enumerate(objs):
        m = idx == i
        base = np.where(m[..., None], o.colour[None, None, :], base)
        rough = np.where(m, o.rough, rough)
        glass = np.where(m, o.glass, glass)
        emit = np.where(m, o.emit, emit)
    on_floor = idx == nobj
    base = np.where(on_floor[..., None], FLOOR_COL[None, None, :], base)
    # San qua bong thi lobe GGX o goc ta bung len thanh mot vet sang lo lung
    # gan chan troi. Nham hon thi dom sang trai rong ra va tat.
    rough = np.where(on_floor, 0.40, rough)

    v = -rd
    sh = soft_shadow(p + n * 0.012, KEY, objs)
    occ = ao(p, n, objs)
    ndl = np.clip((n * KEY).sum(-1), 0, 1)
    ndr = np.clip((n * RIM).sum(-1), 0, 1)

    diff = base * (
        KEY_COL[None, None, :] * (ndl * sh)[..., None]
        + RIM_COL[None, None, :] * ndr[..., None] * 0.42
        + env(n) * 0.34
    ) * occ[..., None]

    spec = (
        KEY_COL[None, None, :] * (ggx(n, v, KEY, rough) * sh)[..., None]
        + RIM_COL[None, None, :] * ggx(n, v, RIM, rough)[..., None] * 0.5
    )

    fres = (0.04 + 0.96 * (1 - np.clip((n * v).sum(-1), 0, 1)) ** 4.5)
    col = diff + spec * 0.42

    # truyen sang cho vat lieu kinh mo
    if glass.max() > 0:
        through = env(rd) * 0.55 + base * 0.75
        col = np.where((glass > 0)[..., None],
                       col * (1 - glass[..., None] * 0.55)
                       + through * (glass[..., None] * 0.62)
                       + base * (fres * glass)[..., None] * 0.9,
                       col)
    if emit.max() > 0:
        col = col + base * emit[..., None] * 1.5
    return col, fres, on_floor, rough


def render(scene, scale):
    objs, eye, look, fov, focus = scene()
    w, h = int(W * scale), int(H * scale)
    fwd = norm(np.float32(look) - np.float32(eye))
    right = norm(np.cross(fwd, np.float32([0, 1, 0])))
    up = np.cross(right, fwd)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (x + 0.5) / w * 2 - 1
    vv = 1 - (y + 0.5) / h * 2
    rd = norm(fwd + right * (u * (w / h) * fov)[..., None] + up * (vv * fov)[..., None])
    ro = np.broadcast_to(np.float32(eye), rd.shape).copy()

    t, hit, idx = march(ro, rd, objs)
    p = ro + rd * t[..., None]
    n = normal(p, objs)
    col, fres, on_floor, rough = shade(p, n, rd, idx, objs)

    # ---- san phan chieu: mot lan doi tia ----
    rdr = norm(rd - 2 * ((rd * n).sum(-1))[..., None] * n)
    ro2 = p + n * 0.02
    t2, hit2, idx2 = march(ro2, rdr, objs, steps=64)
    p2 = ro2 + rdr * t2[..., None]
    n2 = normal(p2, objs)
    col2, _, _, _ = shade(p2, n2, rdr, idx2, objs, depth=1)
    refl = np.where(hit2[..., None], col2, env(rdr))
    # mo dan theo khoang cach: phan chieu xa thi tan
    fade = np.clip(1.0 - t2 / 9.0, 0, 1)[..., None]
    # San o xa phai MO dan. San bong den vo cuc thi o phia chan troi no soi
    # thang vao hop sang va tao ra mot vet sang lo lung — dung vat ly, nhung
    # trong khung hinh no chi la nhieu.
    far = np.clip(1.25 - t / 5.5, 0, 1)
    k_refl = np.where(on_floor, 0.55 * far, 0.10 * (1 - rough))[..., None]         * fres[..., None] * 3.0
    k_refl = np.clip(k_refl, 0, 0.72)
    col = col * (1 - k_refl) + refl * k_refl * (0.35 + 0.65 * fade)

    # ---- suong theo chieu sau ----
    # Suong chi de tach lop, khong de rua troi tuong phan. 0.55 lam ca
    # anh xam nhu chup qua kinh mo.
    fog = np.clip((t - 3.2) / 9.0, 0, 1)[..., None] ** 1.3
    col = col * (1 - fog * 0.30) + env(rd, direct=True) * (fog * 0.30)

    out = np.where(hit[..., None], col, env(rd, direct=True))
    return np.clip(out, 0, None), np.where(hit, t, MAX_DIST), focus


def finish(img, t, focus, path, raw=False):
    """Hau ky: xoa phong theo do sau, bloom, duong cong phim. KHONG hat nhieu."""
    h, w = img.shape[:2]
    if raw:
        out = (np.clip(img / (1.0 + img * 0.20), 0, 1) ** (1 / 2.2) * 255).astype(np.uint8)
        Image.fromarray(out).resize((W, H), Image.LANCZOS).save(path, quality=94)
        print(f"  RAW {path.name}")
        return

    # bloom: chi lay phan sang hon 1.0
    bright = np.clip(img - 1.0, 0, None)
    bl = np.asarray(Image.fromarray(
        (np.clip(bright, 0, 4) / 4 * 255).astype(np.uint8)
    ).filter(ImageFilter.GaussianBlur(w * 0.010))).astype(np.float32) / 255 * 4
    # Bloom manh tay lam khoi phat sang keo thanh vet khoi boc len. No phai
    # la mot quang sat mep, khong phai mot cot khoi.
    img = img + bl * 0.14

    # xoa phong: hai muc nhoe, chon theo vong tron nhoe
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    b1 = np.asarray(im.filter(ImageFilter.GaussianBlur(w * 0.0045))).astype(np.float32) / 255
    b2 = np.asarray(im.filter(ImageFilter.GaussianBlur(w * 0.013))).astype(np.float32) / 255
    # 1.35 lam vung net chi day ~0.7 don vi: ca canh nam ngoai no. Xoa phong
    # phai la mot lop mong o hau canh, khong phai mot tam kinh mo.
    coc = np.clip(np.abs(t - focus) * 0.34, 0, 1)[..., None] ** 1.3
    base = np.clip(img, 0, 1)
    img = base * (1 - coc) + b1 * coc
    img = img * (1 - coc ** 2.2) + b2 * (coc ** 2.2)

    img = img / (1.0 + img * 0.20)          # duong cong phim
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx / w - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 2) ** 2) / 1.414
    img = img * (1 - 0.16 * d[..., None] ** 2.2)
    out = (np.clip(img, 0, 1) ** (1 / 2.2) * 255).astype(np.uint8)
    im = Image.fromarray(out)
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    im.save(path, quality=94, method=6)
    print(f"  {path.name}  {im.size[0]}x{im.size[1]}  {path.stat().st_size // 1024}KB")


# ------------------------------------------------------------------- canh


def platform():
    """Muoi chin khoi tren mot be, va MOT khoi duoc nhac len khoi luoi.

    Khoi bay len la tieu diem: no la vat duy nhat khong cham be, no phat sang,
    va no do bong xuong dung o vi tri no vua roi khoi. Khong co no thi ca canh
    la mot luoi deu — dung cai loi "khong co focus" ma Viet chi ra.

    Ve nghia thi no cung dung: agent moi nhat cua nen tang do mot file Markdown
    va mot thu muc, khong sua gi o loi. Mot o roi ra khoi luoi ma nen tang van
    chay."""
    objs = []
    objs.append(Slab([0, -0.58, -0.05], [1.98, 0.075, 1.62], rot_y(0.10),
                     "#0a0e2a", rough=0.16))
    rng = np.random.default_rng(9)
    blue = {(0, 4), (3, 0)}
    gap = (1, 2)          # o trong: cho khoi vua bay len
    n = 0
    for r in range(4):
        for c in range(5):
            if r == 3 and c == 4:
                continue
            n += 1
            x = -1.52 + c * 0.76
            z = -1.12 + r * 0.76
            if (r, c) == gap:
                continue      # de trong, khoi nay dang lo lung ben tren
            hgt = 0.34 + rng.uniform(0, 0.14)
            col = "#2f6bee" if (r, c) in blue else "#eef2fc"
            objs.append(Slab([x, -0.505 + hgt / 2, z], [0.24, hgt / 2, 0.24],
                             rot_y(0.10), col, rough=0.20, glass=0.30))
    assert n == 19, n
    # tieu diem: khoi bay, kinh mo, phat sang nhe
    objs.append(Slab([-1.52 + gap[1] * 0.76, 0.30, -1.12 + gap[0] * 0.76],
                     [0.27, 0.27, 0.27], rot_y(0.10) , "#07ef9c",
                     rough=0.14, glass=0.55, emit=0.22))
    return objs, [2.05, 1.78, 2.95], [0.0, -0.10, -0.05], 0.44, 4.05


SCENES = {"agentic-ai-platform": platform}


RAW = False


def main(argv):
    global RAW
    scale = 1.0
    args = list(argv)
    if "--raw" in args:
        args.remove("--raw")
        RAW = True
    if args and args[0].replace(".", "").isdigit():
        scale = float(args.pop(0))
    want = args or list(SCENES)
    for key in want:
        for slug in [s for s in SCENES if key in s]:
            print(f"{slug} @ {scale}")
            img, t, focus = render(SCENES[slug], scale)
            finish(img, t, focus, OUT / f"r3d2-{slug}.webp", raw=RAW)


if __name__ == "__main__":
    main(sys.argv[1:])
