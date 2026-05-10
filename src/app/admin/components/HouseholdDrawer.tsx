'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, TextField, Select } from '@/components';
import {
  getHouseholdDetail,
  updateHousehold,
  addGuestToHousehold,
} from '../households/actions';
import type { HouseholdDetail, NewGuestInput } from '../households/actions';

type Props = {
  householdId: string | null;
  onClose: () => void;
  onOpenGuest: (guestId: string) => void;
};

type EditForm = {
  household_name: string;
  side: string;
  relationship_to_couple: string;
  invite_status: string;
};

const SIDE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'jeslin', label: "Jeslin's" },
  { value: 'myles', label: "Myles's" },
];

const INVITE_STATUS_OPTIONS = [
  { value: 'definite', label: 'Definite' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_invited', label: 'Not invited' },
];

const GUEST_TYPE_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'partner', label: 'Partner' },
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'plus_one', label: 'Plus-one' },
];

function emptyMember(): NewGuestInput {
  return { firstName: '', lastName: '', phone: '', email: '', guestType: 'adult' };
}

function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'default' {
  if (status === 'accepted') return 'success';
  if (status === 'declined') return 'danger';
  if (status === 'pending') return 'warning';
  return 'default';
}

export function HouseholdDrawer({ householdId, onClose, onOpenGuest }: Props) {
  const router = useRouter();
  const [data, setData] = useState<HouseholdDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Add member state
  const [addingMember, setAddingMember] = useState(false);
  const [memberForm, setMemberForm] = useState<NewGuestInput>(emptyMember());
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    const d = await getHouseholdDetail(id);
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!householdId) { setData(null); setEditing(false); setAddingMember(false); return; }
    fetchData(householdId);
  }, [householdId, fetchData]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && !editing) onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, editing]);

  function startEditing() {
    if (!data) return;
    setEditForm({
      household_name: data.household_name,
      side: data.side ?? '',
      relationship_to_couple: data.relationship_to_couple ?? '',
      invite_status: data.invite_status,
    });
    setSaveError('');
    setEditing(true);
  }

  async function handleSave() {
    if (!householdId || !editForm) return;
    setSaving(true);
    setSaveError('');
    const result = await updateHousehold(householdId, editForm);
    setSaving(false);
    if (!result.success) { setSaveError(result.error ?? 'Failed to save.'); return; }
    setEditing(false);
    await fetchData(householdId);
    router.refresh();
  }

  async function handleAddMember() {
    if (!householdId) return;
    setAddError('');
    setAddLoading(true);
    const result = await addGuestToHousehold(householdId, memberForm);
    setAddLoading(false);
    if (!result.success) { setAddError(result.error ?? 'Failed to add guest.'); return; }
    setMemberForm(emptyMember());
    setAddingMember(false);
    await fetchData(householdId);
    router.refresh();
  }

  const open = !!householdId;

  return (
    <>
      <div
        onClick={() => !editing && onClose()}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-[#FAF7F2] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          {loading || !data ? (
            <div className="h-8 w-48 bg-border/50 rounded animate-pulse" />
          ) : (
            <div>
              <h2 className="text-2xl font-cursive text-fg">
                {editing ? editForm?.household_name : data.household_name}
              </h2>
              <p className="text-sm text-muted mt-0.5 capitalize">
                {data.side ? `${data.side}'s guest` : 'Household'} · {data.members.length} member{data.members.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {data && !editing && (
              <button
                onClick={startEditing}
                className="px-3 py-1 text-xs font-medium border border-border rounded-md text-muted hover:text-fg hover:border-fg transition-all"
              >
                Edit
              </button>
            )}
            {editing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setSaveError(''); }}
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
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-border/50 rounded animate-pulse" style={{ width: `${70 - i * 10}%` }} />
              ))}
            </div>
          )}

          {!loading && data && (
            <>
              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}

              {/* ── Household details ── */}
              <section>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Details</h3>
                {editing && editForm ? (
                  <div className="space-y-3">
                    <TextField
                      label="Household name"
                      value={editForm.household_name}
                      onChange={e => setEditForm(f => ({ ...f!, household_name: e.target.value }))}
                    />
                    <Select
                      label="Guest of"
                      value={editForm.side}
                      onChange={e => setEditForm(f => ({ ...f!, side: e.target.value }))}
                      options={SIDE_OPTIONS}
                    />
                    <TextField
                      label="Relationship to couple"
                      value={editForm.relationship_to_couple}
                      onChange={e => setEditForm(f => ({ ...f!, relationship_to_couple: e.target.value }))}
                      placeholder="e.g. Jeslin's family, Myles's friend"
                    />
                    <Select
                      label="Invite status"
                      value={editForm.invite_status}
                      onChange={e => setEditForm(f => ({ ...f!, invite_status: e.target.value }))}
                      options={INVITE_STATUS_OPTIONS}
                    />
                  </div>
                ) : (
                  <dl className="space-y-2.5">
                    {[
                      { label: 'Guest of', value: data.side ?? '—', capitalize: true },
                      { label: 'Relationship', value: data.relationship_to_couple ?? '—' },
                      { label: 'Invite status', value: data.invite_status, capitalize: true },
                    ].map(({ label, value, capitalize }) => (
                      <div key={label} className="flex gap-2">
                        <dt className="text-xs text-muted w-32 shrink-0 pt-0.5">{label}</dt>
                        <dd className={`text-sm text-fg ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>

              {/* ── Members ── */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Members</h3>
                  {!addingMember && (
                    <button
                      onClick={() => { setMemberForm(emptyMember()); setAddError(''); setAddingMember(true); }}
                      className="text-xs text-accent hover:underline"
                    >
                      + Add member
                    </button>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {data.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <div>
                        <button
                          onClick={() => onOpenGuest(member.id)}
                          className="text-sm font-medium text-fg hover:text-accent hover:underline transition-colors text-left"
                        >
                          {member.first_name} {member.last_name ?? ''}
                          {data.primary_guest_id === member.id && (
                            <span className="ml-1.5 text-xs text-muted font-normal">(primary)</span>
                          )}
                        </button>
                        <p className="text-xs text-muted capitalize">{member.guest_type}</p>
                      </div>
                      <Badge variant={statusVariant(member.overall_rsvp_status)}>
                        {member.overall_rsvp_status}
                      </Badge>
                    </div>
                  ))}

                  {data.members.length === 0 && (
                    <p className="text-sm text-muted py-2">No members yet.</p>
                  )}
                </div>

                {/* Add member form */}
                {addingMember && (
                  <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                    <p className="text-xs font-medium text-muted uppercase tracking-wide">New member</p>
                    <div className="grid grid-cols-2 gap-3">
                      <TextField
                        label="First name"
                        value={memberForm.firstName}
                        onChange={e => setMemberForm(f => ({ ...f, firstName: e.target.value }))}
                        placeholder="First"
                      />
                      <TextField
                        label="Last name"
                        value={memberForm.lastName}
                        onChange={e => setMemberForm(f => ({ ...f, lastName: e.target.value }))}
                        placeholder="Last"
                      />
                    </div>
                    <Select
                      label="Guest type"
                      value={memberForm.guestType}
                      onChange={e => setMemberForm(f => ({ ...f, guestType: e.target.value as NewGuestInput['guestType'] }))}
                      options={GUEST_TYPE_OPTIONS}
                    />
                    <TextField
                      label="Phone (optional)"
                      type="tel"
                      value={memberForm.phone}
                      onChange={e => setMemberForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. 4045550001"
                    />
                    <TextField
                      label="Email (optional)"
                      type="email"
                      value={memberForm.email}
                      onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="e.g. john@example.com"
                    />
                    {addError && <p className="text-red-600 text-xs">{addError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleAddMember}
                        disabled={addLoading || !memberForm.firstName.trim()}
                        className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 transition-all"
                      >
                        {addLoading ? 'Adding…' : 'Add member'}
                      </button>
                      <button
                        onClick={() => setAddingMember(false)}
                        className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-fg transition-all"
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
