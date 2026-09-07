"""Bay hinh cua bai "An agent platform for SEONGON", ve tay.

Chung nam trong bai qua the <img> chu khong phai khoi ```render```, va do la
co y: alt cua the <img> duoc render thanh chu thich duoi hinh. Doi sang khoi
render se mat het bay cau chu thich do.

Vi la tai lieu doc lap, chung khong doc duoc bien CSS cua trang — nhung doc
duoc `prefers-color-scheme` cua chinh minh, nen `figure_file_svg` dat mau bang
mot khoi <style> va khong ve nen.

    python scripts/make-platform-figures.py
"""

from pathlib import Path

from doodle import (
    SW, arrow, check, chip, dot, figure_file_svg, rect, seg, sheet, spark,
    text,
)

OUT = Path(__file__).resolve().parent.parent / "public" / "figures"
W = 900


def box(x, y, w, h, title, sub=None, strong=False, r=8, dash=None):
    b = [rect(x, y, w, h, 0.95 if strong else 0.55,
              SW * (1.5 if strong else 1.0), r=r, dash=dash,
              fill="0.05" if strong else None)]
    t = [text(x + w / 2, y + (h / 2 + 6 if not sub else h / 2 - 3), title, 14,
              0.95 if strong else 0.88, 500 if strong else 400,
              anchor="middle")]
    if sub:
        t.append(text(x + w / 2, y + h / 2 + 17, sub, 11.5, 0.52,
                      anchor="middle"))
    return "".join(b), "".join(t)


def primitives():
    """Ba tu vung cua SDK. Chi mot trong ba la thu cong ty thuc su tich luy —
    nen no la o duy nhat ve dam."""
    b, t = [], []
    t.append(text(0, 16, "ONE TASK, IN THE SDK'S VOCABULARY", 12, 0.42, 500))
    parts = (("Agent", "the adapter",
              ("A thin layer that lets a model use",
               "the other two. Delete it and the",
               "work itself still survives."),
              "agents/publish-article.md", "19 in production, optional",
              False),
             ("Skill", "the asset",
              ("The steps, the standards, the",
               "judgment points. The thing the",
               "company is actually accumulating."),
              "skills/wp-publish/SKILL.md", "63 in the repo", True),
             ("Tool", "the reach",
              ("One crude connector to one",
               "outside system. It knows nothing",
               "about the work."),
              "Google Docs, WordPress, Ahrefs", "21 connectors", False))
    for i, (name, role, lines, path, count, hero) in enumerate(parts):
        x = i * 306
        b.append(rect(x, 40, 288, 214, 0.95 if hero else 0.5,
                      SW * (1.7 if hero else 1.0), r=10,
                      fill="0.05" if hero else None))
        t.append(text(x + 24, 74, name, 19, 0.95 if hero else 0.88, 500))
        t.append(text(x + 24, 96, role, 12, 0.56))
        for j, line in enumerate(lines):
            t.append(text(x + 24, 130 + j * 20, line, 12.5, 0.82))
        t.append(text(x + 24, 208, path, 11, 0.62, mono=True))
        t.append(text(x + 24, 232, count, 11, 0.5))
        if i < 2:
            b.append(arrow(x + 290, x + 304, 148, 0.55))
    t.append(text(0, 290, "Delete the agent and the work survives. Delete the "
                  "skill and there is nothing left.", 13.5, 0.65))
    return figure_file_svg("".join(b), "".join(t), W, 304)


def ownership():
    """Ai duoc sua cai gi. Bien gioi giua ba lop chinh la mot thu muc."""
    b, t = [], []
    t.append(text(0, 16, "WHO MAY EDIT WHAT", 12, 0.42, 500))
    for x, label in ((0, "LAYER"), (300, "WHERE IT LIVES"), (600, "OWNER")):
        t.append(text(x, 44, label, 10.5, 0.42, 500))
    b.append(seg(0, 54, W, 54, 0.25, SW * 0.8))
    rows = ((("Interface", "The surface an end user touches:",
              "a Lark bot, an internal web app."),
             ("interfaces/<name>/",), ("Champion", "owns the work itself"),
             False),
            (("Agent and Skill", "The job description and the know-how.",
              "Everything that decides how good it is."),
             (".claude/agents/<name>.md", ".claude/skills/<name>/"),
             ("Champion", "edits it with no engineer in the room"), True),
            (("System", "Runtime, database, auth, connectors, deploy.",
              "Built once, shared by every agent above."),
             ("core/   api/   tools/",), ("Platform team", None), False))
    for i, (left, where, owner, hero) in enumerate(rows):
        y = 84 + i * 92
        if hero:
            b.append(rect(-8, y - 26, W + 16, 80, 0.0, SW, fill="0.05", r=8))
        t.append(text(0, y, left[0], 14.5, 0.95 if hero else 0.88, 500))
        for j, line in enumerate(left[1:]):
            t.append(text(0, y + 22 + j * 18, line, 11.5, 0.56))
        for j, wl in enumerate(where):
            t.append(text(300, y + j * 20, wl, 11.5, 0.72, mono=True))
        t.append(text(600, y, owner[0], 13, 0.95 if hero else 0.6, 500))
        if owner[1]:
            t.append(text(600, y + 22, owner[1], 11, 0.56))
        if i < 2:
            b.append(seg(0, y + 56, W, y + 56, 0.14, SW * 0.7))
    return figure_file_svg("".join(b), "".join(t), W, 356)


def skill_folder():
    """Ben trong mot thu muc skill: phan model doc, phan model khong bao gio
    doc, va nguoi so huu ca hai."""
    b, t = [], []
    t.append(text(0, 16, "INSIDE ONE SKILL FOLDER", 12, 0.42, 500))
    b.append(rect(0, 40, 300, 250, 0.55, SW * 1.2, r=10))
    t.append(text(20, 70, "skills/wp-publish/", 13.5, 0.8, 500, mono=True))
    items = (("SKILL.md", 0, True), ("scripts/", 0, False),
             ("prep_doc.py", 1, False), ("process_images.py", 1, False),
             ("publish_run.py", 1, False), ("references/", 0, False))
    for i, (name, depth, read) in enumerate(items):
        y = 104 + i * 28
        t.append(text(24 + depth * 22, y, name, 12.5, 0.85 if read else 0.55,
                      500 if read else 400, mono=True))
    b.append(seg(310, 96, 350, 96, 0.4, SW))
    t.append(text(360, 78, "The model reads this", 13.5, 0.9, 500))
    for j, line in enumerate((
            "When the skill should trigger, the process",
            "step by step, and the contracts it must keep.")):
        t.append(text(360, 100 + j * 19, line, 12, 0.62))
    b.append(seg(310, 190, 350, 190, 0.4, SW, dash="6 6"))
    t.append(text(360, 172, "The model never reads this", 13.5, 0.6, 500))
    for j, line in enumerate((
            "Plain Python. Identical result every run, at",
            "zero tokens. Thirty-one of our 63 skills ship code.")):
        t.append(text(360, 194 + j * 19, line, 12, 0.62))
    t.append(text(0, 322, "A champion owns the whole folder. The person who "
                  "knows the work edits it,", 13, 0.65))
    t.append(text(0, 344, "and no platform code changes hands.", 13, 0.65))
    return figure_file_svg("".join(b), "".join(t), W, 358)


def request_sequence():
    """Mot yeu cau, theo dung thu tu. Sau ben tham gia, va dung mot ben tinh
    tien."""
    b, t = [], []
    t.append(text(0, 16, "ONE REQUEST, IN ORDER", 12, 0.42, 500))
    lanes = (("User", None), ("Interface", "Lark or web"),
             ("Runner", "plain Python"), ("Agent SDK", "the only paid one"),
             ("Tools and skills", "connectors, scripts"),
             ("Run history", "Postgres"))
    xs = []
    for i, (name, sub) in enumerate(lanes):
        x = 60 + i * 156
        xs.append(x)
        paid = name == "Agent SDK"
        b.append(rect(x - 66, 40, 132, 46, 0.95 if paid else 0.5,
                      SW * (1.5 if paid else 1.0), r=8,
                      fill="0.05" if paid else None))
        t.append(text(x, 60, name, 12, 0.95 if paid else 0.75, 500,
                      anchor="middle"))
        if sub:
            t.append(text(x, 76, sub, 10, 0.4, anchor="middle"))
        b.append(seg(x, 90, x, 356, 0.18, SW * 0.8, dash="5 7"))
    msgs = ((0, 1, "asks for something"), (1, 2, "start a run"),
            (2, 2, "reads agent.md, builds options"),
            (2, 3, "opens a session"), (3, 4, "calls a tool, runs a skill"),
            (4, 3, "result"), (3, 2, "events, output, token usage"),
            (2, 5, "writes steps, tokens, cost"), (2, 1, "result"),
            (1, 0, "answer and files"))
    for i, (a, c, label) in enumerate(msgs):
        y = 116 + i * 24
        if a == c:
            b.append(seg(xs[a], y, xs[a] + 34, y, 0.45, SW * 0.9))
            b.append(seg(xs[a] + 34, y, xs[a] + 34, y + 10, 0.45, SW * 0.9))
            b.append(arrow(xs[a] + 34, xs[a] + 2, y + 10, 0.45))
            t.append(text(xs[a] + 44, y - 4, label, 10.5, 0.66))
        else:
            b.append(arrow(xs[a], xs[c], y, 0.5))
            t.append(text((xs[a] + xs[c]) / 2, y - 7, label, 10.5, 0.72,
                          anchor="middle"))
    return figure_file_svg("".join(b), "".join(t), W, 372)


def encodings():
    """Cung mot quy trinh, hai cach ma hoa. Chi cach ma hoa doi; phan biet
    nghe duoc thi khong."""
    b, t = [], []
    t.append(text(0, 16, "ONE PROCEDURE, TWO ENCODINGS", 12, 0.42, 500))
    cols = (("Encoding A", "conversation-first",
             (("agent.md", "a thin adapter so a model can use the two below"),
              ("SKILL.md", "the procedure, written for a model to follow"),
              ("connectors", "Google Docs, WordPress")),
             "Runtime: the Claude Agent SDK. The model reads the",
             "steps and decides each one.", False),
            ("Encoding B", "app-first",
             (("agent.md", "deleted, nothing was left for it to decide"),
              ("publish_run.py", "the same steps, as Python the worker runs"),
              ("connectors", "the same two, untouched"),
              ("scan_patterns.py", "one model call per client, at setup")),
             "Right when every step stopped needing judgment.",
             "Variance ran out.", True))
    for i, (name, kind, rows, foot1, foot2, hero) in enumerate(cols):
        x = i * 470
        b.append(rect(x, 40, 430, 250, 0.95 if hero else 0.5,
                      SW * (1.6 if hero else 1.0), r=10,
                      fill="0.04" if hero else None))
        t.append(text(x + 22, 72, name, 16, 0.95 if hero else 0.88, 500))
        t.append(text(x + 22, 92, kind, 12, 0.45))
        for j, (fname, what) in enumerate(rows):
            y = 128 + j * 38
            gone = "deleted" in what
            t.append(text(x + 22, y, fname, 12.5, 0.35 if gone else 0.85,
                          500, mono=True))
            t.append(text(x + 22, y + 17, what, 11, 0.56))
            if gone:
                b.append(seg(x + 20, y - 4, x + 22 + len(fname) * 7.4, y - 4,
                             0.5, SW))
        t.append(text(x + 22, 262, foot1, 11, 0.5))
        t.append(text(x + 22, 278, foot2, 11, 0.5))
        if i == 0:
            b.append(arrow(436, 462, 165, 0.45))
    return figure_file_svg("".join(b), "".join(t), W, 302)


def where_it_runs():
    """Nen tang lam bang gi, va bao nhieu phan trong do that su goi model."""
    b, t = [], []
    t.append(text(0, 16, "WHAT THE PLATFORM IS MADE OF", 12, 0.42, 500))
    for i, (n, what, sub) in enumerate((("19", "agents",
                                         "one Markdown file each"),
                                        ("63", "skills",
                                         "31 of them ship Python"),
                                        ("21", "connectors",
                                         "never call a model"))):
        x = i * 150
        t.append(text(x, 74, n, 34, 0.95, 600))
        t.append(text(x + (56 if len(n) == 2 else 40), 74, what, 15, 0.7, 500))
        t.append(text(x, 96, sub, 11, 0.52))
    b.append(seg(0, 126, W, 126, 0.22, SW * 0.8))
    t.append(text(0, 154, "HOW THEY EXECUTE", 12, 0.42, 500))
    total = 103
    bx, bw = 0, W
    left = bw * 51 / total
    b.append(rect(bx, 172, left, 44, 0.95, SW * 1.5, r=6, fill="0.16"))
    b.append(rect(bx + left + 6, 172, bw - left - 6, 44, 0.5, SW, r=6))
    t.append(text(bx + 16, 200, "51 parts run with a model", 13, 0.95, 500))
    t.append(text(bx + left + 22, 200, "52 parts never do", 13, 0.6))
    t.append(text(bx + 16, 236, "judgment, conversation, drafting", 11, 0.56))
    t.append(text(bx + left + 22, 236, "scripts, connectors, orchestrators",
                  11, 0.56))
    t.append(text(0, 280, "Half the platform never invokes a model.", 15, 0.9,
                  500))
    return figure_file_svg("".join(b), "".join(t), W, 292)


def bill_of_materials():
    """Agent dau tien phai tra cho tat ca. Agent thu muoi chin chi phai tra cho
    hai dong cuoi."""
    b, t = [], []
    t.append(text(0, 16, "WHAT EACH AGENT HAD TO PAY FOR", 12, 0.42, 500))
    parts = ("Deploy pipeline and health checks",
             "Database schema and migrations", "Auth, roles, admin surface",
             "Encrypted credential store", "Connectors to outside systems",
             "The SDK runner itself", "Run history and cost tracking",
             "Eval harness and gold cases", "Background worker queue")
    own = ("Its own job description", "Its own skill")
    for side in (0, 1):
        x = side * 470
        first = side == 0
        t.append(text(x, 52, "Agent #1" if first else "Agent #19", 16, 0.95,
                      500))
        t.append(text(x + 96, 52, "May" if first else "July", 12, 0.4))
        for i, part in enumerate(parts):
            y = 82 + i * 26
            if first:
                b.append(rect(x, y - 13, 400, 21, 0.55, SW * 0.95, r=4))
                t.append(text(x + 12, y + 2, part, 11.5, 0.76))
            else:
                t.append(text(x + 12, y + 2, part, 11.5, 0.22))
        if not first:
            b.append(rect(x, 68, 400, 240, 0.38, SW, r=8, dash="7 7"))
            t.append(text(x + 200, 330, "all of it, already standing", 12,
                          0.55, anchor="middle"))
            t.append(text(x + 200, 348, "built once, in May, for everyone "
                          "after", 11, 0.4, anchor="middle"))
        for i, part in enumerate(own):
            y = 322 + i * 30 if first else 372 + i * 30
            b.append(rect(x, y - 15, 400, 25, 0.95, SW * 1.5, r=5,
                          fill="0.08"))
            t.append(text(x + 12, y + 3, part, 12, 0.95, 500))
        if not first and i == 1:
            b.append(seg(x + 404, y - 3, x + 424, y - 3, 0.5, SW * 0.9))
        if not first:
            t.append(text(x + 400, 344, "the only new work", 11.5, 0.75, 500,
                          anchor="end"))
    t.append(text(0, 452, "A platform is not what makes agents possible. It is "
                  "what makes the twentieth one boring.", 14, 0.85, 500))
    return figure_file_svg("".join(b), "".join(t), W, 468)


FIGURES = {
    "platform-primitives": primitives,
    "platform-ownership": ownership,
    "platform-skill-folder": skill_folder,
    "platform-request-sequence": request_sequence,
    "platform-encodings": encodings,
    "platform-where-it-runs": where_it_runs,
    "platform-bill-of-materials": bill_of_materials,
}


def main():
    for name, fn in FIGURES.items():
        p = OUT / f"{name}.svg"
        p.write_text(fn(), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
