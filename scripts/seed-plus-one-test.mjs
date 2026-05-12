import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: events } = await supabase.from('events').select('id, name');
const eventIds = events.map(e => e.id);
console.log('Events found:', events.map(e => e.name));

// ── 1. Named plus-one: Alex Chen + their plus-one Jordan Lee ──────────────────

const { data: h1 } = await supabase
  .from('households')
  .insert({ household_name: 'Alex Chen', side: 'myles', relationship_to_couple: "Myles's friend", invite_status: 'definite' })
  .select('id').single();

const { data: alex } = await supabase
  .from('guests')
  .insert({ household_id: h1.id, first_name: 'Alex', last_name: 'Chen', guest_type: 'primary', phone: '4040000001', invite_status: 'definite', is_named: true, plus_one_allowed: true, overall_rsvp_status: 'pending' })
  .select('id').single();

const { data: jordan } = await supabase
  .from('guests')
  .insert({ household_id: h1.id, first_name: 'Jordan', last_name: 'Lee', guest_type: 'plus_one', invite_status: 'definite', is_named: true, plus_one_allowed: false, overall_rsvp_status: 'pending', invited_by_guest_id: alex.id })
  .select('id').single();

// Link plus-one back to Alex
await supabase.from('guests').update({ plus_one_guest_id: jordan.id }).eq('id', alex.id);

// Set primary guest on household
await supabase.from('households').update({ primary_guest_id: alex.id }).eq('id', h1.id);

// Invite both to all events
await supabase.from('guest_event_invitations').insert(
  [alex.id, jordan.id].flatMap(gid => eventIds.map(eid => ({ guest_id: gid, event_id: eid, invited: true, rsvp_status: 'pending' })))
);

console.log('✓ Named plus-one household: Alex Chen (phone: 4040000001) + Jordan Lee');

// ── 2. Unnamed plus-one: Sam Rivera (has +1 slot, no name yet) ───────────────

const { data: h2 } = await supabase
  .from('households')
  .insert({ household_name: 'Sam Rivera', side: 'jeslin', relationship_to_couple: "Jeslin's friend", invite_status: 'definite' })
  .select('id').single();

const { data: sam } = await supabase
  .from('guests')
  .insert({ household_id: h2.id, first_name: 'Sam', last_name: 'Rivera', guest_type: 'primary', phone: '4040000002', invite_status: 'definite', is_named: true, plus_one_allowed: true, overall_rsvp_status: 'pending' })
  .select('id').single();

await supabase.from('households').update({ primary_guest_id: sam.id }).eq('id', h2.id);

await supabase.from('guest_event_invitations').insert(
  eventIds.map(eid => ({ guest_id: sam.id, event_id: eid, invited: true, rsvp_status: 'pending' }))
);

console.log('✓ Unnamed plus-one household: Sam Rivera (phone: 4040000002) — +1 slot open');
console.log('\nTest these at /rsvp:');
console.log('  4040000001 → Alex Chen + named plus-one Jordan Lee');
console.log('  4040000002 → Sam Rivera with unnamed +1 slot');
