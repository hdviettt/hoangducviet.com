// Stack that trang platform.
//
// Truoc do trang nay chi liet ke 4 thu: Claude Agent SDK, MCP, FastAPI,
// PostgreSQL. Do la be mat cua mot nen tang chay 19 agent va 21 connector cho
// 120 nguoi, va no doc ra mong hon ca vai du an con nam ben trong no.
//
// Moi muc duoi day deu co nguon:
//   - CV, dong "Tech stack" cua Company-wide AI platform: Vercel AI SDK,
//     Next.js, TypeScript, Python, PostgreSQL, Larksuite Open API.
//   - Bai "An agent platform for SEONGON": Claude Agent SDK (frontmatter ->
//     session), MCP (`mcp_servers=MCP_SERVERS`), Python (`python -m core.eval`,
//     scripts trong skill), Lark bots o lop interfaces, va hai connector duoc
//     ke ten trong duong ong publishing la Google Docs va WordPress.
//
// Khong them thu gi khong co trong hai nguon do: Redis, Docker, Railway,
// DataForSEO... deu khong duoc nhac den cho nen tang nay.
//
//   node scripts/set-platform-stack.cjs --dry
//   railway run --service database node scripts/set-platform-stack.cjs

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const dry = process.argv.includes("--dry");
const SLUG = "agentic-ai-platform";

const STACK = [
  {
    group: "Runtime",
    items: [
      { name: "Claude Agent SDK", mark: "claude" },
      { name: "Python", mark: "python" },
      { name: "FastAPI", mark: "fastapi" },
      { name: "MCP", mark: "mcp" },
    ],
  },
  {
    group: "Interfaces",
    items: [
      { name: "Next.js", mark: "nextjs" },
      { name: "TypeScript", mark: "typescript" },
      { name: "Vercel AI SDK", mark: "vercel" },
    ],
  },
  {
    group: "Data",
    items: [{ name: "PostgreSQL", mark: "postgres" }],
  },
  {
    group: "Connectors",
    items: [
      // Lark khong co brand mark don sac o bo icon nao dung duoc, nen no giu
      // chu cai. Bo mot phan that cua stack de hang icon dep hon thi te hon.
      { name: "Larksuite Open API", letter: "Lk" },
      { name: "Google Docs", mark: "googledocs" },
      { name: "WordPress REST", mark: "wordpress" },
    ],
  },
];

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL
      ? { rejectUnauthorized: false }
      : false,
  });

  const before = await pool.query(
    "select slug, stack, description from projects where slug = $1",
    [SLUG],
  );
  const row = before.rows[0];
  if (!row) throw new Error(`khong tim thay ${SLUG}`);

  const countOld = (row.stack || []).reduce(
    (n, g) => n + (g.items || []).length,
    0,
  );
  const countNew = STACK.reduce((n, g) => n + g.items.length, 0);
  console.log(`stack: ${countOld} muc -> ${countNew} muc`);
  console.log("cu:", JSON.stringify(row.stack));

  if (dry) {
    console.log("moi:", JSON.stringify(STACK, null, 2));
    console.log("--- --dry: khong ghi gi ---");
    await pool.end();
    return;
  }

  const file = path.join(__dirname, `_stack-backup-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(row, null, 2));
  console.log(`sao luu -> ${path.basename(file)}`);

  await pool.query("update projects set stack = $2::jsonb where slug = $1", [
    SLUG,
    JSON.stringify(STACK),
  ]);
  console.log("ghi stack: ok");

  // Description gio la chu tren the o /work lan doan duoi tieu de, nen cau
  // cuoi cua no khong duoc tro xuong trang: "Each agent below" khong co "below"
  // nao khi no nam tren mot the.
  const trimmed = (row.description || "").replace(
    " Each agent below is a standalone piece of work in its own right.",
    "",
  );
  if (trimmed !== row.description) {
    await pool.query("update projects set description = $2 where slug = $1", [
      SLUG,
      trimmed,
    ]);
    console.log(
      `ghi description: ${row.description.length} -> ${trimmed.length}`,
    );
  } else {
    console.log("description: khong co gi de cat");
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
