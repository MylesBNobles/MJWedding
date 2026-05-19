export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import { Container, SectionHeader, Card } from '@/components';
import { GuestTable } from './components/GuestTable';
import { AddHouseholdButton } from './components/AddHouseholdButton';
import type { Guest, Event, GuestEventInvitation } from '@/lib/database.types';

type GuestRow = Guest & {
  household: { household_name: string; side: string | null } | null;
  invitations: (GuestEventInvitation & { event: Event })[];
};

async function getAdminData() {
  const supabase = createServerClient();

  const [{ data: guestsData, error: guestsError }, { data: eventsData }] = await Promise.all([
    supabase
      .from('guests')
      .select('*, household:households!household_id(household_name, side)')
      .eq('is_named', true)
      .neq('invite_status', 'not_invited')
      .order('last_name'),
    supabase
      .from('events')
      .select('*')
      .order('event_date'),
  ]);

  if (guestsError) console.error('Admin guests query error:', guestsError);

  const guests = (guestsData ?? []) as GuestRow[];
  const events = (eventsData ?? []) as Event[];

  const guestIds = guests.map(g => g.id);

  const { data: invitationsData } = guestIds.length > 0
    ? await supabase
        .from('guest_event_invitations')
        .select('*, event:events(*)')
        .in('guest_id', guestIds)
    : { data: [] };

  const invitations = (invitationsData ?? []) as (GuestEventInvitation & { event: Event })[];

  const guestsWithInvitations: GuestRow[] = guests.map(g => ({
    ...g,
    invitations: invitations.filter(inv => inv.guest_id === g.id),
  }));

  return { guests: guestsWithInvitations, events };
}


export default async function AdminPage() {
  const { guests, events } = await getAdminData();

  const stats = {
    total: guests.length,
    accepted: guests.filter(g => g.overall_rsvp_status === 'accepted').length,
    declined: guests.filter(g => g.overall_rsvp_status === 'declined').length,
    pending: guests.filter(g => g.overall_rsvp_status === 'pending').length,
  };

  const eventStats = events.map(event => {
    const eventInvitations = guests.flatMap(g => g.invitations).filter(inv => inv.event_id === event.id);
    return {
      event,
      accepted: eventInvitations.filter(inv => inv.rsvp_status === 'accepted').length,
      declined: eventInvitations.filter(inv => inv.rsvp_status === 'declined').length,
      pending: eventInvitations.filter(inv => inv.rsvp_status === 'pending').length,
      total: eventInvitations.filter(inv => inv.invited).length,
    };
  });

  return (
    <section className="pt-28 pb-16 bg-[#FAF7F2] min-h-screen">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <SectionHeader
            title="Admin Dashboard"
            subtitle="Jeslin & Myles · Guest Management"
            className="mb-0"
          />
          <div className="flex items-center gap-4">
            <AddHouseholdButton />
            <Link href="/admin/budget" className="text-sm text-accent hover:underline font-medium">
              Budget
            </Link>
            <Link href="/admin/messages" className="text-sm text-accent hover:underline font-medium">
              Messages
            </Link>
            <Link href="/admin/finance" className="text-sm font-medium px-3 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors">
              Finance HQ
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="text-sm text-muted hover:text-fg transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card padding="sm">
            <p className="text-sm text-muted">Total Guests</p>
            <p className="text-2xl font-semibold text-fg">{stats.total}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-muted">Accepted</p>
            <p className="text-2xl font-semibold text-green-600">{stats.accepted}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-muted">Declined</p>
            <p className="text-2xl font-semibold text-muted">{stats.declined}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-muted">Pending</p>
            <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
          </Card>
        </div>

        {/* Per-event stats */}
        <h2 className="text-lg font-semibold text-fg mb-4">By Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {eventStats.map(({ event, accepted, declined, pending, total }) => (
            <Card key={event.id} padding="sm">
              <p className="font-medium text-fg mb-1">{event.name}</p>
              <p className="text-xs text-muted mb-3">
                {event.event_date
                  ? new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                  : ''}
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">{accepted} yes</span>
                <span className="text-muted">{declined} no</span>
                <span className="text-yellow-600">{pending} pending</span>
                <span className="text-muted ml-auto">/ {total} invited</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Guest list */}
        <h2 className="text-lg font-semibold text-fg mb-4">All Guests</h2>
        <GuestTable guests={guests} events={events} />
      </Container>
    </section>
  );
}
