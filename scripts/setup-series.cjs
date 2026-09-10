// Set up the "An agentic system for creating presentations" series: the series
// row, six draft posts, and the series<->post links. Part 1 gets real content
// from a markdown file; parts 2-6 are placeholder drafts. Idempotent.
const fs = require("node:fs");
const { Pool } = require("pg");

const POST1 = process.argv.find((a) => a.endsWith(".md")) ||
  "C:/Users/admin/AppData/Local/Temp/claude/C--Users-admin-Desktop-workspace/62e9790c-7484-40fc-a2e4-a32e292e6ae1/scratchpad/pa1-final.md";

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function parseFm(input) {
  const raw = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/);
  if (!m) throw new Error("part 1 markdown is missing frontmatter");
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i !== -1) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { fm, body: m[2].replace(/\s+$/, "") };
}

const SERIES = {
  slug: "an-agentic-system-for-creating-presentations",
  title: "An agentic system for creating presentations",
  summary:
    "I built an AI that makes real presentations, not just slides. It reads your data, works out what to say, designs the slides so they look good, and hands you a deck you can edit. This series is how each piece works.",
  description:
    "<p>Most AI slide tools do one thing: you type a prompt, they hand back slides. This is bigger. It reads your data, works out what the deck should argue, designs every slide to look professional, and gives you a deck you can edit like Canva or Google Slides.</p>" +
    "<p>Underneath it's a team of agents working together: an outline agent that decides what to say, a slide agent that builds each slide, a data analyst that runs real code on your spreadsheets, and an SEO specialist that brings in expertise. On top of that sits a design engine, a set of algorithms that decide how every slide looks, so the result never comes out ugly.</p>" +
    "<p>This series is how I built it, one piece at a time, in plain language.</p>",
};

const REST = [
  { slug: "making-ai-generated-slides-interactive", title: "Making AI-generated slides interactive",
    description: "How the AI generates a slide, and how the engine designs it and makes it fully editable.", date: "2026-08-26" },
  { slug: "dynamic-outlines", title: "Dynamic outlines",
    description: "Before any slide is built, the AI writes the argument as an outline you can edit and approve.", date: "2026-08-27" },
  { slug: "adding-a-data-analyst-agent", title: "Adding a data analyst agent",
    description: "A separate agent runs real code on your spreadsheets and reports what it found, instead of inventing figures.", date: "2026-08-28" },
  { slug: "adding-an-seo-specialist-agent", title: "Adding an SEO specialist agent",
    description: "A specialist agent brings knowledge the base AI doesn't have, and you can add more the same way.", date: "2026-08-29" },
  { slug: "agent-orchestration", title: "Agent orchestration",
    description: "Getting the outline, slide, analyst, and SEO agents to work as one, and the problems that came with it.", date: "2026-08-30" },
];

const PLACEHOLDER = "This part of the series is coming soon.";

(async () => {
  const { fm, body } = parseFm(fs.readFileSync(POST1, "utf8"));

  // Remove the old monolithic draft so its slug doesn't shadow the series slug.
  const del = await pool.query("DELETE FROM posts WHERE slug = $1 RETURNING id",
    ["an-agentic-system-for-creating-presentations"]);
  console.log(del.rowCount ? `deleted old monolith post id ${del.rows[0].id}` : "no old monolith to delete");

  // Series row.
  await pool.query(
    `INSERT INTO series (slug, title, summary, description, status)
     VALUES ($1,$2,$3,$4,'draft')
     ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, summary=EXCLUDED.summary,
       description=EXCLUDED.description, date_updated=now()`,
    [SERIES.slug, SERIES.title, SERIES.summary, SERIES.description],
  );
  console.log("series upserted:", SERIES.slug);

  // Part 1 (real content) — update content on conflict.
  await pool.query(
    `INSERT INTO posts (slug, title, description, content, status, date_created)
     VALUES ($1,$2,$3,$4,'draft','2026-08-25T09:00:00.000Z')
     ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description,
       content=EXCLUDED.content, date_updated=now()`,
    [fm.slug, fm.title, fm.description || null, body],
  );
  console.log("part 1 upserted:", fm.slug, `(${body.length} chars, ${(body.match(/```render/g) || []).length} figures)`);

  // Parts 2-6 (placeholders) — do NOT overwrite content if they already exist.
  for (const p of REST) {
    await pool.query(
      `INSERT INTO posts (slug, title, description, content, status, date_created)
       VALUES ($1,$2,$3,$4,'draft',$5::timestamptz)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, date_updated=now()`,
      [p.slug, p.title, p.description, PLACEHOLDER, p.date + "T09:00:00.000Z"],
    );
  }
  console.log("parts 2-6 upserted");

  // Links (ordering comes from date_created ascending).
  const slugs = [fm.slug, ...REST.map((p) => p.slug)];
  for (const s of slugs) {
    await pool.query(
      `INSERT INTO series_posts (series_slug, post_slug) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [SERIES.slug, s],
    );
  }
  console.log("linked", slugs.length, "posts to the series");

  const check = await pool.query(
    `SELECT p.slug, p.status, length(coalesce(p.content,'')) chars, p.date_created
       FROM series_posts sp JOIN posts p ON p.slug = sp.post_slug
      WHERE sp.series_slug = $1 ORDER BY p.date_created`,
    [SERIES.slug],
  );
  console.log("\nseries parts, in order:");
  for (const r of check.rows) console.log(`  ${r.date_created.toISOString().slice(0, 10)}  ${r.chars.toString().padStart(6)}ch  ${r.status}  ${r.slug}`);
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
