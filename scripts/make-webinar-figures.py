"""Tam hinh cua bai webinar, ve tay.

Chung o lai dang file <img> vi ca tam deu co alt that, va alt duoc render
thanh chu thich duoi hinh. Doi sang khoi ```render``` la mat het tam cau do.

    python scripts/make-webinar-figures.py
"""

from pathlib import Path

from doodle import (
    SW, arrow, check, chip, dot, figure_file_svg, rect, seg, spark, text,
)

OUT = Path(__file__).resolve().parent.parent / "public" / "figures"
W = 900


def panel(x, y, w, h, hero=False, dash=None):
    return rect(x, y, w, h, 0.95 if hero else 0.45,
                SW * (1.6 if hero else 1.0), r=10,
                fill="0.04" if hero else None, dash=dash)


def three_shapes():
    """Cung mot viec, ba hinh dang. Thu duy nhat di chuyen la vi tri cua
    model."""
    b, t = [], []
    t.append(text(0, 18, "TASK: PUBLISH AN SEO ARTICLE", 12, 0.4, 500))
    cols = (("Workflow", "you write the steps, no model",
             (("Fetch the article list", False),
              ("Convert the content to HTML", False),
              ("Push to the CMS", False)), False),
            ("AI Workflow", "still your steps, a model does one",
             (("Fetch the article list", False),
              ("Convert the content to HTML", False),
              ("Write the meta description", True),
              ("Push to the CMS", False)), False),
            ("Agent", "you set the goal, it picks the steps",
             (("Publish this article well", None),), True))
    for i, (name, sub, steps, agent) in enumerate(cols):
        x = 4 + i * 300
        b.append(panel(x, 40, 284, 248, agent))
        t.append(text(x + 20, 70, name, 16, 0.95 if agent else 0.75, 500))
        t.append(text(x + 20, 90, sub, 11, 0.5))
        if agent:
            b.append(rect(x + 20, 108, 248, 36, 0.95, SW * 1.4, r=7,
                          fill="0.07"))
            t.append(text(x + 144, 131, steps[0][0], 12, 0.95, 500,
                          anchor="middle"))
            t.append(text(x + 144, 164, "IT DECIDES THE STEPS", 10.5, 0.55,
                          500, anchor="middle"))
            for k in range(3):
                b.append(rect(x + 34 + k * 78, 178, 62, 30, 0.5, SW, r=6,
                              dash="6 6"))
                t.append(text(x + 65 + k * 78, 198, "?", 13, 0.5,
                              anchor="middle"))
            b.append(spark(x + 40, 234, 9, 0.9, SW * 0.8))
            t.append(text(x + 56, 239, "reads the real result,", 10.5, 0.6))
            t.append(text(x + 56, 255, "then picks the next step", 10.5, 0.6))
            b.append(rect(x + 100, 264, 88, 22, 0.9, SW * 1.2, r=11))
            t.append(text(x + 144, 280, "done", 11, 0.9, 500,
                          anchor="middle"))
        else:
            for k, (step, model) in enumerate(steps):
                y = 112 + k * 42
                b.append(rect(x + 20, y, 248, 32, 0.95 if model else 0.5,
                              SW * (1.4 if model else 1.0), r=6,
                              fill="0.06" if model else None))
                if model:
                    b.append(spark(x + 38, y + 16, 8, 0.9, SW * 0.75))
                    t.append(text(x + 54, y + 21, step, 11.5, 0.95, 500))
                else:
                    t.append(text(x + 34, y + 21, step, 11.5, 0.6))
    return figure_file_svg("".join(b), "".join(t), W, 302)


def scale():
    """Mot nang luc o ba quy mo. Hai hang duoi cung moi la thu quyet dinh co
    nen xay hay khong."""
    b, t = [], []
    heads = (("One person", "1 user"), ("A department", "5 to 30 people"),
             ("The company", "many teams, hundreds"))
    cx = (300, 500, 700)
    for i, (name, sub) in enumerate(heads):
        t.append(text(cx[i], 24, name, 13, 0.9, 500, anchor="middle"))
        t.append(text(cx[i], 40, sub, 10.5, 0.42, anchor="middle"))
    b.append(seg(0, 52, W, 52, 0.28, SW * 0.9))
    groups = (("HOW IT RUNS",
               (("When does it run?", "when I open my laptop",
                 "on a schedule or a trigger", "continuously, self-triggering"),
                ("How does data get in?", "I paste it in",
                 "wired into the team's tools",
                 "many sources, with permissions"))),
              ("ACCOUNTABILITY AND CONTROL",
               (("Who answers when it is wrong?", "me", "the department head",
                 "the company, to clients and law"),
                ("How do you know it is good?", "I can tell by looking",
                 "a fixed set of cases to score",
                 "scored continuously, with alarms"),
                ("Do you know what it costs?", "a subscription",
                 "measured per run", "budgeted and attributed"))))
    y = 76
    for gi, (gname, rows) in enumerate(groups):
        hero = gi == 1
        if hero:
            b.append(rect(-8, y - 20, W + 16, len(rows) * 46 + 34, 0.0, SW,
                          fill="0.045", r=8))
        t.append(text(0, y, gname, 10.5, 0.85 if hero else 0.4, 500))
        y += 26
        for label, a, c, d in rows:
            t.append(text(0, y, label, 11.5, 0.75))
            for i, val in enumerate((a, c, d)):
                t.append(text(cx[i], y, val, 10.5, 0.55, anchor="middle"))
            y += 46
        y += 8
    return figure_file_svg("".join(b), "".join(t), W, y + 10)


def account_vs_platform():
    """Mot nguoi can mot tai khoan. Mot phong ban can ca lop ben duoi, va lop
    do xay mot lan roi dung chung."""
    b, t = [], []
    t.append(text(0, 18, "WHAT ONE PERSON NEEDS", 11, 0.4, 500))
    b.append(panel(4, 32, 296, 74))
    t.append(text(20, 60, "One chatbot account", 14, 0.8, 500))
    t.append(text(20, 80, "paid monthly, open it and go", 11, 0.5))
    t.append(text(20, 96, "nothing to build", 11, 0.5))
    t.append(text(0, 148, "WHAT A DEPARTMENT OR A COMPANY NEEDS", 11, 0.4,
                  500))
    jobs = (("WORKFLOW", "sync the price list"),
            ("AI WORKFLOW", "write the meta description"),
            ("AGENT", "publish an SEO article"))
    for i, (kind, job) in enumerate(jobs):
        x = i * 240
        b.append(rect(x, 164, 220, 56, 0.6, SW * 1.1, r=8))
        t.append(text(x + 16, 186, kind, 10, 0.5, 500))
        t.append(text(x + 16, 206, job, 12, 0.8))
    t.append(text(732, 196, "and many more", 11, 0.45))
    t.append(text(732, 212, "jobs after that", 11, 0.45))
    for i in range(3):
        b.append(seg(i * 240 + 110, 220, i * 240 + 110, 244, 0.35, SW * 0.9))
    b.append(panel(4, 248, W - 8, 168, hero=True))
    t.append(text(20, 274, "SHARED PLATFORM  ·  BUILT ONCE, REUSED BY EVERY "
                  "JOB", 11, 0.85, 500))
    cols = (("Data and tools", ("internal data sources",
                                "connectors to existing tools",
                                "context memory")),
            ("Where users click", ("a chat surface", "an internal app",
                                   "a bot in Lark")),
            ("Permissions and safety", ("who may see what",
                                        "guardrails when it breaks",
                                        "a human approver before publish")),
            ("Measurement and operations", ("logs and tracing",
                                            "quality scoring",
                                            "cost tracking")))
    for i, (name, items) in enumerate(cols):
        x = 20 + i * 220
        t.append(text(x, 302, name, 11.5, 0.9, 500))
        for k, item in enumerate(items):
            t.append(text(x, 324 + k * 22, item, 10.5, 0.55))
    return figure_file_svg("".join(b), "".join(t), W, 430)


def operating_blueprint():
    """Ba lop tren cung mot truc. Doc doc mot cot de thay mot chang doi ra
    sao — va chi lop thu ba moi noi chang nao dang goi model."""
    b, t = [], []
    t.append(text(0, 18, "READ DOWN A COLUMN, NOT ACROSS A ROW", 11, 0.4, 500))
    stages = (("Take the brief", "a brief", "Account", "meets the client",
               False),
              ("Keyword research", "a keyword set", "SEO exec",
               "filters by hand", True),
              ("Produce the content", "an article", "Writer and editor",
               "writes and revises", True),
              ("Publish", "a live page", "Technical SEO", "pastes into the CMS",
               False),
              ("Measure and report", "a report", "Account", "assembles a deck",
               False))
    cw = W / 5
    for i, (stage, out, who, how, model) in enumerate(stages):
        x = i * cw
        b.append(rect(x + 6, 40, cw - 12, 62, 0.6, SW * 1.1, r=8))
        t.append(text(x + cw / 2, 66, stage, 11.5, 0.85, 500,
                      anchor="middle"))
        t.append(text(x + cw / 2, 86, "out: " + out, 10, 0.45,
                      anchor="middle"))
        b.append(seg(x + cw / 2, 102, x + cw / 2, 126, 0.3, SW * 0.85))
        b.append(rect(x + 6, 126, cw - 12, 62, 0.45, SW, r=8))
        t.append(text(x + cw / 2, 150, who, 11, 0.7, 500, anchor="middle"))
        t.append(text(x + cw / 2, 170, how, 10, 0.45, anchor="middle"))
        b.append(seg(x + cw / 2, 188, x + cw / 2, 212, 0.3, SW * 0.85))
        b.append(rect(x + 6, 212, cw - 12, 58, 0.95 if model else 0.35,
                      SW * (1.5 if model else 0.95), r=8,
                      fill="0.06" if model else None,
                      dash=None if model else "6 6"))
        if model:
            b.append(spark(x + cw / 2, 234, 10, 0.95, SW * 0.8))
            t.append(text(x + cw / 2, 260, "a model earns its place", 10, 0.7,
                          anchor="middle"))
        else:
            t.append(text(x + cw / 2, 246, "code is enough", 10, 0.4,
                          anchor="middle"))
    for i, label in enumerate(("VALUE CHAIN — what the company sells",
                               "PROCESS AS-IS — who does it today",
                               "WHERE A MODEL BELONGS")):
        t.append(text(0, (32, 118, 204)[i], label, 9.5, 0.35, 500))
    return figure_file_svg("".join(b), "".join(t), W, 284)


def silent_failure():
    """Phan mem thuong bao cho ban biet no hong. Mot agent dua cho ban mot ket
    qua hoan chinh va tu tin, va no sai mot cach im lang."""
    b, t = [], []
    for side, (kind, when, what, wrong, items, loud) in enumerate((
            ("ORDINARY SOFTWARE", "ALERTED AT 09:12",
             "An error, at the moment it happens.",
             "Visible. Someone goes and fixes it.",
             ("The article did not publish.",
              "CMS connection failed. Code 502."), True),
            ("AI", "PUBLISHED AT 09:12",
             "A finished article, written with total confidence.",
             "Invisible until a reader or a client finds it.",
             ("A required section is missing.",
              "Nobody checked the figures.",
              "The voice is off-brand."), False))):
        x = side * 470
        b.append(panel(x, 32, 426, 264, hero=not loud))
        t.append(text(x + 20, 60, kind, 12, 0.9, 500))
        cb, ct = chip(x + 280, 44, 132, 24, when, 10, 0.6, 0.8)
        b.append(cb)
        t.append(ct)
        for i, line in enumerate(items):
            y = 96 + i * 26
            if loud:
                b.append(seg(x + 22, y - 5, x + 34, y + 7, 0.7, SW * 1.2))
                b.append(seg(x + 34, y - 5, x + 22, y + 7, 0.7, SW * 1.2))
            else:
                b.append(dot(x + 28, y + 1, 6, 0.5, hollow=True))
            t.append(text(x + 44, y + 5, line, 11.5, 0.75))
        t.append(text(x + 20, 206, "WHAT YOU GET", 9.5, 0.35, 500))
        t.append(text(x + 20, 226, what, 11.5, 0.7))
        t.append(text(x + 20, 256, "WHAT IS WRONG", 9.5, 0.35, 500))
        t.append(text(x + 20, 276, wrong, 11.5, 0.7))
    return figure_file_svg("".join(b), "".join(t), W, 310)


def start_from_output():
    """Dung ve cach nguoi ta lam viec. Ve thu ho tao ra. Cac buoc tu no roi
    ra."""
    b, t = [], []
    t.append(text(0, 18, "MAP WHAT PEOPLE PRODUCE, NOT HOW THEY WORK", 11,
                  0.4, 500))
    b.append(panel(4, 34, 426, 118))
    t.append(text(20, 58, "THE USUAL WAY", 10, 0.4, 500))
    for k in range(4):
        b.append(rect(20 + k * 66, 72, 54, 28, 0.4, SW, r=5))
    b.append(rect(20 + 4 * 66, 72, 54, 28, 0.4, SW, r=5, dash="5 5"))
    t.append(text(20 + 4 * 66 + 27, 92, "?", 13, 0.5, anchor="middle"))
    t.append(text(20, 122, "Lay out the steps first. Work out the output "
                  "later.", 11, 0.55))
    b.append(panel(466, 34, 426, 118, hero=True))
    t.append(text(490, 58, "THE WAY WE DO IT", 10, 0.6, 500))
    b.append(rect(490, 68, 96, 36, 0.95, SW * 1.5, r=7, fill="0.08"))
    t.append(text(538, 91, "the output", 11, 0.95, 500, anchor="middle"))
    for k in range(4):
        b.append(rect(608 + k * 66, 72, 54, 28, 0.6, SW, r=5))
    b.append(arrow(592, 604, 86, 0.5))
    t.append(text(490, 132, "Draw the output first. Then derive the steps it "
                  "needs.", 11, 0.6))
    t.append(text(0, 190, "FOUR QUESTIONS PER OUTPUT", 11, 0.4, 500))
    t.append(text(300, 190, "for example: one published SEO article", 11, 0.5))
    qs = (("Who owns the final output?", "a name, not a department"),
          ("What counts as a good one?", "written down as a checkable list"),
          ("What is the current process?", "described after the target, "
           "not before"),
          ("Which tools and accounts?", "last, never first"))
    for i, (q, a) in enumerate(qs):
        y = 218 + i * 46
        t.append(text(0, y, f"0{i + 1}", 12, 0.5, 600, mono=True))
        t.append(text(34, y, q, 12.5, 0.85, 500))
        t.append(text(34, y + 18, a, 11, 0.5))
    return figure_file_svg("".join(b), "".join(t), W, 400)


def shape_per_job():
    """Ba viec that, ba cau hoi giong nhau. Hai trong ba khong can agent."""
    b, t = [], []
    heads = ("THE JOB", "STEPS FIXED?", "NEEDS LANGUAGE?", "LOOK BACK?",
             "SHAPE THAT FITS")
    xs = (0, 330, 452, 588, 700)
    for i, h in enumerate(heads):
        t.append(text(xs[i], 20, h, 9.5, 0.35, 500))
    b.append(seg(0, 30, W, 30, 0.25, SW * 0.8))
    rows = (("Publish an article", "fetch, convert to HTML, push to CMS",
             "Fixed", "No", "No", "Workflow", False),
            ("Publish, plus meta", "adds one step that needs language",
             "Fixed", "One step", "No", "AI Workflow", False),
            ("Write an SEO article", "from keyword to submittable draft",
             "Not fixed", "Almost all of it", "Yes, many rounds", "Agent",
             True))
    for i, (job, sub, fixed, lang, back, shape, agent) in enumerate(rows):
        y = 62 + i * 76
        if agent:
            b.append(rect(-8, y - 26, W + 16, 62, 0.0, SW, fill="0.045", r=8))
        t.append(text(0, y, job, 13, 0.9, 500))
        t.append(text(0, y + 18, sub, 10.5, 0.45))
        for k, val in enumerate((fixed, lang, back)):
            t.append(text(xs[k + 1], y, val, 11.5, 0.6))
        b.append(rect(xs[4], y - 18, 176, 30, 0.95 if agent else 0.5,
                      SW * (1.5 if agent else 1.0), r=6,
                      fill="0.08" if agent else None))
        t.append(text(xs[4] + 88, y + 2, shape, 12, 0.95 if agent else 0.7,
                      500, anchor="middle"))
        if i < 2:
            b.append(seg(0, y + 34, W, y + 34, 0.12, SW * 0.7))
    t.append(text(0, 296, "Two of the three do not want an agent.", 13, 0.85,
                  500))
    return figure_file_svg("".join(b), "".join(t), W, 312)


def guideline_rewrite():
    """Cung mot cau, mot bien tap doc ra mot dang va mot agent doc ra dang
    khac. Bien do cho phep von van o do, chi la khong ai viet no ra."""
    b, t = [], []
    t.append(text(0, 18, "OLD GUIDELINE  ·  WRITTEN FOR PEOPLE", 11, 0.4, 500))
    b.append(panel(10, 32, W - 20, 46))
    t.append(text(20, 62, '"Articles must not exceed 1,000 words."', 15, 0.85,
                  500, mono=True))
    readers = (("Editor", ("Gets a 1,050-word draft. Cutting it would drop a",
                           "required section, so it stays. Everyone in the",
                           "trade reads 1,000 as guidance."),
                "Every section survives. Correct.", True),
               ("Agent", ("Reads it literally. To it, 1,000 is a rule and not",
                          "guidance, and there is nowhere in the sentence",
                          "for an exception."),
                "Cuts the required section. Broken.", False))
    for i, (who, lines, verdict, ok) in enumerate(readers):
        # cot phai tung bat dau o 470 va rong 430, tuc cham dung mep 900; net
        # va bo loc rough day them 4px nua ra ngoai viewBox.
        x = 10 + i * 460
        b.append(panel(x, 96, 420, 132))
        t.append(text(x + 20, 124, who, 13.5, 0.85, 500))
        for k, line in enumerate(lines):
            t.append(text(x + 20, 148 + k * 20, line, 11, 0.55))
        t.append(text(x + 20, 214, verdict, 11.5, 0.9, 500))
        if ok:
            b.append(check(x + 390, 208, 8, 0.9, SW * 1.3))
        else:
            b.append(seg(x + 382, 200, x + 398, 216, 0.8, SW * 1.4))
            b.append(seg(x + 398, 200, x + 382, 216, 0.8, SW * 1.4))
    b.append(seg(450, 236, 450, 258, 0.35, SW * 0.9))
    b.append(seg(444, 251, 450, 258, 0.35, SW * 0.9))
    b.append(seg(456, 251, 450, 258, 0.35, SW * 0.9))
    t.append(text(0, 288, "NEW GUIDELINE  ·  WRITTEN FOR BOTH", 11, 0.4, 500))
    b.append(panel(10, 300, W - 20, 70, hero=True))
    t.append(text(20, 330, '"Articles target 1,000 words. Up to 10% over is',
                  15, 0.95, 500, mono=True))
    t.append(text(20, 354, ' acceptable if cutting would drop a required '
                  'section."', 15, 0.95, 500, mono=True))
    t.append(text(0, 396, "The tolerance was always there. It was just never "
                  "written down.", 13, 0.7))
    return figure_file_svg("".join(b), "".join(t), W, 410)


FIGURES = {
    "webinar-three-shapes": three_shapes,
    "webinar-scale": scale,
    "webinar-account-vs-platform": account_vs_platform,
    "webinar-operating-blueprint": operating_blueprint,
    "webinar-silent-failure": silent_failure,
    "webinar-start-from-output": start_from_output,
    "webinar-shape-per-job": shape_per_job,
    "webinar-guideline-rewrite": guideline_rewrite,
}


def main():
    for name, fn in FIGURES.items():
        p = OUT / f"{name}.svg"
        p.write_text(fn(), encoding="utf-8")
        print(f"{p.name}  {len(p.read_bytes())} bytes")


if __name__ == "__main__":
    main()
