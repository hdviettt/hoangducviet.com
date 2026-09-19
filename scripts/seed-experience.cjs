// Move the timeline out of src/lib/resume.ts and into profile.experience, once.
//
// Reads the constant that is about to be deleted, so the seed is exactly what
// the site has been rendering rather than a re-typing of it.
const { Client } = require("pg");
const fs = require("node:fs");

function readExperienceFromSource() {
  const src = fs.readFileSync("src/lib/resume.ts", "utf8");
  const start = src.indexOf("export const EXPERIENCE");
  if (start === -1) throw new Error("EXPERIENCE is already gone from resume.ts");
  // NOT the first "[" after the name: the declaration reads
  // `export const EXPERIENCE: Company[] = [`, so the first one belongs to the
  // type annotation and scanning from it matches an empty array.
  const eq = src.indexOf("=", start);
  const open = src.indexOf("[", eq);
  // Walk the brackets so a `[` inside a string cannot end the array early.
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      i++;
      while (i < src.length && (src[i] !== '"' || src[i - 1] === "\\")) i++;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error("could not find the end of EXPERIENCE");
  // The literal is plain data, so evaluating it is the most faithful parse.
  // eslint-disable-next-line no-new-func
  return new Function(`return ${src.slice(open, end)};`)();
}

(async () => {
  const experience = readExperienceFromSource();
  console.log(
    "read from source:",
    experience.length,
    "company,",
    experience[0].roles.length,
    "roles",
  );

  const c = new Client({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const before = await c.query("SELECT experience FROM profile WHERE id = 1");
  const existing = before.rows[0]?.experience ?? [];
  if (Array.isArray(existing) && existing.length > 0 && !process.argv.includes("--force")) {
    console.log("profile.experience is already populated; refusing to overwrite.");
    console.log("Pass --force to replace it.");
    await c.end();
    return;
  }

  const res = await c.query(
    "UPDATE profile SET experience = $1::jsonb WHERE id = 1 RETURNING experience",
    [JSON.stringify(experience)],
  );
  const saved = res.rows[0].experience;
  console.log("saved:", saved.length, "company");
  for (const r of saved[0].roles) {
    console.log(
      "  " + r.title.padEnd(28) + r.start + " -> " + (r.end || "present"),
      "(" + (r.highlights?.length ?? 0) + " results)",
    );
  }
  await c.end();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
