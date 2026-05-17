'use client';

import { useDroppable } from '@dnd-kit/core';
import { BudgetItem } from './data';
import { BudgetCard } from './BudgetCard';

// ─── Considering Cutting Zone ─────────────────────────────────────────────────

interface ConsideringZoneProps {
  items: BudgetItem[];
  multiplier: number;
  onUpdate: (id: string, patch: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onRestoreAll: () => void;
  savings: number;
}

export function ConsideringZone({
  items,
  multiplier,
  onUpdate,
  onDelete,
  onRestore,
  onRestoreAll,
  savings,
}: ConsideringZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'considering',
    data: { type: 'considering' },
  });

  const savingsFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(savings);

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 transition-all duration-200
        ${isOver
          ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-100'
          : 'border-dashed border-amber-300/60 bg-amber-50/30'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">⚠</span>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Considering Cutting
            </p>
            <p className="text-[10px] text-amber-600/70 mt-0.5">
              Drag items here to see projected savings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savings > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-amber-600/70 uppercase tracking-wider">Would save</p>
              <p className="text-lg font-bold text-amber-700 tabular-nums">{savingsFormatted}</p>
            </div>
          )}
          {items.length > 0 && (
            <button
              onClick={onRestoreAll}
              className="text-[11px] text-amber-600 hover:text-amber-800 font-medium border border-amber-300 rounded px-2 py-1 hover:bg-amber-100 transition-colors"
            >
              Restore all
            </button>
          )}
        </div>
      </div>

      {/* Drop target area */}
      <div className="px-3 pb-3">
        {items.length === 0 && !isOver && (
          <div className="border-2 border-dashed border-amber-200 rounded-lg py-6 text-center">
            <p className="text-xs text-amber-400">
              Drag budget items here to explore cuts
            </p>
          </div>
        )}

        {isOver && items.length === 0 && (
          <div className="border-2 border-amber-400 rounded-lg py-6 text-center bg-amber-100/50 animate-pulse">
            <p className="text-xs text-amber-600 font-medium">Release to add</p>
          </div>
        )}

        {isOver && items.length > 0 && (
          <div className="border-2 border-amber-400 rounded-lg py-2 px-3 text-center bg-amber-100/50 animate-pulse mb-2">
            <p className="text-xs text-amber-600 font-medium">Release to add</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {items.map((item) => (
              <BudgetCard
                key={item.id}
                item={item}
                multiplier={multiplier}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onRestore={onRestore}
                isConsidering
                accentColor="#F59E0B"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Definitely Cut Zone ──────────────────────────────────────────────────────

interface CutZoneProps {
  items: BudgetItem[];
  multiplier: number;
  onUpdate: (id: string, patch: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  savings: number;
}

export function CutZone({
  items,
  multiplier,
  onUpdate,
  onDelete,
  onRestore,
  savings,
}: CutZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'cut',
    data: { type: 'cut' },
  });

  const savingsFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(savings);

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 transition-all duration-200
        ${isOver
          ? 'border-red-400 bg-red-50 shadow-lg shadow-red-100'
          : 'border-dashed border-red-200/70 bg-red-50/20'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">✂</span>
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Removed from Budget
            </p>
            <p className="text-[10px] text-red-500/60 mt-0.5">
              These items are confirmed cuts
            </p>
          </div>
        </div>
        {savings > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-red-500/60 uppercase tracking-wider">Total saved</p>
            <p className="text-lg font-bold text-red-600 tabular-nums">{savingsFormatted}</p>
          </div>
        )}
      </div>

      {/* Drop target area */}
      <div className="px-3 pb-3">
        {items.length === 0 && !isOver && (
          <div className="border-2 border-dashed border-red-100 rounded-lg py-4 text-center">
            <p className="text-xs text-red-300">
              Drag here to permanently remove from budget
            </p>
          </div>
        )}

        {isOver && (
          <div className="border-2 border-red-400 rounded-lg py-3 text-center bg-red-100/50 animate-pulse mb-2">
            <p className="text-xs text-red-600 font-medium">✂ Release to cut</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {items.map((item) => (
              <BudgetCard
                key={item.id}
                item={item}
                multiplier={multiplier}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onRestore={onRestore}
                isCut
                accentColor="#C9BFB2"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
