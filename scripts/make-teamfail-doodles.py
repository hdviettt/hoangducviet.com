"""Doodles for "Why our AI team failed".

Replaces eight black Excalidraw screenshots with drawings in the blog's own
language: one hue taken from the page, rough strokes, real type. The classroom
photo at the end stays a photo, because it is a photograph of a real room and
nothing is gained by drawing it.

The meaning of each original is kept; how it is drawn is not. The four-part
build of the three-layer diagram is kept as a build, because the prose walks
down it one layer at a time and a reader who meets all three at once has to
hold two of them in reserve.

Writes fences to scripts/_teamfail.json for the pusher to place.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from doodle import (SW, arrow, article_svg, chip, dot, person, rect, seg,
                    sheet, text)

W = 640
SLUG = "why-our-ai-team-failed"
figs = {}


def add(key, uid, strokes, labels, h):
    figs[key] = article_svg(f"{SLUG}-{uid}", strokes, labels, w=W, h=h)


# ---------------------------------------------------------------- 1. AI search
# Two search pages side by side. The right one grows an answer panel on top and
# pushes the ranked results down; the work needed to reach them grows with it.
def serp(x, y, w, h, overview):
    s = rect(x, y, w, h, 0.45, SW)
    s += rect(x + 14, y + 14, w - 28, 20, 0.30, SW * 0.85, r=10)
    top = y + 48
    if overview:
        s += rect(x + 14, top, w - 28, 66, 0.65, SW)
        for i in range(3):
            s += seg(x + 26, top + 18 + i * 15, x + w - 60 - i * 22, top + 18 + i * 15, 0.40, SW * 0.8)
        top += 80
    for i in range(3):
        yy = top + i * 34
        s += seg(x + 14, yy, x + 14 + 86, yy, 0.55, SW * 0.9)
        s += seg(x + 14, yy + 12, x + w - 34 - i * 18, yy + 12, 0.22, SW * 0.8)
    return s


st = serp(30, 56, 258, 232, False) + serp(352, 56, 258, 232, True)
st += arrow(300, 340, 172, 0.35)
lb = (text(30, 40, "before", 13, 0.55, 500)
      + text(352, 40, "after", 13, 0.55, 500)
      + text(159, 308, "one page of results", 12, 0.40, anchor="middle")
      + text(481, 308, "an answer first, results below it", 12, 0.40, anchor="middle")
      + text(320, 330, "same traffic target, a second job to do", 12, 0.55, 500, anchor="middle"))
add("ai-search", 0, st, lb, 348)


# ---------------------------------------------------------------- 2. five things
# A stack, not a pyramid. A pyramid says the top is the goal; a stack says each
# course carries the one above it, which is the claim being made.
rows = [
    ("A blueprint for the organisation", 1),
    ("Technology and data infrastructure", 2),
    ("Documented skills and competencies", 3),
    ("Individual capability with AI", 4),
    ("Middle management that can run it", 5),
]
st = ""
lb = ""
bw, bh, gap = 330, 40, 12
for i, (label, n) in enumerate(rows):
    yy = 260 - i * (bh + gap)
    inset = i * 22
    st += rect(40 + inset, yy, bw - inset * 2, bh, 0.55 if i == 0 else 0.42, SW)
    lb += text(40 + inset + 16, yy + bh / 2 + 5, str(n), 15, 0.55, 600)
    lb += text(404, yy + bh / 2 + 5, label, 13, 0.75 if i == 0 else 0.6)
st += seg(30, 312, 610, 312, 0.20, SW * 0.8)
lb += text(40, 332, "each course carries the one above it", 12, 0.45)
add("five-things", 1, st, lb, 348)


# ------------------------------------------------------- 3-6. the three layers
# Built up one band at a time, because the prose introduces them one at a time.
BANDS = [
    ("Value delivery chain", "what the company sells, in the abstract"),
    ("Operational process, as-is", "who actually does it today, and in how many passes"),
    ("Operational process, could-be", "the same value, redesigned around what AI can carry"),
]


def layer_row(y, kind):
    """The right-hand illustration for one band."""
    s = ""
    if kind == 0:                      # abstract boxes, chained
        for i in range(3):
            s += rect(300 + i * 104, y - 16, 78, 32, 0.5, SW)
            if i < 2:
                s += arrow(378 + i * 104, 404 + i * 104, y, 0.3)
    elif kind == 1:                    # many people, many passes
        for i, cx in enumerate((318, 356, 394)):
            s += person(cx, y - 4, 11, 0.5)
        s += arrow(416, 448, y, 0.3)
        for cx in (470, 508):
            s += person(cx, y - 4, 11, 0.5)
        s += arrow(530, 562, y, 0.3)
    else:                              # one person, one machine
        s += person(318, y - 4, 11, 0.5)
        s += arrow(340, 372, y, 0.3)
        s += rect(384, y - 18, 46, 34, 0.55, SW)
        s += dot(398, y - 4, 2.4, 0.6)
        s += dot(416, y - 4, 2.4, 0.6)
        s += arrow(442, 474, y, 0.3)
    return s


for count in (1, 2, 3):
    st, lb = "", ""
    for i in range(count):
        yy = 60 + i * 92
        st += seg(30, yy + 46, 610, yy + 46, 0.18, SW * 0.8)
        st += layer_row(yy + 4, i)
        lb += text(40, yy, BANDS[i][0], 13, 0.8, 600)
        lb += text(40, yy + 20, BANDS[i][1], 12, 0.42)
    if count == 3:
        st += seg(22, 56, 22, 290, 0.35, SW, dash="5 6")
        lb += text(10, 322, "the blueprint is all three, read together", 12, 0.55, 500)
    add(f"layers-{count}", 2 + count, st, lb,
        60 + count * 92 + (86 if count == 3 else 10))


# The overview that opens the section: the method's shape, before any content
# is poured into it. Image 3 and image 6 in the original both showed all three
# bands; one of them is better spent saying "there are three".
st, lb = "", ""
for i, (name, sub) in enumerate(BANDS):
    yy = 54 + i * 74
    st += rect(40, yy, 560, 54, 0.5 if i < 2 else 0.7, SW)
    lb += text(60, yy + 24, name, 13, 0.8, 600)
    lb += text(60, yy + 42, sub, 11, 0.42)
st += seg(22, 54, 22, 256, 0.35, SW, dash="5 6")
lb += text(10, 288, "three passes over the same business, top to bottom", 12, 0.5, 500)
add("layers-intro", 8, st, lb, 308)


# ------------------------------------------------- 7. infrastructure that fits
# A substrate with things standing on it, not a cloud diagram: the point of the
# section is that fifty people build on top of what a small team lays down.
st = rect(40, 40, 560, 74, 0.5, SW)
lb = text(56, 64, "what fifty people build", 13, 0.75, 600)
cs, ct = "", ""
for i, name in enumerate(("agents", "workflows", "dashboards", "one-off tools")):
    c = chip(56 + i * 132, 78, 118, 26, name, 11, 0.45, 0.65)
    cs += c[0]
    ct += c[1]
st += cs
lb += ct
st += seg(320, 114, 320, 142, 0.3, SW * 0.9, dash="4 5")
st += rect(40, 142, 560, 86, 0.6, SW)
lb += text(56, 166, "what the AI team lays down", 13, 0.75, 600)
cs, ct = "", ""
for i, name in enumerate(("hosting", "security", "observability", "data")):
    c = chip(56 + i * 132, 180, 118, 26, name, 11, 0.5, 0.7)
    cs += c[0]
    ct += c[1]
st += cs
lb += ct
st += seg(320, 228, 320, 256, 0.3, SW * 0.9, dash="4 5")
st += rect(160, 256, 320, 34, 0.4, SW)
lb += text(320, 277, "the company's own data and operations", 12, 0.6, anchor="middle")
lb += text(40, 316, "generic infrastructure fits a tutorial, not an agency", 12, 0.45)
add("infrastructure", 6, st, lb, 334)


# --------------------------------------------------- 8. the vocabulary problem
# Two speakers and one word that only one of them owns. The gap is the figure.
st = sheet(40, 54, 250, 104, 0.5)
st += person(360, 84, 14, 0.55)
st += sheet(350, 176, 250, 96, 0.5)
st += person(250, 206, 14, 0.55)
st += seg(300, 120, 330, 120, 0.3, SW * 0.9, dash="4 5")
st += seg(300, 212, 330, 212, 0.3, SW * 0.9, dash="4 5")
lb = (text(56, 84, "“Cluster these keywords", 13, 0.75)
      + text(56, 106, "semantically.”", 13, 0.75)
      + text(56, 138, "a request", 11, 0.4)
      + text(366, 206, "“What does semantically", 13, 0.75)
      + text(366, 228, "mean here?”", 13, 0.75)
      + text(366, 258, "the same word, no shared meaning", 11, 0.4)
      + text(40, 304, "a skill nobody has written down cannot be asked for", 12, 0.5, 500))
add("vocabulary", 7, st, lb, 324)


out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_teamfail.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(figs, f)
print(f"wrote {len(figs)} figures to {out}")
for k, v in figs.items():
    print(f"  {k:16s} {len(v):6d} bytes")
