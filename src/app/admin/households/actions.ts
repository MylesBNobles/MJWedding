'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';

export type NewGuestInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  guestType: 'primary' | 'partner' | 'child' | 'adult' | 'plus_one';
};

export type NewHouseholdInput = {
  householdName: string;
  side: 'jeslin' | 'myles' | '';
  relationship: string;
  guests: NewGuestInput[];
};

export async function createHousehold(
  input: NewHouseholdInput,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  if (!input.householdName.trim()) return { success: false, error: 'Household name is required.' };
  if (input.guests.length === 0 || !input.guests[0].firstName.trim()) {
    return { success: false, error: 'At least one guest with a first name is required.' };
  }

  // 1. Create household
  const { data: householdData, error: householdError } = await supabase
    .from('households')
    .insert({
      household_name: input.householdName.trim(),
      side: input.side || null,
      relationship_to_couple: input.relationship.trim() || null,
      invite_status: 'maybe',
    } as never)
    .select('id')
    .single();

  if (householdError || !householdData) {
    return { success: false, error: householdError?.message ?? 'Failed to create household.' };
  }

  const householdId = (householdData as { id: string }).id;

  // 2. Create guests
  const guestRows = input.guests
    .filter(g => g.firstName.trim())
    .map((g, i) => ({
      household_id: householdId,
      first_name: g.firstName.trim(),
      last_name: g.lastName.trim() || null,
      phone: g.phone.replace(/\D/g, '') || null,
      email: g.email.trim() || null,
      guest_type: g.guestType,
      invite_status: 'maybe',
      is_named: true,
      plus_one_allowed: false,
      overall_rsvp_status: 'pending',
    }));

  const { data: createdGuests, error: guestsError } = await supabase
    .from('guests')
    .insert(guestRows as never)
    .select('id');

  if (guestsError || !createdGuests) {
    return { success: false, error: guestsError?.message ?? 'Failed to create guests.' };
  }

  const guestIds = (createdGuests as { id: string }[]).map(g => g.id);

  // 3. Set primary guest (first in list)
  await supabase
    .from('households')
    .update({ primary_guest_id: guestIds[0] } as never)
    .eq('id', householdId);

  // 4. Invite all guests to all events
  const { data: events } = await supabase.from('events').select('id');
  const eventIds = (events ?? []).map((e: { id: string }) => e.id);

  if (eventIds.length > 0) {
    const invitations = guestIds.flatMap(guestId =>
      eventIds.map(eventId => ({
        guest_id: guestId,
        event_id: eventId,
        invited: true,
        rsvp_status: 'pending',
      }))
    );
    await supabase.from('guest_event_invitations').insert(invitations as never);
  }

  revalidatePath('/admin');
  return { success: true };
}

// ── Household detail & editing ────────────────────────────────────────────────

export type HouseholdMember = {
  id: string;
  first_name: string;
  last_name: string | null;
  guest_type: string;
  overall_rsvp_status: string;
  phone: string | null;
  email: string | null;
  invite_status: string;
  plus_one_allowed: boolean;
  plus_one_guest_id: string | null;
};

export type HouseholdDetail = {
  id: string;
  household_name: string;
  side: string | null;
  relationship_to_couple: string | null;
  invite_status: string;
  primary_guest_id: string | null;
  members: HouseholdMember[];
};

export async function getHouseholdDetail(id: string): Promise<HouseholdDetail | null> {
  const supabase = createServerClient();

  const { data: household } = await supabase
    .from('households')
    .select('id, household_name, side, relationship_to_couple, invite_status, primary_guest_id')
    .eq('id', id)
    .single();

  if (!household) return null;

  const { data: members } = await supabase
    .from('guests')
    .select('id, first_name, last_name, guest_type, overall_rsvp_status, phone, email, invite_status, plus_one_allowed, plus_one_guest_id')
    .eq('household_id', id)
    .order('guest_type');

  return {
    ...(household as Omit<HouseholdDetail, 'members'>),
    members: (members ?? []) as HouseholdMember[],
  };
}

export type HouseholdUpdateFields = {
  household_name?: string;
  side?: string;
  relationship_to_couple?: string;
  invite_status?: string;
};

export async function updateHousehold(
  id: string,
  fields: HouseholdUpdateFields,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const payload: Record<string, string | null> = {};
  if (fields.household_name !== undefined) payload.household_name = fields.household_name.trim();
  if (fields.side !== undefined) payload.side = fields.side || null;
  if (fields.relationship_to_couple !== undefined) payload.relationship_to_couple = fields.relationship_to_couple.trim() || null;
  if (fields.invite_status !== undefined) payload.invite_status = fields.invite_status;

  const { error } = await supabase.from('households').update(payload as never).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function addGuestToHousehold(
  householdId: string,
  guest: NewGuestInput,
): Promise<{ success: boolean; error?: string }> {
  if (!guest.firstName.trim()) return { success: false, error: 'First name is required.' };
  const supabase = createServerClient();

  const { data: newGuest, error } = await supabase
    .from('guests')
    .insert({
      household_id: householdId,
      first_name: guest.firstName.trim(),
      last_name: guest.lastName.trim() || null,
      phone: guest.phone.replace(/\D/g, '') || null,
      email: guest.email.trim() || null,
      guest_type: guest.guestType,
      invite_status: 'maybe',
      is_named: true,
      plus_one_allowed: false,
      overall_rsvp_status: 'pending',
    } as never)
    .select('id')
    .single();

  if (error || !newGuest) return { success: false, error: error?.message ?? 'Failed to add guest.' };

  const guestId = (newGuest as { id: string }).id;
  const { data: events } = await supabase.from('events').select('id');
  const eventIds = (events ?? []).map((e: { id: string }) => e.id);

  if (eventIds.length > 0) {
    await supabase.from('guest_event_invitations').insert(
      eventIds.map(eid => ({ guest_id: guestId, event_id: eid, invited: true, rsvp_status: 'pending' })) as never
    );
  }

  revalidatePath('/admin');
  return { success: true };
}
