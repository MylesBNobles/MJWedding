'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { Container } from '@/components';

import {
  BudgetItem,
  BudgetCategory,
  CATEGORIES,
  GUEST_COUNT,
  Scenario,
  SCENARIO_MULTIPLIERS,
  CATEGORY_COLORS,
} from './data';
import { createItem, updateItem, removeItem } from './actions';
import { BudgetCard } from './BudgetCard';
import { CategorySection } from './CategorySection';
import { ConsideringZone, CutZone } from './DropZone';
import { BudgetRail } from './BudgetRail';

export function BudgetClient({ initialItems }: { initialItems: BudgetItem[] }) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [scenario, setScenario] = useState<Scenario>('Realistic');
  const [activeId, setActiveId] = useState<string | null>(null);

  const multiplier = SCENARIO_MULTIPLIERS[scenario];

  const activeItems     = items.filter((i) => i.zone === 'active');
  const consideringItems = items.filter((i) => i.zone === 'considering');
  const cutItems        = items.filter((i) => i.zone === 'cut');

  const consideringSavings = consideringItems.reduce(
    (s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * 1.09, 0
  );
  const cutSavings = cutItems.reduce(
    (s, i) => s + (i.actualEur ?? i.estimatedEur) * multiplier * 1.09, 0
  );

  const draggingItem = activeId ? items.find((i) => i.id === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ── Mutations — optimistic update + fire-and-forget persist ───────────────

  const handleUpdate = useCallback((id: string, patch: Partial<BudgetItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    updateItem(id, patch).catch(console.error);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    removeItem(id).catch(console.error);
  }, []);

  const moveToConsidering = useCallback((id: string) => {
    const patch = { zone: 'considering' as const };
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    updateItem(id, patch).catch(console.error);
  }, []);

  const restoreItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const patch = { zone: 'active' as const, status: i.status === 'Cut' ? 'Planned' as const : i.status };
        updateItem(id, patch).catch(console.error);
        return { ...i, ...patch };
      })
    );
  }, []);

  const restoreAll = useCallback(() => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.zone !== 'considering') return i;
        const patch = { zone: 'active' as const, status: i.status === 'Cut' ? 'Planned' as const : i.status };
        updateItem(i.id, patch).catch(console.error);
        return { ...i, ...patch };
      })
    );
  }, []);

  const handleAdd = useCallback(async (category: BudgetCategory) => {
    // Optimistic placeholder while DB round-trip completes
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const tempItem: BudgetItem = {
      id: tempId, category, lineItem: 'New Item', vendor: '',
      status: 'Planned', estimatedEur: 0, actualEur: null,
      depositPaidEur: 0, dueDate: '', notes: '', zone: 'active',
    };
    setItems((prev) => [...prev, tempItem]);
    try {
      const real = await createItem(category);
      setItems((prev) => prev.map((i) => (i.id === tempId ? real : i)));
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    }
  }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const itemId = String(active.id);
    const overId = String(over.id);

    if (overId === 'considering') {
      const patch = { zone: 'considering' as const };
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));
      updateItem(itemId, patch).catch(console.error);
    } else if (overId === 'cut') {
      const patch = { zone: 'cut' as const, status: 'Cut' as const };
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));
      updateItem(itemId, patch).catch(console.error);
    } else if (overId.startsWith('category-')) {
      const cat = overId.replace('category-', '') as BudgetCategory;
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== itemId) return i;
          const patch = {
            zone: 'active' as const,
            category: cat,
            status: (i.status === 'Cut' ? 'Planned' : i.status) as BudgetItem['status'],
          };
          updateItem(itemId, patch).catch(console.error);
          return { ...i, ...patch };
        })
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleDragOver(_event: DragOverEvent) {}

  return (
    <section className="pt-20 pb-20 min-h-screen" style={{ background: '#FAF7F2' }}>
      <Container size="xl">
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-[#C9BFB2] hover:text-[#3F3A36] transition-colors">
              ← Dashboard
            </Link>
            <div>
              <h1
                className="text-2xl font-semibold text-[#3F3A36] tracking-tight leading-tight"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Wedding Budget
              </h1>
              <p className="text-xs text-[#8a7d6c] mt-0.5">
                Jeslin &amp; Myles · Italy 2027 · {GUEST_COUNT} guests · Drag cards to plan cuts
              </p>
            </div>
          </div>

          {/* Scenario toggle */}
          <div className="flex rounded-full border border-[#EDE6D8] bg-white overflow-hidden shadow-sm">
            {(['Realistic', 'Luxury', 'Reduced'] as Scenario[]).map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  scenario === s ? 'bg-[#3F3A36] text-white' : 'text-[#8a7d6c] hover:bg-[#FAF7F2]'
                }`}
              >
                {s}
                {s === 'Luxury'  && <span className="ml-1 opacity-60">×1.35</span>}
                {s === 'Reduced' && <span className="ml-1 opacity-60">×0.75</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main layout ───────────────────────────────────────────────────── */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <CategorySection
                    key={cat}
                    category={cat}
                    items={activeItems.filter((i) => i.category === cat)}
                    multiplier={multiplier}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onConsider={moveToConsidering}
                    onAdd={handleAdd}
                  />
                ))}
              </div>

              <ConsideringZone
                items={consideringItems}
                multiplier={multiplier}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onRestore={restoreItem}
                onRestoreAll={restoreAll}
                savings={consideringSavings}
              />

              <CutZone
                items={cutItems}
                multiplier={multiplier}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onRestore={restoreItem}
                savings={cutSavings}
              />

              <p className="text-[10px] text-[#C9BFB2] text-center pt-2" style={{ fontFamily: 'Georgia, serif' }}>
                All amounts stored in EUR · Displayed at ×1.09 USD · Changes saved to database
              </p>
            </div>

            <div className="w-72 flex-shrink-0 hidden lg:block">
              <BudgetRail items={items} multiplier={multiplier} scenario={scenario} />
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {draggingItem ? (
              <div className="w-64 pointer-events-none">
                <BudgetCard
                  item={draggingItem}
                  multiplier={multiplier}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  isDragOverlay
                  accentColor={
                    draggingItem.zone === 'considering' ? '#F59E0B'
                    : draggingItem.zone === 'cut' ? '#C9BFB2'
                    : CATEGORY_COLORS[draggingItem.category]
                  }
                  isCut={draggingItem.zone === 'cut'}
                  isConsidering={draggingItem.zone === 'considering'}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-6 lg:hidden">
          <BudgetRail items={items} multiplier={multiplier} scenario={scenario} />
        </div>
      </Container>
    </section>
  );
}
