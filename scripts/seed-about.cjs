// One-off: move the hard-coded About story into profile.about_html so it shows
// up in /admin → Settings → About page → body and becomes editable. The visual
// output is identical (same text); it just stops living only in code.
// Run: railway run --service database node scripts/seed-about.cjs
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ABOUT_HTML = `<p>Most of what I do comes down to one habit: I understand systems by rebuilding them from scratch. Search engines, ranking algorithms, AI pipelines — I take them apart and build them again, because you can't win at a system you refuse to understand. That's where my edge comes from, and where most of my writing begins.</p>
<p>These days my work sits between two things: <strong>agentic SEO</strong> — how content earns its place now that search is turning generative — and <strong>building the AI systems businesses actually run on</strong>. I write about how search and AI work under the hood, the strategy of shipping AI inside a company, what China's playbook teaches the rest of us, and the occasional honest post-mortem when something breaks.</p>
<p>If you're trying to make AI real inside your business — or you just like taking things apart to see how they work — we'll probably get along.</p>`;

(async () => {
  const before = await pool.query(
    "SELECT about_html FROM profile ORDER BY id LIMIT 1",
  );
  console.log("BEFORE about_html:", JSON.stringify(before.rows[0]?.about_html));
  await pool.query(
    "UPDATE profile SET about_html = $1 WHERE id = (SELECT id FROM profile ORDER BY id LIMIT 1)",
    [ABOUT_HTML],
  );
  const after = await pool.query(
    "SELECT about_html FROM profile ORDER BY id LIMIT 1",
  );
  console.log("AFTER about_html length:", after.rows[0].about_html.length);
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
