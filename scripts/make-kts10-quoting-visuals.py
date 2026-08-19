"""Cover and figures for `a-wrong-quote-that-looks-like-a-right-one`.

The post is about one internal agent: the SEO quoting workbench. So every
drawing here is that workbench, or a piece of it, drawn as the screen it
actually is, with its real Vietnamese labels. No abstract diagrams.

    python scripts/make-kts10-quoting-visuals.py            # everything
    python scripts/make-kts10-quoting-visuals.py kts10-silent-failure

SEONGON only: Prosperous Blue carries the data, Future Green is the single
accent per figure. Real labels come from the live app (Kts10BgsxView.tsx,
Kts10KhungChiPhi.tsx, lib/kts10.ts); no prices, domains, or rate-card values.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from figure import (  # noqa: E402
    ACCENT, ACCENT_TEXT, BLUE, H, INK, MUTED, RULE, W,
    Plane, emit, lifted, slab, text, wrap,
)

ROOT = Path(__file__).resolve().parent.parent
COVERS = ROOT / "public" / "covers"
FIGS = ROOT / "public" / "figures" / "kts10-quoting"

DEFS = f"""  <defs>
    <linearGradient id="head" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{BLUE}"/>
      <stop offset="1" stop-color="#2f6bf6"/>
    </linearGradient>
    <linearGradient id="chip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a72f4"/>
      <stop offset="1" stop-color="{BLUE}"/>
    </linearGradient>
    <linearGradient id="plate" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.94"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.42"/>
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="7" stdDeviation="10" flood-color="#0b1a3a" flood-opacity="0.14"/>
    </filter>
  </defs>
"""


def kit(p: Plane):
    """0..1 surface-coordinate helpers on a plane."""

    def rect(a, b, c, d, fill=None, o=1.0, delay=0.0, stroke=None, cls="rise"):
        return slab(p, a, b, c, d, fill, o, delay, stroke, cls)

    def t(x, y, s, size=13, fill=MUTED, anchor="start", weight="400"):
        return text(p, x, y, s, size, fill, anchor, weight)

    def dotp(x, y, r, fill, o=1.0, delay=0.0, cls="pop"):
        cx, cy = p(x, y)
        return (f'<circle class="{cls}" cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}" '
                f'style="--o:{o};animation-delay:{delay:.2f}s"/>')

    return rect, t, dotp


def acct(p, x0, y0, x1, y1, delay, o=1.0):
    """A Future-Green fill on the plane (the single accent, fills only)."""
    return slab(p, x0, y0, x1, y1, ACCENT, o, delay, cls="pop")


# ------------------------------------------------------------ shared chrome

TABS = ("Báo giá", "Giải trình", "Chủ đề", "Đối thủ", "Cam kết", "Từ khoá", "Giả định")

# 9 deterministic steps, real labels from lib/kts10.ts (simple_mode).
STEPS = ("Đầu vào", "Soát bộ từ khoá", "Đọc bảng xếp hạng", "Chọn đối thủ",
         "Gom cụm", "Ước KPI", "Đo offpage", "Tính content", "Lắp bảng chi phí")


def topbar(rect, t, x0, x1, y0, delay, active=0):
    """The workbench title bar + centred tab strip."""
    out = [rect(x0, y0, x1, y0 + 0.052, "url(#head)", 1, delay),
           t(x0 + 0.014, y0 + 0.036, "Báo giá sản xuất SEO", 12, "#ffffff", weight="600")]
    # run + assistant buttons on the right of the header
    out.append(rect(x1 - 0.20, y0 + 0.011, x1 - 0.115, y0 + 0.042, "#ffffff", 0.18, delay + 0.02))
    out.append(t(x1 - 0.1575, y0 + 0.033, "Chạy tất định", 8.5, "#ffffff", "middle"))
    out.append(rect(x1 - 0.105, y0 + 0.011, x1 - 0.014, y0 + 0.042, "#ffffff", 0.28, delay + 0.02))
    out.append(t(x1 - 0.0595, y0 + 0.033, "Trợ lý", 8.5, "#ffffff", "middle"))
    # tab strip
    ty = y0 + 0.052
    tw = (x1 - x0) / len(TABS)
    for i, tab in enumerate(TABS):
        cx = x0 + tw * (i + 0.5)
        on = (i == active)
        if on:
            out.append(rect(x0 + i * tw + 0.006, ty + 0.006, x0 + (i + 1) * tw - 0.006,
                            ty + 0.044, BLUE, 0.10, delay + 0.05 + i * 0.01))
        out.append(text_at(rect, t, cx, ty + 0.033, tab, 10 if on else 9.5,
                           INK if on else MUTED, "600" if on else "400"))
    return "".join(out), ty + 0.05


def text_at(rect, t, x, y, s, size, fill, weight):
    return t(x, y, s, size, fill, "middle", weight)


# --------------------------------------------------------------------- cover
#
# The cover is the workbench mid-run: the agent in its rail has just written a
# number into the cost table, one cell still filling. The single accent is the
# green "deterministic" provenance dots that say which numbers the machine owns.

def cover():
    p = Plane(600, 336, 1128, 520, umax=1, vmax=1)
    rect, t, dotp = kit(p)
    m = [f'<polygon class="rise" points="{p.quad(-0.02, -0.03, 1.02, 1.03)}" '
         f'fill="url(#plate)" filter="url(#soft)" style="--o:1;animation-delay:0s"/>']

    head, ty = topbar(rect, t, 0.02, 0.72, 0.03, 0.04, active=0)
    m.append(head)

    # cost table on the left: "BGSX - chỉnh trực tiếp trên bảng"
    m.append(t(0.045, ty + 0.03, "BGSX", 11, INK, weight="600"))
    m.append(t(0.115, ty + 0.03, "chỉnh trực tiếp trên bảng", 9, MUTED))
    cols = (("Hạng mục", 0.045, "start"), ("SL", 0.40, "end"),
            ("Đơn giá", 0.52, "end"), ("CP tối thiểu", 0.635, "end"), ("CP tối đa", 0.71, "end"))
    hy = ty + 0.055
    m.append(rect(0.03, hy, 0.72, hy + 0.032, "#f0f4f9", 1, 0.10))
    for lab, x, an in cols:
        m.append(t(x, hy + 0.022, lab, 8.5, MUTED, an, "600"))
    # editable header tint on SL/Đơn giá
    m.append(rect(0.36, hy, 0.565, hy + 0.032, BLUE, 0.06, 0.11))
    rows = (("Content", None, True, "green"),
            ("Bài Blog viết mới", "62", False, "green"),
            ("Bài sản phẩm", "28", False, "green"),
            ("Offpage (booking)", None, True, "blue"),
            ("Link Guestpost", "•", False, "blue"),
            ("Kỹ thuật", None, True, "green"),
            ("Nhân sự", None, True, "amber"))
    ry = hy + 0.032
    rh = 0.052
    for i, (label, sl, group, src) in enumerate(rows):
        y = ry + i * rh
        d = 0.16 + i * 0.05
        if group:
            m.append(rect(0.03, y, 0.72, y + rh, "#f6f8fb", 1, d))
        # provenance dot
        col = {"green": ACCENT, "blue": BLUE, "amber": "#e0a000"}[src]
        m.append(dotp(0.038, y + rh / 2, 3.4, col, 1, d + 0.02,
                      cls="pop" if src == "green" else "rise"))
        m.append(t(0.058, y + rh / 2 + 0.012, label, 9.5 if not group else 10,
                   INK, weight="600" if group else "400"))
        if sl and sl != "•":
            # a filled number, monospace feel via right align
            m.append(t(0.40, y + rh / 2 + 0.012, sl, 9.5, INK, "end"))
            m.append(rect(0.47, y + 0.014, 0.565, y + rh - 0.014, BLUE, 0.16, d + 0.04))
            m.append(rect(0.60, y + 0.016, 0.715, y + rh - 0.016, MUTED, 0.14, d + 0.05))
        m.append(rect(0.03, y + rh - 0.002, 0.72, y + rh, RULE, 0.7, d))
    # the offpage line: still filling (skeleton shimmer) -> the live write
    fy = ry + 4 * rh
    m.append(rect(0.06, fy + 0.016, 0.36, fy + rh - 0.016, BLUE, 0.10, 0.9, cls="type"))
    # total row
    tly = ry + 7 * rh + 0.006
    m.append(rect(0.03, tly, 0.72, tly + 0.05, BLUE, 0.09, 0.9))
    m.append(t(0.058, tly + 0.033, "TỔNG BGSX", 11, INK, weight="700"))
    m.append(rect(0.56, tly + 0.014, 0.715, tly + 0.038, BLUE, 0.6, 0.94, cls="pop"))

    # agent rail on the right
    m.append(rect(0.735, 0.03, 0.98, 0.965, "#ffffff", 1, 0.10, RULE, cls="rise"))
    m.append(rect(0.735, 0.03, 0.98, 0.082, "#f6f8fb", 1, 0.11))
    m.append(t(0.752, 0.064, "Agent báo giá", 10.5, INK, weight="600"))
    m.append(rect(0.775, 0.11, 0.965, 0.20, "url(#chip)", 1, 0.5, cls="rise"))
    m.append(t(0.955, 0.152, "chọn đối thủ: bỏ 4 site", 8.5, "#ffffff", "end"))
    m.append(t(0.955, 0.178, "không phải đối thủ", 8.5, "#ffffff", "end"))
    m.append(rect(0.752, 0.23, 0.93, 0.335, "#f2f4f9", 1, 0.56, cls="rise"))
    m.append(t(0.766, 0.276, "đã lắp bảng chi phí,", 8.5, MUTED))
    m.append(t(0.766, 0.303, "9/9 bước xong.", 8.5, MUTED))
    m.append(rect(0.775, 0.36, 0.965, 0.45, "url(#chip)", 1, 0.62, cls="rise"))
    m.append(t(0.955, 0.402, "kiểm bất biến: mọi số", 8.5, "#ffffff", "end"))
    m.append(t(0.955, 0.428, "có mặt trước khi trình", 8.5, "#ffffff", "end"))
    m.append(rect(0.752, 0.88, 0.965, 0.945, "#ffffff", 1, 0.7, RULE, cls="rise"))
    m.append(t(0.766, 0.918, "nhắn cho agent…", 8.5, MUTED))

    return wrap(DEFS + lifted("".join(m)))


# ------------------------------------------------------- fig: the stepper (arch)
#
# The nine deterministic steps as the app actually draws them: chips with a
# status dot, one step holding the single model call. State lives in the rows
# it writes, not in the chat.

def kts10_pipeline():
    p = Plane(600, 340, 1052, 520, umax=1, vmax=1)
    rect, t, dotp = kit(p)
    m = [f'<rect x="0" y="0" width="{W}" height="{H}" fill="none"/>']

    m.append(rect(0.03, 0.06, 0.97, 0.16, "#ffffff", 1, 0.02, RULE, cls="rise"))
    m.append(t(0.05, 0.122, "Tiến độ", 13, INK, weight="600"))
    m.append(t(0.13, 0.122, "9/9 bước · một tên miền", 11.5, MUTED))

    # nine step chips across two rows
    cols = 5
    cw, chh = 0.176, 0.135
    x0, y0 = 0.045, 0.24
    for i, name in enumerate(STEPS):
        r, c = divmod(i, cols)
        x = x0 + c * (cw + 0.008)
        y = y0 + r * (chh + 0.055)
        model = (i == 3)  # "Chọn đối thủ" is the one model call
        d = 0.06 + i * 0.04
        m.append(rect(x, y, x + cw, y + chh, "#ffffff", 1, d, BLUE if model else RULE, cls="rise"))
        # status dot: green check for done
        if model:
            m.append(dotp(x + 0.024, y + 0.038, 5.0, BLUE, 1, d + 0.02))
            m.append(t(x + 0.024, y + 0.042, "◆", 8, "#ffffff", "middle"))
        else:
            m.append(dotp(x + 0.024, y + 0.038, 5.0, ACCENT, 1, d + 0.02, cls="pop"))
            m.append(t(x + 0.024, y + 0.043, "✓", 8, ACCENT_TEXT, "middle", "700"))
        m.append(t(x + 0.046, y + 0.045, f"{i + 1}", 10, MUTED, weight="600"))
        m.append(t(x + 0.014, y + 0.092, name, 11, INK, weight="500"))
        # a written-row hint at the bottom of each chip
        m.append(rect(x + 0.014, y + 0.108, x + cw - 0.02, y + 0.118, MUTED, 0.22, d + 0.04))
        if i < len(STEPS) - 1 and c < cols - 1:
            ax0, ay = p(x + cw, y + chh / 2)
            ax1, _ = p(x + cw + 0.008, y + chh / 2)
            m.append(f'<line class="c" x1="{ax0:.1f}" y1="{ay:.1f}" x2="{ax1:.1f}" y2="{ay:.1f}" '
                     f'stroke="{BLUE}" stroke-opacity="0.4" stroke-width="1.5" '
                     f'style="--o:0.5;animation-delay:{d:.2f}s"/>')

    m.append(t(0.32, 0.40, "một bước gọi mô hình", 10.5, ACCENT_TEXT, "middle", "500"))

    # the writes land in one table
    m.append(rect(0.045, 0.74, 0.60, 0.83, "#f6f8fb", 1, 0.5, RULE, cls="rise"))
    m.append(t(0.065, 0.80, "kts10.quote_stages · mỗi bước một dòng", 11, MUTED))
    m.append(t(0.64, 0.80, "8/9 là script thuần, không mô hình nào chạm số", 12, INK, weight="500"))

    m.append(t(0.50, 0.955,
               "chín bước tất định; trạng thái nằm ở các dòng chúng ghi, không phải trong hội thoại",
               13, MUTED, "middle"))
    return wrap(DEFS + lifted("".join(m)))


# ------------------------------------------------ fig: the silent failure
#
# The real cost table, marked done, with the whole Offpage block gone. The one
# accent is a green "9/9 done" flag on a run that shipped a wrong number.

def kts10_silent_failure():
    p = Plane(600, 340, 1052, 520, umax=1, vmax=1)
    rect, t, dotp = kit(p)
    m = [f'<rect x="0" y="0" width="{W}" height="{H}" fill="none"/>']

    m.append(rect(0.05, 0.05, 0.95, 0.90, "#ffffff", 1, 0.02, RULE, cls="rise"))
    m.append(rect(0.05, 0.05, 0.95, 0.125, "url(#head)", 1, 0.03))
    m.append(t(0.072, 0.10, "BGSX · chỉnh trực tiếp trên bảng", 12.5, "#ffffff", weight="600"))
    # a green "done" flag: the run that shipped
    m.append(rect(0.78, 0.066, 0.93, 0.11, ACCENT, 0.9, 0.9, cls="pop"))
    m.append(t(0.855, 0.098, "9/9 · xong", 10, ACCENT_TEXT, "middle", "700"))

    cols = (("Hạng mục", 0.09, "start"), ("SL", 0.52, "end"),
            ("Đơn giá", 0.63, "end"), ("CP tối thiểu", 0.78, "end"), ("CP tối đa", 0.90, "end"))
    hy = 0.145
    m.append(rect(0.05, hy, 0.95, hy + 0.05, "#f0f4f9", 1, 0.10))
    for lab, x, an in cols:
        m.append(t(x, hy + 0.033, lab, 9.5, MUTED, an, "600"))

    rows = (("Content", "", False, "green"),
            ("Bài Blog viết mới", "62", True, "green"),
            ("Bài sản phẩm", "28", True, "green"),
            ("Offpage (booking)", "GONE", False, "blue"),
            ("Kỹ thuật", "", False, "green"),
            ("Nhân sự", "", False, "green"))
    ry = hy + 0.05
    rh = 0.083
    for i, (label, sl, filled, src) in enumerate(rows):
        y = ry + i * rh
        d = 0.14 + i * 0.06
        gone = (sl == "GONE")
        if gone:
            m.append(rect(0.05, y, 0.95, y + rh, "#fbeceb", 0.7, d))
        elif label in ("Content", "Kỹ thuật", "Nhân sự"):
            m.append(rect(0.05, y, 0.95, y + rh, "#f6f8fb", 1, d))
        col = {"green": ACCENT, "blue": BLUE, "amber": "#e0a000"}[src]
        if not gone:
            m.append(dotp(0.062, y + rh / 2, 3.6, col, 1, d + 0.02,
                          cls="pop" if src == "green" else "rise"))
        m.append(t(0.082, y + rh / 2 + 0.012, label, 11, INK,
                   weight="600" if not filled else "400"))
        if filled:
            m.append(t(0.52, y + rh / 2 + 0.012, sl, 11, INK, "end"))
            m.append(rect(0.56, y + 0.022, 0.665, y + rh - 0.022, BLUE, 0.16, d + 0.04))
            m.append(rect(0.70, y + 0.024, 0.90, y + rh - 0.024, MUTED, 0.14, d + 0.05))
        if gone:
            # the vanished block: a dashed placeholder where cells should be
            gx0, gy = p(0.30, y + rh / 2)
            gx1, _ = p(0.90, y + rh / 2)
            m.append(f'<line class="c" x1="{gx0:.1f}" y1="{gy:.1f}" x2="{gx1:.1f}" y2="{gy:.1f}" '
                     f'stroke="{MUTED}" stroke-width="1.4" stroke-dasharray="6 5" '
                     f'style="--o:0.4;animation-delay:{d + 0.05:.2f}s"/>')
        m.append(rect(0.05, y + rh - 0.002, 0.95, y + rh, RULE, 0.7, d))

    # total still computes, still looks clean
    tly = ry + 6 * rh
    m.append(rect(0.05, tly, 0.95, tly + 0.058, BLUE, 0.09, 0.86))
    m.append(t(0.082, tly + 0.04, "TỔNG BGSX", 12, INK, weight="700"))
    m.append(rect(0.72, tly + 0.016, 0.90, tly + 0.044, BLUE, 0.55, 0.9, cls="pop"))

    m.append(t(0.50, 0.955,
               "một khối biến mất, không lỗi, không cảnh báo; tổng vẫn ra và trông sạch",
               13, MUTED, "middle"))
    return wrap(DEFS + lifted("".join(m)))


# ------------------------------------------------ fig: traceability (glass box)
#
# "Diễn giải & chỉnh": one number, its derivation chain, and the three-colour
# provenance legend. Here three colours are the subject, so they earn their place.

def kts10_traceability():
    p = Plane(600, 340, 1012, 500, umax=1, vmax=1)
    rect, t, dotp = kit(p)
    m = [f'<rect x="0" y="0" width="{W}" height="{H}" fill="none"/>']

    m.append(rect(0.06, 0.05, 0.94, 0.90, "#ffffff", 1, 0.02, RULE, cls="rise"))
    m.append(t(0.085, 0.115, "Diễn giải & chỉnh", 13, INK, weight="600"))
    m.append(t(0.30, 0.115, "vì sao con số này", 11, MUTED))
    m.append(t(0.915, 0.115, "↗", 15, ACCENT_TEXT, "end"))

    # the derivation chain: nodes joined by a vertical connector
    chain = (("Cam kết 62% = đang có 41% cộng phần tăng", "mục tiêu cam kết", "Bước 6 · Ước KPI"),
             ("Đang có 41% = 128 trên 312 từ khoá", "đếm thẳng từ kết quả Google", "Bước 3 · Đọc bảng xếp hạng"),
             ("Số bài = MAX(3 cách ước lượng)", "tránh ước lượng thiếu", "Bước 8 · Tính content"))
    cx = 0.13
    y0 = 0.20
    ny = 0.19
    lx, ly0 = p(cx, y0 + 0.02)
    lx2, ly1 = p(cx, y0 + (len(chain) - 1) * ny + 0.02)
    m.append(f'<line class="c" x1="{lx:.1f}" y1="{ly0:.1f}" x2="{lx2:.1f}" y2="{ly1:.1f}" '
             f'stroke="{BLUE}" stroke-opacity="0.35" stroke-width="1.6" '
             f'style="--o:0.5;animation-delay:0.1s"/>')
    for i, (expr, why, link) in enumerate(chain):
        y = y0 + i * ny
        d = 0.12 + i * 0.08
        last = (i == len(chain) - 1)
        m.append(dotp(cx, y + 0.02, 5.2, MUTED if last else "#ffffff", 1, d + 0.02))
        if not last:
            m.append(dotp(cx, y + 0.02, 5.2, "#ffffff", 1, d + 0.02))
            m.append(f'<circle cx="{p(cx, y + 0.02)[0]:.1f}" cy="{p(cx, y + 0.02)[1]:.1f}" '
                     f'r="5.2" fill="none" stroke="{BLUE}" stroke-width="1.6"/>')
        m.append(t(cx + 0.03, y + 0.006, expr, 12, INK, weight="500"))
        m.append(t(cx + 0.03, y + 0.052, why, 10.5, MUTED))
        m.append(t(cx + 0.03, y + 0.095, f"↳ {link}", 10.5, ACCENT_TEXT, weight="500"))

    # the three-colour provenance legend: the subject of this figure
    ly = 0.80
    m.append(rect(0.06, ly - 0.03, 0.94, ly + 0.06, "#f6f8fb", 1, 0.5))
    legend = (("phép tính tất định", ACCENT, ACCENT_TEXT), ("agent phán đoán", BLUE, BLUE),
              ("người chạy chốt", "#e0a000", "#8a6b00"))
    lxp = 0.10
    for i, (label, dot, ink) in enumerate(legend):
        m.append(dotp(lxp, ly + 0.012, 4.5, dot, 1, 0.58 + i * 0.06,
                      cls="pop" if i == 0 else "rise"))
        m.append(t(lxp + 0.022, ly + 0.024, label, 11, INK))
        lxp += 0.30

    m.append(t(0.50, 0.955,
               "mỗi số truy được về công thức và bước nguồn, và ai đã tạo ra nó",
               13, MUTED, "middle"))
    return wrap(DEFS + lifted("".join(m)))


COVER_FIGS = {"a-wrong-quote-that-looks-like-a-right-one": cover}
SLIDE_FIGS = {
    "kts10-pipeline": kts10_pipeline,
    "kts10-silent-failure": kts10_silent_failure,
    "kts10-traceability": kts10_traceability,
}


if __name__ == "__main__":
    argv = sys.argv[1:]
    cov = [s for s in argv if s in COVER_FIGS] or (list(COVER_FIGS) if not argv else [])
    sld = [s for s in argv if s in SLIDE_FIGS] or (list(SLIDE_FIGS) if not argv else [])
    rc = emit(COVER_FIGS, COVERS, cov) if cov else 0
    rc = emit(SLIDE_FIGS, FIGS, sld) or rc if sld else rc
    sys.exit(rc)
