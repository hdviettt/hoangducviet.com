// Audit fenced code blocks across every post.
//
// A closing fence has to sit alone on its line. When a paragraph runs on
// directly after the backticks, markdown reads the whole line as an OPENING
// fence with a very long info string, and everything after it renders as raw
// text. That is not hypothetical: one published post has twelve of these, and
// its headings, bold text and backticks are all visible as literal characters
// on the live page.
//
//   railway run --service database node scripts/fence-audit.cjs
//   ... --fix   writes the repaired markdown back
//
// Writes go straight to the content column with SQL rather than through
// PUT /api/posts/[slug], because that route deletes and re-inserts the post's
// categories and its series association from the request body: a payload that
// omits them silently unfiles the post.
const { Pool } = require("pg");

const FIX = process.argv.includes("--fix");
const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_PUBLIC_URL / DATABASE_URL in env.");
  process.exit(1);
}
const pool = new Pool({
  connectionString: url,
  ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

// A legitimate info string is one token: ```ts, ```render, ```widget:carousel.
const INFO_OK = /^[A-Za-z0-9_:+-]*$/;

function findBadFences(content) {
  const lines = content.split("\n");
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("```")) continue;
    const info = line.slice(3).trim();
    if (info && !INFO_OK.test(info)) hits.push({ line: i + 1, text: line });
  }
  return { hits, fences: lines.filter((l) => l.startsWith("```")).length };
}

function repair(content) {
  return content
    .split("\n")
    .map((line) => {
      if (!line.startsWith("```")) return line;
      const info = line.slice(3).trim();
      if (!info || INFO_OK.test(info)) return line;
      return `\`\`\`\n\n${info}`;
    })
    .join("\n");
}

(async () => {
  const { rows } = await pool.query(
    "SELECT slug, content FROM posts ORDER BY slug",
  );
  let problems = 0;

  for (const row of rows) {
    const content = row.content ?? "";
    if (!content) continue;
    const { hits, fences } = findBadFences(content);
    const unbalanced = fences % 2 === 1;
    if (!hits.length && !unbalanced) continue;

    problems++;
    console.log(`\n${row.slug}`);
    console.log(`  fence lines: ${fences}${unbalanced ? "  UNBALANCED" : ""}`);
    for (const h of hits)
      console.log(`  line ${h.line}: ${h.text.slice(0, 92)}`);

    if (FIX && hits.length) {
      const fixed = repair(content);
      const after = findBadFences(fixed);
      if (after.hits.length) {
        console.log("  fix -> SKIPPED, repair did not clear the file");
        continue;
      }
      const res = await pool.query(
        "UPDATE posts SET content = $1 WHERE slug = $2",
        [fixed, row.slug],
      );
      console.log(
        `  fix -> ${res.rowCount === 1 ? `written, ${content.length} -> ${fixed.length} chars` : "FAILED"}`,
      );
    }
  }

  console.log(
    `\n${problems} post${problems === 1 ? "" : "s"} with a malformed or unbalanced fence.`,
  );
  if (problems && !FIX) console.log("Re-run with --fix to repair.");
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
