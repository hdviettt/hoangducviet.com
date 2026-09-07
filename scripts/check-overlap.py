"""Tim cac nhan chu de len nhau trong moi hinh.

`check-figures.py` bat loi HINH HOC — muc tran ra ngoai viewBox. No khong bat
duoc loi kia: hai nhan chu dat dung trong khung nhung dam vao nhau, doc ra mot
dong ky tu chong nhau. Loi do chi lo ra khi nhin, va co 105 hinh de nhin.

Cach do: doc lai chinh SVG da phat ra, lay moi <text>, dung ra mot hop chu
xap xi tu x/y/font-size/text-anchor, roi bao moi cap hop giao nhau qua nguong.
Chu rong bao nhieu thi khong doc duoc tu SVG, nen uoc luong theo he so be
rong trung binh cua DM Sans va JetBrains Mono — du chinh xac de bat mot cau
dai nam de len mot caption, va du long de khong keu vi hai chu cach nhau 2px.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# be rong trung binh mot ky tu, tinh theo font-size
ADV_SANS = 0.512
ADV_MONO = 0.600
# phan chieu cao that su co muc, tren va duoi baseline
ASC = 0.74
DESC = 0.20
# hai hop phai giao nhau it nhat ngan nay theo ca hai chieu moi bi bao
MIN_OVERLAP_X = 2.0
MIN_OVERLAP_Y = 1.5

TEXT_RE = re.compile(r"<text\b([^>]*)>(.*?)</text>", re.S)
ATTR_RE = re.compile(r'([a-z-]+)="([^"]*)"')


def boxes(svg):
    out = []
    for attrs, body in TEXT_RE.findall(svg):
        a = dict(ATTR_RE.findall(attrs))
        if "x" not in a or "y" not in a:
            continue
        x = float(a["x"])
        y = float(a["y"])
        size = float(re.sub(r"[^0-9.]", "", a.get("font-size", "12")))
        mono = "Mono" in a.get("font-family", "")
        # nhan xoay khong the so bang hop truc toa do — bo qua
        if "rotate" in a.get("transform", ""):
            continue
        body = re.sub(r"<[^>]+>", "", body)
        body = (body.replace("&amp;", "&").replace("&lt;", "<")
                .replace("&gt;", ">").replace("&quot;", '"'))
        if not body.strip():
            continue
        w = len(body) * size * (ADV_MONO if mono else ADV_SANS)
        anchor = a.get("text-anchor", "start")
        x0 = x - w / 2 if anchor == "middle" else (x - w if anchor == "end"
                                                  else x)
        out.append({"x0": x0, "x1": x0 + w, "y0": y - size * ASC,
                    "y1": y + size * DESC, "t": body.strip(), "s": size})
    return out


def outside(svg, width=640):
    """Nhan chu nam vuot ra ngoai be ngang cua hinh.

    Day la lo hong cua ca hai bo kiem tra cu. `check-figures.py` do MUC nam
    ngoai viewBox, nhung hinh trong bai co width="100%", nen chu tran ra bi
    trinh duyet cat truoc khi do — hop do khong bao gio rong ra. Con
    `clashes()` thi chi so hai nhan voi nhau. Ket qua la mot dong chu bi cat
    cut ba lan lot qua ca hai cua, va chi lo ra khi nhin.
    """
    m = re.search(r'viewBox="0 0 ([\d.]+)', svg)
    if m:
        width = float(m.group(1))
    out = []
    for x in boxes(svg):
        if x["x1"] > width + 1:
            out.append((round(x["x1"] - width, 1), "phai", x["t"]))
        elif x["x0"] < -1:
            out.append((round(-x["x0"], 1), "trai", x["t"]))
    return out


def clashes(svg):
    bs = boxes(svg)
    bad = []
    for i in range(len(bs)):
        for j in range(i + 1, len(bs)):
            p, q = bs[i], bs[j]
            ox = min(p["x1"], q["x1"]) - max(p["x0"], q["x0"])
            oy = min(p["y1"], q["y1"]) - max(p["y0"], q["y0"])
            if ox > MIN_OVERLAP_X and oy > MIN_OVERLAP_Y:
                bad.append((round(ox, 1), round(oy, 1), p["t"], q["t"]))
    return bad


def main():
    total = 0
    # `_figures.json` la { slug: [svg, ...] }; `_search-figures.json` la
    # { slug: [{src, svg}, ...] }. Ca hai deu la hinh se len trang, nen ca
    # hai deu phai qua cung mot cua.
    for name in ("_figures.json", "_search-figures.json"):
        path = ROOT / "scripts" / name
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        for slug, arr in data.items():
            for i, item in enumerate(arr):
                svg = item["svg"] if isinstance(item, dict) else item
                for ox, oy, a, b in clashes(svg):
                    total += 1
                    print(f"{slug}#{i}  de nhau {ox}x{oy}px  "
                          f"{a[:40]!r} <> {b[:40]!r}")
                for over, side, txt in outside(svg):
                    total += 1
                    print(f"{slug}#{i}  tran {side} {over}px  {txt[:52]!r}")
    for d in ("public/figures", "public/work", "public/covers"):
        for f in sorted((ROOT / d).glob("*.svg")):
            svg = f.read_text(encoding="utf-8")
            for ox, oy, a, b in clashes(svg):
                total += 1
                print(f"{d}/{f.name}  de nhau {ox}x{oy}px  "
                      f"{a[:40]!r} <> {b[:40]!r}")
            for over, side, txt in outside(svg):
                total += 1
                print(f"{d}/{f.name}  tran {side} {over}px  {txt[:52]!r}")
    print(f"\n{total} cho hong (chu de nhau, hoac chu tran ra ngoai khung)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
