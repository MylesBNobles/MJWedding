import { GuestPlan } from './types';

const PLANS_KEY = 'wedding-hq-plans';
const SUBSCRIPTION_KEY = 'wedding-hq-subscription';
const LAST_UPDATED = '2026-02-12';

export function getPlans(): GuestPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PLANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePlan(plan: GuestPlan): void {
  if (typeof window === 'undefined') return;
  const plans = getPlans();
  const existingIndex = plans.findIndex(p => p.email.toLowerCase() === plan.email.toLowerCase());

  if (existingIndex >= 0) {
    plans[existingIndex] = { ...plan, updatedAt: new Date().toISOString() };
  } else {
    plans.push({ ...plan, id: generateId(), updatedAt: new Date().toISOString() });
  }

  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function getPlanByEmail(email: string): GuestPlan | null {
  const plans = getPlans();
  return plans.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
}

export function deletePlan(email: string): void {
  if (typeof window === 'undefined') return;
  const plans = getPlans();
  const filtered = plans.filter(p => p.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(PLANS_KEY, JSON.stringify(filtered));
}

export function getUpdatesSubscription(): { email: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SUBSCRIPTION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveUpdatesSubscription(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ email }));
}

export function getLastUpdated(): string {
  return LAST_UPDATED;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function exportPlansToCSV(): string {
  const plans = getPlans();
  if (plans.length === 0) return '';

  const headers = [
    'Name',
    'Email',
    'Party Size',
    'Attending',
    'Arrival Date/Time',
    'Arrival Airport',
    'Arrival Flight',
    'Departure Date/Time',
    'Departure Airport',
    'Departure Flight',
    'Lodging Name',
    'Lodging Area',
    'Transport Needs',
    'Dietary Notes',
    'Notes',
    'Updated At',
  ];

  const rows = plans.map(p => [
    p.name,
    p.email,
    p.partySize?.toString() || '',
    p.attendingStatus,
    p.arrivalDateTime || '',
    p.arrivalAirport || '',
    p.arrivalFlight || '',
    p.departureDateTime || '',
    p.departureAirport || '',
    p.departureFlight || '',
    p.lodgingName || '',
    p.lodgingArea || '',
    p.transportNeeds.join('; '),
    p.dietaryNotes || '',
    p.notes || '',
    p.updatedAt,
  ]);

  const escapeCSV = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
