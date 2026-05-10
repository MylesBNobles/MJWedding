import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const sql = readFileSync(join(__dirname, '../supabase/migrations/001_initial_schema.sql'), 'utf8');

await client.connect();
console.log('Connected to Supabase');

await client.query(sql);
console.log('Migration complete — all tables created');

await client.end();
