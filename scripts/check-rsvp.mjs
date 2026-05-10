import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const { rows } = await client.query(`
  select
    g.first_name,
    g.last_name,
    g.overall_rsvp_status,
    e.name as event_name,
    gei.rsvp_status,
    gei.responded_at
  from guest_event_invitations gei
  join guests g on g.id = gei.guest_id
  join events e on e.id = gei.event_id
  order by g.first_name, e.event_date;
`);

console.table(rows);
await client.end();
