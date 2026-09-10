"""Featured media ve theo dung ngon ngu net cua frontpage.html.

Bo cong thuc lay tu chinh file cua Viet, khong phai tu suy doan:

    <filter id="rough">
      <feTurbulence type="turbulence" baseFrequency="0.022" numOctaves="2" seed="7"/>
      <feDisplacementMap scale="2.6"/>
    </filter>
    <svg stroke="currentColor" stroke-width="2" fill="none"
         stroke-linecap="round" stroke-linejoin="round">

Ba diem tach no khoi hai ban doodle da bi bac:

  1. NET MANH, MOT MAU. Khong co net vien den day, khong co mang mau. Ban
     doodle thu hai dung sau mau keo va bi che la tre con — o day ca buc chi
     co mot mau, la primary cua chinh site.
  2. KHONG TO. `fill="none"`, tru vai cho to o 6% cho co khoi luong.
  3. CHIEU SAU BANG DO MO CUA NET. Vat o sau ve o .35-.45, vat chinh ve o 1.0.
     Do la toan bo cach bo tranh nay ta khong gian — khong bong do, khong
     gradient.

Hinh ve giu dung von tu vung cua file goc: the bo goc, khoi lap phuong noi
nhau, mat cuoi, tia sang hai net cheo, cung mo lam bong duoi vat.

    python scripts/make-work-line.py
"""

import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "work"

# 16:9. Ve o 960x540 roi de trinh duyet phong: net van sac vi la vector.
W, H = 960, 540
INK = "#004AEF"          # primary cua site
SW = 3.2                 # tuong duong stroke-width 2 tren khung 240 cua file goc


def defs():
    return """<defs>
  <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="turbulence" baseFrequency="0.018" numOctaves="2"
                  seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <radialGradient id="halo" cx="0.5" cy="0.46" r="0.62">
    <stop offset="0" stop-color="#004AEF" stop-opacity="0.10"/>
    <stop offset="0.5" stop-color="#004AEF" stop-opacity="0.035"/>
    <stop offset="1" stop-color="#004AEF" stop-opacity="0"/>
  </radialGradient>
</defs>"""


def p(d, op=1.0, w=SW):
    return f'<path d="{d}" stroke-opacity="{op}" stroke-width="{w}"/>'


def circle(cx, cy, r, op=1.0, fill=None, w=SW):
    f = f' fill="{INK}" fill-opacity="{fill}"' if fill else ""
    return (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" stroke-opacity="{op}" '
        f'stroke-width="{w}"{f}/>'
    )


def dot(cx, cy, r=4.0, op=1.0):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{INK}" fill-opacity="{op}" stroke="none"/>'


def rrect(x, y, w, h, r, op=1.0, fill=None, sw=SW):
    f = f' fill="{INK}" fill-opacity="{fill}"' if fill else ""
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" '
        f'stroke-opacity="{op}" stroke-width="{sw}"{f}/>'
    )


def spark(cx, cy, s=12, op=1.0, w=SW):
    """Tia sang hai net cheo — dung kieu cua file goc, khong phai sao to dac."""
    return p(f"M{cx},{cy - s} L{cx},{cy + s} M{cx - s},{cy} L{cx + s},{cy}", op, w)


def ground(cx, y, half=120, op=0.32):
    """Cung mo lam bong: vat co cho dung ma khong can bong do."""
    return p(f"M{cx - half},{y} q{half},{half * 0.42} {half * 2},0", op)


def svg(body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" stroke="{INK}" '
        f'stroke-width="{SW}" fill="none" stroke-linecap="round" '
        f'stroke-linejoin="round">{defs()}'
        f'<rect width="{W}" height="{H}" fill="#FFFFFF" stroke="none"/>'
        f'<rect width="{W}" height="{H}" fill="url(#halo)" stroke="none"/>'
        f'<g filter="url(#rough)" transform="translate(-38,-14) scale(1.09)">{body}</g></svg>'
    )


# ------------------------------------------------------------------- canh


def platform():
    """Mot the lon la nen tang, cac the agent noi vao no, mot tia sang.

    Vat chinh ve net dam nhat va to nhat; cac the agent nho hon va mo hon;
    cai lam nguoi xem hieu "nhieu cai tren mot cai" la net noi va do mo, chu
    khong phai mot cai nhan chu."""
    b = []
    # nen tang: the lon, ben trong la luoi o
    b.append(rrect(150, 150, 280, 250, 34, 1.0, fill="0.05"))
    for r in range(3):
        for c in range(3):
            b.append(rrect(178 + c * 82, 182 + r * 74, 60, 50, 12, 0.45))
    b.append(dot(290, 168, 4.5, 0.7))

    # cac the agent ben phai, cao thap khac nhau, noi ve nen tang
    agents = [(560, 120, 120, 92), (700, 232, 132, 100), (556, 330, 116, 88)]
    for i, (x, y, w, h) in enumerate(agents):
        op = (0.85, 1.0, 0.7)[i]
        b.append(rrect(x, y, w, h, 18, op))
        b.append(p(f"M{x + 18},{y + 32} h{w - 56}", op * 0.6))
        b.append(p(f"M{x + 18},{y + 52} h{w - 84}", op * 0.45))
        # duong noi: cung mem tu mep phai nen tang toi mep trai the
        b.append(p(f"M430,{262} q{(x - 430) * 0.45},{(y + h / 2 - 262) * 0.7} "
                   f"{x - 430},{y + h / 2 - 262}", op * 0.5, SW * 0.85))
        b.append(dot(x, y + h / 2, 4, op * 0.8))

    # mot the dang roi khoi luoi: cai duy nhat co tia sang
    b.append(rrect(196, 40, 132, 104, 20, 1.0, fill="0.06"))
    b.append(p("M216,74 h86", 0.6))
    b.append(p("M216,96 h58", 0.45))
    b.append(spark(356, 52, 10, 0.9, SW * 0.9))
    # net dut ngan noi the bay voi cho no vua roi khoi luoi
    b.append(p("M262,150 v22", 0.30))

    # bong duoi nen tang
    b.append(ground(290, 424, 132, 0.30))
    return "".join(b)


SCENES = {"agentic-ai-platform": platform}


def main():
    for slug, fn in SCENES.items():
        path = OUT / f"ln-{slug}.svg"
        path.write_text(svg(fn()), encoding="utf-8")
        print(f"{path.name}  {len(path.read_bytes())} bytes")


if __name__ == "__main__":
    main()
