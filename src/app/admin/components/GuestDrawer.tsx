'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, TextField, Select } from '@/components';
import { TagEditor } from './TagEditor';
import {
  getGuestDetail,
  updateGuest,
  updateInvitationRsvp,
  deleteGuest,
  getAllHouseholds,
  moveGuestToHousehold,
  setPlusOneAllowed,
  addNamedPlusOne,
  removePlusOne,
  updatePlusOneName,
} from '../guests/[id]/actions';
import type { GuestDetail } from '../guests/[id]/actions';

type Props = {
  guestId: string | null;
  onClose: () => void;
  onOpenHousehold?: (householdId: string) => void;
};

type EditForm = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  guest_type: string;
  dietary_restrictions: string;
  notes: string;
  invite_status: string;
};

const GUEST_TYPE_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'partner', label: 'Partner' },
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'plus_one', label: 'Plus-one' },
];

const INVITE_STATUS_OPTIONS = [
  { value: 'definite', label: 'Definite' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_invited', label: 'Not invited' },
];

function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'default' {
  if (status === 'accepted') return 'success';
  if (status === 'declined') return 'danger';
  if (status === 'pending') return 'warning';
  return 'default';
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(t: string | null) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="text-xs text-muted w-32 shrink-0 pt-0.5">{label}</dt>
      <dd className={`text-sm text-fg ${capitalize ? 'capitalize' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

export function GuestDrawer({ guestId, onClose, onOpenHousehold }: Props) {
  const router = useRouter();
  const [data, setData] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Household move state
  const [movingHousehold, setMovingHousehold] = useState(false);
  const [households, setHouseholds] = useState<{ id: string; household_name: string }[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('');
  const [moveLoading, setMoveLoading] = useState(false);

  // Plus-one state
  const [plusOneMode, setPlusOneMode] = useState<'idle' | 'naming' | 'editing'>('idle');
  const [plusOneForm, setPlusOneForm] = useState({ firstName: '', lastName: '' });
  const [plusOneLoading, setPlusOneLoading] = useState(false);

  // RSVP editing state
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [rsvpSaving, setRsvpSaving] = useState(false);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    const d = await getGuestDetail(id);
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!guestId) { setData(null); setEditing(false); setConfirmDelete(false); return; }
    fetchData(guestId);
  }, [guestId, fetchData]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && !editing) onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, editing]);

  function startEditing() {
    if (!data) return;
    const g = data.guest;
    setEditForm({
      first_name: g.first_name ?? '',
      last_name: g.last_name ?? '',
      phone: g.phone ?? '',
      email: g.email ?? '',
      guest_type: g.guest_type ?? 'adult',
      dietary_restrictions: g.dietary_restrictions ?? '',
      notes: g.notes ?? '',
      invite_status: g.invite_status ?? 'maybe',
    });
    setSaveError('');
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditForm(null);
    setSaveError('');
  }

  async function handleSave() {
    if (!guestId || !editForm) return;
    setSaving(true);
    setSaveError('');
    const result = await updateGuest(guestId, editForm);
    setSaving(false);
    if (!result.success) { setSaveError(result.error ?? 'Failed to save.'); return; }
    setEditing(false);
    setEditForm(null);
    await fetchData(guestId);
    router.refresh();
  }

  async function handleRsvpChange(invitationId: string, status: 'pending' | 'accepted' | 'declined') {
    if (!guestId) return;
    setRsvpSaving(true);
    await updateInvitationRsvp(invitationId, guestId, status);
    setEditingInvId(null);
    await fetchData(guestId);
    router.refresh();
    setRsvpSaving(false);
  }

  async function handleDelete() {
    if (!guestId) return;
    setDeleting(true);
    const result = await deleteGuest(guestId);
    setDeleting(false);
    if (!result.success) return;
    router.refresh();
    onClose();
  }

  async function handleMove() {
    if (!guestId || !selectedHouseholdId) return;
    setMoveLoading(true);
    const result = await moveGuestToHousehold(guestId, selectedHouseholdId);
    setMoveLoading(false);
    if (!result.success) return;
    setMovingHousehold(false);
    await fetchData(guestId);
    router.refresh();
  }

  async function openMoveHousehold() {
    const list = await getAllHouseholds();
    setHouseholds(list);
    setSelectedHouseholdId(data?.guest.household_id ?? '');
    setMovingHousehold(true);
  }

  async function handleTogglePlusOneAllowed() {
    if (!guestId || !data) return;
    setPlusOneLoading(true);
    await setPlusOneAllowed(guestId, !data.guest.plus_one_allowed);
    await fetchData(guestId);
    setPlusOneLoading(false);
  }

  async function handleAddPlusOne() {
    if (!guestId || !data || !plusOneForm.firstName.trim()) return;
    setPlusOneLoading(true);
    await addNamedPlusOne(guestId, data.guest.household_id, plusOneForm.firstName, plusOneForm.lastName);
    setPlusOneMode('idle');
    setPlusOneForm({ firstName: '', lastName: '' });
    await fetchData(guestId);
    router.refresh();
    setPlusOneLoading(false);
  }

  async function handleRemovePlusOne() {
    if (!guestId || !data?.guest.plus_one_guest_id) return;
    setPlusOneLoading(true);
    await removePlusOne(guestId, data.guest.plus_one_guest_id);
    await fetchData(guestId);
    router.refresh();
    setPlusOneLoading(false);
  }

  async function handleUpdatePlusOneName() {
    if (!data?.guest.plus_one_guest_id || !plusOneForm.firstName.trim()) return;
    setPlusOneLoading(true);
    await updatePlusOneName(data.guest.plus_one_guest_id, plusOneForm.firstName, plusOneForm.lastName);
    setPlusOneMode('idle');
    setPlusOneForm({ firstName: '', lastName: '' });
    await fetchData(guestId!);
    setPlusOneLoading(false);
  }

  const open = !!guestId;
  const guest = data?.guest;

  return (
    <>
      <div
        onClick={() => !editing && onClose()}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-[#FAF7F2] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          {loading || !guest ? (
            <div className="h-8 w-48 bg-border/50 rounded animate-pulse" />
          ) : (
            <div>
              <h2 className="text-2xl font-cursive text-fg">
                {editing ? (editForm?.first_name || 'Guest') + ' ' + (editForm?.last_name || '') : `${guest.first_name} ${guest.last_name ?? ''}`}
              </h2>
              <p className="text-sm text-muted mt-0.5 capitalize">
                {guest.guest_type} · {guest.household?.household_name}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {guest && !editing && (
              <>
                <Badge variant={statusVariant(guest.overall_rsvp_status)}>{guest.overall_rsvp_status}</Badge>
                <button
                  onClick={startEditing}
                  className="px-3 py-1 text-xs font-medium border border-border rounded-md text-muted hover:text-fg hover:border-fg transition-all"
                >
                  Edit
                </button>
              </>
            )}
            {editing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="px-3 py-1 text-xs font-medium border border-border rounded-md text-muted hover:text-fg transition-all"
                >
                  Cancel
                </button>
              </>
            )}
            <button onClick={onClose} className="text-muted hover:text-fg transition-colors text-xl leading-none ml-1" aria-label="Close">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-border/50 rounded animate-pulse" style={{ width: `${70 - i * 8}%` }} />
              ))}
            </div>
          )}

          {!loading && data && guest && (
            <>
              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}

              {/* ── Contact ── */}
              <section>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Contact</h3>
                {editing && editForm ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <TextField label="First name" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f!, first_name: e.target.value }))} />
                      <TextField label="Last name" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f!, last_name: e.target.value }))} />
                    </div>
                    <TextField label="Phone" type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f!, phone: e.target.value }))} />
                    <TextField label="Email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f!, email: e.target.value }))} />
                    <Select label="Guest type" value={editForm.guest_type} onChange={e => setEditForm(f => ({ ...f!, guest_type: e.target.value }))} options={GUEST_TYPE_OPTIONS} />
                    <Select label="Invite status" value={editForm.invite_status} onChange={e => setEditForm(f => ({ ...f!, invite_status: e.target.value }))} options={INVITE_STATUS_OPTIONS} />
                  </div>
                ) : (
                  <dl className="space-y-2.5">
                    <Row label="Phone" value={guest.phone ?? ''} />
                    <Row label="Email" value={guest.email ?? ''} />
                    <Row label="Guest of" value={guest.household?.side ?? ''} capitalize />
                    <Row label="Relationship" value={guest.household?.relationship_to_couple ?? ''} />
                    <Row label="Guest type" value={guest.guest_type} capitalize />
                    <Row label="Invite status" value={guest.invite_status} capitalize />
                  </dl>
                )}
              </section>

              {/* ── Dietary & Notes ── */}
              <section>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Dietary & Notes</h3>
                {editing && editForm ? (
                  <div className="space-y-3">
                    <TextField label="Dietary restrictions" value={editForm.dietary_restrictions} onChange={e => setEditForm(f => ({ ...f!, dietary_restrictions: e.target.value }))} placeholder="e.g. vegetarian, nut allergy" />
                    <TextField label="Internal notes" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f!, notes: e.target.value }))} placeholder="Private notes visible only to admins" />
                  </div>
                ) : (
                  <dl className="space-y-2.5">
                    <Row label="Dietary" value={guest.dietary_restrictions ?? ''} />
                    <Row label="Notes" value={guest.notes ?? ''} />
                  </dl>
                )}
              </section>

              {/* ── Household ── */}
              <section>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Household</h3>
                {!movingHousehold && onOpenHousehold && guest.household_id && (
                  <div className="mb-2">
                    <button
                      onClick={() => onOpenHousehold(guest.household_id)}
                      className="text-xs text-accent hover:underline"
                    >
                      View household →
                    </button>
                  </div>
                )}
                {movingHousehold ? (
                  <div className="space-y-3">
                    <Select
                      label="Move to household"
                      value={selectedHouseholdId}
                      onChange={e => setSelectedHouseholdId(e.target.value)}
                      options={households.map(h => ({ value: h.id, label: h.household_name }))}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleMove}
                        disabled={moveLoading || selectedHouseholdId === guest.household_id}
                        className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 transition-all"
                      >
                        {moveLoading ? 'Moving…' : 'Confirm move'}
                      </button>
                      <button
                        onClick={() => setMovingHousehold(false)}
                        className="px-3 py-1.5 text-xs font-medium border border-border rounded-md text-muted hover:text-fg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-fg">{guest.household?.household_name ?? '—'}</span>
                    <button
                      onClick={openMoveHousehold}
                      className="text-xs text-accent hover:underline"
                    >
                      Move household
                    </button>
                  </div>
                )}
              </section>

              {/* ── Tags ── */}
              <section>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Tags</h3>
                <TagEditor guestId={guest.id} initialTags={guest.tags ?? []} />
              </section>

              {/* ── Plus-one ── */}
              <section>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Plus-one</h3>

                {!guest.plus_one_allowed ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Not allowed</span>
                    <button
                      onClick={handleTogglePlusOneAllowed}
                      disabled={plusOneLoading}
                      className="text-xs text-accent hover:underline disabled:opacity-50"
                    >
                      Allow plus-one
                    </button>
                  </div>
                ) : guest.plus_one_guest_id ? (
                  // Named plus-one exists
                  <div>
                    {plusOneMode === 'editing' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <TextField label="First name" value={plusOneForm.firstName} onChange={e => setPlusOneForm(f => ({ ...f, firstName: e.target.value }))} />
                          <TextField label="Last name" value={plusOneForm.lastName} onChange={e => setPlusOneForm(f => ({ ...f, lastName: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdatePlusOneName}
                            disabled={plusOneLoading || !plusOneForm.firstName.trim()}
                            className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50"
                          >
                            {plusOneLoading ? 'Saving…' : 'Save name'}
                          </button>
                          <button onClick={() => setPlusOneMode('idle')} className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-fg">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-fg font-medium">
                            {data.householdGuests.find(g => g.id === guest.plus_one_guest_id)?.first_name ?? ''}{' '}
                            {data.householdGuests.find(g => g.id === guest.plus_one_guest_id)?.last_name ?? ''}
                          </p>
                          <p className="text-xs text-muted">Named plus-one</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const po = data.householdGuests.find(g => g.id === guest.plus_one_guest_id);
                              setPlusOneForm({ firstName: po?.first_name ?? '', lastName: po?.last_name ?? '' });
                              setPlusOneMode('editing');
                            }}
                            className="text-xs text-accent hover:underline"
                          >
                            Edit name
                          </button>
                          <button
                            onClick={handleRemovePlusOne}
                            disabled={plusOneLoading}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Allowed but unnamed
                  <div>
                    {plusOneMode === 'naming' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-muted">Optionally pre-name the plus-one — or leave it for the guest to fill in when they RSVP.</p>
                        <div className="grid grid-cols-2 gap-3">
                          <TextField label="First name" value={plusOneForm.firstName} onChange={e => setPlusOneForm(f => ({ ...f, firstName: e.target.value }))} />
                          <TextField label="Last name" value={plusOneForm.lastName} onChange={e => setPlusOneForm(f => ({ ...f, lastName: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddPlusOne}
                            disabled={plusOneLoading || !plusOneForm.firstName.trim()}
                            className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50"
                          >
                            {plusOneLoading ? 'Saving…' : 'Save plus-one'}
                          </button>
                          <button onClick={() => setPlusOneMode('idle')} className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-fg">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Slot open — not yet named</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setPlusOneForm({ firstName: '', lastName: '' }); setPlusOneMode('naming'); }}
                            className="text-xs text-accent hover:underline"
                          >
                            Name them
                          </button>
                          <button
                            onClick={handleTogglePlusOneAllowed}
                            disabled={plusOneLoading}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            Remove allowance
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* ── Event RSVPs ── */}
              <section>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Event RSVPs</h3>
                {data.invitations.length === 0 ? (
                  <p className="text-sm text-muted">Not invited to any events.</p>
                ) : (
                  <div className="space-y-1">
                    {data.invitations
                      .sort((a, b) => (a.event.event_date ?? '').localeCompare(b.event.event_date ?? ''))
                      .map(inv => (
                        <div key={inv.id} className="py-3 border-b border-border last:border-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-fg">{inv.event.name}</p>
                              <p className="text-xs text-muted">
                                {formatDate(inv.event.event_date)}
                                {inv.event.start_time && ` · ${formatTime(inv.event.start_time)}`}
                              </p>
                              {inv.dietary_restrictions && (
                                <p className="text-xs text-muted mt-0.5">Dietary: {inv.dietary_restrictions}</p>
                              )}
                            </div>
                            {editingInvId === inv.id ? (
                              <div className="flex gap-1 shrink-0">
                                {(['accepted', 'pending', 'declined'] as const).map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleRsvpChange(inv.id, s)}
                                    disabled={rsvpSaving}
                                    className={`px-2 py-1 rounded text-xs font-medium border transition-all disabled:opacity-50 ${
                                      inv.rsvp_status === s
                                        ? 'bg-fg text-white border-fg'
                                        : 'border-border text-muted hover:border-fg hover:text-fg'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setEditingInvId(null)}
                                  className="px-2 py-1 text-xs text-muted hover:text-fg"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setEditingInvId(inv.id)} className="shrink-0">
                                <Badge variant={statusVariant(inv.rsvp_status)} className="hover:opacity-75 transition-opacity cursor-pointer">
                                  {inv.rsvp_status}
                                </Badge>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </section>

              {/* ── Others in household ── */}
              {data.householdGuests.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Others in this household</h3>
                  <div className="space-y-2">
                    {data.householdGuests.map(g => (
                      <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm font-medium text-fg">{g.first_name} {g.last_name ?? ''}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted capitalize">{g.guest_type}</span>
                          <Badge variant={statusVariant(g.overall_rsvp_status)}>{g.overall_rsvp_status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Delete ── */}
              <section className="pt-2 pb-4">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete guest…
                  </button>
                ) : (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Delete {guest.first_name} {guest.last_name ?? ''}?</p>
                    <p className="text-xs text-red-600 mb-4">This will permanently delete the guest and all their event RSVPs. This cannot be undone.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-all"
                      >
                        {deleting ? 'Deleting…' : 'Yes, delete'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 text-xs border border-red-200 rounded-md text-red-600 hover:bg-red-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
