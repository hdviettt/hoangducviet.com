// One-off: restore the hero bio (description) and About story (about_html) after
// they were cleared. Run once, then manage both from /admin → Settings.
// Run: railway run --service database node scripts/restore-profile.cjs
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const BIO =
  "<p>21, based in Vietnam. I help companies actually ship AI — not just demo it — and I write about how search and AI really work underneath.</p>";

const STORY = `<p>Most of what I do comes down to one habit: I understand systems by rebuilding them from scratch. Search engines, ranking algorithms, AI pipelines — I take them apart and build them again, because you can't win at a system you refuse to understand. That's where my edge comes from, and where most of my writing begins.</p>
<p>These days my work sits between two things: <strong>agentic SEO</strong> — how content earns its place now that search is turning generative — and <strong>building the AI systems businesses actually run on</strong>. I write about how search and AI work under the hood, the strategy of shipping AI inside a company, what China's playbook teaches the rest of us, and the occasional honest post-mortem when something breaks.</p>
<p>If you're trying to make AI real inside your business — or you just like taking things apart to see how they work — we'll probably get along.</p>`;

(async () => {
  await pool.query(
    "UPDATE profile SET description = $1, about_html = $2 WHERE id = (SELECT id FROM profile ORDER BY id LIMIT 1)",
    [BIO, STORY],
  );
  const r = await pool.query(
    "SELECT length(description) AS d, length(about_html) AS a FROM profile ORDER BY id LIMIT 1",
  );
  console.log("restored — description len:", r.rows[0].d, "about_html len:", r.rows[0].a);
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
