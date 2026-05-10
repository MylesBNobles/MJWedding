import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// Create test household
const { rows: [household] } = await client.query(`
  insert into households (household_name, side, relationship_to_couple, invite_status)
  values ('Nobles Test Household', 'myles', 'Test Data', 'definite')
  returning id;
`);

// Create guests
const { rows: guests } = await client.query(`
  insert into guests (household_id, first_name, last_name, guest_type, phone, invite_status, plus_one_allowed)
  values
    ($1, 'Myles', 'Nobles', 'primary', '5555550001', 'definite', false),
    ($1, 'Jeslin', 'Abraham', 'partner', '5555550002', 'definite', false)
  returning id, first_name;
`, [household.id]);

// Set primary guest
await client.query(`
  update households set primary_guest_id = $1 where id = $2
`, [guests[0].id, household.id]);

// Get event IDs
const { rows: events } = await client.query(`
  select id, slug from events where slug in ('welcome-lunch', 'wedding', 'farewell-brunch');
`);

const eventMap = Object.fromEntries(events.map(e => [e.slug, e.id]));

// Invite all guests to all 3 events
const invitations = [];
for (const guest of guests) {
  for (const slug of ['welcome-lunch', 'wedding', 'farewell-brunch']) {
    invitations.push([guest.id, eventMap[slug]]);
  }
}

for (const [guestId, eventId] of invitations) {
  await client.query(`
    insert into guest_event_invitations (guest_id, event_id, invited, rsvp_status)
    values ($1, $2, true, 'pending')
    on conflict (guest_id, event_id) do nothing;
  `, [guestId, eventId]);
}

console.log('Test household created:');
console.log('  Household:', household.id);
console.log('  Guests:', guests.map(g => `${g.first_name} (${g.id})`).join(', '));
console.log('  Phone to test RSVP lookup: 5555550001 or 5555550002');

await client.end();
