"""Featured media: isometric ve bang net, cung bo loc rough cua frontpage.html.

Viet chi ra rang file goc con co ca khoi lap phuong isometric, va do la phan
lam no "chin chu" ma ban phang cua toi thieu. Ba thu tao ra su chin chu do,
va deu la ky thuat chu khong phai gu:

  1. PHEP CHIEU DUNG. Moi canh deu theo dung ba huong cua he isometric, khong
     co canh nao "gan dung". Mat nhin ra ngay mot khoi bi lech truc.
  2. XOA NET KHUAT. Mat khoi to trang duc, ve tu xa den gan, nen net cua khoi
     phia sau bi khoi phia truoc che di. Neu de trong suot thi ca hinh thanh
     mot mo day thep.
  3. BA SAC DO CHO BA MAT. Mat tren sang nhat, mat trai dam nhat. Chi can ba
     muc do mo cua cung mot mau la khoi co huong sang, khong can gradient.

Do sau con duoc ta them bang do dam cua NET: khoi cang xa net cang mo.

    python scripts/make-work-iso.py
"""

import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"

W, H = 960, 540
INK = "#004AEF"
SW = 3.8          # day hon: o 2.8 net mong den muc anh trong nhu bi phai mau

# He truc isometric: hai huong ngang lech 30 do, mot huong dung.
COS30, SIN30 = math.cos(math.radians(30)), math.sin(math.radians(30))
U = 64.0          # mot o luoi. Ban truoc de 46: hinh nam gon giua khung
                  # voi le trong rat rong ba phia, doc ra la mot cai icon.


VIEW = {"ox": 452.0, "oy": 286.0, "u": U}


def view(ox, oy, u=U):
    """Moi canh mot goc nhin: bo cuc khac nhau thi tam va co o phai khac."""
    VIEW.update(ox=float(ox), oy=float(oy), u=float(u))


SEEN = []


def iso(x, y, z, ox=None, oy=None):
    """(x, y, z) trong he luoi -> toa do man hinh.

    Moi diem duoc ghi lai de svg() tu canh khung. Chinh tay tung canh thi
    canh nao cung thanh mot cai icon nam giua mot bien le trong."""
    ox = VIEW["ox"] if ox is None else ox
    oy = VIEW["oy"] if oy is None else oy
    u = VIEW["u"]
    pt = (
        ox + (x - y) * COS30 * u,
        oy + (x + y) * SIN30 * u - z * u,
    )
    SEEN.append(pt)
    return pt


def poly(pts, fill, fop, op, sw=SW, stroke=True):
    d = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    st = (f' stroke="{INK}" stroke-opacity="{op}" stroke-width="{sw}"'
          if stroke else ' stroke="none"')
    return f'<polygon points="{d}" fill="{fill}" fill-opacity="{fop}"{st}/>'


def box(x, y, z0, z1, w=1.0, d=1.0, op=1.0, sw=SW, tint=1.0):
    """Mot khoi hop iso, ve tu mat sau ra mat truoc.

    Mat to trang duc truoc, roi mot lop mau rat nhat de tach ba mat. Trang duc
    la thu xoa net khuat: khong co no thi day thep."""
    a = iso(x, y, z1)
    b = iso(x + w, y, z1)
    c = iso(x + w, y + d, z1)
    e = iso(x, y + d, z1)
    b0 = iso(x + w, y, z0)
    c0 = iso(x + w, y + d, z0)
    e0 = iso(x, y + d, z0)
    out = []
    # mat phai (nhin thay), mat trai (nhin thay), mat tren
    out.append(poly([b, c, c0, b0], "#FFFFFF", 1, 0, sw, stroke=False))
    out.append(poly([b, c, c0, b0], INK, 0.13 * tint, op, sw))
    out.append(poly([e, c, c0, e0], "#FFFFFF", 1, 0, sw, stroke=False))
    out.append(poly([e, c, c0, e0], INK, 0.06 * tint, op, sw))
    out.append(poly([a, b, c, e], "#FFFFFF", 1, 0, sw, stroke=False))
    out.append(poly([a, b, c, e], INK, 0.02 * tint, op, sw))
    return "".join(out)


def line(p0, p1, op=1.0, sw=SW, dash=None):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<path d="M{p0[0]:.1f},{p0[1]:.1f} L{p1[0]:.1f},{p1[1]:.1f}" fill="none" '
        f'stroke="{INK}" stroke-opacity="{op}" stroke-width="{sw}" '
        f'stroke-linecap="round"{da}/>'
    )


def spark(cx, cy, s=11, op=0.95, sw=SW):
    SEEN.extend([(cx - s, cy - s), (cx + s, cy + s)])
    return (
        f'<path d="M{cx},{cy - s} L{cx},{cy + s} M{cx - s},{cy} L{cx + s},{cy}" '
        f'fill="none" stroke="{INK}" stroke-opacity="{op}" stroke-width="{sw}" '
        f'stroke-linecap="round"/>'
    )


def defs():
    return """<defs>
  <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="turbulence" baseFrequency="0.016" numOctaves="2"
                  seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.9"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <radialGradient id="halo" cx="0.5" cy="0.44" r="0.62">
    <stop offset="0" stop-color="#004AEF" stop-opacity="0.09"/>
    <stop offset="0.55" stop-color="#004AEF" stop-opacity="0.03"/>
    <stop offset="1" stop-color="#004AEF" stop-opacity="0"/>
  </radialGradient>
</defs>"""


def _lift(m):
    """Nang san do mo cua ca buc.

    Cac lop xa duoc ve o 0.3-0.5 de ta chieu sau, nhung cong lai thi ca hinh
    doc ra nhu bi phai nang. Anh xa 0 -> 0.34 va giu 1.0 nguyen: van con chenh
    lech de tao chieu sau, ma khong con lop nao mo den muc bien mat."""
    key, val = m.group(1), float(m.group(2))
    # 0.34 la qua tay: lop xa gan bang lop gan, mat het chieu sau. 0.19 giu
    # duoc ca hai — khong lop nao bien mat, ma van con bac.
    return f'{key}="{0.19 + 0.81 * val:.2f}"'


def svg(body, margin=0.045):
    """Tu canh hinh vao khung: phong toi khi cham le, roi dat vao giua.

    Ty le net duoc chia nguoc lai boi ty le phong, nen net van dung do day du
    dinh — neu khong, canh nao phong nhieu se co net day hon canh khac va ca
    bo mat dong nhat."""
    if SEEN:
        xs = [p[0] for p in SEEN]
        ys = [p[1] for p in SEEN]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        bw, bh = max(x1 - x0, 1e-6), max(y1 - y0, 1e-6)
        k = min(W * (1 - 2 * margin) / bw, H * (1 - 2 * margin) / bh)
        tx = W / 2 - (x0 + x1) / 2 * k
        ty = H / 2 - (y0 + y1) / 2 * k
        fit = f'transform="translate({tx:.1f},{ty:.1f}) scale({k:.4f})"'
        # net mong lai dung bang ty le phong => do day khong doi tren man hinh
        fit += f' stroke-width="{SW / k:.3f}"'
    else:
        fit = ""
    import re
    body = re.sub(r'(stroke-opacity|fill-opacity)="([0-9.]+)"', _lift, body)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" fill="none" '
        f'stroke-linejoin="round" stroke-linecap="round">{defs()}'
        f'<rect width="{W}" height="{H}" fill="#FFFFFF" stroke="none"/>'
        f'<rect width="{W}" height="{H}" fill="url(#halo)" stroke="none"/>'
        f'<g filter="url(#rough)" {fit}>{body}</g></svg>'
    )



# --------------------------------------------------------- chi tiet nhan dang
#
# Ban truoc moi canh chi co khoi tron, nen bay canh doc ra nhu nhau: mot dong
# hop. Trong file goc cua Viet, moi hinh la mot DO VAT — mat robot co mat va
# mieng, tai lieu co dong chu, kinh lup co can. Nhung ham duoi day ve dung
# phan do: chi tiet nam TREN MAT tren cua khoi, chieu theo dung he iso.


def face_line(x0, y0, x1, y1, z, op=0.5, sw=None):
    """Mot net nam tren mat phang cao do z — chu tren mat mot to giay."""
    return line(iso(x0, y0, z), iso(x1, y1, z), op, sw or SW * 0.8)


def text_lines(x, y, z, w, d, rows=3, op=0.45, pad=0.16):
    """May dong chu gia tren mat tren: cai bien mot cai hop thanh mot to giay."""
    out = []
    for i in range(rows):
        yy = y + pad + (d - 2 * pad) * (i / max(rows - 1, 1))
        ww = (w - 2 * pad) * (1.0, 0.72, 0.86)[i % 3]
        out.append(face_line(x + pad, yy, x + pad + ww, yy, z, op))
    return "".join(out)


def sheet(sx, sy, w, h, op=1.0, sw=None, fold=16, header=True, rows=3):
    """Mot TO FILE ve nhin thang: goc tren phai gap lai, va mot khoi frontmatter
    duoc dong khung o dau to.

    Day la cho toi da sai suot may vong: mot khoi hop iso khong tu noi no la
    cai gi. Mot to giay co goc gap thi ai cung goi ten duoc ngay, va cai khung
    o dau to la thu bien no thanh mot file Markdown chu khong phai mot to giay
    bat ky."""
    sw = sw or SW
    d = (f"M{sx},{sy + h} L{sx},{sy} L{sx + w - fold},{sy} "
         f"L{sx + w},{sy + fold} L{sx + w},{sy + h} Z")
    out = [f'<path d="{d}" fill="#FFFFFF" stroke="{INK}" stroke-opacity="{op}" '
           f'stroke-width="{sw}" stroke-linejoin="round"/>']
    out.append(f'<path d="M{sx + w - fold},{sy} L{sx + w - fold},{sy + fold} '
               f'L{sx + w},{sy + fold}" fill="none" stroke="{INK}" '
               f'stroke-opacity="{op * 0.8}" stroke-width="{sw * 0.85}" '
               f'stroke-linejoin="round"/>')
    if header:
        # hai vach ngang om lay khoi frontmatter, dung kieu "---" cua Markdown
        for k, yy in enumerate((sy + h * 0.22, sy + h * 0.46)):
            out.append(f'<path d="M{sx + w * 0.14},{yy:.0f} L{sx + w * 0.86},{yy:.0f}" '
                       f'fill="none" stroke="{INK}" stroke-opacity="{op * 0.85}" '
                       f'stroke-width="{sw * 0.9}" stroke-linecap="round"/>')
        for k in range(2):
            yy = sy + h * (0.30 + 0.08 * k)
            ww = w * (0.5 if k == 0 else 0.34)
            out.append(f'<path d="M{sx + w * 0.2},{yy:.0f} L{sx + w * 0.2 + ww:.0f},{yy:.0f}" '
                       f'fill="none" stroke="{INK}" stroke-opacity="{op * 0.5}" '
                       f'stroke-width="{sw * 0.7}" stroke-linecap="round"/>')
    return "".join(out)


def folder(sx, sy, w, h, op=1.0, sw=None):
    """Mot THU MUC nhin thang, co tai o goc trai: skill la mot folder."""
    sw = sw or SW
    tab = w * 0.34
    d = (f"M{sx},{sy + h} L{sx},{sy + 10} L{sx + tab},{sy + 10} "
         f"L{sx + tab + 9},{sy} L{sx + w},{sy} L{sx + w},{sy + h} Z")
    return (f'<path d="{d}" fill="#FFFFFF" stroke="{INK}" stroke-opacity="{op}" '
            f'stroke-width="{sw}" stroke-linejoin="round"/>')


def wall_line(x, y0, y1, z, op=0.5, sw=None):
    """Mot net nam tren mat DUNG (mat phang x co dinh).

    face_line() chi ve duoc tren mat nam ngang. Mot to giay dung tren canh thi
    chu cua no nam tren mat dung, va do la ly do can ham nay."""
    return line(iso(x, y0, z), iso(x, y1, z), op, sw or SW * 0.75)


def dim_line(p0, p1, op=0.55, cap=7, sw=None):
    """Duong do kich thuoc, ve trong KHONG GIAN MAN HINH.

    Mot cai thuoc bi chieu theo iso la mot cai thuoc gay: do dai doc duoc tren
    do khong con dung nua. Nen moi phep do deu ve nhin thang."""
    import math as _m
    sw = sw or SW * 0.7
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    ln = _m.hypot(dx, dy) or 1
    nx, ny = -dy / ln * cap, dx / ln * cap
    return (
        f'<path d="M{p0[0]:.1f},{p0[1]:.1f} L{p1[0]:.1f},{p1[1]:.1f} '
        f'M{p0[0] - nx:.1f},{p0[1] - ny:.1f} L{p0[0] + nx:.1f},{p0[1] + ny:.1f} '
        f'M{p1[0] - nx:.1f},{p1[1] - ny:.1f} L{p1[0] + nx:.1f},{p1[1] + ny:.1f}" '
        f'fill="none" stroke="{INK}" stroke-opacity="{op}" stroke-width="{sw}" '
        f'stroke-linecap="round"/>'
    )


def iso_circle(cx, cy, z, r, op=1.0, sw=None, n=28):
    """Vong tron nam tren mat phang z — trong phep chieu iso no la elip."""
    pts = [iso(cx + r * math.cos(2 * math.pi * i / n),
               cy + r * math.sin(2 * math.pi * i / n), z) for i in range(n)]
    d = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return (
        f'<polygon points="{d}" fill="none" stroke="{INK}" '
        f'stroke-opacity="{op}" stroke-width="{sw or SW}"/>'
    )


def magnifier(sx, sy, r=54, op=1.0):
    """Kinh lup ve TRONG KHONG GIAN MAN HINH, khong chieu theo iso.

    Mot vong tron nam ngang chieu theo iso ra mot hinh elip dep dat duoi dat,
    va no cat qua cac khoi phia sau — doc ra la mot cai vong, khong phai cai
    kinh lup. File goc cua Viet cung ve kinh lup nhin thang giua mot canh iso:
    do vat cam tay thi ve nhin thang, cau truc thi ve iso.
    """
    SEEN.extend([(sx - r * 1.1, sy - r * 1.1), (sx + r * 2.1, sy + r * 2.1)])
    k = 0.707
    hx0, hy0 = sx + r * k, sy + r * k
    hx1, hy1 = sx + r * 1.75, sy + r * 1.75
    return (
        f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{r:.1f}" fill="#FFFFFF" '
        f'fill-opacity="0.55" stroke="{INK}" stroke-opacity="{op}" '
        f'stroke-width="{SW * 1.25}"/>'
        f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{r * 0.74:.1f}" fill="none" '
        f'stroke="{INK}" stroke-opacity="{op * 0.32}" stroke-width="{SW * 0.7}"/>'
        f'<path d="M{hx0:.1f},{hy0:.1f} L{hx1:.1f},{hy1:.1f}" fill="none" '
        f'stroke="{INK}" stroke-opacity="{op}" stroke-width="{SW * 1.9}" '
        f'stroke-linecap="round"/>'
    )


def arrow(p0, p1, op=0.6, sw=None):
    """Mui ten giua hai diem da chieu — dung khong gian man hinh cho dau ten
    khong bi bien dang theo phep chieu."""
    import math as _m
    sw = sw or SW * 0.9
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    ln = _m.hypot(dx, dy) or 1
    ux, uy = dx / ln, dy / ln
    nx, ny = -uy, ux
    tipx, tipy = p1[0] - ux * 2, p1[1] - uy * 2
    a = (tipx - ux * 13 + nx * 7, tipy - uy * 13 + ny * 7)
    bq = (tipx - ux * 13 - nx * 7, tipy - uy * 13 - ny * 7)
    return (
        f'<path d="M{p0[0]:.1f},{p0[1]:.1f} L{tipx:.1f},{tipy:.1f}" fill="none" '
        f'stroke="{INK}" stroke-opacity="{op}" stroke-width="{sw}" '
        f'stroke-linecap="round"/>'
        f'<path d="M{a[0]:.1f},{a[1]:.1f} L{tipx:.1f},{tipy:.1f} '
        f'L{bq[0]:.1f},{bq[1]:.1f}" fill="none" stroke="{INK}" '
        f'stroke-opacity="{op}" stroke-width="{sw}" stroke-linecap="round" '
        f'stroke-linejoin="round"/>'
    )


def check(x, y, z, s=0.34, op=1.0):
    """Dau tich, ve trong KHONG GIAN MAN HINH tai vi tri da chieu.

    Ve dau tich tren mat phang iso thi hai net cua no bi keo theo hai truc
    khac nhau va hinh ra mot dau ngoac kep nguoc — ky hieu thi phai nhin
    thang, giong nhu cai kinh lup."""
    sx, sy = iso(x, y, z)
    k = s * VIEW["u"] * 0.9
    p0 = (sx - k * 0.45, sy - k * 0.05)
    p1 = (sx - k * 0.12, sy + k * 0.32)
    p2 = (sx + k * 0.52, sy - k * 0.42)
    return (
        f'<path d="M{p0[0]:.1f},{p0[1]:.1f} L{p1[0]:.1f},{p1[1]:.1f} '
        f'L{p2[0]:.1f},{p2[1]:.1f}" fill="none" stroke="{INK}" '
        f'stroke-opacity="{op}" stroke-width="{SW * 1.35}" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
    )


def bars(x, y, z, w, d, vals=(0.45, 0.8, 0.6, 1.0), op=0.55):
    """Bieu do cot: cot DUNG that tren mat tam, khong phai net ke.

    Ve bang net thi trong phep chieu iso chung thanh may gach cheo roi rac,
    doc khong ra bieu do. Cot co khoi thi doc ra ngay."""
    out = []
    n = len(vals)
    cell = (w - 0.4) / n
    for i, v in enumerate(vals):
        bx = x + 0.2 + cell * i
        out.append(box(bx, y + d * 0.3, z, z + 0.16 + 0.5 * v,
                       cell * 0.52, d * 0.34, op=op + 0.25, sw=SW * 0.8,
                       tint=0.9))
    out.append(face_line(x + 0.16, y + d * 0.72, x + w - 0.16, y + d * 0.72,
                         z, op * 0.7))
    return "".join(out)


# ------------------------------------------------------------------- canh


def platform():
    """Mot day FILE dung tren mot thanh ray, mot file duoc nhac len cung folder.

    Ban truoc day la nhung tam hop iso tron: dung ve co che nhung khong tu noi
    duoc no la cai gi — nguoi xem phai doc chu thich moi hieu. O day moi tam
    la mot TO FILE ve nhin thang, co goc gap va co khoi frontmatter dong khung
    o dau to. Ai cung goi ten duoc ngay: mot file. Va vi frontmatter la thu
    duy nhat co noi dung, con than to de trong, no noi luon "frontmatter is
    the whole contract".

    Thanh ray van la iso: cau truc thi ve iso, VAT thi ve nhin thang. Do la
    quy tac da rut ra tu cai kinh lup va dau tich o cac vong truoc.
    """
    view(430, 300, 54)
    b = []
    N = 11
    BEAM_Y, BEAM_D, BEAM_Z = 0.0, 1.30, 0.34
    slot = 7
    STEP = 0.62

    # thanh ray: mot khoi duy nhat, khong duong noi => "zero changes to the core"
    b.append(box(-0.55, BEAM_Y, 0.0, BEAM_Z, N * STEP + 1.05, BEAM_D,
                 op=0.9, sw=SW * 1.05, tint=0.5))

    SW_, SH = 88, 112
    for i in range(N):
        if i == slot:
            continue
        # chan to file dat tren mat ray, roi ve to nhin thang tu diem do len
        px, py = iso(i * STEP + 0.30, BEAM_Y + BEAM_D * 0.5, BEAM_Z)
        op = 0.95 - 0.4 * (i / (N - 1))
        b.append(sheet(px - SW_ / 2, py - SH, SW_, SH, op, SW * 0.95))
        SEEN.extend([(px - SW_ / 2, py - SH), (px + SW_ / 2, py)])

    # cho trong tren ray
    xs = slot * STEP + 0.30
    c = [iso(xs - 0.26, BEAM_Y + 0.28, BEAM_Z), iso(xs + 0.26, BEAM_Y + 0.28, BEAM_Z),
         iso(xs + 0.26, BEAM_Y + 1.02, BEAM_Z), iso(xs - 0.26, BEAM_Y + 1.02, BEAM_Z)]
    for i in range(4):
        b.append(line(c[i], c[(i + 1) % 4], 0.45, SW * 0.75, "7 8"))

    # file duoc nhac len + folder skill ben canh
    px, py = iso(xs, BEAM_Y + BEAM_D * 0.5, BEAM_Z)
    lift = 96
    b.append(sheet(px - SW_ / 2, py - SH - lift, SW_, SH, 1.0, SW * 1.2))
    b.append(folder(px + SW_ / 2 + 26, py - SH - lift + 30, 86, 74, 0.95, SW * 1.05))
    SEEN.extend([(px - SW_ / 2, py - SH - lift), (px + SW_ / 2 + 120, py)])
    b.append(line((px, py - lift + 4), (px, py - 6), 0.4, SW * 0.8, "7 9"))

    # ba mau ray cut phia sau: the gioi cu, moi mau mot file, khong cham nhau
    for (sx_, sy_, sz) in ((2.0, -4.4, 1.5), (5.0, -5.2, 2.0), (7.6, -4.0, 1.2)):
        b.append(box(sx_, sy_, sz, sz + 0.12, 0.7, 0.7, op=0.28, sw=SW * 0.6,
                     tint=0.3))
        qx, qy = iso(sx_ + 0.35, sy_ + 0.35, sz + 0.12)
        b.append(sheet(qx - 20, qy - 50, 40, 50, 0.30, SW * 0.6, fold=8,
                       header=False))
    return "".join(b)


def search():
    """Bang thua cua inverted index: vai tu trung moi tai lieu, phan lon trung
    gan nhu khong cai nao.

    Trang bai cua chinh du an nay ve dung hinh do — mot ma tran thua ma cac
    hang xep theo tan suat tao thanh mot cai nem Zipf. Ve lai no thi khong
    phai la bia an du: do la hinh cua chinh du an.

    Bong dang cua buc la mot DAI DAC TAN DAN THANH RAC — khong phai mot nhom
    the phang. Do la ly do no khong lan voi sau hinh con lai o co thumbnail.
    """
    view(430, 292, 40)
    b = []
    ROWS, COLS = 26, 22
    # KHONG ve mam, KHONG ve luoi. Phep thu thumbnail cho thay: co duong bao
    # hinh thoi thi o co nho canh nay va canh keyword clustering rut gon thanh
    # cung mot vet, va hai hinh khong con phan biet duoc. Bo duong bao di thi
    # cai con lai la ban than truong hat — mot vet tam giac, khong ai trung.

    import numpy as np
    rng = np.random.default_rng(11)
    for r in range(ROWS):
        # Hang GAN nguoi xem la tu pho bien: dai dac nam o mep truoc roi tan
        # dan ve phia sau. Dat nguoc lai thi cai nem chi ve phia chan troi va
        # mat het suc nang.
        # Trong phep chieu nay y tang thi di XUONG-TRAI, nen hang gan nguoi
        # xem la hang co r LON. Dat nguoc lai thi dai dac chay ve chan troi.
        k = r / (ROWS - 1)                       # 1 o mep truoc (duoi-trai)
        dens = max(0.015, 1.05 * (k ** 2.4))
        rad = 3.2 + 5.2 * k                      # hat gan to hon => dinh thanh dai
        op = 0.34 + 0.62 * k
        for c in range(COLS):
            if rng.random() < dens:
                sx, sy = iso(c + 0.5, r + 0.5, 0.0)
                b.append(
                    f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{rad:.1f}" '
                    f'fill="{INK}" fill-opacity="{op:.2f}" stroke="none"/>'
                )
    # mot posting list: cac tai lieu chua CUNG mot tu, noi thanh chuoi
    # posting list nam trong vung thua: mot tu hiem, va cac tai lieu chua no
    r = 8
    cols = [3, 7, 11, 16, 20]
    pts = [iso(c + 0.5, r + 0.5, 0.0) for c in cols]
    for i in range(len(pts) - 1):
        b.append(line(pts[i], pts[i + 1], 0.85, SW * 0.9))
    for sx, sy in pts:
        b.append(
            f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="6.4" fill="{INK}" '
            f'fill-opacity="1" stroke="none"/>'
        )
    return "".join(b)


def presentation():
    """Mot outline duoc duyet, roi mot engine code ve ra slide.

    Menh de cua trang: "model viet lap luan, mot engine code ve tung pixel",
    va outline phai duoc DUYET truoc khi ton tai slide nao. Ban truoc toi ve
    mot chong slide voi mot tam duoc nhac len — no chi noi "day la mot bo
    deck", tuc la noi cai ai cung doan duoc tu tieu de, khong noi cai lam du
    an nay khac.

    O day: the outline ben trai, tung dong la mot slide, co dau tich la da
    duyet. Mui ten sang phai. Ben phai la slide da dung, co bieu do that, va
    ba khoi nho phia sau la cac block dung san."""
    view(420, 300, 60)
    b = []
    # the outline: dung, cac dong tieu de
    b.append(box(0, 0.15, 0.0, 0.10, 1.45, 1.9, op=1.0, sw=SW * 1.15))
    rows = 5
    for i in range(rows):
        yy = 0.42 + 1.36 * i / (rows - 1)
        b.append(face_line(0.20, yy, 1.06, yy, 0.10, 0.5))
    b.append(check(1.05, 0.30, 0.10, 0.30, 0.95))

    # mui ten: outline -> slide
    b.append(arrow(iso(1.55, 1.1, 0.12), iso(2.35, 1.1, 0.12), 0.55))

    # ba block dung san, xep chong phia sau slide
    for i in range(3):
        b.append(box(2.7 + 0.12 * i, 1.75 - 0.12 * i, 0.06 * i, 0.06 * i + 0.05,
                     1.9, 1.25, op=0.32 - 0.06 * i, sw=SW * 0.8, tint=0.5))

    # slide da dung: co bieu do
    b.append(box(2.6, 0.15, 0.42, 0.52, 2.15, 1.5, op=1.0, sw=SW * 1.2))
    b.append(bars(2.6, 0.15, 0.52, 2.15, 1.5, (0.42, 0.75, 0.58, 1.0), 0.5))
    b.append(face_line(2.78, 0.40, 4.0, 0.40, 0.52, 0.55))
    t = iso(3.7, 0.9, 0.52)
    b.append(spark(t[0] + 52, t[1] - 40, 12, 0.95, SW))
    return "".join(b)


def publishing():
    """Mot lan goi model luc onboarding, roi mai mai khong lan nao nua.

    Nguyen van trang do: "The model runs exactly once per site at onboarding...
    Per article, forever, there are zero model calls."

    Bong dang: MOT THAP DUNG, ROI MOT DUOI DAI THAP. Cai tranh luan nam o
    khoang trong ben phai — khong co gi xay ra o do, mai mai. Vi vay khong ve
    bat ky net nao tu thap toi cac tam phia sau: co net la thanh phat song,
    va mat dung y "model khong cham vao chung".
    """
    view(300, 300, 56)
    b = []
    # thanh ray thap chay suot: kho pattern, cac bai nam tren no
    b.append(box(-0.4, 0.35, -0.20, 0.0, 12.5, 1.1, op=0.55, sw=SW * 0.8,
                 tint=0.4))
    # thap: mot lan goi model duy nhat, cao gap nhieu lan moi thu khac
    b.append(box(0.0, 0.3, 0.0, 2.5, 1.15, 1.15, op=1.0, sw=SW * 1.25))
    b.append(text_lines(0.0, 0.3, 2.5, 1.15, 1.15, 3, 0.6, 0.22))
    # diem cham duy nhat giua thap va ray
    sx, sy = iso(1.15, 0.88, 0.0)
    b.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="6" fill="{INK}" stroke="none"/>')

    # duoi dai: cac bai da xuat ban, giong het nhau, thap va nhat dan
    for i in range(18):
        x = 1.65 + i * 0.60
        op = 0.85 - 0.62 * (i / 17)
        b.append(box(x, 0.45, 0.0, 0.10, 0.48, 0.62, op=op, sw=SW * 0.85,
                     tint=0.75 - 0.4 * (i / 17)))
    return "".join(b)


def content():
    """Bon kien truc, cung mot checklist, bon muc do giu duoc no.

    Menh de cua bai, nguyen van: "a checklist needs 100 percent of the guidance
    in front of the model, and most approaches deliver less". Menh de do von
    da la mot phep SO SANH, nen hinh phai so sanh — khong hinh nao khac trong
    bo lam viec do, va do cung la ly do bong dang cua no khong dung voi ai.

    Mot don vi lap lai duy nhat: mot lat mong = mot muc trong checklist.
      1. RAG      — thap con ba lat, chin lat kia nam xoe duoi dat, ba lat cuoi
                    ve bang net dut: "keeps a top-k and drops the rest".
      2. QLoRA    — khong con lat nao, ba khoi lien mach khong duong noi, hai
                    khoi do nghieng: hai trong ba ban fine-tune hong.
      3. Skills   — thap du muoi hai lat, moi duong noi deu thay: "loaded whole
                    or not at all".
      4. Hybrid   — cung thap do dung tren mot be, canh phai la mot vach dung:
                    trang thai o app, phan viet o rail ben canh.
    """
    view(430, 300, 46)
    b = []
    WW, WD, WH = 1.5, 0.62, 0.10

    def tower(x, y, n, op, sw, gap=0.0):
        out = []
        for i in range(n):
            z = i * (WH + gap)
            out.append(box(x, y, z, z + WH, WW, WD, op=op, sw=sw))
        return "".join(out)

    # --- 1. RAG: giu ba, lam roi chin ---
    b.append(tower(0.0, 0.0, 3, 0.55, SW * 0.85))
    import numpy as np
    rng = np.random.default_rng(6)
    for i in range(9):
        dx = 1.75 + i * 0.16 + rng.uniform(0, 0.12)
        dy = -0.30 + i * 0.14
        if i >= 6:
            # ba lat cuoi: chi con net dut, da roi han
            c = [iso(dx, dy, 0.02), iso(dx + WW * 0.8, dy, 0.02),
                 iso(dx + WW * 0.8, dy + WD, 0.02), iso(dx, dy + WD, 0.02)]
            for k in range(4):
                b.append(line(c[k], c[(k + 1) % 4], 0.26, SW * 0.6, "6 7"))
        else:
            b.append(box(dx, dy, 0.0, 0.05, WW * 0.8, WD, op=0.42 - 0.04 * i,
                         sw=SW * 0.7, tint=0.5))

    # --- 2. QLoRA: ba khoi lien mach, hai khoi do ---
    b.append(box(4.6, 0.0, 0.0, 1.25, WW, WD, op=0.62, sw=SW * 0.9))
    b.append(box(6.25, -0.15, 0.0, WD, 1.25, WD, op=0.5, sw=SW * 0.85))
    b.append(box(6.25, 0.62, 0.0, WD, 1.25, WD, op=0.42, sw=SW * 0.85))

    # --- 3. Skills: thap du, cao nhat, dam nhat ---
    b.append(tower(8.9, 0.0, 12, 1.0, SW * 1.05))

    # --- 4. Hybrid: thap tren be, co vach dung ben canh ---
    b.append(box(11.6, -0.35, 0.0, 0.16, WW + 0.9, WD + 0.7, op=0.9,
                 sw=SW * 0.95, tint=0.6))
    b.append(tower(11.75, -0.2, 12, 0.92, SW))
    b.append(box(13.35, -0.3, 0.16, 1.5, 0.07, WD + 0.55, op=0.85, sw=SW * 0.9))
    for k in range(4):
        b.append(wall_line(13.35, -0.22, 0.24, 1.28 - 0.24 * k, 0.5, SW * 0.65))
    return "".join(b)


def keywords():
    """Truoc khi nen: moi diem cach deu moi diem. Sau khi nen: co cum.

    Nguyen van: "at full width almost every point is equidistant and DISTANCE
    STOPS MEANING ANYTHING", roi "HDBSCAN finds the natural groups by density".
    Ban truoc chi ve nua sau — cac cum — nen no khong noi duoc vi sao phai co
    ca cai pipeline nay.

    Mang trai to va deu tap: mot diem giua co tam net noi ra tam hang xom,
    TAT CA DAI BANG NHAU. Do la toan bo cach noi "khong con y nghia gi".
    Mang phai nho hon han: cung tung ay diem, gio tu thanh ba cum, hai diem
    khong vao dau ca. Chenh lech kich thuoc giua hai mang chinh la phep nen
    chieu — khong can ve them gi de noi dieu do.
    """
    view(430, 296, 40)
    b = []

    def plane(ox_, oy_, n, step, op):
        out = []
        for i in range(n + 1):
            out.append(line(iso(ox_, oy_ + i * step, 0),
                            iso(ox_ + n * step, oy_ + i * step, 0), op, SW * 0.5))
            out.append(line(iso(ox_ + i * step, oy_, 0),
                            iso(ox_ + i * step, oy_ + n * step, 0), op, SW * 0.5))
        return "".join(out)

    # --- mang trai: luoi deu, khong cum nao ---
    N, STEP = 8, 0.62
    b.append(plane(0, 0, N, STEP, 0.07))
    import numpy as np
    rng = np.random.default_rng(3)
    for i in range(N):
        for j in range(N):
            x = 0.31 + i * STEP + rng.uniform(-0.05, 0.05)
            y = 0.31 + j * STEP + rng.uniform(-0.05, 0.05)
            sx, sy = iso(x, y, 0)
            b.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="4.6" fill="{INK}" '
                     f'fill-opacity="0.62" stroke="none"/>')
    # mot diem, tam hang xom, tam net DAI BANG NHAU
    ci, cj = 4, 4
    cx0, cy0 = 0.31 + ci * STEP, 0.31 + cj * STEP
    for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1),
                   (1, 1), (1, -1), (-1, 1), (-1, -1)):
        b.append(line(iso(cx0, cy0, 0),
                      iso(cx0 + di * STEP, cy0 + dj * STEP, 0), 0.5, SW * 0.7))
    sx, sy = iso(cx0, cy0, 0)
    b.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="6.5" fill="{INK}" stroke="none"/>')

    # --- mang phai: nho hon han, da co cum ---
    OX, SC = 7.6, 0.55
    b.append(plane(OX, 1.1, 6, STEP * SC, 0.07))
    groups = ((1.15, 0.95, 0.62, 12), (2.55, 0.75, 0.5, 9), (1.85, 2.15, 0.55, 10))
    for gi, (gx, gy, r, n) in enumerate(groups):
        pts = rng.normal(0, r * 0.40, (n, 2))
        pts = pts[np.hypot(pts[:, 0], pts[:, 1]) < r * 0.82]
        for px, py in pts:
            sx, sy = iso(OX + (gx + px) * SC, 1.1 + (gy + py) * SC, 0)
            b.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="4.6" fill="{INK}" '
                     f'fill-opacity="0.92" stroke="none"/>')
        b.append(iso_circle(OX + gx * SC, 1.1 + gy * SC, 0, r * SC, 0.5,
                            SW * 0.7).replace("/>", ' stroke-dasharray="7 7"/>'))
    for px, py in ((0.35, 2.5), (3.15, 1.9)):
        sx, sy = iso(OX + px * SC, 1.1 + py * SC, 0)
        b.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="5.6" fill="#FFFFFF" '
                 f'stroke="{INK}" stroke-opacity="0.85" stroke-width="{SW * 0.8}"/>')

    # mui ten giua hai mang: phep nen chieu
    b.append(arrow(iso(5.3, 2.4, 0.0), iso(6.9, 2.4, 0.0), 0.5))
    return "".join(b)


def quoting():
    """Chin o lien mot khoi, dung hai o duoc khoet ra lam long nhot.

    Rang buoc quan trong nhat cua canh nay la NEGATIVE: khong duoc ve thanh
    mot chuoi chin buoc chay cheo, vi bong dang do da thuoc ve duong ong
    publishing, va hai hinh chuoi nam canh nhau la va cham te nhat trong bo.
    Nen canh nay ke bang SU BAO BOC chu khong bang trinh tu.

    Bay o dong kin va TRONG RONG hoan toan: "numbers in, numbers out" thi
    khong co gi de nhin. Hai o mo la hai long nhot, moi cai co song chan va
    mot cham nho nam duoi day — model chi duoc dong day trong khoang do.
    Ben canh long thu nhat: danh sach nam ten voi hai ten da bi gach, va HAI
    dau tich, vi "checked once inside the function and once at the caller".
    Ben canh long thu hai: mot cai thang nam bac voi mot cham nam DUNG tren
    mot bac, khong bao gio nam giua hai bac — do la "clamped to a fixed set
    of tiers, never a free number".
    """
    view(400, 300, 78)
    b = []
    CELL, HGT = 1.0, 0.8
    wells = {(0, 1), (2, 0)}

    # khoi dac 3x3: ve nhu MOT vat, khong phai chin vat roi nhau
    b.append(box(0, 0, 0.0, HGT, 3 * CELL, 3 * CELL, op=1.0, sw=SW * 1.25))
    for i in (1, 2):
        b.append(face_line(i * CELL, 0, i * CELL, 3 * CELL, HGT, 0.35, SW * 0.8))
        b.append(face_line(0, i * CELL, 3 * CELL, i * CELL, HGT, 0.35, SW * 0.8))

    # Hai o duoc khoet. De doc ra la HO chu khong phai khay nam tren mat, phai
    # ve hai mat TUONG TRONG: nhin tu goc nay ta thay mat trong o canh xa, va
    # chung phai duoc to dam hon mat tren. Thieu hai mat do thi mat doc ra la
    # mot cai hop dat len ban.
    for (r, c) in sorted(wells, key=lambda rc: rc[0] + rc[1]):
        x0, y0 = c * CELL + 0.13, r * CELL + 0.13
        w = CELL - 0.26
        depth = 0.42
        A, B = iso(x0, y0, HGT), iso(x0 + w, y0, HGT)
        C, D = iso(x0 + w, y0 + w, HGT), iso(x0, y0 + w, HGT)
        A2, B2 = iso(x0, y0, HGT - depth), iso(x0 + w, y0, HGT - depth)
        C2, D2 = iso(x0 + w, y0 + w, HGT - depth), iso(x0, y0 + w, HGT - depth)
        # Hai mat tuong trong o canh XA (canh ke goc A), to dam han va co
        # GACH DUNG. Chi lam dam thoi thi mat van lat nguoc thanh cai khay noi
        # len — hieu ung Necker. Net gach chay theo chieu sau la thu noi ro
        # "day la mat ben trong", vi mot mat ngoai khong bao gio co gach do.
        b.append(poly([A, B, B2, A2], INK, 0.26, 0.6, SW * 0.85))
        b.append(poly([A, D, D2, A2], INK, 0.17, 0.6, SW * 0.85))
        for k in range(1, 4):
            t = k / 4
            b.append(line(iso(x0 + w * t, y0, HGT), iso(x0 + w * t, y0, HGT - depth),
                          0.30, SW * 0.6))
            b.append(line(iso(x0, y0 + w * t, HGT), iso(x0, y0 + w * t, HGT - depth),
                          0.26, SW * 0.6))
        # day gieng
        b.append(poly([A2, B2, C2, D2], INK, 0.07, 0.55, SW * 0.75))
        # Vien mieng: hai canh XA dam (do la cho tuong gap mat tren), hai canh
        # GAN nhat (do chi la mep vat lieu, khong phai mot cai vanh).
        b.append(line(A, B, 0.95, SW * 1.05))
        b.append(line(A, D, 0.95, SW * 1.05))
        b.append(line(B, C, 0.5, SW * 0.8))
        b.append(line(D, C, 0.5, SW * 0.8))
        # song chan: dat THAP hon mieng mot chut, nen no nam TRONG hoc
        zb = HGT - 0.10
        for k in range(1, 5):
            t = k / 5
            b.append(line(iso(x0 + w * t, y0, zb), iso(x0 + w * t, y0 + w, zb),
                          0.45, SW * 0.7))
        # cham nho duoi day: model, nho hon long
        sx, sy = iso(x0 + w / 2, y0 + w / 2, HGT - depth)
        b.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="7" fill="{INK}" '
                 f'fill-opacity="0.9" stroke="none"/>')

    # --- ky hieu, ve nhin thang ben phai khoi ---
    ax, ay = iso(3 * CELL, 0.6, HGT)
    ax += 96
    # long 1: danh sach nam ten, hai ten bi gach, hai dau tich
    for i in range(5):
        yy = ay - 74 + i * 27
        hollow = i in (1, 3)
        if hollow:
            b.append(f'<circle cx="{ax:.0f}" cy="{yy:.0f}" r="7.5" fill="#FFFFFF" '
                     f'stroke="{INK}" stroke-opacity="0.55" stroke-width="{SW * 0.8}"/>')
        else:
            b.append(f'<circle cx="{ax:.0f}" cy="{yy:.0f}" r="7.5" fill="{INK}" '
                     f'fill-opacity="0.85" stroke="none"/>')
    for dx in (-42, 40):
        p0 = (ax + dx - 9, ay - 6)
        b.append(f'<path d="M{p0[0]:.0f},{p0[1]:.0f} l7,8 l13,-16" fill="none" '
                 f'stroke="{INK}" stroke-opacity="0.85" stroke-width="{SW * 1.2}" '
                 f'stroke-linecap="round" stroke-linejoin="round"/>')

    # long 2: thang nam bac, mot cham nam DUNG tren mot bac
    bx, by = ax - 6, ay + 128
    for i in range(5):
        yy = by + i * 22
        b.append(f'<path d="M{bx - 26:.0f},{yy:.0f} L{bx + 26:.0f},{yy:.0f}" '
                 f'fill="none" stroke="{INK}" stroke-opacity="0.5" '
                 f'stroke-width="{SW * 0.8}" stroke-linecap="round"/>')
    b.append(f'<circle cx="{bx:.0f}" cy="{by + 44:.0f}" r="8" fill="{INK}" '
             f'fill-opacity="0.95" stroke="none"/>')
    return "".join(b)


SCENES = {
    "agentic-ai-platform": platform,
    "mini-search-engine": search,
    "agentic-presentation-system": presentation,
    "cms-publishing-pipeline": publishing,
    "content-seo-ai": content,
    "keyword-clustering": keywords,
    "seo-quoting-agent": quoting,
}


def main():
    for slug, fn in SCENES.items():
        SEEN.clear()
        path = OUT / f"iso-{slug}.svg"
        path.write_text(svg(fn()), encoding="utf-8")
        print(f"{path.name}  {len(path.read_bytes())} bytes")


if __name__ == "__main__":
    main()
