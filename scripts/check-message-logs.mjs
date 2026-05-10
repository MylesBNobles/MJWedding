import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const { rows } = await client.query(`select recipient, status, error_message from message_logs order by created_at desc limit 5`);
console.table(rows);
await client.end();
