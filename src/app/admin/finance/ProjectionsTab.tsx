'use client';

import { useState, useMemo } from 'react';
import type { FinanceProfile } from './data';
import { monthly401k, monthlyRsu, fmtDollar, fmtDollarFull } from './data';
import { saveProfile } from './actions';

const CARD_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const INPUT_STYLE: React.CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #CBD5E1',
  borderRadius: 6,
  color: '#0F172A',
  fontSize: 13,
  padding: '4px 8px',
  width: 110,
  outline: 'none',
  textAlign: 'right' as const,
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: '#64748B',
  minWidth: 160,
};

interface Props {
  profile: FinanceProfile;
  availableToSave: number;
  weddingTotal: number;
  onProfileChange: (p: FinanceProfile) => void;
}

function projectNetWorth(
  profile: FinanceProfile,
  monthlySavedFromBudget: number,
  months: number
): number[] {
  const monthly401kP1 = monthly401k(profile.partner1.grossSalary, profile.partner1.k401Pct);
  const monthly401kP2 = monthly401k(profile.partner2.grossSalary, profile.partner2.k401Pct);
  const monthlyRoth = (profile.partner1.rothMonthly ?? 0) + (profile.partner2.rothMonthly ?? 0);
  const monthlyRsuVest = monthlyRsu(profile.partner1.rsuAnnual, profile.partner1.rsuTaxRate);
  const monthlyTaxRefund = profile.household.taxRefundAnnual / 12;
  const cashSavingsPct = (profile.household.cashSavingsPct ?? 80) / 100;
  const safeMonthlySaved = Math.max(0, monthlySavedFromBudget) * cashSavingsPct;

  const spRate = profile.household.spGrowthRate / 100 / 12;
  const rsuRate = (profile.household.rsuGrowthRate ?? profile.household.spGrowthRate) / 100 / 12;

  // RSU stock tracked separately at its own growth rate
  let rsuBal = profile.partner1.rsuStockBalance ?? 0;
  let otherNW =
    profile.household.currentSavings +
    profile.partner1.k401Balance +
    profile.partner2.k401Balance +
    (profile.partner1.rothBalance ?? 0) +
    (profile.partner2.rothBalance ?? 0);

  const result = [rsuBal + otherNW];
  for (let m = 1; m <= months; m++) {
    rsuBal += monthlyRsuVest;
    rsuBal *= 1 + rsuRate;
    otherNW += monthly401kP1 + monthly401kP2 + monthlyRoth + monthlyTaxRefund + safeMonthlySaved;
    otherNW *= 1 + spRate;
    result.push(rsuBal + otherNW);
  }
  return result;
}

function InputRow({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
  slider,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  slider?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid #F1F5F9',
      }}
    >
      <span style={LABEL_STYLE}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {slider && (
          <input
            type="range"
            min={min ?? 0}
            max={max ?? 100}
            step={step ?? 1}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: 80, accentColor: '#6366F1' }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {prefix && <span style={{ fontSize: 12, color: '#64748B' }}>{prefix}</span>}
          <input
            type="number"
            min={min}
            max={max}
            step={step ?? 1}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            style={INPUT_STYLE}
          />
          {suffix && <span style={{ fontSize: 12, color: '#64748B' }}>{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

const SVG_W = 900;
const SVG_H = 320;
const PAD = { top: 24, right: 40, bottom: 48, left: 72 };

function NwChart({
  data,
  milestoneIndices,
  weddingCrossMonth,
}: {
  data: number[];
  milestoneIndices: { label: string; month: number; age: number }[];
  weddingCrossMonth: number | null;
}) {
  if (data.length < 2) return null;

  const plotW = SVG_W - PAD.left - PAD.right;
  const plotH = SVG_H - PAD.top - PAD.bottom;
  const maxNw = Math.max(...data) * 1.05;
  const months = data.length - 1;

  function xOf(m: number) {
    return PAD.left + (m / months) * plotW;
  }
  function yOf(v: number) {
    return PAD.top + plotH - (v / maxNw) * plotH;
  }

  // Build path
  const pts = data.map((v, i) => ({ x: xOf(i), y: yOf(v) }));
  const linePath =
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    linePath +
    ` L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + plotH).toFixed(1)}` +
    ` L${pts[0].x.toFixed(1)},${(PAD.top + plotH).toFixed(1)} Z`;

  // Y axis ticks
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    (maxNw * i) / yTickCount
  );

  // X axis ticks (years)
  const totalYears = Math.floor(months / 12);
  const yearStep = totalYears > 20 ? 5 : totalYears > 10 ? 2 : 1;
  const xYearTicks: number[] = [];
  for (let y = 0; y <= totalYears; y += yearStep) xYearTicks.push(y);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            y1={yOf(v)}
            x2={PAD.left + plotW}
            y2={yOf(v)}
            stroke="#E2E8F0"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={yOf(v) + 4}
            textAnchor="end"
            fontSize={10}
            fill="#64748B"
          >
            {fmtDollar(v)}
          </text>
        </g>
      ))}

      {/* X axis ticks */}
      {xYearTicks.map((yr) => (
        <g key={yr}>
          <line
            x1={xOf(yr * 12)}
            y1={PAD.top + plotH}
            x2={xOf(yr * 12)}
            y2={PAD.top + plotH + 4}
            stroke="#64748B"
            strokeWidth={1}
          />
          <text
            x={xOf(yr * 12)}
            y={PAD.top + plotH + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#64748B"
          >
            +{yr}y
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} />

      {/* Wedding cross line */}
      {weddingCrossMonth !== null &&
        weddingCrossMonth >= 0 &&
        weddingCrossMonth <= months && (
          <g>
            <line
              x1={xOf(weddingCrossMonth)}
              y1={PAD.top}
              x2={xOf(weddingCrossMonth)}
              y2={PAD.top + plotH}
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={xOf(weddingCrossMonth) + 4}
              y={PAD.top + 12}
              fontSize={9}
              fill="#F59E0B"
            >
              Wedding
            </text>
          </g>
        )}

      {/* Milestone lines and dots */}
      {milestoneIndices.map(({ label, month }) => {
        if (month < 0 || month > months) return null;
        const x = xOf(month);
        const y = yOf(data[month] ?? 0);
        return (
          <g key={label}>
            <line
              x1={x}
              y1={PAD.top}
              x2={x}
              y2={PAD.top + plotH}
              stroke="#E2E8F0"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle cx={x} cy={y} r={5} fill="#6366F1" stroke="#FFFFFF" strokeWidth={2} />
            <rect
              x={x - 30}
              y={y - 32}
              width={60}
              height={18}
              rx={4}
              fill="rgba(255,255,255,0.95)"
              stroke="rgba(99,102,241,0.4)"
              strokeWidth={1}
            />
            <text x={x} y={y - 19} textAnchor="middle" fontSize={9} fill="#0F172A">
              {fmtDollar(data[month] ?? 0)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type AnnualRow = {
  year: number;
  age: number;
  netWorth: number;
  contributions: number;
  marketGains: number;
  yoyChange: number;
};

function projectAnnualBreakdown(
  profile: FinanceProfile,
  monthlySavedFromBudget: number,
  totalYears: number
): AnnualRow[] {
  const monthly401kP1 = monthly401k(profile.partner1.grossSalary, profile.partner1.k401Pct);
  const monthly401kP2 = monthly401k(profile.partner2.grossSalary, profile.partner2.k401Pct);
  const monthlyRoth = (profile.partner1.rothMonthly ?? 0) + (profile.partner2.rothMonthly ?? 0);
  const monthlyRsuVest = monthlyRsu(profile.partner1.rsuAnnual, profile.partner1.rsuTaxRate);
  const monthlyTaxRefund = profile.household.taxRefundAnnual / 12;
  const cashSavingsPct = (profile.household.cashSavingsPct ?? 80) / 100;
  const safeMonthlySaved = Math.max(0, monthlySavedFromBudget) * cashSavingsPct;
  const monthlyOtherContribs = monthly401kP1 + monthly401kP2 + monthlyRoth + monthlyTaxRefund + safeMonthlySaved;

  const spRate = profile.household.spGrowthRate / 100 / 12;
  const rsuRate = (profile.household.rsuGrowthRate ?? profile.household.spGrowthRate) / 100 / 12;

  let rsuBal = profile.partner1.rsuStockBalance ?? 0;
  let otherNW =
    profile.household.currentSavings +
    profile.partner1.k401Balance +
    profile.partner2.k401Balance +
    (profile.partner1.rothBalance ?? 0) +
    (profile.partner2.rothBalance ?? 0);

  const currentYear = new Date().getFullYear();
  const rows: AnnualRow[] = [];

  for (let y = 0; y < totalYears; y++) {
    const startRsu = rsuBal;
    const startOther = otherNW;
    const startOfYear = startRsu + startOther;

    for (let m = 0; m < 12; m++) {
      rsuBal += monthlyRsuVest;
      rsuBal *= 1 + rsuRate;
      otherNW += monthlyOtherContribs;
      otherNW *= 1 + spRate;
    }

    const annualContributions = (monthlyRsuVest + monthlyOtherContribs) * 12;
    const nw = rsuBal + otherNW;
    const marketGains = nw - startOfYear - annualContributions;
    rows.push({
      year: currentYear + y + 1,
      age: profile.partner1.age + y + 1,
      netWorth: nw,
      contributions: annualContributions,
      marketGains,
      yoyChange: nw - startOfYear,
    });
  }
  return rows;
}

const WEDDING_DATE = new Date('2027-06-12');

export function ProjectionsTab({ profile, availableToSave, weddingTotal, onProfileChange }: Props) {
  const [salaryGrowthPct] = useState(3);
  const [showAllYears, setShowAllYears] = useState(false);

  const handleField = (
    section: keyof FinanceProfile,
    field: string,
    value: number
  ) => {
    const updated = {
      ...profile,
      [section]: { ...(profile[section] as Record<string, unknown>), [field]: value },
    } as FinanceProfile;
    onProfileChange(updated);
    saveProfile(updated);
  };

  const p1Age = profile.partner1.age;
  const retAge = profile.household.retirementAge;
  const totalMonths = Math.max(0, (retAge - p1Age) * 12);
  const totalYears = Math.max(0, retAge - p1Age);

  const data = useMemo(
    () => projectNetWorth(profile, availableToSave, totalMonths),
    [profile, availableToSave, totalMonths]
  );

  const annualRows = useMemo(
    () => projectAnnualBreakdown(profile, availableToSave, totalYears),
    [profile, availableToSave, totalYears]
  );

  // Milestone months relative to now
  const now = new Date();

  function ageToMonth(age: number): number {
    const yearsFromNow = age - p1Age;
    return yearsFromNow * 12;
  }

  const milestones = [
    { label: 'Age 30', month: ageToMonth(30), age: 30 },
    { label: 'Age 45', month: ageToMonth(45), age: 45 },
    { label: `Retirement (${retAge})`, month: ageToMonth(retAge), age: retAge },
  ].filter((m) => m.month >= 0 && m.month <= totalMonths);

  // Wedding cross month
  const weddingMonthOffset =
    (WEDDING_DATE.getFullYear() - now.getFullYear()) * 12 +
    (WEDDING_DATE.getMonth() - now.getMonth());

  // Find when savings cross wedding goal
  const weddingCrossMonth = useMemo(() => {
    if (weddingTotal <= 0) return null;
    for (let i = 0; i < data.length; i++) {
      if (data[i] >= weddingTotal) return i;
    }
    return null;
  }, [data, weddingTotal]);

  function monthToDate(m: number): string {
    const d = new Date(now);
    d.setMonth(d.getMonth() + m);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  const yearsFromNow = (m: number) => (m / 12).toFixed(1);

  // Monthly contributions breakdown for assumptions card
  const mo401kP1 = monthly401k(profile.partner1.grossSalary, profile.partner1.k401Pct);
  const mo401kP2 = monthly401k(profile.partner2.grossSalary, profile.partner2.k401Pct);
  const moRoth = (profile.partner1.rothMonthly ?? 0) + (profile.partner2.rothMonthly ?? 0);
  const moRsu = monthlyRsu(profile.partner1.rsuAnnual, profile.partner1.rsuTaxRate);
  const moTaxRefund = profile.household.taxRefundAnnual / 12;
  const cashPct = (profile.household.cashSavingsPct ?? 80) / 100;
  const moSavings = Math.max(0, availableToSave) * cashPct;
  const totalMonthlyContrib = mo401kP1 + mo401kP2 + moRoth + moRsu + moTaxRefund + moSavings;

  const startingNW =
    profile.household.currentSavings +
    profile.partner1.k401Balance +
    profile.partner2.k401Balance +
    (profile.partner1.rsuStockBalance ?? 0) +
    (profile.partner1.rothBalance ?? 0) +
    (profile.partner2.rothBalance ?? 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Age milestone cards — TOP ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${milestones.length}, 1fr)`, gap: 14 }}>
        {milestones.map(({ label, month }) => {
          const nw = data[Math.min(month, data.length - 1)] ?? 0;
          const yearsAway = Math.round(month / 12);
          const row = annualRows[Math.min(yearsAway - 1, annualRows.length - 1)];
          const isRetirement = label.startsWith('Retirement');
          return (
            <div key={label} style={{
              ...CARD_STYLE,
              borderTop: `3px solid ${isRetirement ? '#059669' : '#6366F1'}`,
              padding: '20px 24px',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: isRetirement ? '#059669' : '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                {label}
              </p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                {fmtDollar(nw)}
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px' }}>
                {fmtDollarFull(nw)} · in {yearsAway} years
              </p>
              {row && (
                <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>That year's gains</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#10B981', margin: 0 }}>+{fmtDollar(row.marketGains)}</p>
                  </div>
                  <div style={{ width: 1, background: '#F1F5F9' }} />
                  <div>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>YoY growth</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#6366F1', margin: 0 }}>+{fmtDollar(row.yoyChange)}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Assumptions card ─────────────────────────────────────────────── */}
      <div style={{ ...CARD_STYLE, background: '#F8FAFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 4px' }}>Projection Assumptions</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>These are the inputs driving every number above — adjust them in the settings below.</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 11, background: '#EEF2FF', color: '#6366F1', padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' }}>
              S&P {profile.household.spGrowthRate}%/yr
            </span>
            <span style={{ fontSize: 11, background: '#FFF7ED', color: '#D97706', padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' }}>
              AMZN {profile.household.rsuGrowthRate ?? 10}%/yr
            </span>
            <span style={{ fontSize: 11, background: '#F0FDF4', color: '#059669', padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' }}>
              retire at {profile.household.retirementAge}
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginTop: 16, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <AssumptionCell label="Starting Net Worth" value={fmtDollarFull(startingNW)} note="all accounts today" />
          <AssumptionCell label="Monthly Contributions" value={fmtDollar(totalMonthlyContrib)} note="all sources combined" border />
          <AssumptionCell label="Contribution Breakdown" value="" note="" border>
            <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.8 }}>
              <div>401k: <strong style={{ color: '#0F172A' }}>{fmtDollar(mo401kP1 + mo401kP2)}/mo</strong></div>
              <div>RSU stock: <strong style={{ color: '#0F172A' }}>{fmtDollar(moRsu)}/mo</strong></div>
              <div>Savings ({profile.household.cashSavingsPct ?? 80}% of avail): <strong style={{ color: '#0F172A' }}>{fmtDollar(moSavings)}/mo</strong></div>
              {moRoth > 0 && <div>Roth: <strong style={{ color: '#0F172A' }}>{fmtDollar(moRoth)}/mo</strong></div>}
              {moTaxRefund > 0 && <div>Tax refund: <strong style={{ color: '#0F172A' }}>{fmtDollar(moTaxRefund)}/mo</strong></div>}
            </div>
          </AssumptionCell>
          <AssumptionCell label="Not included" value="" note="" border>
            <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.8 }}>
              <div>Social Security income</div>
              <div>Salary raises over time</div>
              <div>Inflation adjustment</div>
              <div>Future RSU grant changes</div>
            </div>
          </AssumptionCell>
        </div>
      </div>

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Household */}
        <div style={CARD_STYLE}>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#0F172A' }}>Household Settings</p>
          <InputRow
            label="Current Cash / Savings"
            value={profile.household.currentSavings}
            onChange={(v) => handleField('household', 'currentSavings', v)}
            prefix="$"
          />
          <InputRow
            label="Annual Tax Refund"
            value={profile.household.taxRefundAnnual}
            onChange={(v) => handleField('household', 'taxRefundAnnual', v)}
            prefix="$"
          />
          <InputRow
            label="S&P Growth Rate (cash/401k/Roth)"
            value={profile.household.spGrowthRate}
            onChange={(v) => handleField('household', 'spGrowthRate', v)}
            suffix="%"
            min={1}
            max={20}
            step={0.5}
            slider
          />
          <InputRow
            label="RSU Stock Growth Rate (AMZN)"
            value={profile.household.rsuGrowthRate ?? 10}
            onChange={(v) => handleField('household', 'rsuGrowthRate', v)}
            suffix="%"
            min={1}
            max={40}
            step={0.5}
            slider
          />
          <InputRow
            label="Cash Savings Rate"
            value={profile.household.cashSavingsPct ?? 80}
            onChange={(v) => handleField('household', 'cashSavingsPct', v)}
            suffix="%"
            min={0}
            max={100}
            step={5}
            slider
          />
          <InputRow
            label="Retirement Age"
            value={profile.household.retirementAge}
            onChange={(v) => handleField('household', 'retirementAge', v)}
            min={50}
            max={75}
          />
        </div>

        {/* Per-partner */}
        <div style={CARD_STYLE}>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#0F172A' }}>
            Retirement Account Balances
          </p>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: '-8px 0 10px', lineHeight: 1.5 }}>
            Balance = what&apos;s in the account today. Monthly = what you keep adding each month.
          </p>
          <InputRow
            label={`${profile.partner1.name} 401k Balance`}
            value={profile.partner1.k401Balance}
            onChange={(v) => handleField('partner1', 'k401Balance', v)}
            prefix="$"
          />
          <InputRow
            label={`${profile.partner1.name} Roth Balance`}
            value={profile.partner1.rothBalance ?? 0}
            onChange={(v) => handleField('partner1', 'rothBalance', v)}
            prefix="$"
          />
          <InputRow
            label={`${profile.partner1.name} Roth Monthly`}
            value={profile.partner1.rothMonthly}
            onChange={(v) => handleField('partner1', 'rothMonthly', v)}
            prefix="$"
          />
          <InputRow
            label={`${profile.partner2.name} 401k Balance`}
            value={profile.partner2.k401Balance}
            onChange={(v) => handleField('partner2', 'k401Balance', v)}
            prefix="$"
          />
          <InputRow
            label={`${profile.partner2.name} Roth Balance`}
            value={profile.partner2.rothBalance ?? 0}
            onChange={(v) => handleField('partner2', 'rothBalance', v)}
            prefix="$"
          />
          <InputRow
            label={`${profile.partner2.name} Roth Monthly`}
            value={profile.partner2.rothMonthly}
            onChange={(v) => handleField('partner2', 'rothMonthly', v)}
            prefix="$"
          />
        </div>
      </div>

      {/* ── SVG Chart ────────────────────────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', margin: 0 }}>Net Worth Curve</p>
          <span style={{ fontSize: 12, color: '#64748B' }}>
            S&P {profile.household.spGrowthRate}% · AMZN {profile.household.rsuGrowthRate ?? 10}% · retire {profile.household.retirementAge}
          </span>
        </div>
        <NwChart
          data={data}
          milestoneIndices={milestones}
          weddingCrossMonth={weddingCrossMonth !== null ? weddingCrossMonth : weddingMonthOffset}
        />
      </div>

      {/* ── Wedding funding ───────────────────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#0F172A' }}>
          🇮🇹 Wedding Funding
        </p>
        {weddingTotal <= 0 ? (
          <p style={{ color: '#64748B', fontSize: 13 }}>No wedding budget tracked yet.</p>
        ) : weddingCrossMonth === null ? (
          <p style={{ color: '#EF4444', fontSize: 13 }}>
            At current trajectory, savings may not reach the {fmtDollar(weddingTotal)} goal before retirement.
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 99 }}>
              Funded by {monthToDate(weddingCrossMonth)}
            </span>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {yearsFromNow(weddingCrossMonth)} years from now · goal: {fmtDollar(weddingTotal)}
            </span>
          </div>
        )}
      </div>

      {/* ── Year-by-year breakdown table ─────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 3px', color: '#0F172A' }}>Year-by-Year Breakdown</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
              Contributions vs market gains · {profile.household.spGrowthRate}% annual growth assumed
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#6366F1', display: 'inline-block' }} />
              <span style={{ color: '#64748B' }}>Contributions</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10B981', display: 'inline-block' }} />
              <span style={{ color: '#64748B' }}>Market gains</span>
            </span>
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '70px 60px 1fr 1fr 1fr 1fr 80px',
          gap: 0,
          background: '#F8FAFC',
          borderRadius: '8px 8px 0 0',
          border: '1px solid #E2E8F0',
          borderBottom: 'none',
          padding: '8px 12px',
        }}>
          {['Year', 'Age', 'Net Worth', 'Contributions', 'Market Gains', 'YoY Growth', 'Growth %'].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
          {(showAllYears ? annualRows : annualRows.slice(0, 15)).map((row, i) => {
            const barMax = Math.max(...annualRows.map(r => r.yoyChange));
            const contribPct = barMax > 0 ? (row.contributions / barMax) * 100 : 0;
            const gainPct = barMax > 0 ? (row.marketGains / barMax) * 100 : 0;
            const yoyPct = annualRows[i - 1] ? ((row.netWorth / annualRows[i - 1].netWorth - 1) * 100) : null;
            return (
              <div
                key={row.year}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 60px 1fr 1fr 1fr 1fr 80px',
                  gap: 0,
                  padding: '10px 12px',
                  borderBottom: i < (showAllYears ? annualRows : annualRows.slice(0, 15)).length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{row.year}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>{row.age}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{fmtDollarFull(row.netWorth)}</span>
                {/* Contributions with mini bar */}
                <div>
                  <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 500 }}>{fmtDollar(row.contributions)}</span>
                  <div style={{ height: 3, background: '#EEF2FF', borderRadius: 99, marginTop: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${contribPct}%`, height: '100%', background: '#6366F1', borderRadius: 99 }} />
                  </div>
                </div>
                {/* Market gains with mini bar */}
                <div>
                  <span style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>{fmtDollar(row.marketGains)}</span>
                  <div style={{ height: 3, background: '#D1FAE5', borderRadius: 99, marginTop: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${gainPct}%`, height: '100%', background: '#10B981', borderRadius: 99 }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#475569' }}>+{fmtDollar(row.yoyChange)}</span>
                <span style={{ fontSize: 12, color: yoyPct && yoyPct > 0 ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                  {yoyPct != null ? `+${yoyPct.toFixed(1)}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {annualRows.length > 15 && (
          <button
            onClick={() => setShowAllYears(!showAllYears)}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '8px',
              background: 'none',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 12,
              color: '#6366F1',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {showAllYears ? 'Show fewer years' : `Show all ${annualRows.length} years`}
          </button>
        )}
      </div>
    </div>
  );
}

function AssumptionCell({ label, value, note, border, children }: {
  label: string; value: string; note: string; border?: boolean; children?: React.ReactNode;
}) {
  return (
    <div style={{ padding: '0 20px 0 0', borderLeft: border ? '1px solid #E2E8F0' : 'none', marginLeft: border ? 20 : 0 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{label}</p>
      {value && <p style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{value}</p>}
      {note && <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{note}</p>}
      {children}
    </div>
  );
}
