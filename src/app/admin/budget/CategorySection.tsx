'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BudgetItem, BudgetCategory, CATEGORY_COLORS, genId, fmtUsd } from './data';
import { BudgetCard } from './BudgetCard';

interface CategorySectionProps {
  category: BudgetCategory;
  items: BudgetItem[];
  multiplier: number;
  onUpdate: (id: string, patch: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onConsider: (id: string) => void;
  onAdd: (category: BudgetCategory) => void;
}

export function CategorySection({
  category,
  items,
  multiplier,
  onUpdate,
  onDelete,
  onConsider,
  onAdd,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newName, setNewName] = useState('');

  const { isOver, setNodeRef } = useDroppable({
    id: `category-${category}`,
    data: { type: 'category', category },
  });

  const color = CATEGORY_COLORS[category];

  const total = items.reduce(
    (s, item) => s + (item.actualEur ?? item.estimatedEur) * multiplier * 1.09,
    0
  );

  const fmtTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(total);

  function handleAdd() {
    if (!newName.trim()) return;
    onAdd(category);
    setAddingItem(false);
    setNewName('');
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border transition-all duration-200
        ${isOver
          ? 'border-[#C9A684] bg-[#C9A684]/5 shadow-md'
          : 'border-[#EDE6D8] bg-white'
        }
      `}
    >
      {/* Category Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-[#FAF7F2]/60 rounded-t-xl transition-colors"
      >
        <span
          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ background: color }}
        />
        <span
          className="text-xs uppercase tracking-widest font-medium text-[#8a7d6c] flex-1"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {category}
        </span>
        <span className="text-[10px] text-[#C9BFB2] mr-1">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
        <span className="text-sm font-semibold text-[#3F3A36] tabular-nums">
          {fmtTotal}
        </span>
        <svg
          className="w-3.5 h-3.5 text-[#C9BFB2] transition-transform flex-shrink-0"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 space-y-2">
          {/* Drop hint when empty */}
          {items.length === 0 && !isOver && (
            <p className="text-xs text-[#C9BFB2] italic text-center py-3">
              Drop items here to restore them
            </p>
          )}

          {isOver && (
            <div className="border-2 border-dashed border-[#C9A684]/40 rounded-lg py-3 text-center text-xs text-[#C9A684] animate-pulse">
              Drop to restore here
            </div>
          )}

          {/* Cards */}
          {items.map((item) => (
            <div key={item.id} className="group">
              <BudgetCard
                item={item}
                multiplier={multiplier}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onConsider={onConsider}
                accentColor={color}
              />
            </div>
          ))}

          {/* Add item */}
          {addingItem ? (
            <div className="flex gap-2 mt-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') { setAddingItem(false); setNewName(''); }
                }}
                placeholder="Item name..."
                className="flex-1 text-sm bg-[#FAF7F2] border border-[#C9A684] rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#C9A684]/30"
              />
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 bg-[#C9A684] text-white text-xs rounded font-medium hover:bg-[#B8956E] transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setAddingItem(false); setNewName(''); }}
                className="px-2 py-1.5 text-[#C9BFB2] text-xs hover:text-[#3F3A36] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="flex items-center gap-1.5 text-[11px] text-[#C9BFB2] hover:text-[#C9A684] transition-colors w-full mt-1 px-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
