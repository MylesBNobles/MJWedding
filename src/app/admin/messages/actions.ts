'use server';

import { createServerClient } from '@/lib/supabase';
import type { Guest } from '@/lib/database.types';

const IS_DEV = process.env.NODE_ENV === 'development';
const A2P_APPROVED = false; // flip to true once Twilio A2P approval comes through
// In dev we use Twilio test credentials (messages are validated but not delivered)
const SENDING_ENABLED = IS_DEV || A2P_APPROVED;

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
    // join through household
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
  if (!SENDING_ENABLED) {
    return { sent: 0, failed: 0, error: 'A2P_PENDING' };
  }

  const supabase = createServerClient();
  const guests = await getTargetGuests(target);
  const twilio = (await import('twilio')).default;

  const accountSid = IS_DEV
    ? process.env.TWILIO_TEST_ACCOUNT_SID!
    : process.env.TWILIO_ACCOUNT_SID!;
  const authToken = IS_DEV
    ? process.env.TWILIO_TEST_AUTH_TOKEN!
    : process.env.TWILIO_AUTH_TOKEN!;
  // Twilio test magic numbers: +15005550006 = valid sender, +15005550001 = invalid recipient (for testing failures)
  const fromNumber = IS_DEV ? '+15005550006' : process.env.TWILIO_FROM_NUMBER!;

  const client = twilio(accountSid, authToken);

  let sent = 0;
  let failed = 0;

  for (const guest of guests) {
    if (!guest.phone) continue;
    const message = interpolate(body, guest);
    try {
      const rawTo = guest.phone!.startsWith('+') ? guest.phone! : `+1${guest.phone}`;
      const to = IS_DEV && process.env.TWILIO_DEV_TO_OVERRIDE
        ? process.env.TWILIO_DEV_TO_OVERRIDE
        : rawTo;
      const msg = await client.messages.create({
        body: message,
        from: fromNumber,
        to,
      });
      await supabase.from('message_logs').insert({
        guest_id: guest.id,
        household_id: guest.household_id,
        channel: 'sms',
        recipient: rawTo,
        body: message,
        status: 'sent',
        provider_message_id: msg.sid,
        sent_at: new Date().toISOString(),
      } as never);
      sent++;
    } catch (err: unknown) {
      const error = err as Error;
      const rawTo = guest.phone!.startsWith('+') ? guest.phone! : `+1${guest.phone}`;
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
