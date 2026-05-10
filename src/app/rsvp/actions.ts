'use server';

import { createServerClient } from '@/lib/supabase';
import type { Guest, Event, GuestEventInvitation } from '@/lib/database.types';

export type GuestWithInvitations = Guest & {
  invitations: (GuestEventInvitation & { event: Event })[];
  invitedByName: string | null;
};

export type HouseholdLookupResult = {
  householdId: string;
  householdName: string;
  guests: GuestWithInvitations[];
};

export async function lookupByPhone(phone: string): Promise<HouseholdLookupResult | null> {
  const supabase = createServerClient();
  const cleaned = phone.replace(/\D/g, '');

  const { data: guestRow } = await supabase
    .from('guests')
    .select('id, household_id')
    .eq('phone', cleaned)
    .neq('guest_type', 'plus_one')
    .single();

  const guest = guestRow as { id: string; household_id: string } | null;
  if (!guest) return null;

  const { data: householdRow } = await supabase
    .from('households')
    .select('id, household_name')
    .eq('id', guest.household_id)
    .single();

  const household = householdRow as { id: string; household_name: string } | null;
  if (!household) return null;

  const { data: guestsData } = await supabase
    .from('guests')
    .select('*')
    .eq('household_id', household.id)
    .eq('is_named', true)
    .neq('invite_status', 'not_invited')
    .order('guest_type');

  const guests = (guestsData ?? []) as Guest[];

  const { data: invitationsData } = await supabase
    .from('guest_event_invitations')
    .select('*, event:events(*)')
    .in('guest_id', guests.map(g => g.id))
    .eq('invited', true);

  const invitations = (invitationsData ?? []) as (GuestEventInvitation & { event: Event })[];

  const guestsWithInvitations: GuestWithInvitations[] = guests.map(g => {
    let invitedByName: string | null = null;
    if (g.guest_type === 'plus_one' && g.invited_by_guest_id) {
      const invitedBy = guests.find(other => other.id === g.invited_by_guest_id);
      if (invitedBy) invitedByName = invitedBy.first_name;
    }
    return {
      ...g,
      invitedByName,
      invitations: invitations
        .filter(inv => inv.guest_id === g.id)
        .sort((a, b) => (a.event.event_date ?? '').localeCompare(b.event.event_date ?? '')),
    };
  });

  return {
    householdId: household.id,
    householdName: household.household_name,
    guests: guestsWithInvitations,
  };
}

export type RsvpSubmission = {
  guestId: string;
  invitationId: string;
  rsvpStatus: 'accepted' | 'declined';
  dietaryRestrictions?: string;
  plusOneFirstName?: string;
  plusOneLastName?: string;
}[];

export async function submitRsvp(submissions: RsvpSubmission): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  for (const sub of submissions) {
    const { error } = await supabase
      .from('guest_event_invitations')
      .update({
        rsvp_status: sub.rsvpStatus,
        dietary_restrictions: sub.dietaryRestrictions || null,
        responded_at: now,
      } as never)
      .eq('id', sub.invitationId);

    if (error) return { success: false, error: error.message };

    // Create plus-one guest if named and primary accepted
    if (sub.rsvpStatus === 'accepted' && sub.plusOneFirstName?.trim()) {
      const { data: primaryGuest } = await supabase
        .from('guests')
        .select('household_id, plus_one_guest_id')
        .eq('id', sub.guestId)
        .single();

      const pg = primaryGuest as { household_id: string; plus_one_guest_id: string | null } | null;
      if (pg && !pg.plus_one_guest_id) {
        const { data: newPlusOne } = await supabase
          .from('guests')
          .insert({
            household_id: pg.household_id,
            first_name: sub.plusOneFirstName.trim(),
            last_name: sub.plusOneLastName?.trim() || null,
            guest_type: 'plus_one',
            is_named: true,
            plus_one_allowed: false,
            invite_status: 'maybe',
            overall_rsvp_status: 'accepted',
            invited_by_guest_id: sub.guestId,
          } as never)
          .select('id')
          .single();

        const po = newPlusOne as { id: string } | null;
        if (po) {
          // Link back to primary guest
          await supabase
            .from('guests')
            .update({ plus_one_guest_id: po.id } as never)
            .eq('id', sub.guestId);

          // Invite plus-one to the same events the primary accepted
          const acceptedEventIds = submissions
            .filter(s => s.guestId === sub.guestId && s.rsvpStatus === 'accepted')
            .map(s => s.invitationId);

          if (acceptedEventIds.length > 0) {
            const { data: invRows } = await supabase
              .from('guest_event_invitations')
              .select('event_id')
              .in('id', acceptedEventIds);

            const eventIds = (invRows ?? []).map((r: { event_id: string }) => r.event_id);
            if (eventIds.length > 0) {
              await supabase.from('guest_event_invitations').insert(
                eventIds.map(eventId => ({
                  guest_id: po.id,
                  event_id: eventId,
                  invited: true,
                  rsvp_status: 'accepted',
                  responded_at: now,
                })) as never
              );
            }
          }
        }
      }
    }
  }

  const guestIds = Array.from(new Set(submissions.map(s => s.guestId)));
  for (const guestId of guestIds) {
    const guestSubs = submissions.filter(s => s.guestId === guestId);
    const anyAccepted = guestSubs.some(s => s.rsvpStatus === 'accepted');
    const allDeclined = guestSubs.every(s => s.rsvpStatus === 'declined');
    const overall = allDeclined ? 'declined' : anyAccepted ? 'accepted' : 'pending';

    await supabase
      .from('guests')
      .update({ overall_rsvp_status: overall } as never)
      .eq('id', guestId);
  }

  return { success: true };
}
