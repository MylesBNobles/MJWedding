'use client';

import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BudgetItem, BudgetStatus, STATUS_CONFIG, fmtUsd, genId } from './data';

// ─── Status Chip ──────────────────────────────────────────────────────────────

export function StatusChip({ status }: { status: BudgetStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${cfg.colors}`}>
      {cfg.label}
    </span>
  );
}

// ─── Inline Edit Field ────────────────────────────────────────────────────────

function InlineField({
  label,
  value,
  onSave,
  type = 'text',
  placeholder = '',
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit() {
    if (draft !== value) onSave(draft);
  }

  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] uppercase tracking-wider text-[#C9BFB2]" style={{ fontFamily: 'Georgia, serif' }}>
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { commit(); inputRef.current?.blur(); }
          if (e.key === 'Escape') { setDraft(value); inputRef.current?.blur(); }
        }}
        placeholder={placeholder || '—'}
        className="text-sm text-[#3F3A36] bg-[#FAF7F2] border border-[#EDE6D8] rounded px-2 py-1 outline-none focus:border-[#C9A684] focus:ring-1 focus:ring-[#C9A684]/30 transition-all"
        style={{ minWidth: 0 }}
      />
    </div>
  );
}

// ─── Status Selector ──────────────────────────────────────────────────────────

function StatusSelector({ value, onChange }: { value: BudgetStatus; onChange: (v: BudgetStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statuses = Object.keys(STATUS_CONFIG) as BudgetStatus[];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="focus:outline-none">
        <StatusChip status={value} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#EDE6D8] rounded-lg shadow-xl py-1 min-w-[150px]">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#FAF7F2] transition-colors"
            >
              <StatusChip status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

interface BudgetCardProps {
  item: BudgetItem;
  multiplier: number;
  onUpdate: (id: string, patch: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  /** Extra action: move to "considering" zone */
  onConsider?: (id: string) => void;
  /** Extra action: restore to active */
  onRestore?: (id: string) => void;
  /** Override styling for cut zone */
  isCut?: boolean;
  /** Override styling for considering zone */
  isConsidering?: boolean;
  /** Disable dragging (e.g. in overlay clone) */
  isDragOverlay?: boolean;
  accentColor?: string;
}

export function BudgetCard({
  item,
  multiplier,
  onUpdate,
  onDelete,
  onConsider,
  onRestore,
  isCut = false,
  isConsidering = false,
  isDragOverlay = false,
  accentColor = '#C9A684',
}: BudgetCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: isDragOverlay,
    data: { item },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const amountUsd = (item.actualEur ?? item.estimatedEur) * multiplier * 1.09;

  const leftBorderColor = isCut
    ? '#C9BFB2'
    : isConsidering
    ? '#F59E0B'
    : accentColor;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: leftBorderColor,
        opacity: isDragging ? 0.4 : isCut ? 0.65 : 1,
      }}
      className={`
        relative bg-white rounded-lg border border-[#EDE6D8] border-l-[3px]
        shadow-sm hover:shadow-md transition-all duration-150
        ${isDragOverlay ? 'shadow-xl scale-105 rotate-1' : ''}
        ${isCut ? 'bg-[#FAF7F2]' : ''}
        ${isConsidering ? 'bg-amber-50/40' : ''}
        select-none
      `}
    >
      {/* Drag handle + main content */}
      <div className="flex items-start gap-2 p-3">
        {/* Drag grip */}
        {!isDragOverlay && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-[#C9BFB2] hover:text-[#8a7d6c] transition-colors touch-none"
            title="Drag to move"
            tabIndex={-1}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
              <circle cx="3" cy="3" r="1.5" />
              <circle cx="9" cy="3" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="9" cy="8" r="1.5" />
              <circle cx="3" cy="13" r="1.5" />
              <circle cx="9" cy="13" r="1.5" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`font-semibold text-sm leading-tight ${isCut ? 'line-through text-[#C9BFB2]' : 'text-[#3F3A36]'}`}
              >
                {item.lineItem}
              </p>
              {item.vendor && item.vendor !== 'TBD' && item.vendor !== '' && (
                <p className="text-[11px] text-[#8a7d6c] mt-0.5 truncate">{item.vendor}</p>
              )}
            </div>

            {/* Amount — prominent */}
            <div className="text-right flex-shrink-0">
              <p
                className={`text-base font-bold tabular-nums ${isCut ? 'text-[#C9BFB2] line-through' : 'text-[#3F3A36]'}`}
              >
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amountUsd)}
              </p>
            </div>
          </div>

          {/* Status + due date row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusChip status={item.status} />
            {item.dueDate && item.dueDate !== '' && (
              <span className="text-[10px] text-[#C9BFB2]">
                Due: {item.dueDate === 'TBD' ? 'TBD' : new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between px-3 pb-2 gap-2">
        <div className="flex items-center gap-1.5">
          {/* Expand/edit toggle */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[10px] text-[#C9BFB2] hover:text-[#8a7d6c] transition-colors"
          >
            {expanded ? 'Close' : 'Edit'}
          </button>

          {/* Zone action buttons */}
          {onConsider && !isConsidering && !isCut && (
            <button
              onClick={() => onConsider(item.id)}
              className="text-[10px] text-[#C9BFB2] hover:text-amber-600 transition-colors"
              title="Move to Considering"
            >
              Consider cutting
            </button>
          )}
          {onRestore && (isConsidering || isCut) && (
            <button
              onClick={() => onRestore(item.id)}
              className="text-[10px] text-[#C9A684] hover:text-[#8a6a44] font-medium transition-colors"
            >
              Restore
            </button>
          )}
          {isConsidering && onConsider && (
            <button
              onClick={() => {
                onUpdate(item.id, { zone: 'cut' });
              }}
              className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
              title="Move to Definitely Cut"
            >
              ✂ Cut
            </button>
          )}
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="text-[10px] text-[#C9BFB2] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete item"
        >
          ✕
        </button>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div
          className="border-t border-[#EDE6D8] p-3 grid grid-cols-2 gap-3"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <InlineField
            label="Name"
            value={item.lineItem}
            onSave={(v) => onUpdate(item.id, { lineItem: v })}
            placeholder="Line item"
          />
          <InlineField
            label="Vendor"
            value={item.vendor}
            onSave={(v) => onUpdate(item.id, { vendor: v })}
            placeholder="Vendor name"
          />
          <InlineField
            label="Amount (EUR)"
            value={String(item.estimatedEur)}
            onSave={(v) => onUpdate(item.id, { estimatedEur: parseFloat(v) || 0 })}
            type="number"
          />
          <InlineField
            label="Due Date"
            value={item.dueDate}
            onSave={(v) => onUpdate(item.id, { dueDate: v })}
            type="text"
            placeholder="TBD"
          />
          <div className="col-span-2">
            <InlineField
              label="Notes"
              value={item.notes}
              onSave={(v) => onUpdate(item.id, { notes: v })}
              placeholder="Notes..."
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-[#C9BFB2] block mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              Status
            </label>
            <StatusSelector value={item.status} onChange={(v) => onUpdate(item.id, { status: v })} />
          </div>
          {item.notes && (
            <div className="col-span-2">
              <p className="text-[10px] text-[#C9BFB2] italic">{item.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
