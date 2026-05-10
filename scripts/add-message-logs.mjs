import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  create table if not exists message_logs (
    id uuid primary key default gen_random_uuid(),
    guest_id uuid references guests(id) on delete set null,
    household_id uuid references households(id) on delete set null,
    channel text not null default 'sms' check (channel in ('sms', 'email')),
    recipient text not null,
    body text not null,
    status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'delivered')),
    provider_message_id text,
    error_message text,
    sent_at timestamptz,
    created_at timestamptz not null default now()
  );

  alter table message_logs enable row level security;

  create index if not exists idx_message_logs_guest_id on message_logs(guest_id);
  create index if not exists idx_message_logs_created_at on message_logs(created_at desc);
`);

console.log('message_logs table created with RLS enabled.');
await client.end();
