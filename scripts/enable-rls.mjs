import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  alter table households enable row level security;
  alter table guests enable row level security;
  alter table events enable row level security;
  alter table guest_event_invitations enable row level security;
`);

console.log('RLS enabled on all tables. Anon key has zero access. Service role bypasses RLS.');
await client.end();
