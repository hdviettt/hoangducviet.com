const { Pool } = require("pg");
const password = process.env.SUPABASE_PG_PASSWORD;

// aws-1 prefix is the newer pooler URL format
const REGIONS = [
  "aws-1-ap-southeast-1",
  "aws-1-ap-southeast-2",
  "aws-1-ap-northeast-1",
  "aws-1-ap-south-1",
  "aws-1-us-east-1",
  "aws-1-us-east-2",
  "aws-1-us-west-1",
  "aws-1-us-west-2",
  "aws-1-eu-west-1",
  "aws-1-eu-west-2",
  "aws-1-eu-central-1",
];

(async () => {
  for (const region of REGIONS) {
    const host = `${region}.pooler.supabase.com`;
    const pool = new Pool({
      host,
      port: 5432,
      database: "postgres",
      user: "postgres.jjhpvvtcblnsyfwnmxho",
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8_000,
    });
    try {
      await pool.query("SELECT 1");
      console.log(`HIT ${region}`);
      await pool.end();
      process.exit(0);
    } catch (e) {
      console.log(`miss ${region}: ${e.message}`);
      try {
        await pool.end();
      } catch {}
    }
  }
})();
