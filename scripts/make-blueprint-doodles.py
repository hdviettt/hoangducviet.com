"""Doodles for "An artifact-driven AI initiative blueprint".

Five of the seven images are redrawn. The two under "Evaluating existing
frameworks" are left alone: they are other people's diagrams, quoted as
evidence, and redrawing someone else's framework in my own hand would quietly
misrepresent it.

Two of the five are the same diagrams this post shares with "Why our AI team
failed" (the five things, and the three layers). They are re-emitted here
rather than imported, because each needs its own filter id: two copies of the
same id on one page and the second one silently adopts the first's definition.

Writes fences to scripts/_blueprint.json for the pusher to place.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from doodle import (SW, arrow, article_svg, chip, dot, person, rect, seg, text)

W = 640
SLUG = "an-artifact-driven-ai-initiative-blueprint"
figs = {}


def add(key, uid, strokes, labels, h):
    figs[key] = article_svg(f"{SLUG}-{uid}", strokes, labels, w=W, h=h)


# ------------------------------------------------------------ 1. the five things
rows = [
    ("A blueprint for the organisation", 1),
    ("Technology and data infrastructure", 2),
    ("Documented skills and competencies", 3),
    ("Individual capability with AI", 4),
    ("Middle management that can run it", 5),
]
st, lb = "", ""
bw, bh, gap = 330, 40, 12
for i, (label, n) in enumerate(rows):
    yy = 260 - i * (bh + gap)
    inset = i * 22
    # the bottom course is this post's whole subject, so it carries the weight
    st += rect(40 + inset, yy, bw - inset * 2, bh, 0.8 if i == 0 else 0.35, SW)
    lb += text(40 + inset + 16, yy + bh / 2 + 5, str(n), 15, 0.8 if i == 0 else 0.45, 600)
    lb += text(404, yy + bh / 2 + 5, label, 13, 0.85 if i == 0 else 0.45)
st += seg(30, 312, 610, 312, 0.20, SW * 0.8)
lb += text(40, 332, "this post is the bottom course", 12, 0.55, 500)
add("five-things", 0, st, lb, 348)


# ------------------------------------------------------------ 2. three layers
BANDS = [
    ("Value delivery chain", "what the company sells, in the abstract"),
    ("Operational process, as-is", "who does it today, and in how many passes"),
    ("Operational process, could-be", "the same value, redesigned around what AI can carry"),
]
st, lb = "", ""
for i in range(3):
    yy = 60 + i * 92
    st += seg(30, yy + 46, 610, yy + 46, 0.18, SW * 0.8)
    lb += text(40, yy, BANDS[i][0], 13, 0.8, 600)
    lb += text(40, yy + 20, BANDS[i][1], 12, 0.42)
    y = yy + 4
    if i == 0:
        for k in range(3):
            st += rect(300 + k * 104, y - 16, 78, 32, 0.5, SW)
            if k < 2:
                st += arrow(378 + k * 104, 404 + k * 104, y, 0.3)
    elif i == 1:
        for cx in (318, 356, 394):
            st += person(cx, y - 4, 11, 0.5)
        st += arrow(416, 448, y, 0.3)
        for cx in (470, 508):
            st += person(cx, y - 4, 11, 0.5)
        st += arrow(530, 562, y, 0.3)
    else:
        st += person(318, y - 4, 11, 0.5)
        st += arrow(340, 372, y, 0.3)
        st += rect(384, y - 18, 46, 34, 0.55, SW)
        st += dot(398, y - 4, 2.4, 0.6) + dot(416, y - 4, 2.4, 0.6)
        st += arrow(442, 474, y, 0.3)
st += seg(22, 56, 22, 290, 0.35, SW, dash="5 6")
lb += text(10, 322, "the blueprint is all three, read together", 12, 0.55, 500)
add("three-layers", 1, st, lb, 346)


# ------------------------------------------------------- 3. anatomy of an artifact
# A producer on the left, the artifact in the middle with the four things that
# make it definable, and the threshold it has to cross on the right. The point
# is the threshold: an artifact is only an artifact once it leaves.
st = person(66, 128, 15, 0.6)
st += arrow(96, 160, 132, 0.35)
st += rect(170, 60, 300, 150, 0.75, SW)
cs, ct = "", ""
for i, name in enumerate(("an owner", "a specification", "acceptance criteria", "a destination")):
    cx = 186 + (i % 2) * 140
    cy = 126 + (i // 2) * 42
    c = chip(cx, cy, 128, 30, name, 11, 0.5, 0.7)
    cs += c[0]
    ct += c[1]
st += cs
st += seg(496, 48, 496, 224, 0.35, SW, dash="5 6")
st += arrow(470, 492, 132, 0.35)
st += person(548, 104, 14, 0.55)
st += person(548, 172, 14, 0.55)
lb = (text(66, 168, "producer", 12, 0.6, 500, anchor="middle")
      + text(66, 186, "human, agent, or both", 11, 0.4, anchor="middle")
      + text(320, 92, "the artifact", 15, 0.85, 600, anchor="middle")
      + text(320, 112, "a keyword cluster list · a content plan · a quote", 11, 0.45, anchor="middle")
      + ct
      + text(496, 244, "the threshold", 11, 0.5, anchor="middle")
      + text(578, 108, "a teammate", 11, 0.5)
      + text(578, 176, "the client", 11, 0.5)
      + text(40, 280, "define the artifact precisely and the AI has a target,", 12, 0.55, 500)
      + text(40, 298, "however chaotic the making of it is", 12, 0.55, 500))
add("anatomy", 2, st, lb, 318)


# --------------------------------------------------------- 4. fog and solid
# Left: process, drawn as what it actually is - overlapping passes that double
# back. Right: the same work described by what it leaves behind.
st = rect(30, 56, 276, 186, 0.3, SW)
# a tangle: arcs that cross, so the eye cannot follow any single path
pts = [(70, 110), (150, 90), (230, 130), (110, 170), (200, 200), (260, 96), (90, 210)]
for i, (x0, y0) in enumerate(pts):
    st += dot(x0, y0, 4.2, 0.45)
    for j in (1, 3):
        x1, y1 = pts[(i + j) % len(pts)]
        st += seg(x0, y0, x1, y1, 0.16, SW * 0.75)
st += rect(334, 56, 276, 186, 0.55, SW)
for i in range(3):
    yy = 92 + i * 52
    st += rect(354, yy, 150, 36, 0.6, SW)
    if i < 2:
        st += seg(429, yy + 36, 429, yy + 52, 0.3, SW * 0.8, dash="4 5")
    st += seg(520, yy, 520, yy + 36, 0.3, SW * 0.8, dash="4 5")
lb = (text(168, 40, "mapping how people work", 12, 0.5, 500, anchor="middle")
      + text(472, 40, "mapping what they produce", 12, 0.75, 600, anchor="middle")
      + text(429, 114, "keyword clusters", 11, 0.6, anchor="middle")
      + text(429, 166, "content plan", 11, 0.6, anchor="middle")
      + text(429, 218, "published articles", 11, 0.6, anchor="middle")
      + text(472, 264, "each one crosses a threshold", 10, 0.4, anchor="middle")
      + text(168, 292, "processes are fog", 13, 0.5, 500, anchor="middle")
      + text(472, 292, "artifacts are solid", 13, 0.85, 600, anchor="middle"))
add("fog-solid", 3, st, lb, 312)


# ------------------------------------------------------- 5. nodes and edges
# Four well-specified nodes and three edges nobody specified. The gaps are the
# figure, so they are drawn as gaps rather than as arrows.
st, lb = "", ""
names = ("keyword clusters", "content plan", "articles written", "published")
for i, name in enumerate(names):
    x = 26 + i * 152
    st += rect(x, 84, 126, 52, 0.7, SW)
    lb += text(x + 63, 108, name, 11, 0.75, 600, anchor="middle")
    lb += text(x + 63, 126, "spec · owner · agent", 10, 0.4, anchor="middle")
    if i < 3:
        st += seg(x + 126, 110, x + 152, 110, 0.35, SW * 0.9, dash="3 6")
        lb += text(x + 139, 100, "?", 14, 0.7, 600, anchor="middle")
gaps = ("who hands off,\nwhen, in what state?",
        "where does context\ntravel between agents?",
        "who orchestrates\nthe human-agent team?")
for i, g in enumerate(gaps):
    x = 26 + 126 + i * 152 + 13
    for k, line in enumerate(g.split("\n")):
        lb += text(x, 168 + k * 16, line, 10, 0.55, anchor="middle")
lb += text(40, 48, "the nodes were specified; the edges between them were not", 13, 0.8, 600)
lb += text(40, 224, "artifacts are nodes. we under-designed the edges.", 12, 0.55, 500)
add("nodes-edges", 4, st, lb, 244)


out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_blueprint.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(figs, f)
print(f"wrote {len(figs)} figures to {out}")
for k, v in figs.items():
    print(f"  {k:14s} {len(v):6d} bytes")
