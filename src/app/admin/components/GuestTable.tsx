'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Card, TextField } from '@/components';
import { WEDDING_TAGS } from '@/lib/tags';
import { GuestDrawer } from './GuestDrawer';
import { HouseholdDrawer } from './HouseholdDrawer';
import type { Guest, Event, GuestEventInvitation } from '@/lib/database.types';

type GuestRow = Guest & {
  household: { household_name: string; side: string | null } | null;
  invitations: (GuestEventInvitation & { event: Event })[];
};

type Props = {
  guests: GuestRow[];
  events: Event[];
};

type SideFilter = 'all' | 'jeslin' | 'myles';
type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined';

function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'default' {
  if (status === 'accepted') return 'success';
  if (status === 'declined') return 'danger';
  if (status === 'pending') return 'warning';
  return 'default';
}

const SIDE_OPTIONS: { value: SideFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'jeslin', label: "Jeslin's" },
  { value: 'myles', label: "Myles's" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
];

function TagDropdown({ selectedTags, onChange }: { selectedTags: string[]; onChange: (tags: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggle(tag: string) {
    onChange(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag]);
  }

  const label = selectedTags.length === 0 ? 'All tags' : selectedTags.length === 1 ? selectedTags[0] : `${selectedTags.length} tags`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
          selectedTags.length > 0
            ? 'bg-accent text-white border-accent'
            : 'border-border text-muted hover:border-accent hover:text-fg'
        }`}
      >
        {label}
        <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
          {WEDDING_TAGS.map(tag => (
            <label key={tag} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF7F2] cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => toggle(tag)}
                className="accent-accent w-3.5 h-3.5"
              />
              <span className="text-sm text-fg capitalize">{tag}</span>
            </label>
          ))}
          {selectedTags.length > 0 && (
            <>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => { onChange([]); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-muted hover:text-fg hover:bg-[#FAF7F2]"
              >
                Clear tags
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function GuestTable({ guests, events }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [side, setSide] = useState<SideFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openGuestId, setOpenGuestId] = useState<string | null>(null);
  const [openHouseholdId, setOpenHouseholdId] = useState<string | null>(null);

  function openGuest(id: string) { setOpenGuestId(id); setOpenHouseholdId(null); }
  function openHousehold(id: string) { setOpenHouseholdId(id); setOpenGuestId(null); }

  const filtered = useMemo(() => {
    return guests.filter(g => {
      const fullName = `${g.first_name} ${g.last_name ?? ''}`.toLowerCase();
      if (search && !fullName.includes(search.toLowerCase())) return false;
      if (side !== 'all' && g.household?.side !== side) return false;
      if (status !== 'all' && g.overall_rsvp_status !== status) return false;
      if (selectedTags.length > 0 && !selectedTags.some(t => (g.tags ?? []).includes(t))) return false;
      return true;
    });
  }, [guests, search, side, status, selectedTags]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(g => selectedIds.has(g.id));

  function toggleGuest(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(g => next.delete(g.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(g => next.add(g.id));
        return next;
      });
    }
  }

  function handleSendMessage() {
    const ids = Array.from(selectedIds).join(',');
    router.push(`/admin/messages?guests=${ids}`);
  }

  return (
    <div className="relative">
      {/* Search + filters */}
      <Card className="mb-4">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-semibold text-fg leading-none">{filtered.length}</span>
          <span className="text-sm text-muted">of {guests.length} guests</span>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-64">
            <TextField
              label="Search guests"
              placeholder="Type a name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Guest of</span>
            <div className="flex gap-2 flex-wrap">
              {SIDE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSide(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    side === opt.value
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-muted hover:border-accent hover:text-fg'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">RSVP Status</span>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    status === opt.value
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-muted hover:border-accent hover:text-fg'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Tags</span>
            <TagDropdown selectedTags={selectedTags} onChange={setSelectedTags} />
          </div>

          <div className="ml-auto self-end flex items-center gap-3 pb-0.5">
            {filtered.length > 0 && (
              <button
                onClick={() => {
                  const ids = filtered.map(g => g.id).join(',');
                  router.push(`/admin/messages?guests=${ids}`);
                }}
                className="text-sm font-medium text-accent hover:underline whitespace-nowrap"
              >
                Message {filtered.length !== guests.length ? `these ${filtered.length}` : `all ${filtered.length}`} →
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse bg-card">
          <thead>
            <tr className="border-b border-border bg-[#FAF7F2]">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  className="accent-accent w-3.5 h-3.5"
                  aria-label="Select all"
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted">Household</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted">Guest of</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted">Overall</th>
              {events.map(e => (
                <th key={e.id} className="text-left py-3 px-4 text-sm font-medium text-muted whitespace-nowrap">
                  {e.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(guest => (
              <tr
                key={guest.id}
                className={`border-b border-border last:border-0 transition-colors ${
                  selectedIds.has(guest.id) ? 'bg-accent/5' : 'hover:bg-[#FAF7F2]/50'
                }`}
              >
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(guest.id)}
                    onChange={() => toggleGuest(guest.id)}
                    className="accent-accent w-3.5 h-3.5"
                  />
                </td>
                <td className="py-3 px-4 text-sm font-medium text-fg whitespace-nowrap">
                  <button
                    onClick={() => openGuest(guest.id)}
                    className="hover:text-accent hover:underline transition-colors text-left"
                  >
                    {guest.first_name} {guest.last_name ?? ''}
                  </button>
                  {(guest.tags ?? []).length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {guest.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-muted">
                  {guest.household && guest.household_id ? (
                    <button
                      onClick={() => openHousehold(guest.household_id)}
                      className="hover:text-accent hover:underline transition-colors text-left"
                    >
                      {guest.household.household_name}
                    </button>
                  ) : '—'}
                </td>
                <td className="py-3 px-4 text-sm text-muted capitalize">
                  {guest.household?.side ?? '—'}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={statusVariant(guest.overall_rsvp_status)}>
                    {guest.overall_rsvp_status}
                  </Badge>
                </td>
                {events.map(event => {
                  const inv = guest.invitations.find(i => i.event_id === event.id);
                  return (
                    <td key={event.id} className="py-3 px-4">
                      {inv ? (
                        <Badge variant={statusVariant(inv.rsvp_status)}>
                          {inv.rsvp_status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-10 mt-4">
          <p className="text-muted">No guests match your filters.</p>
        </Card>
      )}

      <GuestDrawer
        guestId={openGuestId}
        onClose={() => setOpenGuestId(null)}
        onOpenHousehold={openHousehold}
      />
      <HouseholdDrawer
        householdId={openHouseholdId}
        onClose={() => setOpenHouseholdId(null)}
        onOpenGuest={openGuest}
      />

      {/* Floating action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-fg text-white px-5 py-3 rounded-full shadow-xl">
          <span className="text-sm font-medium">
            {selectedIds.size} guest{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="w-px h-4 bg-white/30" />
          <button
            onClick={handleSendMessage}
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Send message →
          </button>
          <div className="w-px h-4 bg-white/30" />
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
