/**
 * Capitalise the part title inside each series post title.
 *
 *   railway run --service database node scripts/capitalise-series-parts.cjs [--write]
 *
 * The series page renders only what follows "#N: " - see SeriesBlock's
 * `title.match(/#\d+:\s*(.+)$/)` - so that fragment is displayed as a standalone
 * heading. Sentence-casing the whole title left those headings starting on a
 * lowercase letter.
 *
 * Idempotent: a part already capitalised is left alone.
 */
const { Pool } = require("pg");
const write = process.argv.includes("--write");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const { rows } = await pool.query(
    "SELECT slug, title FROM posts WHERE title ~ '#[0-9]+: ' ORDER BY title",
  );
  let n = 0;
  for (const r of rows) {
    const next = r.title.replace(/(#\d+:\s*)(\p{Ll})/u, (_, head, ch) => head + ch.toUpperCase());
    if (next === r.title) { console.log(`  ok     ${r.title}`); continue; }
    console.log(`  ${r.slug}\n    -  ${r.title}\n    +  ${next}`);
    n++;
    if (write) await pool.query("UPDATE posts SET title=$1, date_updated=NOW() WHERE slug=$2", [next, r.slug]);
  }
  console.log(`\n  ${n} to change${write ? ", written" : " (dry run)"}`);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
