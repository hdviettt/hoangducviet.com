const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const DRY_RUN = !process.argv.includes("--commit");
const REWRITTEN_DIR = path.join(process.cwd(), "scripts", "series", "rewritten");

const SLUGS = [
  "why-ai-needs-to-dream",
  "forgetting-as-a-feature",
  "retrieval-induced-forgetting-rif-why-remembering-makes-you-forget",
  "when-memories-contradict-in-an-agentic-system",
  "memory-reconsolidation-in-agenternal",
];

const PROJECT_SLUG = "agenternal";

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/);
  if (!m) throw new Error("missing frontmatter");
  const fmRaw = m[1];
  const body = m[2].replace(/\s+$/, "");
  const fm = {};
  for (const line of fmRaw.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    fm[key] = value;
  }
  return { fm, body };
}

(async () => {
  console.log(
    `${DRY_RUN ? "[DRY RUN]" : "[COMMIT]"} memory series — ${SLUGS.length} posts + ${PROJECT_SLUG} project\n`,
  );

  for (const slug of SLUGS) {
    const file = path.join(REWRITTEN_DIR, `${slug}.md`);
    if (!fs.existsSync(file)) {
      console.log(`SKIP ${slug}: rewrite file missing`);
      continue;
    }
    const raw = fs.readFileSync(file, "utf8");
    const { fm, body } = parseFrontmatter(raw);

    const cur = await pool.query(
      `SELECT title, description, status, date_created, length(coalesce(content,'')) AS chars
         FROM posts
        WHERE slug = $1`,
      [slug],
    );
    if (cur.rows.length === 0) {
      console.log(`SKIP ${slug}: not found in DB`);
      continue;
    }
    const before = cur.rows[0];
    const after = {
      chars: body.length,
      title: fm.title || before.title,
      description: fm.description || null,
      status: fm.status || before.status,
      date_created: fm.date_created || before.date_created.toISOString(),
    };
    const delta = after.chars - before.chars;
    const sign = delta >= 0 ? "+" : "";
    console.log(`${slug}`);
    console.log(`  chars: ${before.chars} → ${after.chars} (${sign}${delta})`);
    if (fm.description !== undefined && fm.description !== before.description) {
      console.log(`  description: "${before.description || "(empty)"}" → "${fm.description}"`);
    }
    if (after.status !== before.status) {
      console.log(`  status: ${before.status} → ${after.status}`);
    }
    const beforeIso = before.date_created.toISOString();
    if (after.date_created !== beforeIso) {
      console.log(`  date_created: ${beforeIso} → ${after.date_created}`);
    }

    if (!DRY_RUN) {
      await pool.query(
        `UPDATE posts
            SET content = $1,
                title = $2,
                description = $3,
                status = $4,
                date_created = $5,
                date_updated = NOW()
          WHERE slug = $6`,
        [body, after.title, after.description, after.status, after.date_created, slug],
      );
      console.log("  UPDATED");
    }
    console.log("");
  }

  // Also flip the project from draft to published so the series index is reachable.
  const projectCur = await pool.query(
    "SELECT slug, title, status FROM projects WHERE slug = $1",
    [PROJECT_SLUG],
  );
  if (projectCur.rows.length === 0) {
    console.log(`SKIP project ${PROJECT_SLUG}: not found`);
  } else {
    const proj = projectCur.rows[0];
    console.log(`project ${PROJECT_SLUG}`);
    if (proj.status !== "published") {
      console.log(`  status: ${proj.status} → published`);
      if (!DRY_RUN) {
        await pool.query(
          "UPDATE projects SET status = 'published', date_updated = NOW() WHERE slug = $1",
          [PROJECT_SLUG],
        );
        console.log("  UPDATED");
      }
    } else {
      console.log("  status: already published");
    }
  }

  await pool.end();
  if (DRY_RUN) {
    console.log("\nDry run only. Re-run with --commit to apply.");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
