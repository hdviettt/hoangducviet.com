// Read-only inspection of the SEONGON Supabase Postgres source.
// Password passed via env var SUPABASE_PG_PASSWORD — never written to disk.

const { Pool } = require("pg");

const password = process.env.SUPABASE_PG_PASSWORD;
if (!password) {
  console.error("Missing SUPABASE_PG_PASSWORD env var");
  process.exit(1);
}

// Direct host is IPv6-only on this project; use the shared session pooler.
// Project lives in aws-1-ap-southeast-2 (Sydney). User format for poolers
// is postgres.<project_ref>.
const pool = new Pool({
  host: "aws-1-ap-southeast-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.jjhpvvtcblnsyfwnmxho",
  password,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 60_000,
  connectionTimeoutMillis: 15_000,
});

function hr(label) {
  console.log(`\n===== ${label} =====`);
}

async function listSchemas() {
  // List ALL schemas; filtering is in caller — first pass we need to see
  // what's actually present.
  const r = await pool.query(`
    SELECT n.nspname AS schema_name,
           (SELECT COUNT(*) FROM information_schema.tables t
              WHERE t.table_schema = n.nspname AND t.table_type = 'BASE TABLE') AS tables
      FROM pg_namespace n
     WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
       AND n.nspname NOT LIKE 'pg_temp%'
       AND n.nspname NOT LIKE 'pg_toast_%'
     ORDER BY tables DESC, schema_name
  `);
  for (const row of r.rows) {
    console.log(`  ${row.schema_name}  (${row.tables} tables)`);
  }
  return r.rows.filter((row) => row.tables > 0).map((row) => row.schema_name);
}

async function listTables(schema) {
  const r = await pool.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = $1 AND table_type = 'BASE TABLE'
      ORDER BY table_name`,
    [schema],
  );
  return r.rows.map((row) => row.table_name);
}

async function rowCount(schema, table) {
  const r = await pool.query(
    `SELECT reltuples::bigint AS n FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = $1 AND c.relname = $2`,
    [schema, table],
  );
  return r.rows[0]?.n ?? null;
}

(async () => {
  try {
    hr("CONNECTION");
    const v = await pool.query("SELECT version()");
    console.log(v.rows[0].version);

    hr("SCHEMAS (filtered)");
    const schemas = await listSchemas();
    console.log(schemas.join(", "));

    for (const schema of schemas) {
      hr(`SCHEMA: ${schema}`);
      const tables = await listTables(schema);
      if (tables.length === 0) {
        console.log("  (no tables)");
        continue;
      }
      for (const t of tables) {
        const n = await rowCount(schema, t);
        console.log(`  ${t}  ~${n ?? "?"} rows`);
      }
    }
  } finally {
    await pool.end();
  }
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
