# Wedding RSVP Database Specification

## Purpose

This database powers a custom wedding RSVP and guest management system for Jeslin & Myles. The goal is to keep the public wedding website fully custom while using Supabase/Postgres as the source of truth for guest data, RSVP responses, invitation groups, plus-ones, and future planning workflows.

This schema is designed for:

- Household-based wedding invitations
- Individual guest tracking
- Custom RSVP flow
- Multiple wedding events
- Plus-one handling
- Future messaging via Twilio/Mailchimp
- Future seating chart and AI planning workflows

---

# Core Modeling Concept

## Household vs Guest

A **household** is the invitation unit.

Examples:

- A married couple
- A family with children
- A single guest
- A friend + their named partner

A **guest** is an individual person.

Examples:

- Jomon Abraham
- Simy Jomon
- Rhea Jomon
- Saanya Bharghava
- Saanya's plus-one

This separation matters because a wedding invite is usually sent to a household, but RSVP, meals, seating, and dietary restrictions belong to individual guests.

---

# Table Overview

The initial database should have four core tables:

1. `households`
2. `guests`
3. `events`
4. `guest_event_invitations`

Optional future tables:

5. `message_logs`
6. `seating_tables`
7. `seating_assignments`

For MVP, start with the first four tables only.

---

# Relationship Overview

```text
households
  ↓ one-to-many
guests
  ↓ many-to-many through guest_event_invitations
events
```

Meaning:

- One household has many guests.
- One guest belongs to one household.
- One guest can be invited to many events.
- One event can have many guests.
- RSVP status is stored on the guest-event relationship.

---

# 1. `households`

## Purpose

Stores invitation groups/families. This is the unit you would normally address an invitation to.

Examples:

- `Jomon Abraham Household`
- `Prince Alino + Kamiya Bridges`
- `Nana Kitty Alexander`
- `Terry Alexander Household`

## Key Design Decision

Contact info is **not duplicated** on the household table. Instead, each household can reference a `primary_guest_id`, which points to the representative guest/contact person for that household.

This keeps phone/email stored in one place: the `guests` table.

## Fields

| Field | Type | Required | Description |
|---|---:|---:|---|
| `id` | `uuid` | Yes | Primary key. Auto-generated unique household ID. |
| `household_name` | `text` | Yes | Admin-friendly name for the household/invitation group. |
| `side` | `text` | No | Which side this household belongs to: `jeslin`, `myles`, or `both`. |
| `relationship_to_couple` | `text` | No | Freeform relationship label, such as `Jeslin's Family`, `Myles's Friend`, etc. |
| `invite_status` | `text` | Yes | Planning status: `definite`, `maybe`, or `not_invited`. |
| `primary_guest_id` | `uuid` | No | References the main guest/contact for the household. Set after guests are created. |
| `street_address` | `text` | No | Mailing address line 1. |
| `street_address_2` | `text` | No | Mailing address line 2. |
| `city` | `text` | No | Mailing city. |
| `state_region` | `text` | No | State, province, or region. |
| `postal_code` | `text` | No | ZIP or postal code. |
| `country` | `text` | No | Country. |
| `notes` | `text` | No | Internal notes. |
| `created_at` | `timestamptz` | Yes | Created timestamp. |
| `updated_at` | `timestamptz` | Yes | Last updated timestamp. |

## Notes

`primary_guest_id` creates a circular relationship because:

- `guests.household_id` references `households.id`
- `households.primary_guest_id` references `guests.id`

This is normal. The insert flow should be:

1. Create household with `primary_guest_id = null`
2. Create guests attached to the household
3. Update household with the primary guest ID

---

# 2. `guests`

## Purpose

Stores every individual person invited or potentially invited.

This includes:

- Primary invitee
- Partner/spouse
- Children
- Named guests
- Unknown plus-ones once claimed

## Fields

| Field | Type | Required | Description |
|---|---:|---:|---|
| `id` | `uuid` | Yes | Primary key. Auto-generated unique guest ID. |
| `household_id` | `uuid` | Yes | References the guest's household. |
| `title` | `text` | No | Optional title, like Mr., Mrs., Dr. |
| `first_name` | `text` | Yes | Guest first name. |
| `last_name` | `text` | No | Guest last name. Nullable for informal names or placeholder guests. |
| `suffix` | `text` | No | Optional suffix, like Jr., Sr., III. |
| `guest_type` | `text` | Yes | Type of guest: `primary`, `partner`, `child`, `adult`, or `plus_one`. |
| `email` | `text` | No | Individual email address. |
| `phone` | `text` | No | Individual phone number. Store as text, not number. |
| `invite_status` | `text` | Yes | Planning status: `definite`, `maybe`, or `not_invited`. |
| `overall_rsvp_status` | `text` | Yes | Convenience summary status: `pending`, `accepted`, `declined`, or `maybe`. |
| `is_named` | `boolean` | Yes | Whether this person is a known/named guest. Unknown plus-ones can start as false. |
| `plus_one_allowed` | `boolean` | Yes | Whether this guest is allowed to bring a plus-one. |
| `plus_one_guest_id` | `uuid` | No | If a plus-one is claimed, points to the plus-one guest row. |
| `invited_by_guest_id` | `uuid` | No | For plus-one rows, points back to the guest who invited them. |
| `dietary_restrictions` | `text` | No | Person-level dietary restrictions. |
| `notes` | `text` | No | Internal notes. |
| `created_at` | `timestamptz` | Yes | Created timestamp. |
| `updated_at` | `timestamptz` | Yes | Last updated timestamp. |

## Contact Info Decision

Phone and email live on `guests`, not `households`.

A household chooses its default communication target through:

```text
households.primary_guest_id → guests.id
```

This lets the system send household-level messages without duplicating phone/email fields.

## Plus-One Modeling

If a guest is allowed a plus-one:

```text
plus_one_allowed = true
plus_one_guest_id = null
```

This means they are allowed to bring someone, but they have not named that person yet.

When they RSVP and claim the plus-one:

1. Create a new row in `guests`
2. Set that row's `guest_type = 'plus_one'`
3. Set that row's `household_id` to the same household
4. Set that row's `invited_by_guest_id` to the original guest
5. Update the original guest's `plus_one_guest_id` to point to the new plus-one guest row

Example:

Before RSVP:

```text
Saanya Bharghava
plus_one_allowed = true
plus_one_guest_id = null
```

After RSVP:

```text
Saanya Bharghava
plus_one_allowed = true
plus_one_guest_id = John Smith's guest ID

John Smith
guest_type = plus_one
invited_by_guest_id = Saanya's guest ID
household_id = Saanya's household ID
```

Because plus-ones are allowed for all events in this wedding model, plus-one permission belongs on `guests`, not `guest_event_invitations`.

---

# 3. `events`

## Purpose

Stores each wedding-related event.

Examples:

- Welcome Party
- Wedding Ceremony
- Reception
- Farewell Brunch

## Fields

| Field | Type | Required | Description |
|---|---:|---:|---|
| `id` | `uuid` | Yes | Primary key. Auto-generated unique event ID. |
| `name` | `text` | Yes | Display name of the event. |
| `slug` | `text` | Yes | Unique machine-friendly name, such as `welcome-party`. |
| `event_date` | `date` | No | Event date. Nullable until finalized. |
| `start_time` | `time` | No | Event start time. Nullable until finalized. |
| `end_time` | `time` | No | Event end time. Nullable until finalized. |
| `location_name` | `text` | No | Venue or location name. |
| `location_address` | `text` | No | Full address. |
| `description` | `text` | No | Guest-facing or admin-facing event description. |
| `is_public` | `boolean` | Yes | Whether this event can be publicly shown on the website. |
| `rsvp_required` | `boolean` | Yes | Whether guests need to RSVP for this event. |
| `created_at` | `timestamptz` | Yes | Created timestamp. |
| `updated_at` | `timestamptz` | Yes | Last updated timestamp. |

---

# 4. `guest_event_invitations`

## Purpose

This table connects guests to events and stores RSVP information for that specific guest-event relationship.

This table answers:

```text
Which guest is invited to which event?
What did they RSVP for that specific event?
```

RSVP is not just a property of a guest, because one guest may say yes to one event and no to another.

Example:

| Guest | Event | RSVP |
|---|---|---|
| Prince Alino | Welcome Party | accepted |
| Prince Alino | Ceremony | accepted |
| Prince Alino | Farewell Brunch | declined |

## Fields

| Field | Type | Required | Description |
|---|---:|---:|---|
| `id` | `uuid` | Yes | Primary key. Auto-generated invitation row ID. |
| `guest_id` | `uuid` | Yes | References the invited guest. |
| `event_id` | `uuid` | Yes | References the event. |
| `invited` | `boolean` | Yes | Whether this guest is currently invited to this event. |
| `rsvp_status` | `text` | Yes | RSVP status: `pending`, `accepted`, `declined`, or `maybe`. |
| `meal_choice` | `text` | No | Optional meal choice for this event. Usually relevant for reception. |
| `dietary_restrictions` | `text` | No | Event-specific dietary notes. Person-level notes also exist on `guests`. |
| `notes` | `text` | No | Internal notes for this guest-event invitation. |
| `responded_at` | `timestamptz` | No | When the guest submitted a response. |
| `created_at` | `timestamptz` | Yes | Created timestamp. |
| `updated_at` | `timestamptz` | Yes | Last updated timestamp. |

## Important Constraint

Each guest should only have one invitation row per event.

This is enforced with:

```sql
unique (guest_id, event_id)
```

---

# SQL Setup for Supabase

Paste the following into Supabase SQL Editor.

## Step 1: Create helper function for `updated_at`

```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

---

## Step 2: Create `households`

```sql
create table households (
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
```

---

## Step 3: Create `guests`

```sql
create table guests (
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
```

---

## Step 4: Add household primary guest relationship

This is added after `guests` exists because `households.primary_guest_id` references `guests.id`.

```sql
alter table households
add constraint households_primary_guest_id_fkey
foreign key (primary_guest_id) references guests(id) on delete set null;
```

---

## Step 5: Create `events`

```sql
create table events (
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
```

---

## Step 6: Create `guest_event_invitations`

```sql
create table guest_event_invitations (
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
```

---

## Step 7: Add `updated_at` triggers

```sql
create trigger update_households_updated_at
before update on households
for each row
execute function update_updated_at_column();

create trigger update_guests_updated_at
before update on guests
for each row
execute function update_updated_at_column();

create trigger update_events_updated_at
before update on events
for each row
execute function update_updated_at_column();

create trigger update_guest_event_invitations_updated_at
before update on guest_event_invitations
for each row
execute function update_updated_at_column();
```

---

# Recommended Indexes

These indexes help with common search/filter flows.

```sql
create index idx_guests_household_id on guests(household_id);
create index idx_guests_first_name on guests(first_name);
create index idx_guests_last_name on guests(last_name);
create index idx_guests_phone on guests(phone);
create index idx_guests_email on guests(email);
create index idx_guests_rsvp_status on guests(overall_rsvp_status);

create index idx_households_primary_guest_id on households(primary_guest_id);
create index idx_households_invite_status on households(invite_status);
create index idx_households_side on households(side);

create index idx_guest_event_invitations_guest_id on guest_event_invitations(guest_id);
create index idx_guest_event_invitations_event_id on guest_event_invitations(event_id);
create index idx_guest_event_invitations_rsvp_status on guest_event_invitations(rsvp_status);
```

---

# Example Insert Flow

## Example: Jomon Abraham Household

### 1. Create household

```sql
insert into households (
  household_name,
  side,
  relationship_to_couple,
  invite_status
)
values (
  'Jomon Abraham Household',
  'jeslin',
  'Jeslin''s Family',
  'maybe'
)
returning id;
```

### 2. Create guests

Replace `<household_id>` with the returned household ID.

```sql
insert into guests (
  household_id,
  first_name,
  last_name,
  guest_type,
  phone,
  invite_status
)
values
  ('<household_id>', 'Jomon', 'Abraham', 'primary', '4038908401', 'maybe'),
  ('<household_id>', 'Simy', 'Jomon', 'partner', null, 'maybe'),
  ('<household_id>', 'Rhea', 'Jomon', 'child', null, 'maybe'),
  ('<household_id>', 'Reba', 'Jomon', 'child', null, 'maybe'),
  ('<household_id>', 'Riley', 'Jomon', 'child', null, 'maybe'),
  ('<household_id>', 'Ryan', 'Jomon', 'child', null, 'maybe')
returning id, first_name, last_name;
```

### 3. Set primary guest

```sql
update households
set primary_guest_id = '<jomon_guest_id>'
where id = '<household_id>';
```

---

# Common Queries

## Find one household's guests

```sql
select h.household_name, g.*
from households h
join guests g on g.household_id = h.id
where h.id = '<household_id>';
```

## Find household representative contacts

```sql
select
  h.id as household_id,
  h.household_name,
  g.first_name,
  g.last_name,
  g.email,
  g.phone
from households h
join guests g on h.primary_guest_id = g.id;
```

## Find pending RSVP households

```sql
select
  h.id,
  h.household_name,
  g.first_name,
  g.last_name,
  g.phone,
  g.email
from households h
join guests g on h.primary_guest_id = g.id
where exists (
  select 1
  from guests guest
  where guest.household_id = h.id
  and guest.overall_rsvp_status = 'pending'
);
```

## Find guests allowed to bring a plus-one

```sql
select *
from guests
where plus_one_allowed = true;
```

## Find claimed plus-ones

```sql
select *
from guests
where guest_type = 'plus_one';
```

## Find accepted guests for a specific event

```sql
select g.*
from guest_event_invitations gei
join guests g on g.id = gei.guest_id
join events e on e.id = gei.event_id
where e.slug = 'reception'
and gei.rsvp_status = 'accepted';
```

## Meal count for reception

```sql
select meal_choice, count(*)
from guest_event_invitations gei
join events e on e.id = gei.event_id
where e.slug = 'reception'
and gei.rsvp_status = 'accepted'
group by meal_choice;
```

---

# MVP Build Order

## Phase 1: Database

Create:

1. `households`
2. `guests`
3. `events`
4. `guest_event_invitations`

Then manually insert a few test households and guests.

## Phase 2: Guest Lookup

Build `/rsvp` page:

1. Guest enters name or phone number
2. System searches `guests`
3. System finds household
4. System displays all guests in household
5. Guest confirms this is their invitation

## Phase 3: RSVP Form

For each guest in the household:

1. Accept / decline
2. Dietary restrictions
3. Meal choice if needed
4. Plus-one question if `plus_one_allowed = true`

## Phase 4: Admin Dashboard

Build `/admin` page:

- View all households
- View all guests
- Filter by RSVP status
- Filter by side
- Export CSV
- See meal counts
- See pending RSVPs

## Phase 5: Messaging

Add later:

- Twilio SMS reminders
- Mailchimp email segments
- Message log table

---

# Future Optional Table: `message_logs`

Do not create this until messaging is being built.

Purpose: track texts/emails sent to guests or households.

Possible schema:

```sql
create table message_logs (
  id uuid primary key default gen_random_uuid(),

  household_id uuid references households(id) on delete set null,
  guest_id uuid references guests(id) on delete set null,

  channel text not null check (channel in ('sms', 'email')),
  provider text check (provider in ('twilio', 'mailchimp', 'resend')),

  recipient text not null,
  subject text,
  body text,

  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'delivered')),

  provider_message_id text,
  error_message text,

  sent_at timestamptz,
  created_at timestamptz not null default now()
);
```

---

# Design Principles

## Keep household and guest separate

Households are for invitation grouping. Guests are for individual people.

## Store contact info on guests

Households reference a primary guest instead of duplicating phone/email.

## Store event RSVP in `guest_event_invitations`

A guest may have different RSVP statuses for different events.

## Model plus-ones as real guests

This makes future seating, meals, dietary restrictions, and counts much easier.

## Keep the MVP simple

Do not build everything at once. Start with lookup, RSVP, and admin visibility.

---

# Final Recommendation

Use the four core tables as the starting point:

```text
households
guests
events
guest_event_invitations
```

This schema is flexible enough for a custom luxury wedding RSVP system, while still staying simple enough to build quickly in Supabase and Next.js.

