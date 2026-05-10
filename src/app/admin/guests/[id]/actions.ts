'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';
import type { Guest, Event, GuestEventInvitation } from '@/lib/database.types';

export type GuestDetail = {
  guest: Guest & {
    household: {
      id: string;
      household_name: string;
      side: string | null;
      relationship_to_couple: string | null;
      notes: string | null;
    } | null;
  };
  invitations: (GuestEventInvitation & { event: Event })[];
  householdGuests: Pick<Guest, 'id' | 'first_name' | 'last_name' | 'guest_type' | 'overall_rsvp_status'>[];
};

export async function getGuestDetail(id: string): Promise<GuestDetail | null> {
  const supabase = createServerClient();

  const { data: guestData } = await supabase
    .from('guests')
    .select('*, household:households!household_id(id, household_name, side, relationship_to_couple, notes)')
    .eq('id', id)
    .single();

  if (!guestData) return null;
  const guest = guestData as GuestDetail['guest'];

  const [{ data: invitationsData }, { data: householdGuestsData }] = await Promise.all([
    supabase
      .from('guest_event_invitations')
      .select('*, event:events(*)')
      .eq('guest_id', id),
    supabase
      .from('guests')
      .select('id, first_name, last_name, guest_type, overall_rsvp_status')
      .eq('household_id', guest.household_id)
      .neq('id', id),
  ]);

  return {
    guest,
    invitations: (invitationsData ?? []) as GuestDetail['invitations'],
    householdGuests: (householdGuestsData ?? []) as GuestDetail['householdGuests'],
  };
}

export type GuestUpdateFields = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  guest_type?: string;
  dietary_restrictions?: string;
  notes?: string;
  invite_status?: string;
};

export async function updateGuest(
  id: string,
  fields: GuestUpdateFields,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const payload: Record<string, string | null> = {};
  if (fields.first_name !== undefined) payload.first_name = fields.first_name.trim() || null!;
  if (fields.last_name !== undefined) payload.last_name = fields.last_name.trim() || null;
  if (fields.phone !== undefined) payload.phone = fields.phone.replace(/\D/g, '') || null;
  if (fields.email !== undefined) payload.email = fields.email.trim() || null;
  if (fields.guest_type !== undefined) payload.guest_type = fields.guest_type;
  if (fields.dietary_restrictions !== undefined) payload.dietary_restrictions = fields.dietary_restrictions.trim() || null;
  if (fields.notes !== undefined) payload.notes = fields.notes.trim() || null;
  if (fields.invite_status !== undefined) payload.invite_status = fields.invite_status;

  const { error } = await supabase.from('guests').update(payload as never).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteGuest(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase.from('guests').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function getAllHouseholds(): Promise<{ id: string; household_name: string }[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('households')
    .select('id, household_name')
    .order('household_name');
  return (data ?? []) as { id: string; household_name: string }[];
}

export async function moveGuestToHousehold(
  guestId: string,
  householdId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('guests')
    .update({ household_id: householdId } as never)
    .eq('id', guestId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function setPlusOneAllowed(
  guestId: string,
  allowed: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('guests')
    .update({ plus_one_allowed: allowed } as never)
    .eq('id', guestId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function addNamedPlusOne(
  guestId: string,
  householdId: string,
  firstName: string,
  lastName: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  const { data: newGuest, error: createError } = await supabase
    .from('guests')
    .insert({
      household_id: householdId,
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
      guest_type: 'plus_one',
      is_named: true,
      plus_one_allowed: false,
      invite_status: 'maybe',
      overall_rsvp_status: 'pending',
      invited_by_guest_id: guestId,
    } as never)
    .select('id')
    .single();

  if (createError || !newGuest) return { success: false, error: createError?.message ?? 'Failed to create plus-one.' };
  const plusOneId = (newGuest as { id: string }).id;

  await supabase
    .from('guests')
    .update({ plus_one_guest_id: plusOneId } as never)
    .eq('id', guestId);

  // Invite plus-one to all events the primary is invited to
  const { data: invitations } = await supabase
    .from('guest_event_invitations')
    .select('event_id')
    .eq('guest_id', guestId)
    .eq('invited', true);

  if (invitations && invitations.length > 0) {
    await supabase.from('guest_event_invitations').insert(
      (invitations as { event_id: string }[]).map(inv => ({
        guest_id: plusOneId,
        event_id: inv.event_id,
        invited: true,
        rsvp_status: 'pending',
      })) as never
    );
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function removePlusOne(
  guestId: string,
  plusOneGuestId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  await supabase
    .from('guests')
    .update({ plus_one_guest_id: null } as never)
    .eq('id', guestId);

  const { error } = await supabase.from('guests').delete().eq('id', plusOneGuestId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function updatePlusOneName(
  plusOneGuestId: string,
  firstName: string,
  lastName: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('guests')
    .update({ first_name: firstName.trim(), last_name: lastName.trim() || null } as never)
    .eq('id', plusOneGuestId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function updateInvitationRsvp(
  invitationId: string,
  guestId: string,
  rsvpStatus: 'pending' | 'accepted' | 'declined',
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('guest_event_invitations')
    .update({ rsvp_status: rsvpStatus, responded_at: rsvpStatus !== 'pending' ? new Date().toISOString() : null } as never)
    .eq('id', invitationId);

  if (error) return { success: false, error: error.message };

  // Recalculate overall_rsvp_status
  const { data: allInvitations } = await supabase
    .from('guest_event_invitations')
    .select('rsvp_status')
    .eq('guest_id', guestId);

  const statuses = (allInvitations ?? []).map((i: { rsvp_status: string }) => i.rsvp_status);
  const overall = statuses.every(s => s === 'declined')
    ? 'declined'
    : statuses.some(s => s === 'accepted')
    ? 'accepted'
    : 'pending';

  await supabase.from('guests').update({ overall_rsvp_status: overall } as never).eq('id', guestId);

  revalidatePath('/admin');
  return { success: true };
}

export async function addTag(guestId: string, tag: string) {
  const supabase = createServerClient();
  const trimmed = tag.trim().toLowerCase();
  if (!trimmed) return;

  const { data } = await supabase.from('guests').select('tags').eq('id', guestId).single();
  const current = (data as { tags: string[] } | null)?.tags ?? [];
  if (current.includes(trimmed)) return;

  await supabase
    .from('guests')
    .update({ tags: [...current, trimmed] } as never)
    .eq('id', guestId);

  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath('/admin');
}

export async function removeTag(guestId: string, tag: string) {
  const supabase = createServerClient();
  const { data } = await supabase.from('guests').select('tags').eq('id', guestId).single();
  const current = (data as { tags: string[] } | null)?.tags ?? [];

  await supabase
    .from('guests')
    .update({ tags: current.filter(t => t !== tag) } as never)
    .eq('id', guestId);

  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath('/admin');
}
