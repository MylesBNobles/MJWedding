'use server';

import { createServerClient } from '@/lib/supabase';
import type { FinanceProfile, FinanceExpense, ExpenseTier, MonthlyRecord, MonthlyLineItem } from './data';

export async function getFinanceData(): Promise<{
  profile: FinanceProfile;
  expenses: FinanceExpense[];
  weddingTotal: number;
}> {
  const supabase = createServerClient();

  const [
    { data: profileRow },
    { data: expensesData },
    { data: budgetData },
  ] = await Promise.all([
    supabase
      .from('finance_profile')
      .select('profile')
      .limit(1)
      .single(),
    supabase
      .from('finance_expenses')
      .select('*')
      .order('sort_order'),
    supabase
      .from('budget_items')
      .select('estimated_eur')
      .eq('zone', 'active'),
  ]);

  const profile = (profileRow?.profile ?? {}) as FinanceProfile;

  const expenses: FinanceExpense[] = (expensesData ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    amount: Number(e.amount),
    tier: e.tier as ExpenseTier,
    active: e.active as boolean,
    sortOrder: e.sort_order as number,
  }));

  const weddingTotal = (budgetData ?? []).reduce(
    (sum: number, item: { estimated_eur: number | null }) =>
      sum + (Number(item.estimated_eur ?? 0) * 1.09),
    0
  );

  return { profile, expenses, weddingTotal };
}

export async function saveProfile(profile: FinanceProfile): Promise<void> {
  const supabase = createServerClient();

  // Get the existing row id
  const { data: existing } = await supabase
    .from('finance_profile')
    .select('id')
    .limit(1)
    .single();

  if (existing?.id) {
    await supabase
      .from('finance_profile')
      .update({ profile, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase.from('finance_profile').insert({ profile });
  }
}

export async function createExpense(data: {
  name: string;
  amount: number;
  tier: ExpenseTier;
}): Promise<FinanceExpense> {
  const supabase = createServerClient();

  // Get max sort_order for this tier
  const { data: existing } = await supabase
    .from('finance_expenses')
    .select('sort_order')
    .eq('tier', data.tier)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = ((existing?.sort_order as number | undefined) ?? 0) + 1;

  const { data: inserted, error } = await supabase
    .from('finance_expenses')
    .insert({ name: data.name, amount: data.amount, tier: data.tier, sort_order: nextOrder })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? 'Failed to create expense');

  return {
    id: inserted.id as string,
    name: inserted.name as string,
    amount: Number(inserted.amount),
    tier: inserted.tier as ExpenseTier,
    active: inserted.active as boolean,
    sortOrder: inserted.sort_order as number,
  };
}

export async function updateExpense(
  id: string,
  patch: Partial<Pick<FinanceExpense, 'name' | 'amount' | 'tier' | 'active' | 'sortOrder'>>
): Promise<void> {
  const supabase = createServerClient();

  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.tier !== undefined) dbPatch.tier = patch.tier;
  if (patch.active !== undefined) dbPatch.active = patch.active;
  if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;

  await supabase.from('finance_expenses').update(dbPatch).eq('id', id);
}

export async function removeExpense(id: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.from('finance_expenses').delete().eq('id', id);
}

function rowToRecord(r: Record<string, unknown>): MonthlyRecord {
  return {
    id: r.id as string,
    month: r.month as string,
    status: r.status as 'planned' | 'complete',
    lineItems: (r.line_items as MonthlyLineItem[]) ?? [],
    netWorthSnapshot: r.net_worth_snapshot != null ? Number(r.net_worth_snapshot) : null,
    debtSnapshot: r.debt_snapshot != null ? Number(r.debt_snapshot) : null,
    notes: (r.notes as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

export async function getMonthlyRecords(): Promise<MonthlyRecord[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('finance_monthly_records')
    .select('*')
    .order('month', { ascending: false });
  return (data ?? []).map((r) => rowToRecord(r as Record<string, unknown>));
}

export async function upsertMonthlyRecord(
  month: string,
  payload: {
    lineItems: MonthlyLineItem[];
    status: 'planned' | 'complete';
    netWorthSnapshot?: number;
    debtSnapshot?: number;
    notes?: string;
  }
): Promise<MonthlyRecord> {
  const supabase = createServerClient();

  // Compute aggregates from line items for backward-compat columns
  const income = payload.lineItems.filter((i) => i.category === 'income');
  const expenses = payload.lineItems.filter((i) => i.category !== 'income' && i.category !== 'savings');
  const savings = payload.lineItems.filter((i) => i.category === 'savings');

  const { data, error } = await supabase
    .from('finance_monthly_records')
    .upsert({
      month,
      status: payload.status,
      line_items: payload.lineItems,
      planned_take_home: income.reduce((s, i) => s + i.plannedAmount, 0),
      planned_expenses: expenses.reduce((s, i) => s + i.plannedAmount, 0),
      planned_savings: savings.reduce((s, i) => s + i.plannedAmount, 0),
      actual_take_home: income.some((i) => i.actualAmount !== null) ? income.reduce((s, i) => s + (i.actualAmount ?? i.plannedAmount), 0) : null,
      actual_expenses: expenses.some((i) => i.actualAmount !== null) ? expenses.reduce((s, i) => s + (i.actualAmount ?? i.plannedAmount), 0) : null,
      actual_savings: savings.some((i) => i.actualAmount !== null) ? savings.reduce((s, i) => s + (i.actualAmount ?? i.plannedAmount), 0) : null,
      net_worth_snapshot: payload.netWorthSnapshot ?? null,
      debt_snapshot: payload.debtSnapshot ?? null,
      notes: payload.notes ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'month' })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to save record');
  return rowToRecord(data as Record<string, unknown>);
}
