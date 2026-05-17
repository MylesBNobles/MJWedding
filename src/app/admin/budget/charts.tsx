'use client';

import { useMemo, useState } from 'react';
import {
  BudgetItem,
  BudgetCategory,
  CATEGORY_COLORS,
  EUR_USD_RATE,
} from './data';

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutProps {
  items: BudgetItem[];
  currency: 'EUR' | 'USD';
  multiplier: number;
}

export function DonutChart({ items, currency, multiplier }: DonutProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const map: Partial<Record<BudgetCategory, number>> = {};
    for (const item of items) {
      const val = (item.actualEur ?? item.estimatedEur) * multiplier;
      map[item.category] = (map[item.category] ?? 0) + val;
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a) as [BudgetCategory, number][];
  }, [items, multiplier]);

  const total = byCategory.reduce((s, [, v]) => s + v, 0);
  const cx = 120;
  const cy = 120;
  const r = 90;
  const innerR = 55;

  let cumAngle = -Math.PI / 2;

  const slices = byCategory.map(([cat, val]) => {
    const fraction = total > 0 ? val / total : 0;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const large = angle > Math.PI ? 1 : 0;

    const d =
      `M ${x1} ${y1} ` +
      `A ${r} ${r} 0 ${large} 1 ${x2} ${y2} ` +
      `L ${ix1} ${iy1} ` +
      `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} ` +
      `Z`;

    return { cat, val, d, fraction, color: CATEGORY_COLORS[cat] };
  });

  const fmt = (v: number) =>
    currency === 'EUR'
      ? `€${Math.round(v).toLocaleString()}`
      : `$${Math.round(v * EUR_USD_RATE).toLocaleString()}`;

  const hoveredSlice = slices.find((s) => s.cat === hovered);

  return (
    <div className="flex gap-6 items-center flex-wrap">
      <svg
        width={240}
        height={240}
        style={{ flexShrink: 0 }}
        role="img"
        aria-label="Budget by category donut chart"
      >
        {slices.map((slice) => (
          <path
            key={slice.cat}
            d={slice.d}
            fill={slice.color}
            opacity={hovered === null || hovered === slice.cat ? 1 : 0.4}
            style={{ transition: 'opacity 200ms, transform 200ms', transformOrigin: `${cx}px ${cy}px` }}
            transform={hovered === slice.cat ? 'scale(1.04)' : 'scale(1)'}
            onMouseEnter={() => setHovered(slice.cat)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          />
        ))}
        {/* Center text */}
        {hoveredSlice ? (
          <>
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#8a7d6c"
              fontFamily="Georgia, serif"
            >
              {hoveredSlice.cat}
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fontSize={13}
              fontWeight="600"
              fill="#3F3A36"
            >
              {fmt(hoveredSlice.val)}
            </text>
            <text
              x={cx}
              y={cy + 26}
              textAnchor="middle"
              fontSize={10}
              fill="#C9BFB2"
            >
              {Math.round(hoveredSlice.fraction * 100)}%
            </text>
          </>
        ) : (
          <>
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fontSize={11}
              fill="#8a7d6c"
              fontFamily="Georgia, serif"
            >
              Total Budget
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fontSize={14}
              fontWeight="700"
              fill="#3F3A36"
            >
              {fmt(total)}
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {slices.map((slice) => (
          <div
            key={slice.cat}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHovered(slice.cat)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered === null || hovered === slice.cat ? 1 : 0.45, transition: 'opacity 200ms' }}
          >
            <span
              className="rounded-sm flex-shrink-0"
              style={{ width: 10, height: 10, background: slice.color }}
            />
            <span
              className="text-xs truncate"
              style={{ fontFamily: 'Georgia, serif', color: '#8a7d6c' }}
            >
              {slice.cat}
            </span>
            <span className="text-xs text-[#3F3A36] font-medium ml-auto whitespace-nowrap">
              {fmt(slice.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────

interface BarProps {
  items: BudgetItem[];
  currency: 'EUR' | 'USD';
  multiplier: number;
}

export function PaidRemainingBar({ items, currency, multiplier }: BarProps) {
  const byCategory = useMemo(() => {
    const map: Partial<Record<BudgetCategory, { paid: number; remaining: number }>> = {};
    for (const item of items) {
      const est = item.estimatedEur * multiplier;
      const paid = item.depositPaidEur * multiplier;
      const remaining = Math.max(0, est - paid);
      if (!map[item.category]) map[item.category] = { paid: 0, remaining: 0 };
      map[item.category]!.paid += paid;
      map[item.category]!.remaining += remaining;
    }
    return Object.entries(map)
      .filter(([, v]) => v.paid + v.remaining > 0)
      .sort(([, a], [, b]) => b.paid + b.remaining - (a.paid + a.remaining)) as [
      BudgetCategory,
      { paid: number; remaining: number }
    ][];
  }, [items, multiplier]);

  const maxVal = byCategory.reduce((m, [, v]) => Math.max(m, v.paid + v.remaining), 0);

  const fmt = (v: number) =>
    currency === 'EUR'
      ? `€${Math.round(v / 1000)}k`
      : `$${Math.round((v * EUR_USD_RATE) / 1000)}k`;

  const BAR_H = 18;
  const GAP = 10;
  const LABEL_W = 110;
  const BAR_AREA = 200;
  const svgH = byCategory.length * (BAR_H + GAP) + 20;

  return (
    <svg
      width="100%"
      height={svgH}
      viewBox={`0 0 ${LABEL_W + BAR_AREA + 60} ${svgH}`}
      style={{ overflow: 'visible' }}
    >
      {byCategory.map(([cat, { paid, remaining }], i) => {
        const y = i * (BAR_H + GAP);
        const total = paid + remaining;
        const paidW = maxVal > 0 ? (paid / maxVal) * BAR_AREA : 0;
        const remW = maxVal > 0 ? (remaining / maxVal) * BAR_AREA : 0;

        return (
          <g key={cat}>
            <text
              x={LABEL_W - 6}
              y={y + BAR_H / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill="#8a7d6c"
              fontFamily="Georgia, serif"
            >
              {cat}
            </text>
            <rect
              x={LABEL_W}
              y={y}
              width={paidW}
              height={BAR_H}
              rx={3}
              fill="#C9A684"
              opacity={0.85}
            />
            <rect
              x={LABEL_W + paidW}
              y={y}
              width={remW}
              height={BAR_H}
              rx={3}
              fill="#BFCBB2"
              opacity={0.75}
            />
            <text
              x={LABEL_W + paidW + remW + 6}
              y={y + BAR_H / 2 + 4}
              fontSize={10}
              fill="#3F3A36"
              fontWeight="500"
            >
              {fmt(total)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${LABEL_W}, ${svgH - 14})`}>
        <rect x={0} y={0} width={10} height={10} rx={2} fill="#C9A684" opacity={0.85} />
        <text x={14} y={9} fontSize={9} fill="#8a7d6c">
          Paid
        </text>
        <rect x={50} y={0} width={10} height={10} rx={2} fill="#BFCBB2" opacity={0.75} />
        <text x={64} y={9} fontSize={9} fill="#8a7d6c">
          Remaining
        </text>
      </g>
    </svg>
  );
}

// ─── Payment Timeline ─────────────────────────────────────────────────────────

interface TimelineProps {
  items: BudgetItem[];
  currency: 'EUR' | 'USD';
  multiplier: number;
}

export function PaymentTimeline({ items, currency, multiplier }: TimelineProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = useMemo(() => {
    return items
      .filter((item) => item.dueDate && item.dueDate !== 'TBD' && item.dueDate !== '')
      .map((item) => {
        const date = new Date(item.dueDate + 'T00:00:00');
        const daysUntil = Math.round((date.getTime() - today.getTime()) / 86400000);
        const amount = item.estimatedEur * multiplier;
        return { item, date, daysUntil, amount };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [items, multiplier]);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-[#C9BFB2]" style={{ fontFamily: 'Georgia, serif' }}>
        No dated payments yet
      </div>
    );
  }

  const fmt = (v: number) =>
    currency === 'EUR'
      ? `€${Math.round(v).toLocaleString()}`
      : `$${Math.round(v * EUR_USD_RATE).toLocaleString()}`;

  const W = 600;
  const H = 100;
  const PAD = 40;
  const LINE_Y = 52;
  const n = events.length;
  const step = n > 1 ? (W - PAD * 2) / (n - 1) : 0;

  function dotColor(daysUntil: number) {
    if (daysUntil < 0) return '#ef4444';
    if (daysUntil <= 30) return '#f97316';
    if (daysUntil <= 90) return '#f59e0b';
    return '#BFCBB2';
  }

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: 'visible' }}
    >
      {/* Baseline */}
      <line
        x1={PAD}
        y1={LINE_Y}
        x2={W - PAD}
        y2={LINE_Y}
        stroke="#EDE6D8"
        strokeWidth={2}
      />

      {events.map(({ item, date, daysUntil, amount }, i) => {
        const x = n === 1 ? W / 2 : PAD + i * step;
        const color = dotColor(daysUntil);
        const above = i % 2 === 0;
        const labelY = above ? LINE_Y - 28 : LINE_Y + 38;
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

        return (
          <g key={item.id}>
            <line
              x1={x}
              y1={LINE_Y}
              x2={x}
              y2={above ? LINE_Y - 16 : LINE_Y + 16}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
            <circle cx={x} cy={LINE_Y} r={5} fill={color} />
            <text
              x={x}
              y={above ? LINE_Y - 20 : LINE_Y + 22}
              textAnchor="middle"
              fontSize={9}
              fill={color}
              fontWeight="600"
            >
              {fmt(amount)}
            </text>
            <text
              x={x}
              y={above ? LINE_Y - 10 : LINE_Y + 32}
              textAnchor="middle"
              fontSize={8.5}
              fill="#8a7d6c"
            >
              {item.lineItem.length > 12 ? item.lineItem.slice(0, 10) + '…' : item.lineItem}
            </text>
            <text
              x={x}
              y={labelY + (above ? 10 : 8)}
              textAnchor="middle"
              fontSize={8}
              fill="#C9BFB2"
            >
              {dateStr}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
