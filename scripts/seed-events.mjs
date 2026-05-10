import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:THEnOBLES2027!@db.codnkxapmlkhohqdqzqf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  insert into events (name, slug, event_date, start_time, end_time, location_name, location_address, description, is_public, rsvp_required)
  values
    (
      'Welcome Lunch',
      'welcome-lunch',
      '2027-06-11',
      '12:30',
      '15:30',
      'Villa Di Geggiano',
      'Strada di Geggiano 1, 53010 Castelnuovo Berardenga, Siena, Italy',
      'A relaxed afternoon lunch in the Tuscan countryside. A chance to catch up before the big day.',
      true,
      true
    ),
    (
      'Wedding',
      'wedding',
      '2027-06-12',
      '16:30',
      '23:00',
      'Villa Di Geggiano',
      'Strada di Geggiano 1, 53010 Castelnuovo Berardenga, Siena, Italy',
      'Ceremony, cocktail hour, reception and dinner. Please arrive by 4:00 PM.',
      true,
      true
    ),
    (
      'Farewell Brunch',
      'farewell-brunch',
      '2027-06-13',
      '10:00',
      '13:00',
      'Grand Hotel Continental Siena',
      'Banchi di Sopra, 85, 53100 Siena, Italy',
      'A relaxed morning to say goodbye. Drop in anytime.',
      true,
      true
    )
  on conflict (slug) do nothing;
`);

console.log('Events seeded: Welcome Lunch, Wedding, Farewell Brunch');
await client.end();
