import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  alter table guests add column if not exists tags text[] not null default '{}';
  create index if not exists idx_guests_tags on guests using gin(tags);
`);

console.log('Added tags column to guests table with GIN index.');
await client.end();
