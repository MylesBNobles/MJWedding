-- Step 1: updated_at helper function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Step 2: households
create table if not exists households (
  id uuid primary key default gen_random_uuid(),

  household_name text not null,

  side text check (side in ('jeslin', 'myles', 'both')),
  relationship_to_couple text,

  invite_status text not null default 'maybe'
    check (invite_status in ('definite', 'maybe', 'not_invited')),

  primary_guest_id uuid,

  street_address text,
  street_address_2 text,
  city text,
  state_region text,
  postal_code text,
  country text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Step 3: guests
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),

  household_id uuid not null references households(id) on delete cascade,

  title text,
  first_name text not null,
  last_name text,
  suffix text,

  guest_type text not null default 'adult'
    check (guest_type in ('primary', 'partner', 'child', 'adult', 'plus_one')),

  email text,
  phone text,

  invite_status text not null default 'maybe'
    check (invite_status in ('definite', 'maybe', 'not_invited')),

  overall_rsvp_status text not null default 'pending'
    check (overall_rsvp_status in ('pending', 'accepted', 'declined', 'maybe')),

  is_named boolean not null default true,
  plus_one_allowed boolean not null default false,
  plus_one_guest_id uuid,
  invited_by_guest_id uuid,

  dietary_restrictions text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint guests_plus_one_guest_id_fkey
    foreign key (plus_one_guest_id) references guests(id) on delete set null,

  constraint guests_invited_by_guest_id_fkey
    foreign key (invited_by_guest_id) references guests(id) on delete set null
);

-- Step 4: Add household → guest FK (after guests table exists)
alter table households
  add constraint households_primary_guest_id_fkey
  foreign key (primary_guest_id) references guests(id) on delete set null;

-- Step 5: events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text unique not null,

  event_date date,
  start_time time,
  end_time time,

  location_name text,
  location_address text,

  description text,

  is_public boolean not null default false,
  rsvp_required boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Step 6: guest_event_invitations
create table if not exists guest_event_invitations (
  id uuid primary key default gen_random_uuid(),

  guest_id uuid not null references guests(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,

  invited boolean not null default true,

  rsvp_status text not null default 'pending'
    check (rsvp_status in ('pending', 'accepted', 'declined', 'maybe')),

  meal_choice text,
  dietary_restrictions text,

  notes text,

  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (guest_id, event_id)
);

-- Step 7: updated_at triggers
create or replace trigger update_households_updated_at
before update on households
for each row execute function update_updated_at_column();

create or replace trigger update_guests_updated_at
before update on guests
for each row execute function update_updated_at_column();

create or replace trigger update_events_updated_at
before update on events
for each row execute function update_updated_at_column();

create or replace trigger update_guest_event_invitations_updated_at
before update on guest_event_invitations
for each row execute function update_updated_at_column();

-- Step 8: Indexes
create index if not exists idx_guests_household_id on guests(household_id);
create index if not exists idx_guests_first_name on guests(first_name);
create index if not exists idx_guests_last_name on guests(last_name);
create index if not exists idx_guests_phone on guests(phone);
create index if not exists idx_guests_email on guests(email);
create index if not exists idx_guests_rsvp_status on guests(overall_rsvp_status);

create index if not exists idx_households_primary_guest_id on households(primary_guest_id);
create index if not exists idx_households_invite_status on households(invite_status);
create index if not exists idx_households_side on households(side);

create index if not exists idx_guest_event_invitations_guest_id on guest_event_invitations(guest_id);
create index if not exists idx_guest_event_invitations_event_id on guest_event_invitations(event_id);
create index if not exists idx_guest_event_invitations_rsvp_status on guest_event_invitations(rsvp_status);
