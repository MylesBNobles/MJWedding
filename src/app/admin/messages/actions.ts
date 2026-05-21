'use server';

import { createServerClient } from '@/lib/supabase';
import type { Guest } from '@/lib/database.types';

const IS_DEV = process.env.NODE_ENV === 'development';
const API_KEY = process.env.SIMPLE_TEXTING_API_KEY!;
const FROM_NUMBER = process.env.SIMPLE_TEXTING_FROM_NUMBER!;
const DEV_TO_OVERRIDE = process.env.SIMPLE_TEXTING_DEV_TO_OVERRIDE;

// SimpleTexting v2 REST API
const ST_BASE = 'https://api-app2.simpletexting.com/v2';

export type RecipientTarget =
  | { type: 'tag'; value: string }
  | { type: 'side'; value: string }
  | { type: 'status'; value: string }
  | { type: 'specific'; guestIds: string[] }
  | { type: 'all' };

export type MessagePreview = {
  guestId: string;
  name: string;
  phone: string;
  preview: string;
};

function interpolate(template: string, guest: Guest): string {
  return template
    .replace(/\{\{first_name\}\}/g, guest.first_name)
    .replace(/\{\{last_name\}\}/g, guest.last_name ?? '')
    .replace(/\{\{full_name\}\}/g, `${guest.first_name} ${guest.last_name ?? ''}`.trim());
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // Strip leading country code 1 if 11 digits, return 10-digit US number
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

async function getTargetGuests(target: RecipientTarget): Promise<Guest[]> {
  const supabase = createServerClient();
  let query = supabase
    .from('guests')
    .select('*')
    .eq('is_named', true)
    .neq('invite_status', 'not_invited')
    .neq('guest_type', 'plus_one')
    .not('phone', 'is', null);

  if (target.type === 'specific') {
    if (target.guestIds.length === 0) return [];
    query = query.in('id', target.guestIds);
  } else if (target.type === 'tag') {
    query = query.contains('tags', [target.value]);
  } else if (target.type === 'side') {
    const { data: households } = await supabase
      .from('households')
      .select('id')
      .eq('side', target.value);
    const ids = (households ?? []).map(h => h.id);
    if (ids.length === 0) return [];
    query = query.in('household_id', ids);
  } else if (target.type === 'status') {
    query = query.eq('overall_rsvp_status', target.value);
  }

  const { data } = await query;
  return (data ?? []) as Guest[];
}

async function sendSms(to: string, text: string): Promise<{ id: string }> {
  if (!API_KEY) throw new Error('SIMPLE_TEXTING_API_KEY is not set');
  if (!FROM_NUMBER) throw new Error('SIMPLE_TEXTING_FROM_NUMBER is not set');

  const res = await fetch(`${ST_BASE}/api/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contactPhone: to,
      accountPhone: formatPhone(FROM_NUMBER),
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SimpleTexting error ${res.status}: ${err}`);
  }

  const data = await res.json() as { id?: string | number };
  return { id: String(data.id ?? '') };
}

export async function previewMessage(
  target: RecipientTarget,
  body: string,
): Promise<{ recipients: MessagePreview[]; error?: string }> {
  const guests = await getTargetGuests(target);
  const recipients: MessagePreview[] = guests
    .filter(g => g.phone)
    .map(g => ({
      guestId: g.id,
      name: `${g.first_name} ${g.last_name ?? ''}`.trim(),
      phone: g.phone!,
      preview: interpolate(body, g),
    }));
  return { recipients };
}

export async function sendMessages(
  target: RecipientTarget,
  body: string,
): Promise<{ sent: number; failed: number; error?: string }> {
  if (!API_KEY || !FROM_NUMBER) {
    return { sent: 0, failed: 0, error: 'MISSING_CONFIG' };
  }

  const supabase = createServerClient();
  const guests = await getTargetGuests(target);

  let sent = 0;
  let failed = 0;

  for (const guest of guests) {
    if (!guest.phone) continue;
    const message = interpolate(body, guest);
    const rawTo = formatPhone(guest.phone);
    const to = IS_DEV && DEV_TO_OVERRIDE ? formatPhone(DEV_TO_OVERRIDE) : rawTo;

    try {
      const { id } = await sendSms(to, message);
      await supabase.from('message_logs').insert({
        guest_id: guest.id,
        household_id: guest.household_id,
        channel: 'sms',
        recipient: rawTo,
        body: message,
        status: 'sent',
        provider_message_id: id,
        sent_at: new Date().toISOString(),
      } as never);
      sent++;
    } catch (err: unknown) {
      const error = err as Error;
      await supabase.from('message_logs').insert({
        guest_id: guest.id,
        household_id: guest.household_id,
        channel: 'sms',
        recipient: rawTo,
        body: message,
        status: 'failed',
        error_message: error.message,
      } as never);
      failed++;
    }
  }

  return { sent, failed };
}

export async function getMessageHistory() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('message_logs')
    .select('*, guest:guests(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(100);
  return data ?? [];
}
