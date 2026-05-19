'use client';

import { useState, useRef } from 'react';
import type { FinanceProfile, FinanceExpense, Debt, DebtType } from './data';
import { monthly401k, monthlyRsu, fmtDollar, fmtDollarFull, monthsToPayoff, totalInterestPaid, DEBT_TYPE_LABELS } from './data';
import { saveProfile } from './actions';

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: '20px 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
};

const DIVIDER: React.CSSProperties = {
  borderTop: '1px solid #F1F5F9',
  margin: '12px 0',
};

interface Props {
  profile: FinanceProfile;
  expenses: FinanceExpense[];
  weddingTotal: number;
  combinedMonthly: number;
  p1TakeHome: number;
  p1Rsu: number;
  p2TakeHome: number;
  totalExpenses: number;
  availableToSave: number;
  savingsRate: number;
  onProfileChange: (p: FinanceProfile) => void;
}

const WEDDING_DATE = new Date('2027-06-12');

function monthsUntilWedding(): number {
  const now = new Date();
  return Math.max(
    0,
    (WEDDING_DATE.getFullYear() - now.getFullYear()) * 12 +
      (WEDDING_DATE.getMonth() - now.getMonth())
  );
}

export function OverviewTab({
  profile,
  weddingTotal,
  combinedMonthly,
  p1TakeHome,
  p2TakeHome,
  totalExpenses,
  availableToSave,
  savingsRate,
  onProfileChange,
}: Props) {
  const [editingEf, setEditingEf] = useState(false);
  const [efInput, setEfInput] = useState('');
  const efInputRef = useRef<HTMLInputElement>(null);

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [newDebt, setNewDebt] = useState<Omit<Debt, 'id'>>({
    name: '', balance: 0, interestRate: 5.5, minimumPayment: 0, type: 'student_loan',
  });

  const saved = profile.household.currentSavings;
  const gap = Math.max(0, weddingTotal - saved);
  const months = monthsUntilWedding();
  const requiredMonthlySavings = months > 0 ? gap / months : 0;
  const weddingProgress = weddingTotal > 0 ? Math.min(100, (saved / weddingTotal) * 100) : 100;

  const p1Monthly401k = monthly401k(profile.partner1.grossSalary, profile.partner1.k401Pct);
  const p2Monthly401k = monthly401k(profile.partner2.grossSalary, profile.partner2.k401Pct);
  const rsuNetAnnual = monthlyRsu(profile.partner1.rsuAnnual, profile.partner1.rsuTaxRate) * 12;

  const combinedGrossSalary = profile.partner1.grossSalary + profile.partner2.grossSalary;

  // Net worth snapshot
  const cash = profile.household.currentSavings;
  const rsuStock = profile.partner1.rsuStockBalance ?? 0;
  const p1_401k = profile.partner1.k401Balance ?? 0;
  const p2_401k = profile.partner2.k401Balance ?? 0;
  const p1Roth = profile.partner1.rothBalance ?? 0;
  const p2Roth = profile.partner2.rothBalance ?? 0;
  const totalNetWorth = cash + rsuStock + p1_401k + p2_401k + p1Roth + p2Roth;

  // Emergency fund
  const efFund = profile.household.emergencyFund ?? 20000;
  const monthsOfExpenses = totalExpenses > 0 ? efFund / totalExpenses : 0;
  const target3mo = totalExpenses * 3;
  const target6mo = totalExpenses * 6;
  const efStatus = efFund < 20000 || monthsOfExpenses < 3 ? 'red' : monthsOfExpenses < 5 ? 'yellow' : 'green';
  const efColor = efStatus === 'red' ? '#DC2626' : efStatus === 'yellow' ? '#D97706' : '#059669';
  const efBg = efStatus === 'red' ? '#FEF2F2' : efStatus === 'yellow' ? '#FFFBEB' : '#F0FDF4';
  const efBorder = efStatus === 'red' ? '#FECACA' : efStatus === 'yellow' ? '#FDE68A' : '#BBF7D0';
  const efStatusLabel = efStatus === 'red' ? (efFund < 20000 ? 'Below $20k minimum' : 'Below 3 months') : efStatus === 'yellow' ? 'Building up' : 'Healthy';
  const efProgressPct = Math.min(100, (monthsOfExpenses / 6) * 100);
  const ef3moPct = Math.min(100, (3 / 6) * 100); // 50%

  // Debts
  const debts = profile.household.debts ?? [];
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const trueNetWorth = totalNetWorth - totalDebt;

  async function addDebt() {
    if (!newDebt.name || newDebt.balance <= 0) return;
    const debt: Debt = { ...newDebt, id: crypto.randomUUID() };
    const updated = { ...profile, household: { ...profile.household, debts: [...debts, debt] } };
    onProfileChange(updated);
    await saveProfile(updated);
    setNewDebt({ name: '', balance: 0, interestRate: 5.5, minimumPayment: 0, type: 'student_loan' });
    setShowAddDebt(false);
  }

  async function deleteDebt(id: string) {
    const updated = { ...profile, household: { ...profile.household, debts: debts.filter((d) => d.id !== id) } };
    onProfileChange(updated);
    await saveProfile(updated);
  }

  async function updateDebtBalance(id: string, balance: number) {
    const updated = { ...profile, household: { ...profile.household, debts: debts.map((d) => d.id === id ? { ...d, balance } : d) } };
    onProfileChange(updated);
    await saveProfile(updated);
  }

  function startEfEdit() {
    setEfInput(String(efFund));
    setEditingEf(true);
    setTimeout(() => efInputRef.current?.select(), 0);
  }

  async function commitEfEdit() {
    const val = parseFloat(efInput.replace(/[^0-9.]/g, ''));
    if (!isNaN(val) && val >= 0) {
      const updated = { ...profile, household: { ...profile.household, emergencyFund: val } };
      onProfileChange(updated);
      await saveProfile(updated);
    }
    setEditingEf(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Row 1: 4 top metric cards ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <MetricCard
          label="Combined Gross Salary"
          value={fmtDollarFull(combinedGrossSalary)}
          sub={`${fmtDollar(combinedGrossSalary / 12)}/mo`}
          color="#0F172A"
        />
        <MetricCard
          label="Monthly Cash Take-Home"
          value={fmtDollar(combinedMonthly)}
          sub="after 401k & taxes"
          color="#059669"
        />
        <MetricCard
          label="Monthly Expenses"
          value={fmtDollar(totalExpenses)}
          sub={`${fmtDollar(totalExpenses * 12)}/yr`}
          color="#DC2626"
        />
        <MetricCard
          label="Available to Save"
          value={fmtDollar(availableToSave)}
          sub={`${savingsRate.toFixed(0)}% savings rate`}
          color={availableToSave >= 0 ? '#059669' : '#DC2626'}
          badge={savingsRate >= 20 ? 'Great' : savingsRate >= 10 ? 'Good' : 'Low'}
          badgeColor={savingsRate >= 20 ? '#059669' : savingsRate >= 10 ? '#D97706' : '#DC2626'}
        />
      </div>

      {/* ── Emergency Fund ───────────────────────────────────────────────── */}
      <div style={{ ...CARD, background: efBg, border: `1px solid ${efBorder}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 3px', color: '#0F172A' }}>Emergency Fund</p>
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
              Target: {fmtDollar(target3mo)} – {fmtDollar(target6mo)} &nbsp;(3–6 months of expenses)
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99,
            background: `${efColor}18`, color: efColor,
          }}>
            {efStatus === 'red' ? '⚠ ' : efStatus === 'yellow' ? '● ' : '✓ '}{efStatusLabel}
          </span>
        </div>

        {/* Amount + inline edit */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
          {editingEf ? (
            <input
              ref={efInputRef}
              type="number"
              value={efInput}
              onChange={(e) => setEfInput(e.target.value)}
              onBlur={commitEfEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEfEdit(); if (e.key === 'Escape') setEditingEf(false); }}
              style={{
                fontSize: 28, fontWeight: 800, color: efColor, border: 'none',
                borderBottom: `2px solid ${efColor}`, background: 'transparent',
                outline: 'none', width: 160, letterSpacing: '-0.02em',
              }}
            />
          ) : (
            <button
              onClick={startEfEdit}
              title="Click to edit"
              style={{
                fontSize: 28, fontWeight: 800, color: efColor, background: 'none',
                border: 'none', padding: 0, cursor: 'pointer', letterSpacing: '-0.02em',
              }}
            >
              {fmtDollarFull(efFund)}
            </button>
          )}
          <span style={{ fontSize: 13, color: '#64748B' }}>
            = {monthsOfExpenses.toFixed(1)} months of expenses
          </span>
        </div>

        {/* Progress bar — 0 to 6 months */}
        <div style={{ position: 'relative', marginBottom: 6 }}>
          {/* Track */}
          <div style={{ height: 10, background: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'visible', position: 'relative' }}>
            <div style={{
              width: `${efProgressPct}%`, height: '100%',
              background: efColor, borderRadius: 99, transition: 'width 0.4s ease',
            }} />
            {/* 3-month marker */}
            <div style={{
              position: 'absolute', left: `${ef3moPct}%`, top: -3,
              width: 2, height: 16, background: '#94A3B8', borderRadius: 1,
            }} />
          </div>
          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>$0</span>
            <span style={{ fontSize: 10, color: '#94A3B8', position: 'absolute', left: `${ef3moPct}%`, transform: 'translateX(-50%)' }}>3 mo</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>6 mo</span>
          </div>
        </div>

        {/* Min floor warning */}
        {efFund < 20000 && (
          <p style={{ fontSize: 11, color: '#DC2626', margin: '8px 0 0', fontWeight: 600 }}>
            ⚠ Minimum floor is $20,000 — currently {fmtDollarFull(20000 - efFund)} below target
          </p>
        )}
        <p style={{ fontSize: 11, color: '#94A3B8', margin: '6px 0 0' }}>Click the amount to update · Minimum $20k floor</p>
      </div>

      {/* ── Debts & Liabilities ──────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 3px', color: '#0F172A' }}>Debts & Liabilities</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Goal: debt-free · Track balances and payoff timelines</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {totalDebt > 0 && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 1px' }}>Total Debt</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#DC2626', margin: 0, letterSpacing: '-0.02em' }}>{fmtDollarFull(totalDebt)}</p>
              </div>
            )}
            {totalDebt === 0 && (
              <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 12, padding: '4px 14px', borderRadius: 99, fontWeight: 700 }}>Debt Free ✓</span>
            )}
          </div>
        </div>

        {/* Debt list */}
        {debts.length === 0 && !showAddDebt && (
          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>No debts tracked — add one below</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {debts.map((debt) => {
            const moMin = monthsToPayoff(debt.balance, debt.interestRate, debt.minimumPayment);
            const intMin = totalInterestPaid(debt.balance, debt.interestRate, debt.minimumPayment);
            const extraPayment = Math.max(0, availableToSave);
            const moExtra = extraPayment > 0 ? monthsToPayoff(debt.balance, debt.interestRate, debt.minimumPayment + extraPayment) : null;
            const intExtra = moExtra !== null && isFinite(moExtra) ? totalInterestPaid(debt.balance, debt.interestRate, debt.minimumPayment + extraPayment) : null;
            return (
              <div key={debt.id} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{debt.name}</span>
                      <span style={{ fontSize: 10, background: '#FEE2E2', color: '#DC2626', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>
                        {DEBT_TYPE_LABELS[debt.type]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                      <span><strong style={{ color: '#DC2626' }}>{fmtDollarFull(debt.balance)}</strong> balance</span>
                      <span>{debt.interestRate}% APR</span>
                      <span>{fmtDollar(debt.minimumPayment)}/mo minimum</span>
                    </div>
                    {/* Payoff projections */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '8px 10px' }}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>At minimum payment</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', margin: '0 0 1px' }}>
                          {isFinite(moMin) ? `${Math.floor(moMin / 12)}y ${moMin % 12}m` : 'Never paid off'}
                        </p>
                        {isFinite(intMin) && <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>+{fmtDollar(intMin)} interest</p>}
                      </div>
                      {moExtra !== null && isFinite(moExtra) && intExtra !== null && (
                        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '8px 10px' }}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>
                            +{fmtDollar(extraPayment)}/mo extra (all savings)
                          </p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', margin: '0 0 1px' }}>
                            {Math.floor(moExtra / 12)}y {moExtra % 12}m
                          </p>
                          <p style={{ fontSize: 11, color: '#059669', margin: 0 }}>saves {fmtDollar(intMin - intExtra)} in interest</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDebt(debt.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16, padding: '0 0 0 12px', lineHeight: 1 }}
                    title="Remove debt"
                  >×</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add debt form */}
        {showAddDebt ? (
          <div style={{ marginTop: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: '0 0 12px' }}>Add Debt</p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
              <div>
                <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Name</p>
                <input
                  placeholder="Student Loans"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt((d) => ({ ...d, name: e.target.value }))}
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Balance ($)</p>
                <input
                  type="number"
                  placeholder="20000"
                  value={newDebt.balance || ''}
                  onChange={(e) => setNewDebt((d) => ({ ...d, balance: parseFloat(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>APR (%)</p>
                <input
                  type="number"
                  step="0.1"
                  placeholder="5.5"
                  value={newDebt.interestRate || ''}
                  onChange={(e) => setNewDebt((d) => ({ ...d, interestRate: parseFloat(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Min. Payment</p>
                <input
                  type="number"
                  placeholder="200"
                  value={newDebt.minimumPayment || ''}
                  onChange={(e) => setNewDebt((d) => ({ ...d, minimumPayment: parseFloat(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Type</p>
                <select
                  value={newDebt.type}
                  onChange={(e) => setNewDebt((d) => ({ ...d, type: e.target.value as DebtType }))}
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', background: '#FFF' }}
                >
                  {(Object.keys(DEBT_TYPE_LABELS) as DebtType[]).map((t) => (
                    <option key={t} value={t}>{DEBT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                onClick={addDebt}
                disabled={!newDebt.name || newDebt.balance <= 0}
                style={{
                  padding: '7px 18px', background: '#0F172A', color: '#FFF', border: 'none',
                  borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >Add</button>
              <button
                onClick={() => setShowAddDebt(false)}
                style={{ padding: '7px 14px', background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, cursor: 'pointer', color: '#64748B' }}
              >Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddDebt(true)}
            style={{
              marginTop: debts.length > 0 ? 10 : 0, padding: '7px 16px',
              background: 'none', border: '1px dashed #CBD5E1', borderRadius: 8,
              fontSize: 13, color: '#64748B', cursor: 'pointer', width: '100%',
            }}
          >+ Add Debt</button>
        )}
      </div>

      {/* ── Row 2: Net Worth Snapshot ────────────────────────────────────── */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 3px', color: '#0F172A' }}>Net Worth Snapshot</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Current balances across all accounts</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>True Net Worth</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{fmtDollarFull(trueNetWorth)}</p>
            {totalDebt > 0 && (
              <p style={{ fontSize: 11, color: '#DC2626', margin: '2px 0 0' }}>
                {fmtDollarFull(totalNetWorth)} assets − {fmtDollarFull(totalDebt)} debt
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid #F1F5F9' }}>
          {/* Cash / Checking */}
          <NwCell
            label="Cash / Savings"
            value={cash}
            sub="Checking & savings"
            color="#059669"
            pct={totalNetWorth > 0 ? (cash / totalNetWorth) * 100 : 0}
            barColor="#059669"
          />
          {/* RSU Stock */}
          <NwCell
            label="RSU Stock"
            value={rsuStock}
            sub="Company shares (vested)"
            color="#6366F1"
            pct={totalNetWorth > 0 ? (rsuStock / totalNetWorth) * 100 : 0}
            barColor="#6366F1"
            border
          />
          {/* 401k + Roth */}
          <NwCell
            label="Retirement Accounts"
            value={p1_401k + p2_401k + p1Roth + p2Roth}
            sub={`401k: ${fmtDollar(p1_401k + p2_401k)} · Roth: ${fmtDollar(p1Roth + p2Roth)}`}
            color="#D97706"
            pct={totalNetWorth > 0 ? ((p1_401k + p2_401k + p1Roth + p2Roth) / totalNetWorth) * 100 : 0}
            barColor="#D97706"
            border
          />
        </div>

        {/* Breakdown detail row */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          <MiniStat label="Cash / Savings" value={fmtDollarFull(cash)} />
          <MiniStat label="RSU Stock" value={fmtDollarFull(rsuStock)} />
          <MiniStat label={`${profile.partner1.name} 401k`} value={fmtDollarFull(p1_401k)} />
          <MiniStat label={`${profile.partner2.name} 401k`} value={fmtDollarFull(p2_401k)} />
          <MiniStat label="Roth IRA (combined)" value={fmtDollarFull(p1Roth + p2Roth)} />
        </div>
      </div>

      {/* ── Row 3: Income breakdown cards ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Myles */}
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#0F172A' }}>{profile.partner1.name}</p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Age {profile.partner1.age}</p>
            </div>
            <span style={{ fontSize: 11, background: '#EEF2FF', color: '#6366F1', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
              Primary
            </span>
          </div>

          {/* Salary breakdown */}
          <p style={{ ...LABEL, marginBottom: 10 }}>Salary Breakdown</p>
          <Row label="Gross Salary" value={fmtDollarFull(profile.partner1.grossSalary)} sub="/yr" bold />
          <Row label={`401k (${profile.partner1.k401Pct}%)`} value={`−${fmtDollar(p1Monthly401k)}/mo`} note="retirement" muted />
          <Row label={`Taxes (~${profile.partner1.salaryTaxRate}%)`} value={`−${fmtDollar(profile.partner1.grossSalary * (1 - profile.partner1.k401Pct / 100) * (profile.partner1.salaryTaxRate / 100) / 12)}/mo`} muted />
          <div style={DIVIDER} />
          <Row label="Cash Take-Home" value={`${fmtDollarFull(p1TakeHome * 12)}/yr`} sub={`${fmtDollar(p1TakeHome)}/mo`} green bold />

          {/* Amazon RSU — separate section */}
          <div style={{ marginTop: 16, background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                RSU Stock (Company Shares)
              </p>
              <span style={{ fontSize: 10, color: '#94A3B8', background: '#EEF2FF', padding: '2px 7px', borderRadius: 4 }}>Not cash</span>
            </div>
            <Row label="Annual vesting (gross)" value={fmtDollarFull(profile.partner1.rsuAnnual)} />
            <Row label={`Tax withholding (~${profile.partner1.rsuTaxRate}%)`} value={`−${fmtDollar(profile.partner1.rsuAnnual * profile.partner1.rsuTaxRate / 100)}/yr`} muted />
            <Row label="Net shares kept (est.)" value={`${fmtDollar(rsuNetAnnual)}/yr`} note="held as stock" />
            <div style={DIVIDER} />
            <Row label="Current stock balance" value={fmtDollarFull(profile.partner1.rsuStockBalance ?? 0)} bold />
          </div>
        </div>

        {/* Jeslin */}
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#0F172A' }}>{profile.partner2.name}</p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Age {profile.partner2.age}</p>
            </div>
          </div>

          <p style={{ ...LABEL, marginBottom: 10 }}>Salary Breakdown</p>
          <Row label="Gross Salary" value={fmtDollarFull(profile.partner2.grossSalary)} sub="/yr" bold />
          <Row label={`401k (${profile.partner2.k401Pct}%)`} value={`−${fmtDollar(p2Monthly401k)}/mo`} note="retirement" muted />
          <Row label={`Taxes (~${profile.partner2.salaryTaxRate}%)`} value={`−${fmtDollar(profile.partner2.grossSalary * (1 - profile.partner2.k401Pct / 100) * (profile.partner2.salaryTaxRate / 100) / 12)}/mo`} muted />
          <div style={DIVIDER} />
          <Row label="Cash Take-Home" value={`${fmtDollarFull(p2TakeHome * 12)}/yr`} sub={`${fmtDollar(p2TakeHome)}/mo`} green bold />

          {/* Combined household summary */}
          <div style={{ marginTop: 16, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
              Household Summary
            </p>
            <Row label="Combined gross salary" value={fmtDollarFull(combinedGrossSalary)} />
            <Row label="Combined 401k saving" value={`${fmtDollar((p1Monthly401k + p2Monthly401k) * 12)}/yr`} note="retirement" />
            <div style={DIVIDER} />
            <Row label="Combined cash take-home" value={`${fmtDollar(combinedMonthly)}/mo`} bold green />
            <Row label="After expenses" value={`${fmtDollar(availableToSave)}/mo`} bold green={availableToSave >= 0} />
          </div>
        </div>
      </div>

      {/* ── Row 4: Wedding progress ───────────────────────────────────────── */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 3px', color: '#0F172A' }}>🇮🇹 Wedding Goal</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>June 12, 2027 · {months} months away</p>
          </div>
          {gap <= 0 ? (
            <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 12, padding: '4px 14px', borderRadius: 99, fontWeight: 700 }}>Fully funded ✓</span>
          ) : (
            <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 12, padding: '4px 14px', borderRadius: 99, fontWeight: 600 }}>Gap: {fmtDollar(gap)}</span>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ height: 10, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{
            width: `${weddingProgress}%`, height: '100%',
            background: 'linear-gradient(90deg, #D97706, #FBBF24)',
            borderRadius: 99, transition: 'width 0.5s ease',
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <StatCell label="Saved" value={fmtDollar(saved)} color="#059669" />
          <StatCell label="Goal" value={weddingTotal > 0 ? fmtDollar(weddingTotal) : '—'} color="#0F172A" />
          <StatCell label="Need / month" value={fmtDollar(requiredMonthlySavings)} color="#D97706" />
          <div>
            <p style={LABEL}>Saving / month</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: availableToSave >= requiredMonthlySavings ? '#059669' : '#DC2626', margin: '4px 0 2px' }}>
              {fmtDollar(availableToSave)}
            </p>
            <p style={{ fontSize: 11, color: availableToSave >= requiredMonthlySavings ? '#059669' : '#DC2626', margin: 0 }}>
              {availableToSave >= requiredMonthlySavings ? '✓ On track' : `Need ${fmtDollar(requiredMonthlySavings - availableToSave)} more`}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function MetricCard({ label, value, sub, color, badge, badgeColor }: {
  label: string; value: string; sub?: string; color?: string; badge?: string; badgeColor?: string;
}) {
  return (
    <div style={CARD}>
      <p style={LABEL}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: color ?? '#0F172A', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        {sub && <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{sub}</p>}
        {badge && <span style={{ fontSize: 10, background: badgeColor ? `${badgeColor}18` : '#F1F5F9', color: badgeColor ?? '#64748B', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{badge}</span>}
      </div>
    </div>
  );
}

function Row({ label, value, sub, note, bold, green, muted }: {
  label: string; value: string; sub?: string; note?: string; bold?: boolean; green?: boolean; muted?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontSize: 13, color: muted ? '#94A3B8' : '#475569' }}>
        {label}
        {note && <span style={{ fontSize: 10, background: '#F1F5F9', color: '#94A3B8', padding: '1px 5px', borderRadius: 4, marginLeft: 6 }}>{note}</span>}
      </span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: bold ? 14 : 13, fontWeight: bold ? 700 : 400, color: green ? '#059669' : muted ? '#94A3B8' : '#0F172A' }}>{value}</span>
        {sub && <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 4 }}>{sub}</span>}
      </div>
    </div>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={LABEL}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: color ?? '#0F172A', margin: '4px 0 0' }}>{value}</p>
    </div>
  );
}

function NwCell({ label, value, sub, color, pct, barColor, border }: {
  label: string; value: number; sub: string; color: string; pct: number; barColor: string; border?: boolean;
}) {
  return (
    <div style={{
      padding: '16px 20px',
      borderLeft: border ? '1px solid #F1F5F9' : undefined,
    }}>
      <p style={LABEL}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color, margin: '4px 0 2px', letterSpacing: '-0.01em' }}>{fmtDollarFull(value)}</p>
      <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 8px' }}>{sub}</p>
      <div style={{ height: 4, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct.toFixed(1)}%`, height: '100%', background: barColor, borderRadius: 99 }} />
      </div>
      <p style={{ fontSize: 10, color: '#CBD5E1', margin: '4px 0 0' }}>{pct.toFixed(0)}% of net worth</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0 }}>{value}</p>
    </div>
  );
}
