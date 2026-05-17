'use client';

import { useEffect, useRef, useState } from 'react';
import { BudgetItem, BudgetCategory, CATEGORY_COLORS, EUR_USD_RATE, GUEST_COUNT } from './data';

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({
  value,
  className = '',
  prefix = '$',
}: {
  value: number;
  className?: string;
  prefix?: string;
}) {
  const [displayed, setDisplayed] = useState(value);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(value);
  const toRef = useRef<number>(value);
  const DURATION = 600;

  useEffect(() => {
    fromRef.current = displayed;
    toRef.current = value;
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplayed(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatted = `${prefix}${Math.round(displayed).toLocaleString()}`;
  return <span className={className}>{formatted}</span>;
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({
  items,
  multiplier,
}: {
  items: BudgetItem[];
  multiplier: number;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const byCategory = (() => {
    const map: Partial<Record<BudgetCategory, number>> = {};
    for (const item of items) {
      if (item.zone !== 'active') continue;
      const val = (item.actualEur ?? item.estimatedEur) * multiplier * EUR_USD_RATE;
      map[item.category] = (map[item.category] ?? 0) + val;
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a) as [BudgetCategory, number][];
  })();

  const total = byCategory.reduce((s, [, v]) => s + v, 0);
  const cx = 90;
  const cy = 90;
  const R = 70;
  const innerR = 44;

  let cumAngle = -Math.PI / 2;

  const slices = byCategory.map(([cat, val]) => {
    const fraction = total > 0 ? val / total : 0;
    const angle = fraction * 2 * Math.PI;
    const start = cumAngle;
    cumAngle += angle;
    const end = cumAngle;

    const x1 = cx + R * Math.cos(start);
    const y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end);
    const y2 = cy + R * Math.sin(end);
    const ix1 = cx + innerR * Math.cos(end);
    const iy1 = cy + innerR * Math.sin(end);
    const ix2 = cx + innerR * Math.cos(start);
    const iy2 = cy + innerR * Math.sin(start);
    const large = angle > Math.PI ? 1 : 0;

    const d =
      `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} ` +
      `L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;

    return { cat, val, d, fraction, color: CATEGORY_COLORS[cat as BudgetCategory] };
  });

  const hoveredSlice = slices.find((s) => s.cat === hovered);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  if (slices.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-xs text-[#C9BFB2] italic">
        No active items
      </div>
    );
  }

  return (
    <div>
      <svg
        width={180}
        height={180}
        viewBox="0 0 180 180"
        className="w-full"
        role="img"
        aria-label="Budget by category"
      >
        {slices.map((s) => (
          <path
            key={s.cat}
            d={s.d}
            fill={s.color}
            opacity={hovered === null || hovered === s.cat ? 1 : 0.4}
            style={{ transition: 'opacity 200ms, transform 200ms', transformOrigin: `${cx}px ${cy}px` }}
            transform={hovered === s.cat ? 'scale(1.04)' : 'scale(1)'}
            onMouseEnter={() => setHovered(s.cat)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          />
        ))}
        {hoveredSlice ? (
          <>
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize={9} fill="#8a7d6c" fontFamily="Georgia, serif">
              {hoveredSlice.cat}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize={11} fontWeight="600" fill="#3F3A36">
              {fmt(hoveredSlice.val)}
            </text>
            <text x={cx} y={cy + 20} textAnchor="middle" fontSize={9} fill="#C9BFB2">
              {Math.round(hoveredSlice.fraction * 100)}%
            </text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9} fill="#8a7d6c" fontFamily="Georgia, serif">
              Total
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize={12} fontWeight="700" fill="#3F3A36">
              {fmt(total)}
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="space-y-1.5 mt-1">
        {slices.map((s) => (
          <div
            key={s.cat}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHovered(s.cat)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered === null || hovered === s.cat ? 1 : 0.45, transition: 'opacity 200ms' }}
          >
            <span className="rounded-sm flex-shrink-0" style={{ width: 8, height: 8, background: s.color }} />
            <span className="text-[10px] text-[#8a7d6c] truncate flex-1" style={{ fontFamily: 'Georgia, serif' }}>
              {s.cat}
            </span>
            <span className="text-[10px] font-medium text-[#3F3A36] tabular-nums whitespace-nowrap">
              {fmt(s.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Budget Rail ──────────────────────────────────────────────────────────────

interface BudgetRailProps {
  items: BudgetItem[];
  multiplier: number;
  scenario: string;
}

export function BudgetRail({ items, multiplier, scenario }: BudgetRailProps) {
  const activeItems = items.filter((i) => i.zone === 'active');
  const consideringItems = items.filter((i) => i.zone === 'considering');
  const cutItems = items.filter((i) => i.zone === 'cut');

  const total = activeItems.reduce(
    (s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * EUR_USD_RATE,
    0
  );

  const committed = activeItems
    .filter((i) => i.status === 'Booked' || i.status === 'Paid')
    .reduce((s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * EUR_USD_RATE, 0);

  const paid = activeItems
    .filter((i) => i.status === 'Paid')
    .reduce((s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * EUR_USD_RATE, 0);

  const remaining = total - paid;

  const contingency = total * 0.1;
  const perGuest = total / GUEST_COUNT;

  const consideringSavings = consideringItems.reduce(
    (s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * EUR_USD_RATE,
    0
  );
  const cutSavings = cutItems.reduce(
    (s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * EUR_USD_RATE,
    0
  );
  const totalSavings = consideringSavings + cutSavings;

  // Savings meter: fraction of original budget that's been staged for cutting
  const originalTotal = items.reduce(
    (s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * EUR_USD_RATE,
    0
  );
  const savingsFraction = originalTotal > 0 ? totalSavings / originalTotal : 0;

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <aside className="sticky top-24 flex flex-col gap-4">
      {/* Scenario badge */}
      {scenario !== 'Realistic' && (
        <div className={`
          text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full text-center
          ${scenario === 'Luxury' ? 'bg-[#C9A684]/20 text-[#8a6a44]' : 'bg-[#BFCBB2]/20 text-[#5a7a4a]'}
        `}>
          {scenario} ×{multiplier}
        </div>
      )}

      {/* Main summary card */}
      <div className="bg-white rounded-xl border border-[#EDE6D8] p-4 space-y-3">
        {/* Total — big */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8a7d6c] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Total Estimated
          </p>
          <AnimatedNumber
            value={total}
            className="text-3xl font-bold text-[#3F3A36] tabular-nums block"
          />
        </div>

        <div className="border-t border-[#EDE6D8] pt-3 space-y-2.5">
          <StatRow label="Committed" value={committed} fmt={fmt} />
          <StatRow label="Remaining to Pay" value={remaining} fmt={fmt} highlight />
          <StatRow label="Paid" value={paid} fmt={fmt} muted />
          <StatRow label="Contingency (10%)" value={contingency} fmt={fmt} muted />
          <StatRow label={`Est. Per Guest (÷${GUEST_COUNT})`} value={perGuest} fmt={fmt} muted />
        </div>
      </div>

      {/* Savings meter */}
      {totalSavings > 0 && (
        <div className="bg-white rounded-xl border border-emerald-200 p-4">
          <p className="text-[10px] uppercase tracking-widest text-emerald-600 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Projected Savings
          </p>
          <AnimatedNumber
            value={totalSavings}
            className="text-2xl font-bold text-emerald-600 tabular-nums block"
          />

          {/* Savings meter bar */}
          <div className="mt-3">
            <div className="h-2 bg-[#EDE6D8] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(savingsFraction * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-500 mt-1">
              {Math.round(savingsFraction * 100)}% of total
              {consideringItems.length > 0 && ` · ${consideringItems.length} item${consideringItems.length !== 1 ? 's' : ''} considering`}
              {cutItems.length > 0 && ` · ${cutItems.length} cut`}
            </p>
          </div>

          {consideringSavings > 0 && (
            <p className="text-[10px] text-amber-600 mt-2">
              ⚠ {fmt(consideringSavings)} if you cut the considering items
            </p>
          )}
          {cutSavings > 0 && (
            <p className="text-[10px] text-red-500 mt-1">
              ✂ {fmt(cutSavings)} definitely removed
            </p>
          )}
        </div>
      )}

      {/* Donut chart */}
      <div className="bg-white rounded-xl border border-[#EDE6D8] p-4">
        <p className="text-[10px] uppercase tracking-widest text-[#8a7d6c] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          By Category
        </p>
        <DonutChart items={items} multiplier={multiplier} />
      </div>
    </aside>
  );
}

function StatRow({
  label,
  value,
  fmt,
  highlight,
  muted,
}: {
  label: string;
  value: number;
  fmt: (v: number) => string;
  highlight?: boolean;
  muted?: boolean;
}) {
  const [prev, setPrev] = useState(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlash(true);
      setPrev(value);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] text-[#8a7d6c] truncate">{label}</span>
      <AnimatedNumber
        value={value}
        className={`
          text-sm font-semibold tabular-nums whitespace-nowrap transition-colors duration-300
          ${highlight ? 'text-[#8a6a44]' : muted ? 'text-[#C9BFB2]' : 'text-[#3F3A36]'}
          ${flash ? 'text-emerald-500' : ''}
        `}
      />
    </div>
  );
}
