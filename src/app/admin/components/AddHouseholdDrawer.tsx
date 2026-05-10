'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Select } from '@/components';
import { createHousehold } from '../households/actions';
import type { NewGuestInput } from '../households/actions';

type Props = {
  open: boolean;
  onClose: () => void;
};

const GUEST_TYPE_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'partner', label: 'Partner' },
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'plus_one', label: 'Plus-one' },
];

const SIDE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'jeslin', label: "Jeslin's" },
  { value: 'myles', label: "Myles's" },
];

function emptyGuest(guestType: NewGuestInput['guestType'] = 'adult'): NewGuestInput {
  return { firstName: '', lastName: '', phone: '', email: '', guestType };
}

export function AddHouseholdDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [householdName, setHouseholdName] = useState('');
  const [side, setSide] = useState<'jeslin' | 'myles' | ''>('');
  const [relationship, setRelationship] = useState('');
  const [guests, setGuests] = useState<NewGuestInput[]>([emptyGuest('primary')]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setHouseholdName('');
      setSide('');
      setRelationship('');
      setGuests([emptyGuest('primary')]);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function updateGuest(index: number, field: keyof NewGuestInput, value: string) {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  }

  function addGuest() {
    setGuests(prev => [...prev, emptyGuest('adult')]);
  }

  function removeGuest(index: number) {
    setGuests(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    const result = await createHousehold({ householdName, side, relationship, guests });
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-[#FAF7F2] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          <h2 className="text-xl font-semibold text-fg">New Household</h2>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors text-xl leading-none" aria-label="Close">×</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-8">

          {/* Household info */}
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">Household</h3>
            <div className="space-y-4">
              <TextField
                label="Household name"
                placeholder="e.g. The Johnson Family"
                value={householdName}
                onChange={e => setHouseholdName(e.target.value)}
              />
              <Select
                label="Guest of"
                value={side}
                onChange={e => setSide(e.target.value as typeof side)}
                options={SIDE_OPTIONS}
              />
              <TextField
                label="Relationship to couple (optional)"
                placeholder="e.g. Jeslin's family, Myles's friend"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
              />
            </div>
          </section>

          {/* Guests */}
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
              Guests <span className="text-muted/60 normal-case font-normal">— first guest becomes primary contact</span>
            </h3>
            <div className="space-y-5">
              {guests.map((guest, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3 relative">
                  {i > 0 && (
                    <button
                      onClick={() => removeGuest(i)}
                      className="absolute top-3 right-3 text-muted hover:text-red-500 transition-colors text-lg leading-none"
                      aria-label="Remove guest"
                    >
                      ×
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="First name"
                      value={guest.firstName}
                      onChange={e => updateGuest(i, 'firstName', e.target.value)}
                      placeholder="First"
                    />
                    <TextField
                      label="Last name"
                      value={guest.lastName}
                      onChange={e => updateGuest(i, 'lastName', e.target.value)}
                      placeholder="Last"
                    />
                  </div>
                  <Select
                    label="Guest type"
                    value={guest.guestType}
                    onChange={e => updateGuest(i, 'guestType', e.target.value)}
                    options={GUEST_TYPE_OPTIONS}
                  />
                  <TextField
                    label="Phone (optional)"
                    type="tel"
                    value={guest.phone}
                    onChange={e => updateGuest(i, 'phone', e.target.value)}
                    placeholder="e.g. 4045550001"
                  />
                  <TextField
                    label="Email (optional)"
                    type="email"
                    value={guest.email}
                    onChange={e => updateGuest(i, 'email', e.target.value)}
                    placeholder="e.g. john@example.com"
                  />
                </div>
              ))}

              <button
                onClick={addGuest}
                className="w-full py-2.5 border border-dashed border-border rounded-lg text-sm text-muted hover:border-accent hover:text-accent transition-all"
              >
                + Add another guest
              </button>
            </div>
          </section>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create household'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
