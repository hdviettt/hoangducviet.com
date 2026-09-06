// Dua noi dung trong DB ve dung so lieu cua CV (Hoang Duc Viet CV 2026).
//
// Truoc do site va CV venh nhau o vai cho ma nguoi doc ky se thay, vi CV in
// dia chi site nay ngay dong dau:
//   - 117 nguoi (site) vs 120 (CV)
//   - "a couple thousand keywords" (site) vs "tens of thousands" (CV)
//   - voyage-3-large tra ve 2.048 chieu, khong phai 1.024 (UMAP nen o buoc sau)
//   - toan bo phan ket qua cua CV (2x, 5x, 80%, doi 5 nguoi, 1 gio -> 5 phut,
//     1 ngay -> 1.5 gio) khong co o dau tren site
//
// In ra ban cu, luu backup JSON canh script, roi moi ghi.
//
//   node scripts/align-with-cv.cjs --dry
//   node scripts/align-with-cv.cjs
//   railway run --service database node scripts/align-with-cv.cjs

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const dry = process.argv.includes("--dry");

// --- cac muc moi cho trang platform -----------------------------------------

const STANDARDS = `<h2>The standards under every agent</h2>
<p>Shared rails only work if every agent meets the same bar, so the standards live in the runtime rather than in whoever writes the agent. Each agent runs under its own nonhuman identity, and access is task-scoped for people and agents alike, so each reaches only what its job requires. Every run is observable and written down. Nothing reaches staff until it passes its eval gate. Every procedure names the single point where a human has to reason. Feedback is a feature rather than a survey: a rating and comment widget sits on every model trace and key log, so the people using it in production grade it there, and the answers land in one shared database. Cost is tracked per department, per agent and per person over time, across model and non-model traces, which is what makes it possible to say whether a workflow is worth running at all.</p>`;

const IMPACT = `<h2>What it changed</h2>
<p>The team was five people. Across the SEO production chain the platform halved the time the work takes, and the tasks it fits best, internal linking and content-outline generation, run up to five times faster at the quality of senior staff. Over twenty AI solutions run on top of it, owned by the departments that asked for them. The number I am most sure of is not about software at all: 80% of the company was trained to work with agentic AI, and more than fifty measurable outcomes came out of that training rather than out of the platform team.</p>`;

// --- doi voi tung du an ------------------------------------------------------

const EDITS = {
  "agentic-ai-platform": {
    // Tagline la thu hien tren the o trang chu va /work, description la thu
    // hien tren trang du an. Ca hai deu tung ghi 117.
    tagline: (t) => t.replace("117 people", "120 people"),
    description: (d) => d.replace("117-person", "120-person"),
    content: (c) => {
      let s = c.replace("117-person agency", "120-person agency");
      // Chuan nam sau muc noi ve registry (cho da noi ve credential va eval),
      // ket qua nam truoc muc hoi tuong de bai van ket bang bai hoc.
      s = s.replace(
        "<h2>Encodings are disposable</h2>",
        `${STANDARDS}\n<h2>Encodings are disposable</h2>`,
      );
      s = s.replace(
        "<h2>The most expensive miss</h2>",
        `${IMPACT}\n<h2>The most expensive miss</h2>`,
      );
      return s;
    },
    metrics: [
      { label: "agents live on one runtime", value: "19" },
      { label: "connectors in production", value: "21" },
      { label: "parts run with no model at all", value: "52 / 103" },
      { label: "people the platform serves", value: "120" },
    ],
  },

  "keyword-clustering": {
    description: (d) =>
      d.replace(
        "a couple thousand raw Vietnamese keywords",
        "tens of thousands of raw Vietnamese keywords",
      ),
    content: (c) => {
      let s = c.replace(
        "then UMAP compresses 1,024 dimensions down to about 30",
        "then UMAP compresses the 2,048 dimensions it returns down to about 30",
      );
      s = s.replace(
        "Results ship as a CSV, one row per keyword with its named cluster.",
        "Clustering a set used to take about an hour of someone's day and now takes about five minutes. Results ship as a CSV, one row per keyword with its named cluster.",
      );
      return s;
    },
    metrics: [
      { label: "dimensions, UMAP before clustering", value: "2,048 to 30" },
      { label: "step ML pipeline", value: "8" },
      { label: "per run, from about an hour", value: "5 min" },
      { label: "threshold to move a keyword", value: "+0.05" },
    ],
  },

  "agentic-presentation-system": {
    content: (c) =>
      c.replace(
        "Across 65 production runs, the median deck took under two minutes; the largest was 37 slides against a 33-tab workbook.",
        "Across 65 production runs, the median deck took under two minutes; the largest was 37 slides against a 33-tab workbook. End to end, an SEO proposal that used to take about a day now takes about an hour and a half, most of that the human reading the outline.",
      ),
    metrics: [
      { label: "per SEO proposal, from about a day", value: "~1.5 hrs" },
      { label: "real slides analyzed to design blocks", value: "644" },
      { label: "slides draw real data, up from 1 in 10", value: "7 in 10" },
      { label: "median run across 65 decks", value: "< 2 min" },
    ],
  },
};

const ABOUT_HTML = `<p>I am an undergraduate in International Business at Foreign Trade University in Hanoi, and I spent the last two years building AI systems inside a search marketing agency rather than in a lab.</p>
<p>I joined SEONGON as the CEO's operations assistant, which turned out to be the best training available: six months of watching where the work actually goes wrong before being asked to automate any of it. I moved into building, then founded and led an AI team of five. We shipped a platform that 120 people use, with over twenty AI solutions on it, and I spent about as much time teaching the company to work with agents as writing the agents.</p>
<p>What I care about is the part most AI work skips, the procedure underneath. A company that accumulates procedures compounds; one that accumulates prompts is renting. Most of what I build ends up with less model in it than it started with, and that is usually the point.</p>`;

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL
      ? { rejectUnauthorized: false }
      : false,
  });

  const slugs = Object.keys(EDITS);
  const before = await pool.query(
    "select slug, tagline, description, content, metrics from projects where slug = any($1)",
    [slugs],
  );
  const profileBefore = await pool.query(
    "select id, about_html from profile order by id limit 1",
  );

  const backup = {
    projects: Object.fromEntries(before.rows.map((r) => [r.slug, r])),
    profile: profileBefore.rows[0] ?? null,
  };

  const plan = [];
  for (const row of before.rows) {
    const e = EDITS[row.slug];
    const next = {
      tagline: e.tagline ? e.tagline(row.tagline) : row.tagline,
      description: e.description
        ? e.description(row.description)
        : row.description,
      content: e.content ? e.content(row.content) : row.content,
      metrics: e.metrics ?? row.metrics,
    };
    if (e.tagline && next.tagline === row.tagline)
      throw new Error(`${row.slug}: tagline khong doi, chuoi can thay da khac`);
    if (e.description && next.description === row.description)
      throw new Error(
        `${row.slug}: description khong doi, chuoi can thay da khac`,
      );
    if (e.content && next.content === row.content)
      throw new Error(`${row.slug}: content khong doi, chuoi can thay da khac`);
    plan.push({ slug: row.slug, next });
    console.log(
      `${row.slug}: description ${row.description.length}->${next.description.length}, ` +
        `content ${row.content.length}->${next.content.length}, metrics ${next.metrics.length}`,
    );
  }
  console.log(
    `profile.about_html: ${(profileBefore.rows[0]?.about_html || "").length} -> ${ABOUT_HTML.length}`,
  );

  if (dry) {
    console.log("--- --dry: khong ghi gi ---");
    await pool.end();
    return;
  }

  const file = path.join(__dirname, `_cv-align-backup-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nsao luu -> ${path.basename(file)}\n--- ghi ---`);

  for (const p of plan) {
    const r = await pool.query(
      "update projects set tagline = $2, description = $3, content = $4, metrics = $5::jsonb where slug = $1",
      [
        p.slug,
        p.next.tagline,
        p.next.description,
        p.next.content,
        JSON.stringify(p.next.metrics),
      ],
    );
    console.log(`${p.slug}: ${r.rowCount ? "ok" : "KHONG TIM THAY"}`);
  }
  if (profileBefore.rows[0]) {
    await pool.query("update profile set about_html = $2 where id = $1", [
      profileBefore.rows[0].id,
      ABOUT_HTML,
    ]);
    console.log("profile.about_html: ok");
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
