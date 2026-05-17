'use server';

import { createServerClient } from '@/lib/supabase';
import { BudgetItem, BudgetCategory, BudgetStatus } from './data';

type DbRow = {
  id: string;
  category: string;
  line_item: string;
  vendor: string;
  status: string;
  estimated_eur: number;
  actual_eur: number | null;
  deposit_paid_eur: number;
  due_date: string | null;
  notes: string;
  zone: string;
  sort_order: number;
};

function rowToItem(row: DbRow): BudgetItem {
  return {
    id: row.id,
    category: row.category as BudgetCategory,
    lineItem: row.line_item,
    vendor: row.vendor,
    status: row.status as BudgetStatus,
    estimatedEur: Number(row.estimated_eur),
    actualEur: row.actual_eur !== null ? Number(row.actual_eur) : null,
    depositPaidEur: Number(row.deposit_paid_eur),
    dueDate: row.due_date ?? '',
    notes: row.notes,
    zone: row.zone as 'active' | 'considering' | 'cut',
  };
}

export async function getItems(): Promise<BudgetItem[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from('budget_items')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data as DbRow[]).map(rowToItem);
}

export async function createItem(category: BudgetCategory): Promise<BudgetItem> {
  const db = createServerClient();
  const { data: maxData } = await db
    .from('budget_items')
    .select('sort_order')
    .eq('category', category)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = maxData && maxData.length > 0 ? maxData[0].sort_order + 1 : 1;

  const { data, error } = await db
    .from('budget_items')
    .insert({
      category,
      line_item: 'New Item',
      vendor: '',
      status: 'Planned',
      estimated_eur: 0,
      actual_eur: null,
      deposit_paid_eur: 0,
      due_date: null,
      notes: '',
      zone: 'active',
      sort_order: nextOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToItem(data as DbRow);
}

export async function updateItem(id: string, patch: Partial<BudgetItem>): Promise<void> {
  const db = createServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.lineItem    !== undefined) dbPatch.line_item        = patch.lineItem;
  if (patch.vendor      !== undefined) dbPatch.vendor           = patch.vendor;
  if (patch.status      !== undefined) dbPatch.status           = patch.status;
  if (patch.estimatedEur  !== undefined) dbPatch.estimated_eur  = patch.estimatedEur;
  if (patch.actualEur     !== undefined) dbPatch.actual_eur     = patch.actualEur;
  if (patch.depositPaidEur !== undefined) dbPatch.deposit_paid_eur = patch.depositPaidEur;
  if (patch.dueDate     !== undefined) dbPatch.due_date         = patch.dueDate || null;
  if (patch.notes       !== undefined) dbPatch.notes            = patch.notes;
  if (patch.zone        !== undefined) dbPatch.zone             = patch.zone;
  if (patch.category    !== undefined) dbPatch.category         = patch.category;

  const { error } = await db.from('budget_items').update(dbPatch).eq('id', id);
  if (error) throw error;
}

export async function removeItem(id: string): Promise<void> {
  const db = createServerClient();
  const { error } = await db.from('budget_items').delete().eq('id', id);
  if (error) throw error;
}
