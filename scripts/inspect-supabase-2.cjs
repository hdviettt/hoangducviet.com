// Round 2 on Supabase — same battery of analyses as Railway, so we can
// compare apples-to-apples and see if findings hold on the bigger dataset.

const { Pool } = require("pg");

const password = process.env.SUPABASE_PG_PASSWORD;
if (!password) {
  console.error("Missing SUPABASE_PG_PASSWORD env var");
  process.exit(1);
}

const pool = new Pool({
  host: "aws-1-ap-southeast-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.jjhpvvtcblnsyfwnmxho",
  password,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 120_000,
  connectionTimeoutMillis: 15_000,
});

function hr(label) {
  console.log(`\n===== ${label} =====`);
}

(async () => {
  try {
    hr("KEYWORD_RESULTS — COLUMN LIST");
    const cols = await pool.query(`
      SELECT column_name, data_type
        FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'keyword_results'
       ORDER BY ordinal_position
    `);
    for (const c of cols.rows) {
      console.log(`  ${c.column_name}: ${c.data_type}`);
    }

    hr("OVERALL VOLUME + AIO RATE");
    const overall = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE has_ai_overview = 1) AS aio_present,
        COUNT(*) FILTER (WHERE has_ai_overview = 0) AS aio_absent,
        COUNT(DISTINCT project_id) AS projects,
        COUNT(DISTINCT session_id) AS sessions,
        COUNT(DISTINCT keyword) AS distinct_keywords,
        MIN(created_at) AS earliest,
        MAX(created_at) AS latest
      FROM keyword_results
    `);
    console.log(overall.rows[0]);

    hr("AIO RATE BY PROJECT (top 20 by row count)");
    const byProject = await pool.query(`
      SELECT
        p.id, p.name, p.brand_name, p.brand_domain,
        COUNT(*) AS rows,
        COUNT(*) FILTER (WHERE kr.has_ai_overview = 1) AS aio_present,
        ROUND(100.0 * COUNT(*) FILTER (WHERE kr.has_ai_overview = 1) / COUNT(*), 1) AS aio_pct
      FROM keyword_results kr
      JOIN projects p ON p.id = kr.project_id
      GROUP BY p.id, p.name, p.brand_name, p.brand_domain
      ORDER BY rows DESC
      LIMIT 20
    `);
    for (const r of byProject.rows) {
      console.log(
        `  ${String(r.id).padStart(4)} ${(r.name || "").slice(0, 28).padEnd(28)} ${(r.brand_domain || "").slice(0, 30).padEnd(30)}  ${String(r.rows).padStart(7)} rows · ${r.aio_pct}% AIO`,
      );
    }

    hr("KEYWORD LENGTH vs AIO RATE");
    const klen = await pool.query(`
      SELECT
        CASE
          WHEN array_length(string_to_array(keyword, ' '), 1) <= 2 THEN '1-2 words'
          WHEN array_length(string_to_array(keyword, ' '), 1) <= 4 THEN '3-4 words'
          WHEN array_length(string_to_array(keyword, ' '), 1) <= 6 THEN '5-6 words'
          ELSE '7+ words'
        END AS bucket,
        COUNT(*) AS n,
        ROUND(100.0 * COUNT(*) FILTER (WHERE has_ai_overview = 1) / COUNT(*), 1) AS aio_rate_pct
      FROM keyword_results
      GROUP BY 1
      ORDER BY 1
    `);
    for (const r of klen.rows) {
      console.log(
        `  ${r.bucket.padEnd(12)} ${String(r.n).padStart(8)} rows · ${r.aio_rate_pct}% AIO`,
      );
    }

    hr("AIO MARKDOWN LENGTH DISTRIBUTION");
    const lens = await pool.query(`
      SELECT
        COUNT(*) AS aio_rows,
        AVG(LENGTH(aio_markdown))::int AS avg_chars,
        MIN(LENGTH(aio_markdown)) AS min_chars,
        MAX(LENGTH(aio_markdown)) AS max_chars,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY LENGTH(aio_markdown))::int AS p50,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY LENGTH(aio_markdown))::int AS p90
      FROM keyword_results
      WHERE aio_markdown IS NOT NULL
    `);
    console.log(lens.rows[0]);

    hr("AIO REFERENCES PER OVERVIEW");
    const refct = await pool.query(`
      WITH s AS (
        SELECT keyword, jsonb_array_length(aio_references::jsonb) AS n_refs
        FROM keyword_results
        WHERE has_ai_overview = 1
          AND aio_references IS NOT NULL
          AND aio_references NOT LIKE '%\\u0000%'
      )
      SELECT
        COUNT(*) AS aio_rows_parsed,
        AVG(n_refs)::numeric(10,2) AS avg_refs,
        MIN(n_refs) AS min_refs, MAX(n_refs) AS max_refs,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY n_refs) AS p50,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY n_refs) AS p90
      FROM s
    `);
    console.log(refct.rows[0]);

    hr("TOP 25 CITED DOMAINS IN AIO (skipping null-byte rows)");
    const top = await pool.query(`
      SELECT
        ref->>'domain' AS domain,
        COUNT(*) AS citations,
        COUNT(DISTINCT keyword) AS distinct_kws
      FROM keyword_results,
           jsonb_array_elements(aio_references::jsonb) AS ref
      WHERE has_ai_overview = 1
        AND aio_references IS NOT NULL
        AND aio_references NOT LIKE '%\\u0000%'
      GROUP BY ref->>'domain'
      ORDER BY citations DESC
      LIMIT 25
    `);
    for (const r of top.rows) {
      console.log(
        `  ${(r.domain || "(null)").padEnd(35)} ${String(r.citations).padStart(7)} citations · ${r.distinct_kws} kws`,
      );
    }

    hr("AIO ↔ ORGANIC TOP-10 OVERLAP (3K-row sample)");
    const overlap = await pool.query(`
      WITH s AS (
        SELECT keyword, raw_api_result, aio_references
        FROM keyword_results
        WHERE has_ai_overview = 1
          AND aio_references IS NOT NULL
          AND raw_api_result NOT LIKE '%\\u0000%'
          AND aio_references NOT LIKE '%\\u0000%'
        ORDER BY random()
        LIMIT 3000
      ),
      cited AS (
        SELECT keyword, ARRAY_AGG(DISTINCT ref->>'domain') AS cited_domains
        FROM s, jsonb_array_elements(aio_references::jsonb) AS ref
        GROUP BY keyword
      ),
      org10 AS (
        SELECT keyword, ARRAY_AGG(DISTINCT item->>'domain') AS organic_domains
        FROM s, jsonb_array_elements(raw_api_result::jsonb -> 'items') AS item
        WHERE item->>'type' = 'organic'
          AND (item->>'rank_absolute')::int <= 10
        GROUP BY keyword
      )
      SELECT
        AVG(CARDINALITY(cited_domains)) AS avg_cited,
        AVG(CARDINALITY(organic_domains)) AS avg_org_top10,
        AVG(CARDINALITY(
          ARRAY(SELECT UNNEST(cited_domains) INTERSECT SELECT UNNEST(organic_domains))
        )) AS avg_overlap,
        AVG(
          CARDINALITY(
            ARRAY(SELECT UNNEST(cited_domains) INTERSECT SELECT UNNEST(organic_domains))
          )::float / NULLIF(CARDINALITY(cited_domains)::float, 0)
        ) AS pct_cited_in_top10
      FROM cited c JOIN org10 o USING (keyword)
    `);
    console.log(overlap.rows[0]);

    hr("RAILWAY OVERLAP CHECK — keywords seen in BOTH source DBs?");
    // Sample 5K Supabase keywords; we'll just print to compare manually
    const supKws = await pool.query(`
      SELECT DISTINCT keyword FROM keyword_results LIMIT 10
    `);
    console.log("First 10 distinct keywords on Supabase:");
    for (const r of supKws.rows) console.log(`  ${r.keyword}`);

    hr("PROJECT-LEVEL VERTICAL DIVERSITY");
    const verts = await pool.query(`
      SELECT
        COUNT(DISTINCT project_id) AS distinct_projects,
        COUNT(DISTINCT brand_domain) AS distinct_brands,
        COUNT(*) FILTER (WHERE brand_domain IS NULL) AS unbranded
      FROM projects
    `);
    console.log(verts.rows[0]);

    hr("SESSIONS PER PROJECT (longitudinal coverage)");
    const sess = await pool.query(`
      WITH s AS (
        SELECT project_id, COUNT(DISTINCT session_id) AS sessions
        FROM keyword_results
        GROUP BY project_id
      )
      SELECT
        sessions,
        COUNT(*) AS n_projects
      FROM s
      GROUP BY sessions
      ORDER BY sessions DESC
      LIMIT 15
    `);
    console.log("session_count → number_of_projects");
    for (const r of sess.rows) console.log(`  ${r.sessions}  ${r.n_projects}`);
  } finally {
    await pool.end();
  }
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
