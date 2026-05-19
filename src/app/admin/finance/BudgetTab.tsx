'use client';

import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { FinanceProfile, FinanceExpense, ExpenseTier } from './data';
import { TIER_CONFIG, fmtDollarFull, fmtDollar } from './data';
import {
  saveProfile,
  createExpense,
  updateExpense,
  removeExpense,
} from './actions';

const CARD_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const INPUT_STYLE: React.CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #CBD5E1',
  borderRadius: 6,
  color: '#0F172A',
  fontSize: 13,
  padding: '4px 8px',
  width: '100%',
  outline: 'none',
};

const TIERS: ExpenseTier[] = ['essential', 'important', 'lifestyle'];

interface Props {
  profile: FinanceProfile;
  expenses: FinanceExpense[];
  combinedMonthly: number;
  availableToSave: number;
  savingsRate: number;
  onProfileChange: (p: FinanceProfile) => void;
  onExpensesChange: (e: FinanceExpense[]) => void;
}

function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));

  if (editing) {
    return (
      <input
        autoFocus
        style={{ ...INPUT_STYLE, width: 90 }}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={() => {
          const n = parseFloat(raw);
          if (!isNaN(n)) onChange(n);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const n = parseFloat(raw);
            if (!isNaN(n)) onChange(n);
            setEditing(false);
          }
          if (e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }
  return (
    <button
      onClick={() => { setRaw(String(value)); setEditing(true); }}
      style={{
        background: 'none',
        border: 'none',
        color: '#0F172A',
        fontSize: 13,
        cursor: 'pointer',
        padding: '2px 4px',
        borderRadius: 4,
        borderBottom: '1px dashed #CBD5E1',
      }}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </button>
  );
}

function ProfileInputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: '#94A3B8' }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function DroppableTierColumn({
  tier,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  isDragOver,
}: {
  tier: ExpenseTier;
  expenses: FinanceExpense[];
  onAddExpense: (tier: ExpenseTier, name: string, amount: number) => void;
  onUpdateExpense: (id: string, patch: Partial<FinanceExpense>) => void;
  onRemoveExpense: (id: string) => void;
  isDragOver: boolean;
}) {
  const config = TIER_CONFIG[tier];
  const { setNodeRef } = useDroppable({ id: tier });
  const total = expenses.filter((e) => e.active).reduce((s, e) => s + e.amount, 0);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('100');
  const nameRef = useRef<HTMLInputElement>(null);

  function openForm() {
    setNewName('');
    setNewAmount('100');
    setAdding(true);
    setTimeout(() => nameRef.current?.focus(), 0);
  }

  function cancel() {
    setAdding(false);
    setNewName('');
    setNewAmount('100');
  }

  function commit() {
    const name = newName.trim();
    if (!name) { cancel(); return; }
    const amount = parseFloat(newAmount) || 100;
    onAddExpense(tier, name, amount);
    cancel();
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isDragOver ? '#EEF2FF' : '#FFFFFF',
        border: `1px solid ${isDragOver ? '#6366F1' : '#E2E8F0'}`,
        borderRadius: 12,
        padding: 16,
        minHeight: 300,
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{config.label}</span>
          </div>
          <span style={{ fontSize: 13, color: config.color, fontWeight: 600 }}>{fmtDollar(total)}/mo</span>
        </div>
        <p style={{ fontSize: 11, color: '#64748B', marginTop: 4, marginLeft: 16 }}>{config.description}</p>
      </div>

      {/* Expense items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {expenses.map((expense) => (
          <DraggableExpenseCard
            key={expense.id}
            expense={expense}
            onUpdate={onUpdateExpense}
            onRemove={onRemoveExpense}
          />
        ))}

        {/* Inline add form */}
        {adding && (
          <div style={{
            background: `${config.color}08`,
            border: `1.5px solid ${config.color}50`,
            borderRadius: 8,
            padding: '10px 10px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <input
              ref={nameRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') cancel();
              }}
              placeholder="Expense name…"
              style={{
                ...INPUT_STYLE,
                fontSize: 13,
                padding: '6px 8px',
                border: `1px solid ${config.color}40`,
              }}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }}>$/mo</span>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit();
                  if (e.key === 'Escape') cancel();
                }}
                style={{
                  ...INPUT_STYLE,
                  flex: 1,
                  padding: '5px 8px',
                  fontSize: 13,
                  border: `1px solid ${config.color}40`,
                }}
              />
              <button
                onClick={commit}
                style={{
                  background: config.color,
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Add
              </button>
              <button
                onClick={cancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: '0 2px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add trigger */}
      {!adding && (
        <button
          onClick={openForm}
          style={{
            marginTop: 12,
            padding: '8px',
            background: config.bg,
            border: `1px dashed ${config.color}50`,
            borderRadius: 8,
            color: config.color,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.15s',
          }}
        >
          + Add item
        </button>
      )}
    </div>
  );
}

function DraggableExpenseCard({
  expense,
  onUpdate,
  onRemove,
  isDragging: isDraggingProp,
}: {
  expense: FinanceExpense;
  onUpdate: (id: string, patch: Partial<FinanceExpense>) => void;
  onRemove: (id: string) => void;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: expense.id,
    data: { expense },
  });

  const [editingName, setEditingName] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const [nameDraft, setNameDraft] = useState(expense.name);
  const [amountDraft, setAmountDraft] = useState(String(expense.amount));
  const [hovered, setHovered] = useState(false);

  const isBeingDragged = isDragging || isDraggingProp;

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isBeingDragged ? '#EEF2FF' : '#F8FAFC',
        border: `1px solid ${isBeingDragged ? '#6366F1' : '#E2E8F0'}`,
        borderRadius: 8,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: expense.active ? (isBeingDragged ? 0.5 : 1) : 0.4,
        transition: 'opacity 0.15s, border-color 0.15s',
        cursor: isBeingDragged ? 'grabbing' : 'default',
      }}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        style={{ cursor: 'grab', color: '#64748B', fontSize: 12, flexShrink: 0, lineHeight: 1 }}
      >
        ⠿
      </div>

      {/* Active toggle */}
      <button
        onClick={() => onUpdate(expense.id, { active: !expense.active })}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: `2px solid ${expense.active ? TIER_CONFIG[expense.tier].color : '#64748B'}`,
          background: expense.active ? TIER_CONFIG[expense.tier].color : 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
          padding: 0,
        }}
      />

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              onUpdate(expense.id, { name: nameDraft });
              setEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onUpdate(expense.id, { name: nameDraft }); setEditingName(false); }
              if (e.key === 'Escape') setEditingName(false);
            }}
            style={{ ...INPUT_STYLE, width: '100%', fontSize: 12 }}
          />
        ) : (
          <span
            onClick={() => { setNameDraft(expense.name); setEditingName(true); }}
            style={{
              fontSize: 13,
              color: '#0F172A',
              cursor: 'text',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {expense.name}
          </span>
        )}
      </div>

      {/* Amount */}
      <div style={{ flexShrink: 0 }}>
        {editingAmount ? (
          <input
            autoFocus
            value={amountDraft}
            onChange={(e) => setAmountDraft(e.target.value)}
            onBlur={() => {
              const n = parseFloat(amountDraft);
              if (!isNaN(n)) onUpdate(expense.id, { amount: n });
              setEditingAmount(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const n = parseFloat(amountDraft);
                if (!isNaN(n)) onUpdate(expense.id, { amount: n });
                setEditingAmount(false);
              }
              if (e.key === 'Escape') setEditingAmount(false);
            }}
            style={{ ...INPUT_STYLE, width: 70, fontSize: 12, textAlign: 'right' }}
          />
        ) : (
          <span
            onClick={() => { setAmountDraft(String(expense.amount)); setEditingAmount(true); }}
            style={{
              fontSize: 12,
              color: '#94A3B8',
              cursor: 'text',
              borderBottom: '1px dashed #CBD5E1',
            }}
          >
            {fmtDollarFull(expense.amount)}
          </span>
        )}
      </div>

      {/* Delete */}
      {hovered && (
        <button
          onClick={() => onRemove(expense.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#EF4444',
            cursor: 'pointer',
            fontSize: 14,
            padding: '0 2px',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function BudgetTab({
  profile,
  expenses,
  combinedMonthly,
  availableToSave,
  savingsRate,
  onProfileChange,
  onExpensesChange,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overTier, setOverTier] = useState<ExpenseTier | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const debouncedSaveProfile = useCallback(
    (p: FinanceProfile) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveProfile(p), 800);
    },
    []
  );

  const handleProfileField = (
    section: keyof FinanceProfile,
    field: string,
    value: number | string
  ) => {
    const updated = {
      ...profile,
      [section]: { ...(profile[section] as Record<string, unknown>), [field]: value },
    } as FinanceProfile;
    onProfileChange(updated);
    debouncedSaveProfile(updated);
  };

  const handleUpdateExpense = useCallback(
    (id: string, patch: Partial<FinanceExpense>) => {
      onExpensesChange(
        expenses.map((e) => (e.id === id ? { ...e, ...patch } : e))
      );
      updateExpense(id, patch);
    },
    [expenses, onExpensesChange]
  );

  const handleRemoveExpense = useCallback(
    (id: string) => {
      onExpensesChange(expenses.filter((e) => e.id !== id));
      removeExpense(id);
    },
    [expenses, onExpensesChange]
  );

  const handleAddExpense = async (tier: ExpenseTier, name: string, amount: number) => {
    const created = await createExpense({ name, amount, tier });
    onExpensesChange([...expenses, created]);
  };

  const activeExpense = activeId ? expenses.find((e) => e.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverTier(null);

    if (!over) return;

    const droppedTier = over.id as ExpenseTier;
    if (!TIERS.includes(droppedTier)) return;

    const expense = expenses.find((e) => e.id === active.id);
    if (!expense || expense.tier === droppedTier) return;

    handleUpdateExpense(expense.id, { tier: droppedTier });
  }

  function handleDragOver(event: { over: { id: unknown } | null }) {
    if (event.over && TIERS.includes(event.over.id as ExpenseTier)) {
      setOverTier(event.over.id as ExpenseTier);
    } else {
      setOverTier(null);
    }
  }

  const totalExpenses = expenses.filter((e) => e.active).reduce((s, e) => s + e.amount, 0);

  const leftover = combinedMonthly - totalExpenses;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <SummaryCard
          label="Monthly Income"
          value={combinedMonthly}
          sub="combined take-home after 401k & tax"
          color="#0F172A"
        />
        <SummaryCard
          label="Monthly Expenses"
          value={totalExpenses}
          sub={`${expenses.filter(e => e.active).length} active items`}
          color="#DC2626"
        />
        <SummaryCard
          label="Left Over / Savings"
          value={leftover}
          sub={`${combinedMonthly > 0 ? ((leftover / combinedMonthly) * 100).toFixed(0) : 0}% savings rate`}
          color={leftover >= 0 ? '#059669' : '#DC2626'}
          highlight
        />
      </div>

      {/* Income inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Myles inputs */}
        <div style={CARD_STYLE}>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#0F172A' }}>
            {profile.partner1.name} — Income
          </p>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
            <ProfileInputRow label="Gross Salary">
              <NumberInput
                value={profile.partner1.grossSalary}
                onChange={(v) => handleProfileField('partner1', 'grossSalary', v)}
                prefix="$"
              />
            </ProfileInputRow>
            <ProfileInputRow label="401k %">
              <NumberInput
                value={profile.partner1.k401Pct}
                onChange={(v) => handleProfileField('partner1', 'k401Pct', v)}
                suffix="%"
              />
            </ProfileInputRow>
            <ProfileInputRow label="Tax Rate">
              <NumberInput
                value={profile.partner1.salaryTaxRate}
                onChange={(v) => handleProfileField('partner1', 'salaryTaxRate', v)}
                suffix="%"
              />
            </ProfileInputRow>
            <ProfileInputRow label="RSU Annual">
              <NumberInput
                value={profile.partner1.rsuAnnual}
                onChange={(v) => handleProfileField('partner1', 'rsuAnnual', v)}
                prefix="$"
              />
            </ProfileInputRow>
            <ProfileInputRow label="RSU Tax Rate">
              <NumberInput
                value={profile.partner1.rsuTaxRate}
                onChange={(v) => handleProfileField('partner1', 'rsuTaxRate', v)}
                suffix="%"
              />
            </ProfileInputRow>
            <ProfileInputRow label="RSU Stock Balance">
              <NumberInput
                value={profile.partner1.rsuStockBalance ?? 0}
                onChange={(v) => handleProfileField('partner1', 'rsuStockBalance', v)}
                prefix="$"
              />
            </ProfileInputRow>
          </div>
        </div>

        {/* Jeslin inputs */}
        <div style={CARD_STYLE}>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#0F172A' }}>
            {profile.partner2.name} — Income
          </p>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
            <ProfileInputRow label="Gross Salary">
              <NumberInput
                value={profile.partner2.grossSalary}
                onChange={(v) => handleProfileField('partner2', 'grossSalary', v)}
                prefix="$"
              />
            </ProfileInputRow>
            <ProfileInputRow label="401k %">
              <NumberInput
                value={profile.partner2.k401Pct}
                onChange={(v) => handleProfileField('partner2', 'k401Pct', v)}
                suffix="%"
              />
            </ProfileInputRow>
            <ProfileInputRow label="Tax Rate">
              <NumberInput
                value={profile.partner2.salaryTaxRate}
                onChange={(v) => handleProfileField('partner2', 'salaryTaxRate', v)}
                suffix="%"
              />
            </ProfileInputRow>
          </div>
        </div>
      </div>

      {/* Three-column expense board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TIERS.map((tier) => (
            <DroppableTierColumn
              key={tier}
              tier={tier}
              expenses={expenses.filter((e) => e.tier === tier)}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onRemoveExpense={handleRemoveExpense}
              isDragOver={overTier === tier}
            />
          ))}
        </div>

        <DragOverlay>
          {activeExpense ? (
            <DraggableExpenseCard
              expense={activeExpense}
              onUpdate={() => {}}
              onRemove={() => {}}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Sticky bottom bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          boxShadow: '0 -1px 8px rgba(0,0,0,0.06)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'center',
          gap: 48,
          zIndex: 100,
        }}
      >
        <StickyStat label="Monthly Income" value={fmtDollarFull(combinedMonthly)} color="#0F172A" />
        <StickyDivider />
        <StickyStat label="Monthly Expenses" value={fmtDollarFull(totalExpenses)} color="#EF4444" />
        <StickyDivider />
        <StickyStat
          label="Left Over"
          value={fmtDollarFull(leftover)}
          color={leftover >= 0 ? '#10B981' : '#EF4444'}
        />
        <StickyDivider />
        <StickyStat
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          color={savingsRate >= 20 ? '#10B981' : '#F59E0B'}
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color, highlight }: {
  label: string; value: number; sub: string; color: string; highlight?: boolean;
}) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(value));
  const display = value < 0 ? `−${formatted}` : formatted;
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${highlight && value >= 0 ? '#BBF7D0' : highlight && value < 0 ? '#FECACA' : '#E2E8F0'}`,
      borderRadius: 12,
      padding: '18px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{display}</p>
      <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{sub}</p>
    </div>
  );
}

function StickyStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color }}>{value}</p>
    </div>
  );
}

function StickyDivider() {
  return <div style={{ width: 1, background: '#E2E8F0', alignSelf: 'stretch' }} />;
}
