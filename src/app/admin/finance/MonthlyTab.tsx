'use client';

import { useState, useRef, useCallback } from 'react';
import type { FinanceProfile, FinanceExpense, MonthlyRecord, MonthlyLineItem, MonthlyLineCategory } from './data';
import { fmtDollarFull, fmtDollar, monthLabel, MONTHLY_CATEGORY_CONFIG, lineItemTotals } from './data';
import { upsertMonthlyRecord } from './actions';

const INPUT_STYLE: React.CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #CBD5E1',
  borderRadius: 6,
  color: '#0F172A',
  fontSize: 13,
  padding: '4px 8px',
  outline: 'none',
};

const EXPENSE_CATEGORIES: MonthlyLineCategory[] = ['essential', 'important', 'lifestyle'];

interface Props {
  profile: FinanceProfile;
  expenses: FinanceExpense[];
  initialRecords: MonthlyRecord[];
  combinedMonthly: number;
  totalExpenses: number;
  availableToSave: number;
  totalNetWorth: number;
  totalDebt: number;
}

function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function buildDefaultLineItems(
  profile: FinanceProfile,
  expenses: FinanceExpense[],
  combinedMonthly: number,
  availableToSave: number
): MonthlyLineItem[] {
  const items: MonthlyLineItem[] = [];
  const p1TH = Math.round(combinedMonthly * (profile.partner1.grossSalary / (profile.partner1.grossSalary + profile.partner2.grossSalary)));
  const p2TH = Math.round(combinedMonthly - p1TH);
  items.push({ id: crypto.randomUUID(), name: `${profile.partner1.name} Take-Home`, category: 'income', plannedAmount: p1TH, actualAmount: null });
  items.push({ id: crypto.randomUUID(), name: `${profile.partner2.name} Take-Home`, category: 'income', plannedAmount: p2TH, actualAmount: null });
  for (const e of expenses.filter((e) => e.active)) {
    items.push({ id: crypto.randomUUID(), name: e.name, category: e.tier as MonthlyLineCategory, plannedAmount: Math.round(e.amount), actualAmount: null });
  }
  if (availableToSave > 0) {
    items.push({ id: crypto.randomUUID(), name: 'Savings', category: 'savings', plannedAmount: Math.round(availableToSave), actualAmount: null });
  }
  return items;
}

export function MonthlyTab({ profile, expenses, initialRecords, combinedMonthly, totalExpenses, availableToSave, totalNetWorth, totalDebt }: Props) {
  const [records, setRecords] = useState<MonthlyRecord[]>(initialRecords);
  const [activeMonth, setActiveMonth] = useState(currentMonthStr());
  const [mode, setMode] = useState<'plan' | 'actuals'>('plan');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const thisMonth = currentMonthStr();
  const existingRecord = records.find((r) => r.month === activeMonth) ?? null;
  const isCurrentMonth = activeMonth === thisMonth;
  const isClosed = existingRecord?.status === 'complete';

  const [lineItems, setLineItems] = useState<MonthlyLineItem[]>(
    () => existingRecord?.lineItems.length
      ? existingRecord.lineItems
      : buildDefaultLineItems(profile, expenses, combinedMonthly, availableToSave)
  );
  const [nwSnapshot, setNwSnapshot] = useState(existingRecord?.netWorthSnapshot ?? totalNetWorth);
  const [debtSnapshot, setDebtSnapshot] = useState(existingRecord?.debtSnapshot ?? totalDebt);
  const [notes, setNotes] = useState(existingRecord?.notes ?? '');

  // When switching months, load that month's data
  function switchMonth(month: string) {
    const rec = records.find((r) => r.month === month) ?? null;
    setActiveMonth(month);
    setMode('plan');
    setLineItems(
      rec?.lineItems.length
        ? rec.lineItems
        : buildDefaultLineItems(profile, expenses, combinedMonthly, availableToSave)
    );
    setNwSnapshot(rec?.netWorthSnapshot ?? totalNetWorth);
    setDebtSnapshot(rec?.debtSnapshot ?? totalDebt);
    setNotes(rec?.notes ?? '');
  }

  const updateItem = useCallback((id: string, patch: Partial<MonthlyLineItem>) => {
    setLineItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
  }, []);

  const removeItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addItem = useCallback((category: MonthlyLineCategory, name: string, amount: number) => {
    setLineItems((prev) => [...prev, { id: crypto.randomUUID(), name, category, plannedAmount: amount, actualAmount: null }]);
  }, []);

  async function save(status: 'planned' | 'complete') {
    setSaving(true);
    try {
      const rec = await upsertMonthlyRecord(activeMonth, {
        lineItems, status,
        netWorthSnapshot: nwSnapshot,
        debtSnapshot: debtSnapshot,
        notes: notes || undefined,
      });
      setRecords((prev) => {
        const filtered = prev.filter((r) => r.month !== activeMonth);
        return [rec, ...filtered].sort((a, b) => b.month.localeCompare(a.month));
      });
      setSavedMsg(status === 'complete' ? 'Month closed ✓' : 'Saved ✓');
      setTimeout(() => setSavedMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  }

  // Totals
  const incomeTotals = lineItemTotals(lineItems, 'income');
  const savingsTotals = lineItemTotals(lineItems, 'savings');
  const essentialTotals = lineItemTotals(lineItems, 'essential');
  const importantTotals = lineItemTotals(lineItems, 'important');
  const lifestyleTotals = lineItemTotals(lineItems, 'lifestyle');
  const totalPlannedExp = essentialTotals.planned + importantTotals.planned + lifestyleTotals.planned;
  const totalActualExp = (essentialTotals.actual ?? essentialTotals.planned) + (importantTotals.actual ?? importantTotals.planned) + (lifestyleTotals.actual ?? lifestyleTotals.planned);

  const pastRecords = records.filter((r) => r.status === 'complete' && r.netWorthSnapshot !== null);
  const prevMonth = addMonths(activeMonth, -1);
  const nextMonth = addMonths(activeMonth, 1);
  const canGoNext = activeMonth < thisMonth;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 90 }}>

      {/* ── Month navigator + mode toggle ──────────────────────────────── */}
      <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => switchMonth(prevMonth)} style={navBtn}>←</button>
            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#0F172A' }}>{monthLabel(activeMonth)}</p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                {isClosed ? '✓ Closed' : isCurrentMonth ? 'Current month' : 'Past month'}
              </p>
            </div>
            <button onClick={() => switchMonth(nextMonth)} disabled={!canGoNext} style={{ ...navBtn, opacity: canGoNext ? 1 : 0.3 }}>→</button>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 0, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
            <ModeBtn active={mode === 'plan'} onClick={() => setMode('plan')}>📋 Plan Budget</ModeBtn>
            <ModeBtn active={mode === 'actuals'} onClick={() => setMode('actuals')}>✅ Enter Actuals</ModeBtn>
          </div>

          {/* Save actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {savedMsg && <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{savedMsg}</span>}
            {mode === 'plan' && (
              <button onClick={() => save('planned')} disabled={saving} style={saveBtn('#475569')}>
                {saving ? 'Saving…' : 'Save Plan'}
              </button>
            )}
            {mode === 'actuals' && (
              <>
                <button onClick={() => save('planned')} disabled={saving} style={saveBtn('#475569')}>
                  {saving ? 'Saving…' : 'Save Draft'}
                </button>
                <button onClick={() => save('complete')} disabled={saving} style={saveBtn('#059669')}>
                  {saving ? 'Saving…' : 'Close Month ✓'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mode explanation */}
        <div style={{ marginTop: 12, padding: '10px 14px', background: mode === 'plan' ? '#EFF6FF' : '#F0FDF4', borderRadius: 8, border: `1px solid ${mode === 'plan' ? '#BFDBFE' : '#BBF7D0'}` }}>
          <p style={{ fontSize: 12, color: mode === 'plan' ? '#1D4ED8' : '#059669', margin: 0 }}>
            {mode === 'plan'
              ? '📋 Planning mode — set your expected income, expenses, and savings for this month. Do this at the start of each month.'
              : '✅ Actuals mode — enter what actually happened. The Actual column is now editable. Click Close Month when done.'}
          </p>
        </div>

        {/* Month-end snapshot (actuals mode only) */}
        {mode === 'actuals' && (
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <SnapshotField label="Net Worth Snapshot ($)" value={nwSnapshot} onChange={setNwSnapshot} />
            <SnapshotField label="Total Debt ($)" value={debtSnapshot} onChange={setDebtSnapshot} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Notes</p>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the month go?"
                style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '7px 10px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Income ─────────────────────────────────────────────────────── */}
      <SectionCard
        category="income"
        items={lineItems.filter((i) => i.category === 'income')}
        mode={mode}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
      />

      {/* ── Expense columns ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {EXPENSE_CATEGORIES.map((cat) => (
          <SectionCard
            key={cat}
            category={cat}
            items={lineItems.filter((i) => i.category === cat)}
            mode={mode}
            onUpdate={updateItem}
            onRemove={removeItem}
            onAdd={addItem}
          />
        ))}
      </div>

      {/* ── Savings ─────────────────────────────────────────────────────── */}
      <SectionCard
        category="savings"
        items={lineItems.filter((i) => i.category === 'savings')}
        mode={mode}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
      />

      {/* ── Net worth chart ─────────────────────────────────────────────── */}
      {pastRecords.length > 0 && (
        <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px', color: '#0F172A' }}>Net Worth Over Time</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 16px' }}>From closed months</p>
          <NwChart records={pastRecords} currentNw={totalNetWorth} currentMonth={thisMonth} />
        </div>
      )}

      {/* ── Past months list ────────────────────────────────────────────── */}
      {pastRecords.length > 0 && (
        <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 14px', color: '#0F172A' }}>Closed Months</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pastRecords.map((rec) => (
              <PastMonthRow key={rec.id} rec={rec} onOpen={() => switchMonth(rec.month)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky bottom bar ───────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFF', borderTop: '1px solid #E2E8F0', boxShadow: '0 -1px 8px rgba(0,0,0,0.06)', padding: '10px 24px', display: 'flex', justifyContent: 'center', gap: 36, zIndex: 100 }}>
        <BottomStat label="Planned Income" value={fmtDollarFull(incomeTotals.planned)} color="#059669" />
        <BottomDiv />
        <BottomStat label="Planned Expenses" value={fmtDollarFull(totalPlannedExp)} color="#EF4444" />
        <BottomDiv />
        <BottomStat label="Planned Savings" value={fmtDollarFull(savingsTotals.planned)} color="#0EA5E9" />
        {mode === 'actuals' && <>
          <BottomDiv />
          <BottomStat label="Actual Income" value={incomeTotals.actual !== null ? fmtDollarFull(incomeTotals.actual) : '—'} color="#059669" />
          <BottomDiv />
          <BottomStat label="Actual Expenses" value={fmtDollarFull(totalActualExp)} color="#EF4444" />
          <BottomDiv />
          <BottomStat
            label="Variance"
            value={incomeTotals.actual !== null ? `${(incomeTotals.actual - totalActualExp) >= 0 ? '+' : ''}${fmtDollar(incomeTotals.actual - totalActualExp - (savingsTotals.actual ?? savingsTotals.planned))}` : '—'}
            color="#6366F1"
          />
        </>}
      </div>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ category, items, mode, onUpdate, onRemove, onAdd }: {
  category: MonthlyLineCategory;
  items: MonthlyLineItem[];
  mode: 'plan' | 'actuals';
  onUpdate: (id: string, patch: Partial<MonthlyLineItem>) => void;
  onRemove: (id: string) => void;
  onAdd: (category: MonthlyLineCategory, name: string, amount: number) => void;
}) {
  const cfg = MONTHLY_CATEGORY_CONFIG[category];
  const totals = lineItemTotals(items, category);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('0');
  const nameRef = useRef<HTMLInputElement>(null);

  function openAdd() { setNewName(''); setNewAmount('0'); setAdding(true); setTimeout(() => nameRef.current?.focus(), 0); }
  function cancelAdd() { setAdding(false); }
  function commitAdd() {
    const name = newName.trim();
    if (!name) { cancelAdd(); return; }
    onAdd(category, name, parseFloat(newAmount) || 0);
    cancelAdd();
  }

  const variance = totals.actual !== null ? totals.actual - totals.planned : null;
  const goodVar = variance !== null ? (category === 'income' || category === 'savings' ? variance >= 0 : variance <= 0) : null;

  return (
    <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{cfg.label}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{fmtDollar(totals.planned)}</span>
            {mode === 'actuals' && totals.actual !== null && (
              <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 6 }}>
                actual {fmtDollar(totals.actual)}
                {' '}
                <span style={{ color: goodVar ? '#059669' : '#DC2626', fontWeight: 700 }}>
                  ({variance! >= 0 ? '+' : ''}{fmtDollar(variance!)})
                </span>
              </span>
            )}
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#64748B', margin: '3px 0 0', paddingLeft: 16 }}>{cfg.description}</p>
      </div>

      {/* Column headers in actuals mode */}
      {mode === 'actuals' && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 60px 20px', gap: 4, padding: '0 4px 6px', borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Planned</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actual</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Δ</span>
          <span />
        </div>
      )}

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {items.map((item) => (
          <LineItemRow key={item.id} item={item} category={category} mode={mode} onUpdate={onUpdate} onRemove={onRemove} />
        ))}

        {adding && (
          <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.color}50`, borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              ref={nameRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') cancelAdd(); }}
              placeholder="Item name…"
              style={{ ...INPUT_STYLE, fontSize: 13, padding: '5px 8px', border: `1px solid ${cfg.color}40` }}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }}>$</span>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') cancelAdd(); }}
                style={{ ...INPUT_STYLE, flex: 1, fontSize: 13, padding: '5px 8px', border: `1px solid ${cfg.color}40` }}
              />
              <button onClick={commitAdd} style={{ background: cfg.color, border: 'none', borderRadius: 6, color: '#FFF', fontSize: 13, fontWeight: 600, padding: '5px 12px', cursor: 'pointer' }}>Add</button>
              <button onClick={cancelAdd} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>×</button>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <button onClick={openAdd} style={{ marginTop: 10, padding: '7px', background: cfg.bg, border: `1px dashed ${cfg.color}50`, borderRadius: 8, color: cfg.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
          + Add item
        </button>
      )}
    </div>
  );
}

// ── Line Item Row ─────────────────────────────────────────────────────────────

function LineItemRow({ item, category, mode, onUpdate, onRemove }: {
  item: MonthlyLineItem;
  category: MonthlyLineCategory;
  mode: 'plan' | 'actuals';
  onUpdate: (id: string, patch: Partial<MonthlyLineItem>) => void;
  onRemove: (id: string) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(item.name);
  const [hovered, setHovered] = useState(false);
  const cfg = MONTHLY_CATEGORY_CONFIG[category];

  const actual = item.actualAmount ?? item.plannedAmount;
  const variance = item.actualAmount !== null ? item.actualAmount - item.plannedAmount : null;
  const goodVar = variance !== null ? (category === 'income' || category === 'savings' ? variance >= 0 : variance <= 0) : null;

  const grid = mode === 'actuals'
    ? '1fr 90px 90px 60px 20px'
    : '1fr 90px 20px';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'grid', gridTemplateColumns: grid, gap: 4, alignItems: 'center', padding: '5px 4px', borderRadius: 6, background: hovered ? '#F8FAFC' : 'transparent' }}
    >
      {/* Name */}
      {editingName ? (
        <input
          autoFocus
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => { onUpdate(item.id, { name: nameDraft }); setEditingName(false); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onUpdate(item.id, { name: nameDraft }); setEditingName(false); }
            if (e.key === 'Escape') setEditingName(false);
          }}
          style={{ ...INPUT_STYLE, fontSize: 13 }}
        />
      ) : (
        <span onClick={() => { setNameDraft(item.name); setEditingName(true); }} style={{ fontSize: 13, color: '#0F172A', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </span>
      )}

      {/* Planned — always editable in plan mode, read-only in actuals */}
      {mode === 'plan' ? (
        <InlineAmount value={item.plannedAmount} onChange={(v) => onUpdate(item.id, { plannedAmount: v })} color={cfg.color} />
      ) : (
        <span style={{ fontSize: 13, color: '#94A3B8', textAlign: 'right', paddingRight: 4 }}>{fmtDollarFull(item.plannedAmount)}</span>
      )}

      {/* Actual — visible input in actuals mode */}
      {mode === 'actuals' && (
        <input
          type="number"
          value={actual}
          onChange={(e) => onUpdate(item.id, { actualAmount: parseFloat(e.target.value) || 0 })}
          style={{
            ...INPUT_STYLE,
            textAlign: 'right',
            fontSize: 13,
            fontWeight: 600,
            padding: '4px 6px',
            border: '1.5px solid #BBF7D0',
            background: '#F0FDF4',
            color: '#059669',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Variance */}
      {mode === 'actuals' && (
        <span style={{ fontSize: 11, fontWeight: 700, textAlign: 'right', color: variance === null ? '#CBD5E1' : goodVar ? '#059669' : '#DC2626' }}>
          {variance !== null ? `${variance >= 0 ? '+' : ''}${fmtDollar(variance)}` : '—'}
        </span>
      )}

      {/* Delete */}
      {hovered ? (
        <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}>×</button>
      ) : <div />}
    </div>
  );
}

function InlineAmount({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  if (editing) {
    return (
      <input
        autoFocus type="number" value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { const n = parseFloat(draft); if (!isNaN(n)) onChange(n); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { const n = parseFloat(draft); if (!isNaN(n)) onChange(n); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
        style={{ ...INPUT_STYLE, width: '100%', fontSize: 12, textAlign: 'right', boxSizing: 'border-box' }}
      />
    );
  }
  return (
    <button onClick={() => { setDraft(String(value)); setEditing(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, fontSize: 13, fontWeight: 500, textAlign: 'right', width: '100%', color, borderBottom: '1px dashed #CBD5E1' }}>
      {fmtDollarFull(value)}
    </button>
  );
}

// ── Past month row ────────────────────────────────────────────────────────────

function PastMonthRow({ rec, onOpen }: { rec: MonthlyRecord; onOpen: () => void }) {
  const income = lineItemTotals(rec.lineItems, 'income');
  const savings = lineItemTotals(rec.lineItems, 'savings');
  const exp = ['essential', 'important', 'lifestyle'].map((c) => lineItemTotals(rec.lineItems, c as MonthlyLineCategory));
  const totalExpPlan = exp.reduce((s, t) => s + t.planned, 0);
  const totalExpActual = exp.reduce((s, t) => s + (t.actual ?? t.planned), 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr 1fr auto', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #F1F5F9', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{monthLabel(rec.month)}</p>
        {rec.netWorthSnapshot && <p style={{ fontSize: 12, color: '#6366F1', fontWeight: 600, margin: 0 }}>{fmtDollar(rec.netWorthSnapshot)} NW</p>}
      </div>
      <HistCol label="Income" planned={income.planned} actual={income.actual} positive />
      <HistCol label="Expenses" planned={totalExpPlan} actual={totalExpActual} positive={false} />
      <HistCol label="Saved" planned={savings.planned} actual={savings.actual} positive />
      <button onClick={onOpen} style={{ padding: '5px 12px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
        View →
      </button>
    </div>
  );
}

function HistCol({ label, planned, actual, positive }: { label: string; planned: number; actual: number | null; positive: boolean }) {
  const variance = actual !== null ? actual - planned : null;
  const good = variance !== null ? (positive ? variance >= 0 : variance <= 0) : null;
  return (
    <div>
      <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0 }}>{fmtDollar(actual ?? planned)}</p>
      {variance !== null && <p style={{ fontSize: 10, fontWeight: 600, margin: '1px 0 0', color: good ? '#059669' : '#DC2626' }}>{variance >= 0 ? '+' : ''}{fmtDollar(variance)} vs plan</p>}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SnapshotField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{label}</p>
      <input type="number" value={value || ''} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14, fontWeight: 600, boxSizing: 'border-box' }} />
    </div>
  );
}

function BottomStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}
function BottomDiv() { return <div style={{ width: 1, background: '#E2E8F0', alignSelf: 'stretch' }} />; }

const navBtn: React.CSSProperties = { background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px', fontSize: 16, cursor: 'pointer', color: '#475569', fontWeight: 600 };
function saveBtn(color: string): React.CSSProperties { return { padding: '7px 16px', background: color, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#FFF' }; }
function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: active ? '#FFF' : 'transparent', color: active ? '#0F172A' : '#64748B', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
      {children}
    </button>
  );
}

// ── Net Worth Chart ───────────────────────────────────────────────────────────

function NwChart({ records, currentNw, currentMonth }: { records: MonthlyRecord[]; currentNw: number; currentMonth: string }) {
  const W = 900, H = 200, PAD = { top: 16, right: 60, bottom: 32, left: 72 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const allPoints = [...records.map((r) => ({ month: r.month, nw: r.netWorthSnapshot! }))];
  if (!records.find((r) => r.month === currentMonth)) allPoints.push({ month: currentMonth, nw: currentNw });
  allPoints.sort((a, b) => a.month.localeCompare(b.month));
  const values = allPoints.map((p) => p.nw);
  const minV = Math.min(...values) * 0.95, maxV = Math.max(...values) * 1.05;
  const range = maxV - minV || 1;
  const xOf = (i: number) => PAD.left + (i / Math.max(1, allPoints.length - 1)) * plotW;
  const yOf = (v: number) => PAD.top + plotH - ((v - minV) / range) * plotH;
  const pts = allPoints.map((p, i) => `${xOf(i)},${yOf(p.nw)}`).join(' ');
  const areaPath = `M${xOf(0)},${yOf(allPoints[0].nw)} ${allPoints.slice(1).map((p, i) => `L${xOf(i + 1)},${yOf(p.nw)}`).join(' ')} L${xOf(allPoints.length - 1)},${PAD.top + plotH} L${xOf(0)},${PAD.top + plotH} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <path d={areaPath} fill="url(#nwGrad)" opacity={0.15} />
      <polyline points={pts} fill="none" stroke="#6366F1" strokeWidth={2.5} strokeLinejoin="round" />
      {allPoints.map((p, i) => {
        const x = xOf(i), y = yOf(p.nw), isTod = p.month === currentMonth;
        const [yr, mo] = p.month.split('-');
        const lbl = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleString('en-US', { month: 'short' });
        return (
          <g key={p.month}>
            <circle cx={x} cy={y} r={isTod ? 5 : 4} fill={isTod ? '#6366F1' : '#FFF'} stroke="#6366F1" strokeWidth={2} />
            <text x={x} y={PAD.top + plotH + 16} textAnchor="middle" fontSize={10} fill="#94A3B8">{lbl}</text>
            {(i === 0 || i === allPoints.length - 1 || isTod) && <text x={x} y={y - 8} textAnchor="middle" fontSize={10} fontWeight="600" fill="#6366F1">{fmtDollar(p.nw)}</text>}
          </g>
        );
      })}
      {[0, 0.5, 1].map((t) => <text key={t} x={PAD.left - 6} y={PAD.top + plotH - t * plotH + 4} textAnchor="end" fontSize={10} fill="#94A3B8">{fmtDollar(minV + t * range)}</text>)}
      <defs><linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#6366F1" stopOpacity={0} /></linearGradient></defs>
    </svg>
  );
}
