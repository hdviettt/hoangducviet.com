"""Ban tranh tram: mot ho mau, mot diem nhan am, mot vat ap dao.

Day la ban duy nhat Viet tung khen ("nhin khong te") duoc sua theo dung hai
loi anh chi ra ngay sau do, cong voi loi thu ba tu vong doodle:

  1. BO VAN GIAY. Khong noise moi sang — anh noi vay va anh dung.
  2. CO TIEU DIEM. Ban cu co bon vat ngang co xep hang; o day mot vat cao hon,
     gan hon, sang hon va la vat duy nhat mang mau am.
  3. CAT BANG MAU. Ban doodle sau do dung sau mau keo va bi che la tre con.
     O day: MOT ho mau lanh (xanh da phien) chay tu tram den nhat, cong dung
     MOT diem nhan am. Khong co mau thu ba.

Chieu sau khong den tu bong do gia, ma tu PHOI KHONG KHI: vat cang lui ve sau
cang nhat, cang mem canh, cang gan mau nen. Do la cach tranh son dau ta chieu
sau tu truoc khi co may anh.

    python scripts/make-work-quiet.py
"""

from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"
W, H = 1600, 900

# Mot ho mau lanh duy nhat, tu tram nhat den nhat nhat.
D1 = "#0F1730"   # tram nhat
D2 = "#1B2745"
D3 = "#2C3D63"
D4 = "#465B87"
D5 = "#6C81AC"
D6 = "#94A6C9"
# Dung MOT diem nhan am cho ca buc.
WARM1 = "#E8A96A"
WARM2 = "#C97F4A"


def defs():
    return f"""<defs>
  <linearGradient id="field" x1="0.1" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="#141C36"/>
    <stop offset="0.55" stop-color="#1A2440"/>
    <stop offset="1" stop-color="#0E1428"/>
  </linearGradient>
  <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#8FA6D6" stop-opacity="0.55"/>
    <stop offset="0.55" stop-color="#6E86BC" stop-opacity="0.22"/>
    <stop offset="1" stop-color="#6E86BC" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="warmGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#F0B87C" stop-opacity="0.42"/>
    <stop offset="1" stop-color="#E8A96A" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="hero" x1="0.1" y1="0" x2="0.9" y2="1">
    <stop offset="0" stop-color="{WARM1}"/>
    <stop offset="1" stop-color="{WARM2}"/>
  </linearGradient>
  <linearGradient id="deck" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="{D3}"/>
    <stop offset="1" stop-color="{D2}"/>
  </linearGradient>
  <filter id="edge1" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="1.6"/>
  </filter>
  <filter id="edge2" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="4.5"/>
  </filter>
  <filter id="edge3" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="11"/>
  </filter>
  <filter id="castHero" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="34" stdDeviation="30" flood-color="#050914"
                  flood-opacity="0.55"/>
  </filter>
  <filter id="cast" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#050914"
                  flood-opacity="0.40"/>
  </filter>
  <filter id="wide"><feGaussianBlur stdDeviation="70"/></filter>
</defs>"""


def rrect(x, y, w, h, r, fill, filt=None, op=1.0, rot=None):
    f = f' filter="url(#{filt})"' if filt else ""
    t = f' transform="rotate({rot} {x + w / 2:.0f} {y + h / 2:.0f})"' if rot else ""
    return (
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="{r}" '
        f'fill="{fill}" opacity="{op}"{f}{t}/>'
    )


def platform():
    """Mot be chay het khung, cac cot dung tren no, va MOT cot am o phia truoc.

    Cot am la tieu diem: cao nhat, gan nhat, net nhat, va la mau am duy nhat
    trong mot buc toan mau lanh. Ba tin hieu cung chi vao mot cho."""
    b = []

    # quang sang lon sau lung: cho hau canh mot chieu sau
    b.append('<ellipse cx="1060" cy="330" rx="560" ry="420" fill="url(#lamp)"/>')

    # --- lop xa nhat: nhat, mem canh, gan mau nen ---
    for x, y, w, h in ((120, 402, 118, 250), (300, 356, 104, 296),
                       (1180, 372, 112, 280), (1348, 414, 100, 238)):
        b.append(rrect(x, y, w, h, 26, D4, "edge3", 0.34))

    # --- lop giua ---
    for x, y, w, h in ((236, 372, 132, 292), (420, 316, 140, 348),
                       (1024, 340, 136, 324), (1216, 300, 128, 364)):
        b.append(rrect(x, y, w, h, 28, D3, "edge2", 0.72))

    # --- be do: chay tran ca hai mep khung ---
    b.append(rrect(-80, 648, 1760, 96, 44, "url(#deck)", "edge1"))
    b.append(rrect(-80, 648, 1760, 10, 5, D5, "edge2", 0.5))

    # --- lop gan: dam hon, net hon ---
    for x, y, w, h in ((372, 388, 158, 268), (556, 330, 150, 326),
                       (900, 356, 152, 300), (1080, 420, 142, 236)):
        b.append(rrect(x, y, w, h, 30, D2, "edge1", 0.95))
        b.append(rrect(x, y, w, 6, 3, D5, "edge1", 0.42))

    # --- TIEU DIEM ---
    # Lech khoi truc giua: dat chinh giua thi bo cuc dung yen, va mot khoi cao
    # hep nam giua khung doc ra nhu mot cai dien thoai.
    b.append('<ellipse cx="1004" cy="452" rx="330" ry="300" fill="url(#warmGlow)"/>')
    hx, hy, hw, hh = 892, 236, 236, 420
    b.append(rrect(hx, hy, hw, hh, 34, "url(#hero)", "castHero"))
    b.append(rrect(hx, hy, hw, 8, 4, "#F6D0A4", None, 0.9))
    b.append(rrect(hx + 30, hy + 48, hw - 104, 7, 4, "#7A4A22", None, 0.32))
    b.append(rrect(hx + 30, hy + 78, hw - 150, 7, 4, "#7A4A22", None, 0.22))
    # vung sang am hat xuong be: cai gan vat vao mat phang no dang dung
    b.append(
        '<ellipse cx="1010" cy="668" rx="196" ry="26" fill="#E8A96A" '
        'opacity="0.30" filter="url(#edge3)"/>'
    )

    return "".join(b)


SCENES = {"agentic-ai-platform": platform}


def svg(body, zoom=1.10, dy=44):
    """Phong nhe va ha xuong: mot phan ba duoi khung dang la bong toi trong."""
    tx = W / 2 * (1 - zoom)
    ty = H / 2 * (1 - zoom) + dy
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">{defs()}'
        f'<rect width="{W}" height="{H}" fill="url(#field)"/>'
        f'<g transform="translate({tx:.1f},{ty:.1f}) scale({zoom})">{body}</g></svg>'
    )


def main():
    for slug, fn in SCENES.items():
        p = OUT / f"q-{slug}.svg"
        p.write_text(svg(fn()), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
