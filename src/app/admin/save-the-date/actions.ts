'use server';

import { createServerClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type SaveTheDateGuest = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  save_the_date_sent: boolean;
  guest_type: string;
  is_named: boolean;
  household_id: string;
};

export type SaveTheDateHousehold = {
  id: string;
  household_name: string;
  side: string;
  guests: SaveTheDateGuest[];
};

export async function getSaveTheDateData(): Promise<SaveTheDateHousehold[]> {
  const supabase = createServerClient();

  const { data: households } = await supabase
    .from('households')
    .select('id, household_name, side')
    .not('side', 'is', null)
    .order('household_name');

  const householdIds = (households ?? []).map(h => h.id);
  if (!householdIds.length) return [];

  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, phone, save_the_date_sent, guest_type, is_named, household_id')
    .in('household_id', householdIds)
    .neq('invite_status', 'not_invited')
    .order('guest_type');

  const guestsByHousehold = new Map<string, SaveTheDateGuest[]>();
  for (const g of guests ?? []) {
    if (!guestsByHousehold.has(g.household_id)) guestsByHousehold.set(g.household_id, []);
    guestsByHousehold.get(g.household_id)!.push(g as SaveTheDateGuest);
  }

  return (households ?? [])
    .map(h => ({
      id: h.id,
      household_name: h.household_name,
      side: h.side,
      guests: guestsByHousehold.get(h.id) ?? [],
    }))
    .filter(h => h.guests.length > 0);
}

export async function toggleSaveTheDateSent(guestId: string, sent: boolean) {
  const supabase = createServerClient();
  await supabase
    .from('guests')
    .update({ save_the_date_sent: sent } as never)
    .eq('id', guestId);
  revalidatePath('/admin/save-the-date');
}
