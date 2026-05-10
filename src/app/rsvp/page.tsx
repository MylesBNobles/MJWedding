'use client';

import { useState } from 'react';
import { Container, SectionHeader, Card, Button, TextField } from '@/components';
import { lookupByPhone, submitRsvp } from './actions';
import type { HouseholdLookupResult, RsvpSubmission } from './actions';

type Step = 'lookup' | 'confirm' | 'form' | 'done';

type RsvpState = {
  [invitationId: string]: {
    guestId: string;
    rsvpStatus: 'accepted' | 'declined' | '';
    dietaryRestrictions: string;
  };
};

type PlusOneState = {
  [guestId: string]: {
    bringing: boolean | null;
    firstName: string;
    lastName: string;
  };
};

export default function RsvpPage() {
  const [step, setStep] = useState<Step>('lookup');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [household, setHousehold] = useState<HouseholdLookupResult | null>(null);
  const [rsvpState, setRsvpState] = useState<RsvpState>({});
  const [plusOneState, setPlusOneState] = useState<PlusOneState>({});

  async function handleLookup() {
    setError('');
    setLoading(true);
    const result = await lookupByPhone(phone);
    setLoading(false);
    if (!result) {
      setError("We couldn't find an invitation with that phone number. Please double-check or contact us.");
      return;
    }
    setHousehold(result);
    // Initialize RSVP state for all invitations
    const initial: RsvpState = {};
    for (const guest of result.guests) {
      for (const inv of guest.invitations) {
        initial[inv.id] = {
          guestId: guest.id,
          rsvpStatus: inv.rsvp_status === 'pending' ? '' : inv.rsvp_status as 'accepted' | 'declined',
          dietaryRestrictions: inv.dietary_restrictions ?? '',
        };
      }
    }
    setRsvpState(initial);

    const initialPlusOne: PlusOneState = {};
    for (const guest of result.guests) {
      if (guest.plus_one_allowed && !guest.plus_one_guest_id) {
        initialPlusOne[guest.id] = { bringing: null, firstName: '', lastName: '' };
      }
    }
    setPlusOneState(initialPlusOne);
    setStep('confirm');
  }

  async function handleSubmit() {
    const incomplete = Object.values(rsvpState).some(s => s.rsvpStatus === '');
    if (incomplete) {
      setError('Please respond for every guest and event before submitting.');
      return;
    }
    setError('');
    setLoading(true);

    const submissions: RsvpSubmission = Object.entries(rsvpState).map(([invitationId, s]) => {
      const po = plusOneState[s.guestId];
      return {
        invitationId,
        guestId: s.guestId,
        rsvpStatus: s.rsvpStatus as 'accepted' | 'declined',
        dietaryRestrictions: s.dietaryRestrictions,
        plusOneFirstName: po?.bringing ? po.firstName : undefined,
        plusOneLastName: po?.bringing ? po.lastName : undefined,
      };
    });

    const result = await submitRsvp(submissions);
    setLoading(false);
    if (!result.success) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setStep('done');
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  function formatTime(timeStr: string | null) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  if (step === 'done') {
    return (
      <section className="py-16 min-h-screen bg-[#FAF7F2]">
        <Container size="sm">
          <div className="text-center py-12">
            <div className="text-5xl mb-6">🎉</div>
            <h1 className="text-3xl font-cursive text-fg mb-4">Thank You!</h1>
            <p className="text-muted text-lg mb-2">Your RSVP has been received.</p>
            <p className="text-muted">We can't wait to celebrate with you in Tuscany.</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 min-h-screen bg-[#FAF7F2]">
      <Container size="sm">
        <SectionHeader
          title="RSVP"
          subtitle="Jeslin & Myles · June 12, 2027 · Tuscany, Italy"
          className="mb-10"
        />

        {/* Step 1: Phone lookup */}
        {step === 'lookup' && (
          <Card>
            <h2 className="text-lg font-semibold text-fg mb-2">Find your invitation</h2>
            <p className="text-muted text-sm mb-6">
              Enter the phone number associated with your invitation.
            </p>
            <TextField
              label="Phone number"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 555-555-0001"
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
            />
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
            <div className="mt-6">
              <Button onClick={handleLookup} disabled={loading || !phone.trim()}>
                {loading ? 'Searching...' : 'Find my invitation'}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Confirm household */}
        {step === 'confirm' && household && (
          <Card>
            <h2 className="text-lg font-semibold text-fg mb-2">Is this your invitation?</h2>
            <p className="text-muted text-sm mb-6">
              We found the following guests on this invitation:
            </p>
            <ul className="space-y-2 mb-8">
              {household.guests.map(g => (
                <li key={g.id} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent inline-block mt-1.5 shrink-0" />
                  <div>
                    <span className="text-fg font-medium">
                      {g.first_name} {g.last_name ?? ''}
                    </span>
                    {g.invitedByName && (
                      <p className="text-xs text-muted">Guest of {g.invitedByName}</p>
                    )}
                    {g.plus_one_allowed && !g.plus_one_guest_id && (
                      <p className="text-xs text-muted italic">+ may bring a guest</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => setStep('form')}>
                Yes, this is my invitation
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setStep('lookup'); setPhone(''); setError(''); }}
              >
                That's not me
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: RSVP form */}
        {step === 'form' && household && (
          <div className="space-y-8">
            {household.guests.map(guest => (
              <Card key={guest.id}>
                <h2 className="text-lg font-semibold text-fg mb-0.5">
                  {guest.first_name} {guest.last_name ?? ''}
                </h2>
                {guest.invitedByName && (
                  <p className="text-xs text-muted mb-1">Guest of {guest.invitedByName}</p>
                )}
                {guest.invitations.length === 0 ? (
                  <p className="text-muted text-sm">No events to RSVP for.</p>
                ) : (
                  <div className="space-y-6 mt-4">
                    {guest.invitations.map(inv => {
                      const state = rsvpState[inv.id];
                      return (
                        <div key={inv.id} className="border-t border-border pt-4">
                          <div className="mb-3">
                            <p className="font-medium text-fg">{inv.event.name}</p>
                            <p className="text-sm text-muted">
                              {formatDate(inv.event.event_date)} · {formatTime(inv.event.start_time)}
                              {inv.event.end_time ? ` – ${formatTime(inv.event.end_time)}` : ''}
                            </p>
                            {inv.event.location_name && (
                              <p className="text-sm text-muted">{inv.event.location_name}</p>
                            )}
                          </div>

                          {/* Accept / Decline */}
                          <div className="flex gap-3 mb-4">
                            <button
                              onClick={() => setRsvpState(prev => ({
                                ...prev,
                                [inv.id]: { ...prev[inv.id], rsvpStatus: 'accepted' },
                              }))}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                state?.rsvpStatus === 'accepted'
                                  ? 'bg-accent text-white border-accent'
                                  : 'border-border text-fg hover:border-accent'
                              }`}
                            >
                              Attending
                            </button>
                            <button
                              onClick={() => setRsvpState(prev => ({
                                ...prev,
                                [inv.id]: { ...prev[inv.id], rsvpStatus: 'declined' },
                              }))}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                state?.rsvpStatus === 'declined'
                                  ? 'bg-fg text-white border-fg'
                                  : 'border-border text-fg hover:border-fg'
                              }`}
                            >
                              Not attending
                            </button>
                          </div>

                          {/* Dietary restrictions — only if attending */}
                          {state?.rsvpStatus === 'accepted' && (
                            <TextField
                              label="Dietary restrictions (optional)"
                              value={state.dietaryRestrictions}
                              onChange={e => setRsvpState(prev => ({
                                ...prev,
                                [inv.id]: { ...prev[inv.id], dietaryRestrictions: e.target.value },
                              }))}
                              placeholder="e.g. vegetarian, nut allergy"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Unnamed plus-one slot — only shown if guest accepted at least one event */}
                {plusOneState[guest.id] &&
                  Object.values(rsvpState).some(s => s.guestId === guest.id && s.rsvpStatus === 'accepted') && (
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="text-sm font-medium text-fg mb-1">Are you bringing a plus-one?</p>
                    <p className="text-xs text-muted mb-3">You're welcome to bring a guest — let us know who's joining you.</p>
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => setPlusOneState(prev => ({ ...prev, [guest.id]: { ...prev[guest.id], bringing: true } }))}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          plusOneState[guest.id].bringing === true
                            ? 'bg-accent text-white border-accent'
                            : 'border-border text-fg hover:border-accent'
                        }`}
                      >
                        Yes, bringing someone
                      </button>
                      <button
                        onClick={() => setPlusOneState(prev => ({ ...prev, [guest.id]: { ...prev[guest.id], bringing: false } }))}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          plusOneState[guest.id].bringing === false
                            ? 'bg-fg text-white border-fg'
                            : 'border-border text-fg hover:border-fg'
                        }`}
                      >
                        No, just me
                      </button>
                    </div>
                    {plusOneState[guest.id].bringing && (
                      <div className="grid grid-cols-2 gap-3">
                        <TextField
                          label="Their first name"
                          value={plusOneState[guest.id].firstName}
                          onChange={e => setPlusOneState(prev => ({ ...prev, [guest.id]: { ...prev[guest.id], firstName: e.target.value } }))}
                          placeholder="First"
                        />
                        <TextField
                          label="Last name (optional)"
                          value={plusOneState[guest.id].lastName}
                          onChange={e => setPlusOneState(prev => ({ ...prev, [guest.id]: { ...prev[guest.id], lastName: e.target.value } }))}
                          placeholder="Last"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3 flex-wrap">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit RSVP'}
              </Button>
              <Button variant="secondary" onClick={() => setStep('confirm')}>
                Back
              </Button>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
