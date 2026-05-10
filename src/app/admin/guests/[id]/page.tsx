import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import { Container, Card, Badge } from '@/components';
import { TagEditor } from '../../components/TagEditor';
import type { Guest, Event, GuestEventInvitation } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

async function getGuest(id: string) {
  const supabase = createServerClient();

  const { data: guestData } = await supabase
    .from('guests')
    .select('*, household:households!household_id(id, household_name, side, relationship_to_couple, notes)')
    .eq('id', id)
    .single();

  if (!guestData) return null;
  const guest = guestData as Guest & {
    household: {
      id: string;
      household_name: string;
      side: string | null;
      relationship_to_couple: string | null;
      notes: string | null;
    } | null;
  };

  const { data: invitationsData } = await supabase
    .from('guest_event_invitations')
    .select('*, event:events(*)')
    .eq('guest_id', id);

  const invitations = (invitationsData ?? []) as (GuestEventInvitation & { event: Event })[];

  // Get other guests in same household
  const { data: householdGuestsData } = await supabase
    .from('guests')
    .select('id, first_name, last_name, guest_type, overall_rsvp_status')
    .eq('household_id', guest.household_id)
    .neq('id', id);

  const householdGuests = (householdGuestsData ?? []) as Pick<Guest, 'id' | 'first_name' | 'last_name' | 'guest_type' | 'overall_rsvp_status'>[];

  return { guest, invitations, householdGuests };
}

function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'default' {
  if (status === 'accepted') return 'success';
  if (status === 'declined') return 'danger';
  if (status === 'pending') return 'warning';
  return 'default';
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(t: string | null) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default async function GuestDetailPage({ params }: { params: { id: string } }) {
  const data = await getGuest(params.id);
  if (!data) notFound();

  const { guest, invitations, householdGuests } = data;

  return (
    <section className="pt-28 pb-16 bg-[#FAF7F2] min-h-screen">
      <Container size="md">
        {/* Back */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors mb-8"
        >
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-cursive text-fg">
              {guest.first_name} {guest.last_name ?? ''}
            </h1>
            <p className="text-muted mt-1 capitalize">{guest.guest_type} · {guest.household?.household_name}</p>
          </div>
          <Badge variant={statusVariant(guest.overall_rsvp_status)} className="text-sm px-3 py-1">
            {guest.overall_rsvp_status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact info */}
          <Card>
            <h2 className="text-base font-semibold text-fg mb-4">Contact</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide">Phone</dt>
                <dd className="text-fg mt-0.5">{guest.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide">Email</dt>
                <dd className="text-fg mt-0.5">{guest.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide">Guest of</dt>
                <dd className="text-fg mt-0.5 capitalize">{guest.household?.side ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide">Relationship</dt>
                <dd className="text-fg mt-0.5">{guest.household?.relationship_to_couple ?? '—'}</dd>
              </div>
            </dl>
          </Card>

          {/* Dietary */}
          <Card>
            <h2 className="text-base font-semibold text-fg mb-4">Dietary & Notes</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide">Dietary restrictions</dt>
                <dd className="text-fg mt-0.5">{guest.dietary_restrictions ?? 'None'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide">Plus-one allowed</dt>
                <dd className="text-fg mt-0.5">{guest.plus_one_allowed ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted uppercase tracking-wide">Internal notes</dt>
                <dd className="text-fg mt-0.5">{guest.notes ?? '—'}</dd>
              </div>
            </dl>
          </Card>

          {/* Tags */}
          <Card className="md:col-span-2">
            <h2 className="text-base font-semibold text-fg mb-4">Tags</h2>
            <TagEditor guestId={guest.id} initialTags={guest.tags ?? []} />
          </Card>

          {/* Event RSVPs */}
          <Card className="md:col-span-2">
            <h2 className="text-base font-semibold text-fg mb-4">Event RSVPs</h2>
            {invitations.length === 0 ? (
              <p className="text-muted text-sm">Not invited to any events.</p>
            ) : (
              <div className="space-y-4">
                {invitations
                  .sort((a, b) => (a.event.event_date ?? '').localeCompare(b.event.event_date ?? ''))
                  .map(inv => (
                    <div key={inv.id} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-fg">{inv.event.name}</p>
                        <p className="text-sm text-muted">
                          {formatDate(inv.event.event_date)}
                          {inv.event.start_time && ` · ${formatTime(inv.event.start_time)}`}
                        </p>
                        {inv.dietary_restrictions && (
                          <p className="text-sm text-muted mt-1">Dietary: {inv.dietary_restrictions}</p>
                        )}
                        {inv.responded_at && (
                          <p className="text-xs text-muted/70 mt-1">
                            Responded {new Date(inv.responded_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusVariant(inv.rsvp_status)}>
                        {inv.rsvp_status}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {/* Household members */}
          {householdGuests.length > 0 && (
            <Card className="md:col-span-2">
              <h2 className="text-base font-semibold text-fg mb-4">Others in this household</h2>
              <div className="space-y-2">
                {householdGuests.map(g => (
                  <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <Link
                      href={`/admin/guests/${g.id}`}
                      className="font-medium text-fg hover:text-accent hover:underline transition-colors"
                    >
                      {g.first_name} {g.last_name ?? ''}
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted capitalize">{g.guest_type}</span>
                      <Badge variant={statusVariant(g.overall_rsvp_status)}>
                        {g.overall_rsvp_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Container>
    </section>
  );
}
