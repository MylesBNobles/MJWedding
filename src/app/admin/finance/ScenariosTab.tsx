'use client';

import { useState, useMemo } from 'react';
import type { FinanceProfile, CustomScenario } from './data';
import { monthly401k, monthlyRsu, monthlyTakeHome, fmtDollar, fmtDollarFull } from './data';
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
  marginBottom: 4,
};

interface Props {
  profile: FinanceProfile;
  weddingTotal: number;
  availableToSave: number;
  onProfileChange: (p: FinanceProfile) => void;
}

const WEDDING_DATE = new Date('2027-06-12');

function monthsUntil(target: Date): number {
  const now = new Date();
  return Math.max(
    0,
    (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth())
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function addMonths(d: Date, m: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + m);
  return r;
}

const EMOJIS = ['🏠', '🚗', '✈️', '💰', '🎓', '👶', '🏖️', '💍', '🏋️', '🎯', '🌍', '🛥️'];

export function ScenariosTab({ profile, weddingTotal, availableToSave, onProfileChange }: Props) {
  const [activeId, setActiveId] = useState<string>('wedding');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏠');
  const [newGoal, setNewGoal] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newSaved, setNewSaved] = useState('0');

  const customScenarios = profile.household.customScenarios ?? [];

  const activeCustom = customScenarios.find(s => s.id === activeId) ?? null;
  const isWedding = activeId === 'wedding';

  // Active scenario values
  const activeGoal = isWedding ? weddingTotal : (activeCustom?.goalAmount ?? 0);
  const activeSaved = isWedding ? profile.household.currentSavings : (activeCustom?.savedSoFar ?? 0);
  const activeTargetDate = isWedding ? WEDDING_DATE : (activeCustom ? new Date(activeCustom.targetDate) : new Date());
  const activeScenarioMonths = monthsUntil(activeTargetDate);

  function addScenario() {
    if (!newName.trim() || !newGoal || !newDate) return;
    const scenario: CustomScenario = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      emoji: newEmoji,
      goalAmount: parseFloat(newGoal),
      targetDate: newDate,
      savedSoFar: parseFloat(newSaved) || 0,
    };
    const updated = {
      ...profile,
      household: {
        ...profile.household,
        customScenarios: [...customScenarios, scenario],
      },
    };
    onProfileChange(updated);
    saveProfile(updated);
    setActiveId(scenario.id);
    setShowAddForm(false);
    setNewName(''); setNewEmoji('🏠'); setNewGoal(''); setNewDate(''); setNewSaved('0');
  }

  function deleteScenario(id: string) {
    const updated = {
      ...profile,
      household: {
        ...profile.household,
        customScenarios: customScenarios.filter(s => s.id !== id),
      },
    };
    onProfileChange(updated);
    saveProfile(updated);
    setActiveId('wedding');
  }

  const [cashEnabled, setCashEnabled] = useState(true);
  const [k401Enabled, setK401Enabled] = useState(false);
  const [taxRefundEnabled, setTaxRefundEnabled] = useState(false);
  const [rsuEnabled, setRsuEnabled] = useState(false);

  const [p1NewK401Pct, setP1NewK401Pct] = useState(Math.max(0, profile.partner1.k401Pct - 5));
  const [p2NewK401Pct, setP2NewK401Pct] = useState(Math.max(0, profile.partner2.k401Pct - 5));

  const scenarioMonths = activeScenarioMonths;
  const saved = activeSaved;
  const gap = Math.max(0, activeGoal - saved);
  const weddingProgress = activeGoal > 0 ? Math.min(100, (saved / activeGoal) * 100) : 100;
  const baselineMonthlyNeeded = scenarioMonths > 0 ? gap / scenarioMonths : 0;

  // ── Lever monthly amounts ─────────────────────────────────────────────────

  const moAvailableCash = Math.max(0, availableToSave);

  const p1FreedFromK401 = useMemo(() => {
    if (p1NewK401Pct >= profile.partner1.k401Pct) return 0;
    const currentTH = monthlyTakeHome(profile.partner1.grossSalary, profile.partner1.k401Pct, profile.partner1.salaryTaxRate);
    const newTH = monthlyTakeHome(profile.partner1.grossSalary, p1NewK401Pct, profile.partner1.salaryTaxRate);
    return Math.max(0, newTH - currentTH);
  }, [profile.partner1, p1NewK401Pct]);

  const p2FreedFromK401 = useMemo(() => {
    if (p2NewK401Pct >= profile.partner2.k401Pct) return 0;
    const currentTH = monthlyTakeHome(profile.partner2.grossSalary, profile.partner2.k401Pct, profile.partner2.salaryTaxRate);
    const newTH = monthlyTakeHome(profile.partner2.grossSalary, p2NewK401Pct, profile.partner2.salaryTaxRate);
    return Math.max(0, newTH - currentTH);
  }, [profile.partner2, p2NewK401Pct]);

  const moK401Freed = p1FreedFromK401 + p2FreedFromK401;
  const moTaxRefund = profile.household.taxRefundAnnual / 12;
  const moRsu = monthlyRsu(profile.partner1.rsuAnnual, profile.partner1.rsuTaxRate);

  // ── Total monthly toward goal ─────────────────────────────────────────────

  const totalMonthly =
    (cashEnabled ? moAvailableCash : 0) +
    (k401Enabled ? moK401Freed : 0) +
    (taxRefundEnabled ? moTaxRefund : 0) +
    (rsuEnabled ? moRsu : 0);

  const monthsToGoal = totalMonthly > 0 ? Math.ceil(gap / totalMonthly) : null;
  const goalDate = monthsToGoal !== null ? addMonths(new Date(), monthsToGoal) : null;
  const onTrack = goalDate !== null && goalDate <= WEDDING_DATE;
  const bufferMonths = goalDate !== null && monthsToGoal !== null ? scenarioMonths - monthsToGoal : null;

  // ── Retirement impact ─────────────────────────────────────────────────────

  const yearsToRetirement = Math.max(0, profile.household.retirementAge - profile.partner1.age);
  const spRate = profile.household.spGrowthRate / 100;

  const retirementImpact = useMemo(() => {
    let impact = 0;

    // Cash diverted from investments
    if (cashEnabled) {
      const totalDiverted = moAvailableCash * scenarioMonths;
      impact += totalDiverted * Math.pow(1 + spRate, yearsToRetirement);
    }

    // 401k reduction: less compounding in retirement accounts
    if (k401Enabled) {
      const p1MonthlyReduction = monthly401k(profile.partner1.grossSalary, profile.partner1.k401Pct) -
        monthly401k(profile.partner1.grossSalary, p1NewK401Pct);
      const p2MonthlyReduction = monthly401k(profile.partner2.grossSalary, profile.partner2.k401Pct) -
        monthly401k(profile.partner2.grossSalary, p2NewK401Pct);
      const totalReduction = (p1MonthlyReduction + p2MonthlyReduction) * scenarioMonths;
      impact += totalReduction * Math.pow(1 + spRate, yearsToRetirement);
    }

    // Tax refund diverted (1 year)
    if (taxRefundEnabled) {
      impact += profile.household.taxRefundAnnual * Math.pow(1 + spRate, yearsToRetirement);
    }

    // RSU diverted instead of held as stock
    if (rsuEnabled) {
      const totalDiverted = moRsu * scenarioMonths;
      const rsuRate = (profile.household.rsuGrowthRate ?? spRate * 100) / 100;
      impact += totalDiverted * Math.pow(1 + rsuRate, yearsToRetirement);
    }

    return impact;
  }, [cashEnabled, k401Enabled, taxRefundEnabled, rsuEnabled, moAvailableCash, moK401Freed, moRsu, moTaxRefund, scenarioMonths, yearsToRetirement, spRate, profile, p1NewK401Pct, p2NewK401Pct]);

  const retirementImpactPerMonth = scenarioMonths > 0 ? retirementImpact / scenarioMonths : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Scenario picker ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Wedding — always first */}
        <ScenarioPill
          emoji="🇮🇹"
          name="Wedding 2027"
          goal={weddingTotal}
          active={activeId === 'wedding'}
          onClick={() => setActiveId('wedding')}
        />

        {/* Custom scenarios */}
        {customScenarios.map(s => (
          <ScenarioPill
            key={s.id}
            emoji={s.emoji}
            name={s.name}
            goal={s.goalAmount}
            active={activeId === s.id}
            onClick={() => setActiveId(s.id)}
            onDelete={() => deleteScenario(s.id)}
          />
        ))}

        {/* Add button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '10px 16px',
              background: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: 12,
              fontSize: 13,
              color: '#64748B',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            + Add Scenario
          </button>
        )}
      </div>

      {/* ── Add scenario form ─────────────────────────────────────────────── */}
      {showAddForm && (
        <div style={{ ...CARD, border: '1.5px solid #6366F1', background: '#FAFBFF' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 16px' }}>New Scenario</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <p style={{ ...LABEL, marginBottom: 6 }}>Name</p>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. House Down Payment"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <p style={{ ...LABEL, marginBottom: 6 }}>Goal Amount</p>
              <input
                type="number"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                placeholder="100000"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <p style={{ ...LABEL, marginBottom: 6 }}>Target Date</p>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <p style={{ ...LABEL, marginBottom: 6 }}>Already Saved Toward This</p>
              <input
                type="number"
                value={newSaved}
                onChange={e => setNewSaved(e.target.value)}
                placeholder="0"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <p style={{ ...LABEL, marginBottom: 6 }}>Emoji</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    style={{
                      fontSize: 18,
                      padding: '4px 6px',
                      borderRadius: 6,
                      border: `1.5px solid ${newEmoji === e ? '#6366F1' : '#E2E8F0'}`,
                      background: newEmoji === e ? '#EEF2FF' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={addScenario}
              disabled={!newName.trim() || !newGoal || !newDate}
              style={{
                padding: '8px 20px',
                background: '#6366F1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: newName.trim() && newGoal && newDate ? 'pointer' : 'not-allowed',
                opacity: newName.trim() && newGoal && newDate ? 1 : 0.5,
              }}
            >
              Create Scenario
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ padding: '8px 16px', background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#64748B', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Goal card ─────────────────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px', color: '#0F172A' }}>
              {isWedding ? '🇮🇹 Wedding 2027' : `${activeCustom?.emoji} ${activeCustom?.name}`} — Funding Scenario
            </p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
              {formatDate(activeTargetDate)} · {scenarioMonths} months away
              {isWedding ? ' · Budget auto-synced from Wedding Budget' : ''}
            </p>
          </div>
          {gap <= 0 ? (
            <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 12, padding: '4px 14px', borderRadius: 99, fontWeight: 700 }}>Fully funded ✓</span>
          ) : onTrack ? (
            <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 12, padding: '4px 14px', borderRadius: 99, fontWeight: 700 }}>On track ✓</span>
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
          <div><p style={LABEL}>{isWedding ? 'Budget (live)' : 'Goal'}</p><p style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>{fmtDollarFull(activeGoal)}</p></div>
          <div><p style={LABEL}>Currently Saved</p><p style={{ fontSize: 20, fontWeight: 700, color: '#059669', margin: '2px 0 0' }}>{fmtDollarFull(saved)}</p></div>
          <div><p style={LABEL}>Gap Remaining</p><p style={{ fontSize: 20, fontWeight: 700, color: gap > 0 ? '#D97706' : '#059669', margin: '2px 0 0' }}>{fmtDollarFull(gap)}</p></div>
          <div>
            <p style={LABEL}>Baseline need / mo</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#DC2626', margin: '2px 0 0' }}>{fmtDollar(baselineMonthlyNeeded)}</p>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>with no scenario applied</p>
          </div>
        </div>
      </div>

      {/* ── Levers ───────────────────────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>Funding Levers — toggle to model different strategies</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Redirect available cash */}
          <LeverCard
            enabled={cashEnabled}
            onToggle={() => setCashEnabled(!cashEnabled)}
            title="Redirect All Available Cash"
            description={`Instead of investing your leftover take-home each month, funnel it to the wedding. This pauses your general savings for ${scenarioMonths} months.`}
            monthlyAmount={moAvailableCash}
            color="#6366F1"
          />

          {/* Reduce 401k */}
          <LeverCard
            enabled={k401Enabled}
            onToggle={() => setK401Enabled(!k401Enabled)}
            title="Temporarily Reduce 401k Contributions"
            description="Lower your 401k % to free up more take-home cash. You contribute less to retirement short-term, freeing up cash now."
            monthlyAmount={moK401Freed}
            color="#F59E0B"
          >
            {k401Enabled && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <SliderRow
                  label={`${profile.partner1.name} 401k`}
                  current={profile.partner1.k401Pct}
                  value={p1NewK401Pct}
                  onChange={setP1NewK401Pct}
                  freed={p1FreedFromK401}
                />
                <SliderRow
                  label={`${profile.partner2.name} 401k`}
                  current={profile.partner2.k401Pct}
                  value={p2NewK401Pct}
                  onChange={setP2NewK401Pct}
                  freed={p2FreedFromK401}
                />
              </div>
            )}
          </LeverCard>

          {/* Tax refund */}
          <LeverCard
            enabled={taxRefundEnabled}
            onToggle={() => setTaxRefundEnabled(!taxRefundEnabled)}
            title="Redirect Tax Refund"
            description={`Send your annual tax refund (${fmtDollarFull(profile.household.taxRefundAnnual)}/yr) directly to the wedding fund instead of investing it.`}
            monthlyAmount={moTaxRefund}
            monthlyNote={`${fmtDollarFull(profile.household.taxRefundAnnual)} lump sum / yr`}
            color="#059669"
          />

          {/* RSU vests */}
          <LeverCard
            enabled={rsuEnabled}
            onToggle={() => setRsuEnabled(!rsuEnabled)}
            title="Sell RSU Vests → Wedding Fund"
            description={`Instead of holding vested shares as stock, sell them when they vest and redirect the proceeds to the wedding. Net of ${profile.partner1.rsuTaxRate}% tax.`}
            monthlyAmount={moRsu}
            monthlyNote={`${fmtDollarFull(profile.partner1.rsuAnnual * (1 - profile.partner1.rsuTaxRate / 100))}/yr net`}
            color="#EC4899"
          />
        </div>
      </div>

      {/* ── Month-by-month trajectory ─────────────────────────────────────── */}
      <SavingsTrajectoryChart
        saved={saved}
        goalTotal={activeGoal}
        totalMonthly={totalMonthly}
        scenarioMonths={scenarioMonths}
        targetDate={activeTargetDate}
      />

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Goal timeline */}
        <div style={{ ...CARD, borderTop: `3px solid ${onTrack ? '#059669' : '#DC2626'}` }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 16px' }}>Goal Timeline</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ResultRow label="Total toward goal / mo" value={fmtDollar(totalMonthly)} highlight />
            <ResultRow label="Gap remaining" value={fmtDollarFull(gap)} />
            {totalMonthly > 0 && monthsToGoal !== null ? (
              <>
                <ResultRow label="Months to fully fund" value={`${monthsToGoal} months`} />
                <ResultRow
                  label="Projected funded by"
                  value={goalDate ? formatDate(goalDate) : '—'}
                  color={onTrack ? '#059669' : '#DC2626'}
                />
                {bufferMonths !== null && bufferMonths > 0 && (
                  <ResultRow
                    label="Buffer ahead of wedding"
                    value={`${bufferMonths} months early`}
                    color="#059669"
                  />
                )}
                {bufferMonths !== null && bufferMonths < 0 && (
                  <ResultRow
                    label="Shortfall"
                    value={`${Math.abs(bufferMonths)} months late`}
                    color="#DC2626"
                  />
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Enable levers above to see timeline.</p>
            )}
          </div>
        </div>

        {/* Retirement impact */}
        <div style={{ ...CARD, borderTop: '3px solid #D97706' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 4px' }}>Retirement Impact</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 16px' }}>
            Applying this scenario for {scenarioMonths} months, compounded to age {profile.household.retirementAge}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={LABEL}>Estimated reduction at retirement</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: retirementImpact > 0 ? '#DC2626' : '#94A3B8', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>
                −{fmtDollarFull(retirementImpact)}
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                vs. your baseline projection
              </p>
            </div>
            {retirementImpact > 0 && (
              <>
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 4px' }}>
                    Cost per month of scenario
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#D97706', margin: 0 }}>
                    {fmtDollar(retirementImpactPerMonth)}/mo → {fmtDollar(retirementImpact / (yearsToRetirement || 1))}/yr equivalent at retirement
                  </p>
                </div>
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                    Every month you apply this scenario costs roughly{' '}
                    <strong>{fmtDollar(retirementImpactPerMonth)}</strong> at retirement due to lost compounding.
                    The wedding is {scenarioMonths} months — a short window relative to{' '}
                    {yearsToRetirement} years of growth ahead.
                  </p>
                </div>
              </>
            )}
            {retirementImpact === 0 && (
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Enable levers above to see impact.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      {totalMonthly > 0 && (
        <div style={{ ...CARD, background: onTrack ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${onTrack ? '#BBF7D0' : '#FECACA'}` }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: onTrack ? '#065F46' : '#991B1B', margin: '0 0 8px' }}>
            {onTrack ? '✓ This scenario funds your wedding on time' : '⚠ This scenario doesn\'t fully fund the wedding by June 2027'}
          </p>
          <p style={{ fontSize: 13, color: onTrack ? '#047857' : '#B91C1C', margin: 0, lineHeight: 1.6 }}>
            {onTrack
              ? `With ${fmtDollar(totalMonthly)}/mo toward the wedding, you'd be fully funded by ${goalDate ? formatDate(goalDate) : '—'} — ${bufferMonths} months before the date. The retirement cost of this ${scenarioMonths}-month scenario is ${fmtDollarFull(retirementImpact)}, which is a small fraction of your projected net worth at ${profile.household.retirementAge}.`
              : `You'd reach the goal ${goalDate ? formatDate(goalDate) : '?'} — after the wedding date. Try enabling more levers or increasing the amounts above.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

// ── Trajectory chart + table ───────────────────────────────────────────────

function SavingsTrajectoryChart({
  saved,
  goalTotal,
  totalMonthly,
  scenarioMonths,
  targetDate,
}: {
  saved: number;
  goalTotal: number;
  totalMonthly: number;
  scenarioMonths: number;
  targetDate: Date;
}) {
  const now = new Date();

  // Build month rows from now through target month
  const rows = useMemo(() => {
    const result: { label: string; date: Date; running: number; gap: number; pct: number; funded: boolean; isTarget: boolean }[] = [];
    let running = saved;
    for (let m = 1; m <= scenarioMonths; m++) {
      running = Math.min(running + totalMonthly, goalTotal);
      const d = addMonths(now, m);
      const isTarget = m === scenarioMonths;
      result.push({
        label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: d,
        running,
        gap: Math.max(0, goalTotal - running),
        pct: goalTotal > 0 ? Math.min(100, (running / goalTotal) * 100) : 100,
        funded: running >= goalTotal,
        isTarget,
      });
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, goalTotal, totalMonthly, scenarioMonths]);

  // SVG chart
  const SVG_W = 900;
  const SVG_H = 200;
  const PAD = { top: 16, right: 32, bottom: 36, left: 72 };
  const plotW = SVG_W - PAD.left - PAD.right;
  const plotH = SVG_H - PAD.top - PAD.bottom;
  const maxVal = goalTotal * 1.05;
  const months = rows.length;

  function xOf(i: number) { return PAD.left + (i / Math.max(months - 1, 1)) * plotW; }
  function yOf(v: number) { return PAD.top + plotH - Math.min(1, v / maxVal) * plotH; }

  const pts = [{ x: PAD.left, y: yOf(saved) }, ...rows.map((r, i) => ({ x: xOf(i + 1), y: yOf(r.running) }))];
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + plotH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PAD.top + plotH).toFixed(1)} Z`;

  const goalY = yOf(goalTotal);
  const fundedIdx = rows.findIndex(r => r.funded);

  // X axis: every 2 months
  const xLabels = rows.filter((_, i) => i % 2 === 0 || i === rows.length - 1);

  const lineColor = totalMonthly === 0 ? '#CBD5E1' : rows[rows.length - 1]?.funded ? '#059669' : '#6366F1';

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 3px', color: '#0F172A' }}>Month-by-Month Progress to Goal</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
            {totalMonthly > 0
              ? `Adding ${fmtDollar(totalMonthly)}/mo from enabled levers · starting from ${fmtDollarFull(saved)} saved`
              : 'Enable levers above to see your trajectory'}
          </p>
        </div>
        <span style={{
          fontSize: 11, padding: '3px 12px', borderRadius: 99, fontWeight: 600,
          background: rows[rows.length - 1]?.funded ? '#D1FAE5' : '#FEF3C7',
          color: rows[rows.length - 1]?.funded ? '#059669' : '#D97706',
        }}>
          {rows[rows.length - 1]?.funded
            ? `Fully funded by ${rows.find(r => r.funded)?.label ?? ''}`
            : `${fmtDollar(rows[rows.length - 1]?.gap ?? 0)} short at target date`}
        </span>
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', overflow: 'visible', marginBottom: 4 }}>
        <defs>
          <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Goal line */}
        <line x1={PAD.left} y1={goalY} x2={PAD.left + plotW} y2={goalY} stroke="#D97706" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={PAD.left - 6} y={goalY + 4} textAnchor="end" fontSize={9} fill="#D97706" fontWeight={600}>Goal</text>

        {/* Y axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => (
          <g key={pct}>
            <line x1={PAD.left} y1={yOf(goalTotal * pct)} x2={PAD.left + plotW} y2={yOf(goalTotal * pct)} stroke="#F1F5F9" strokeWidth={1} />
            <text x={PAD.left - 6} y={yOf(goalTotal * pct) + 4} textAnchor="end" fontSize={9} fill="#CBD5E1">
              {fmtDollar(goalTotal * pct)}
            </text>
          </g>
        ))}

        {/* Area + line */}
        <path d={areaPath} fill="url(#trajGrad)" />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Funded marker */}
        {fundedIdx >= 0 && (
          <g>
            <circle cx={xOf(fundedIdx + 1)} cy={yOf(goalTotal)} r={5} fill="#059669" stroke="#fff" strokeWidth={2} />
            <text x={xOf(fundedIdx + 1)} y={yOf(goalTotal) - 10} textAnchor="middle" fontSize={9} fill="#059669" fontWeight={700}>
              Funded ✓
            </text>
          </g>
        )}

        {/* Wedding date marker */}
        <line x1={xOf(months)} y1={PAD.top} x2={xOf(months)} y2={PAD.top + plotH} stroke="#EC4899" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={xOf(months)} y={PAD.top + plotH + 20} textAnchor="middle" fontSize={9} fill="#EC4899" fontWeight={600}>Wedding</text>

        {/* X axis labels */}
        {xLabels.map((r, _i) => {
          const idx = rows.indexOf(r);
          return (
            <text key={r.label} x={xOf(idx + 1)} y={PAD.top + plotH + 14} textAnchor="middle" fontSize={9} fill="#94A3B8">
              {r.label}
            </text>
          );
        })}
      </svg>

      {/* Month-by-month table */}
      <div style={{ marginTop: 12, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr 100px 100px 60px',
          gap: 0,
          background: '#F8FAFC',
          borderRadius: '8px 8px 0 0',
          border: '1px solid #E2E8F0',
          borderBottom: 'none',
          padding: '7px 12px',
        }}>
          {['Month', 'Progress', 'Running Total', 'Gap', '%'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 100px 100px 60px',
                gap: 0,
                padding: '8px 12px',
                borderBottom: i < rows.length - 1 ? '1px solid #F1F5F9' : 'none',
                background: row.isTarget ? '#FFF7ED' : row.funded ? '#F0FDF4' : i % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: row.isTarget ? 700 : 400, color: row.isTarget ? '#D97706' : '#0F172A' }}>
                {row.label} {row.isTarget ? '🎯' : ''}
              </span>
              {/* Progress bar */}
              <div style={{ paddingRight: 16 }}>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${row.pct}%`,
                    height: '100%',
                    background: row.funded ? '#059669' : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                    borderRadius: 99,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: row.funded ? '#059669' : '#0F172A' }}>
                {fmtDollarFull(row.running)}
              </span>
              <span style={{ fontSize: 12, color: row.gap > 0 ? '#DC2626' : '#059669' }}>
                {row.gap > 0 ? `−${fmtDollar(row.gap)}` : 'Funded ✓'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: row.pct >= 100 ? '#059669' : '#64748B' }}>
                {row.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ScenarioPill({ emoji, name, goal, active, onClick, onDelete }: {
  emoji: string; name: string; goal: number; active: boolean;
  onClick: () => void; onDelete?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 16px',
        background: active ? '#EEF2FF' : '#F8FAFC',
        border: `1.5px solid ${active ? '#6366F1' : '#E2E8F0'}`,
        borderRadius: 12,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: active ? '#4338CA' : '#0F172A', margin: 0 }}>{name}</p>
        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{fmtDollarFull(goal)}</p>
      </div>
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute', top: 4, right: 6,
            background: 'none', border: 'none', color: '#CBD5E1',
            fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: 2,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

function LeverCard({
  enabled,
  onToggle,
  title,
  description,
  monthlyAmount,
  monthlyNote,
  color,
  children,
}: {
  enabled: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  monthlyAmount: number;
  monthlyNote?: string;
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{
      background: enabled ? `${color}08` : '#FAFBFC',
      border: `1.5px solid ${enabled ? color + '40' : '#E2E8F0'}`,
      borderRadius: 12,
      padding: '16px 20px',
      transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Toggle */}
        <button
          onClick={onToggle}
          style={{
            width: 36,
            height: 20,
            borderRadius: 99,
            border: 'none',
            background: enabled ? color : '#CBD5E1',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
            marginTop: 2,
            transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: enabled ? 19 : 3,
            transition: 'left 0.15s',
          }} />
        </button>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', margin: '0 0 4px' }}>{title}</p>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0, maxWidth: 560, lineHeight: 1.5 }}>{description}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 20 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: enabled ? color : '#94A3B8', margin: 0 }}>
                +{fmtDollar(monthlyAmount)}/mo
              </p>
              {monthlyNote && (
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{monthlyNote}</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  current,
  value,
  onChange,
  freed,
}: {
  label: string;
  current: number;
  value: number;
  onChange: (v: number) => void;
  freed: number;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>
          <span style={{ textDecoration: 'line-through', marginRight: 6 }}>{current}%</span>
          <span style={{ color: '#F59E0B', fontWeight: 700 }}>{value}%</span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={current}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: '#F59E0B' }}
      />
      <p style={{ fontSize: 11, color: '#059669', margin: '4px 0 0', fontWeight: 600 }}>
        Frees up +{fmtDollar(freed)}/mo take-home
      </p>
    </div>
  );
}

function ResultRow({ label, value, color, highlight }: {
  label: string; value: string; color?: string; highlight?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
      <span style={{ fontSize: highlight ? 18 : 13, fontWeight: highlight ? 700 : 500, color: color ?? '#0F172A' }}>{value}</span>
    </div>
  );
}
