'use client';

import { useState } from 'react';
import { Container, TextField } from '@/components';
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

const RED      = '#C8102E';
const RED_DARK = '#A50D25';
const GOLD     = '#C9A684';
const CREAM    = '#FBF7EE';
const PAPER    = '#EAD9B8'; // aged warm cream
const INK      = '#1C0F08'; // dark brown-black ink

// Perforated edge — cream circles at the ticket boundary create scalloped paper look
function TicketPerforations({ side }: { side: 'left' | 'right' }) {
  const count = 15;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            [side === 'left' ? 'left' : 'right']: -9,
            top: `${(i + 0.5) * (100 / count)}%`,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: PAPER,
            transform: 'translateY(-50%)',
            zIndex: 3,
            boxShadow: side === 'left'
              ? 'inset 2px 0 4px rgba(0,0,0,0.08)'
              : 'inset -2px 0 4px rgba(0,0,0,0.08)',
          }}
        />
      ))}
    </>
  );
}

// Tear line with semicircle notches on both sides
function TicketTear() {
  return (
    <div style={{
      margin: '20px -34px',
      position: 'relative',
      height: 0,
    }}>
      <div style={{
        position: 'absolute',
        left: 12,
        right: 12,
        top: 0,
        borderTop: '1.5px dashed rgba(28,15,8,0.18)',
      }} />
      <div style={{ position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: '50%', background: PAPER, zIndex: 3, boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.08)' }} />
      <div style={{ position: 'absolute', right: -9, top: -9, width: 18, height: 18, borderRadius: '50%', background: PAPER, zIndex: 3, boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.08)' }} />
    </div>
  );
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

export default function RsvpPage() {
  const [step, setStep] = useState<Step>('lookup');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [household, setHousehold] = useState<HouseholdLookupResult | null>(null);
  const [rsvpState, setRsvpState] = useState<RsvpState>({});
  const [plusOneState, setPlusOneState] = useState<PlusOneState>({});
  const [childNameState, setChildNameState] = useState<{ [guestId: string]: { firstName: string; lastName: string } }>({});
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [primaryGuestId, setPrimaryGuestId] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);

  function handlePhoneChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) { setPhone(''); return; }
    if (digits.length <= 3) { setPhone(`(${digits}`); return; }
    if (digits.length <= 6) { setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`); return; }
    setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
  }

  async function handleLookup() {
    setError('');
    setLoading(true);
    const result = await lookupByPhone(phone);
    setLoading(false);
    if (!result) {
      setError("We couldn't find an invitation with that number. Please double-check or contact us.");
      return;
    }
    setHousehold(result);
    setPrimaryGuestId(result.primaryGuestId);
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

    const initialChildNames: { [guestId: string]: { firstName: string; lastName: string } } = {};
    for (const guest of result.guests) {
      if (!guest.is_named && guest.guest_type === 'child') {
        initialChildNames[guest.id] = { firstName: '', lastName: '' };
      }
    }
    setChildNameState(initialChildNames);
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
      const cn = childNameState[s.guestId];
      return {
        invitationId,
        guestId: s.guestId,
        rsvpStatus: s.rsvpStatus as 'accepted' | 'declined',
        dietaryRestrictions: s.dietaryRestrictions,
        plusOneFirstName: po?.bringing ? po.firstName : undefined,
        plusOneLastName: po?.bringing ? po.lastName : undefined,
        childFirstName: cn?.firstName || undefined,
        childLastName: cn?.lastName || undefined,
      };
    });
    const result = await submitRsvp(submissions, smsOptIn, primaryGuestId);
    setLoading(false);
    if (!result.success) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setStep('done');
  }

  // ── Step 1: Movie poster + vintage ticket stub ────────────────────────────────
  if (step === 'lookup') {
    return (
      <>
        <style>{`
          @keyframes ticketFadeUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes posterFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes lightSweep {
            0%   { left: -70%; }
            100% { left: 170%; }
          }
          .ticket-stub {
            animation: ticketFadeUp 1s cubic-bezier(0.22, 0.61, 0.36, 1) 0.3s both;
          }
          .ticket-vintage {
            transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.5s ease;
          }
          .ticket-vintage:hover {
            transform: translateY(-9px) rotate(-0.9deg);
            box-shadow: 0 36px 100px rgba(0,0,0,0.58), 0 8px 24px rgba(0,0,0,0.28) !important;
          }
          .ticket-vintage:hover .ticket-shine {
            animation: lightSweep 0.7s ease forwards;
          }
          .poster-text {
            animation: posterFadeIn 1.2s ease 0.1s both;
          }
          /* Hide footer on this step — fullscreen cinema layout */
          footer { display: none; }
          .phone-input::placeholder { color: rgba(28,15,8,0.22); letter-spacing: 0.04em; font-family: Georgia, serif; }
          @keyframes spotlightIn { from { opacity: 0; } to { opacity: 1; } }
          .phone-spotlight { animation: spotlightIn 0.35s ease forwards; }
          html, body { background: ${RED_DARK} !important; }
          /* ── Responsive split layout ── */
          .rsvp-layout {
            display: flex;
            height: 100svh;
            flex-direction: column;
          }
          .rsvp-poster {
            flex: 0 0 40%;
            position: relative;
            background-image: url(/images/tuscany_pic.png);
            background-size: cover;
            background-position: center;
          }
          .rsvp-ticket-panel {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem clamp(0.75rem, 5vw, 2rem);
            position: relative;
          }
          .rsvp-ticket {
            padding: 14px 20px 14px;
          }
          .rsvp-stars { display: none; }
          .rsvp-corner { display: none; }
          @media (min-width: 640px) {
            .rsvp-layout {
              flex-direction: row;
              height: auto;
              min-height: 100svh;
            }
            .rsvp-poster {
              flex: 0 0 58%;
            }
            .rsvp-ticket-panel {
              flex: 0 0 42%;
              padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem);
            }
            .rsvp-ticket {
              padding: 26px 34px 24px;
            }
            .rsvp-stars { display: block; }
            .rsvp-corner { display: block; }
          }
        `}</style>

        <div className="rsvp-layout">

          {/* LEFT — Tuscany movie poster */}
          <div className="rsvp-poster">
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.32) 100%)`,
            }} />

            <div className="poster-text" style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 'clamp(2rem, 6vw, 5rem)',
            }}>
              {/* Classic movie poster border frame */}
              <div style={{
                position: 'absolute',
                inset: 'clamp(16px, 3vw, 32px)',
                border: `2px solid rgba(255,255,255,0.7)`,
                pointerEvents: 'none',
              }}>
                <div style={{ position: 'absolute', inset: 6, border: `1px solid rgba(255,255,255,0.4)` }} />
              </div>

              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.58rem',
                letterSpacing: '0.55em',
                textTransform: 'uppercase',
                color: '#fff',
                opacity: 0.9,
                marginBottom: '1rem',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}>
                A Jeslin &amp; Myles Production
              </p>

              <p className="rsvp-stars" style={{ color: GOLD, fontSize: '0.72rem', letterSpacing: '0.5em', marginBottom: '0.9rem' }}>
                ★ ★ ★ ★ ★
              </p>

              <h1 style={{
                fontFamily: 'var(--font-cursive)',
                fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
                color: '#FFFFFF',
                lineHeight: 1.05,
                margin: '0 0 1.2rem',
                textShadow: '0 2px 12px rgba(0,0,0,0.25), 0 0 40px rgba(255,255,255,0.1)',
              }}>
                You, Me &amp; Tuscany?
              </h1>

              <div style={{ width: 60, height: 1.5, background: GOLD, margin: '0 auto 1.2rem' }} />

              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(0.58rem, 1.1vw, 0.68rem)',
                letterSpacing: '0.36em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.88)',
                marginBottom: '0.5rem',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}>
                Villa Di Geggiano · Tuscany, Italy
              </p>
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(0.58rem, 1.1vw, 0.68rem)',
                letterSpacing: '0.36em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}>
                June 12, 2027
              </p>
            </div>
          </div>

          {/* RIGHT — Red carpet velvet panel */}
          <div className="rsvp-ticket-panel" style={{
            background: `linear-gradient(160deg, ${RED_DARK} 0%, ${RED} 100%)`,
            position: 'relative',
          }}>
            {/* Velvet sheen overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />

            {/* Corner ornaments */}
            <svg className="rsvp-corner" style={{ position: 'absolute', top: 24, left: 24, opacity: 0.3 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M2 38 L2 2 L38 2" stroke={GOLD} strokeWidth="1.5" fill="none" />
              <circle cx="2" cy="2" r="2.5" fill={GOLD} />
            </svg>
            <svg className="rsvp-corner" style={{ position: 'absolute', top: 24, right: 24, opacity: 0.3 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M38 38 L38 2 L2 2" stroke={GOLD} strokeWidth="1.5" fill="none" />
              <circle cx="38" cy="2" r="2.5" fill={GOLD} />
            </svg>
            <svg className="rsvp-corner" style={{ position: 'absolute', bottom: 24, left: 24, opacity: 0.3 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M2 2 L2 38 L38 38" stroke={GOLD} strokeWidth="1.5" fill="none" />
              <circle cx="2" cy="38" r="2.5" fill={GOLD} />
            </svg>
            <svg className="rsvp-corner" style={{ position: 'absolute', bottom: 24, right: 24, opacity: 0.3 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M38 2 L38 38 L2 38" stroke={GOLD} strokeWidth="1.5" fill="none" />
              <circle cx="38" cy="38" r="2.5" fill={GOLD} />
            </svg>

            {/* Vintage cinema ticket */}
            <div
              className="ticket-vintage ticket-stub rsvp-ticket"
              style={{
                background: PAPER,
                width: '100%',
                maxWidth: 350,
                position: 'relative',
                borderRadius: 3,
                boxShadow: '0 22px 70px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.22)',
              }}
            >
              {/* SVG paper grain texture */}
              <svg
                aria-hidden
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  pointerEvents: 'none',
                  opacity: 0.07,
                  borderRadius: 3,
                }}
              >
                <filter id="ticket-grain">
                  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#ticket-grain)" />
              </svg>

              {/* Diagonal light sweep on hover */}
              <div
                className="ticket-shine"
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '-20%',
                  left: '-70%',
                  width: '35%',
                  height: '140%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                  transform: 'skewX(-18deg)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />

              {/* Perforations — both sides */}
              <TicketPerforations side="left" />
              <TicketPerforations side="right" />

              {/* Outer decorative border */}
              <div style={{
                position: 'absolute',
                inset: 8,
                border: `1.5px solid rgba(28,15,8,0.13)`,
                borderRadius: 1,
                pointerEvents: 'none',
                zIndex: 1,
              }}>
                {/* Inner border rule */}
                <div style={{
                  position: 'absolute',
                  inset: 5,
                  border: `0.5px solid rgba(28,15,8,0.08)`,
                  borderRadius: 1,
                }} />
              </div>

              {/* Serial number — top right */}
              <div style={{ textAlign: 'right', marginBottom: 6, position: 'relative', zIndex: 2 }}>
                <span style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.44rem',
                  letterSpacing: '0.14em',
                  color: INK,
                  opacity: 0.3,
                }}>
                  No. 2027 · 001
                </span>
              </div>

              {/* Top section — event info */}
              <div style={{ textAlign: 'center', marginBottom: 0, position: 'relative', zIndex: 2 }}>
                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.58rem',
                  letterSpacing: '0.5em',
                  textTransform: 'uppercase',
                  color: RED,
                  marginBottom: 10,
                  opacity: 0.8,
                }}>
                  ★ &nbsp; Admit One &nbsp; ★
                </p>

                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.47rem',
                  letterSpacing: '0.36em',
                  textTransform: 'uppercase',
                  color: INK,
                  opacity: 0.45,
                  marginBottom: 10,
                }}>
                  Jeslin &amp; Myles Present
                </p>

                {/* Top rule */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                  <div style={{ flex: 1, height: '0.5px', background: `rgba(28,15,8,0.13)` }} />
                  <span style={{ color: GOLD, fontSize: '0.55rem', opacity: 0.7 }}>✦</span>
                  <div style={{ flex: 1, height: '0.5px', background: `rgba(28,15,8,0.13)` }} />
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-cursive)',
                  fontSize: 'clamp(1.85rem, 4vw, 2.5rem)',
                  color: INK,
                  lineHeight: 1.1,
                  margin: '0 0 10px',
                  opacity: 0.87,
                }}>
                  You, Me &amp; Tuscany
                </h2>

                {/* Bottom rule */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                  <div style={{ flex: 1, height: '0.5px', background: `rgba(28,15,8,0.13)` }} />
                  <span style={{ color: GOLD, fontSize: '0.55rem', opacity: 0.7 }}>✦</span>
                  <div style={{ flex: 1, height: '0.5px', background: `rgba(28,15,8,0.13)` }} />
                </div>

                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.49rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: INK,
                  opacity: 0.52,
                  lineHeight: 1.9,
                }}>
                  Villa Di Geggiano<br />
                  Tuscany, Italy &nbsp;·&nbsp; June 12, 2027
                </p>
              </div>

              <TicketTear />

              {/* Bottom section — phone lookup */}
              <div style={{ position: 'relative', zIndex: 2, paddingTop: 20 }}>

                {/* Spotlight glow on focus */}
                {phoneFocused && (
                  <div
                    className="phone-spotlight"
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: '-12px -20px',
                      background: 'radial-gradient(ellipse at 50% 40%, rgba(200,16,46,0.09) 0%, transparent 72%)',
                      borderRadius: 6,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  color: INK,
                  opacity: 0.78,
                  marginBottom: 12,
                  fontWeight: 600,
                }}>
                  Enter your phone number to RSVP
                </p>
                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.62rem',
                  letterSpacing: '0.05em',
                  color: INK,
                  opacity: 0.42,
                  marginBottom: 14,
                  marginTop: -6,
                }}>
                  International? Ignore the country code — enter the last 10 digits only.
                </p>

                <div style={{ marginBottom: 14, position: 'relative' }}>
                  <input
                    className="phone-input"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                    placeholder="(   )    -    "
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1.5px solid ${phoneFocused ? RED : 'rgba(28,15,8,0.2)'}`,
                      borderRadius: 0,
                      padding: '8px 0',
                      fontFamily: 'Georgia, serif',
                      fontSize: '1.05rem',
                      letterSpacing: '0.06em',
                      color: INK,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                  />
                </div>

                {error && (
                  <p style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.66rem',
                    color: '#9B2335',
                    marginBottom: 10,
                    fontStyle: 'italic',
                  }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleLookup}
                  disabled={loading || !phone.trim()}
                  style={{
                    width: '100%',
                    background: loading || !phone.trim() ? 'rgba(200,16,46,0.28)' : RED,
                    color: PAPER,
                    border: 'none',
                    padding: '10px 0',
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.58rem',
                    letterSpacing: '0.42em',
                    textTransform: 'uppercase',
                    cursor: loading || !phone.trim() ? 'not-allowed' : 'pointer',
                    borderRadius: 1,
                    transition: 'background 0.2s ease',
                  }}
                >
                  {loading ? 'Searching…' : 'Claim Your Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Step 4: Done ──────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{
        minHeight: '100svh',
        background: `linear-gradient(160deg, ${RED_DARK} 0%, ${RED} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          background: PAPER,
          maxWidth: 420,
          width: '100%',
          padding: '48px 44px',
          textAlign: 'center',
          borderRadius: 3,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          position: 'relative',
        }}>
          {/* Grain */}
          <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.07, borderRadius: 3 }}>
            <filter id="done-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#done-grain)" />
          </svg>

          {/* Border frame */}
          <div style={{ position: 'absolute', inset: 10, border: `1.5px solid rgba(28,15,8,0.12)`, borderRadius: 1, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 5, border: `0.5px solid rgba(28,15,8,0.07)`, borderRadius: 1 }} />
          </div>

          <TicketPerforations side="left" />
          <TicketPerforations side="right" />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.58rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: GOLD, marginBottom: 14, opacity: 0.85 }}>
              ★ &nbsp; You&rsquo;re in &nbsp; ★
            </p>
            <h1 style={{ fontFamily: 'var(--font-cursive)', fontSize: '2.8rem', color: INK, margin: '0 0 12px', opacity: 0.88 }}>
              See you in Tuscany
            </h1>
            <div style={{ width: 48, height: '0.5px', background: `rgba(28,15,8,0.18)`, margin: '0 auto 20px' }} />
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: INK, opacity: 0.6, lineHeight: 1.7, marginBottom: 6 }}>
              Your RSVP has been received.
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: INK, opacity: 0.45, fontStyle: 'italic' }}>
              We can&rsquo;t wait to celebrate with you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 2 & 3: Confirm + Form ───────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100svh', background: '#FAF7F2', paddingTop: '6rem', paddingBottom: '4rem' }}>
      <Container size="sm">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.55rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>
            ★ &nbsp; You&rsquo;re Invited &nbsp; ★
          </p>
          <h1 style={{ fontFamily: 'var(--font-cursive)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: RED, margin: '0 0 6px' }}>
            {step === 'confirm' ? 'Is this you?' : 'Your RSVP'}
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8a7d6c' }}>
            Jeslin &amp; Myles · June 12, 2027 · Tuscany
          </p>
        </div>

        {/* Step 2: Confirm household */}
        {step === 'confirm' && household && (
          <div style={{
            background: 'white',
            borderRadius: 4,
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: '1px solid rgba(201,166,132,0.2)',
          }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#5a5048', marginBottom: 24, lineHeight: 1.6 }}>
              We found the following guests on this invitation:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {household.guests.map(g => (
                <li key={g.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#3F3A36', fontWeight: 600 }}>
                      {g.first_name} {g.last_name ?? ''}
                    </span>
                    {g.invitedByName && (
                      <p style={{ fontSize: '0.72rem', color: '#8a7d6c', margin: '2px 0 0', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Guest of {g.invitedByName}</p>
                    )}
                    {g.plus_one_allowed && !g.plus_one_guest_id && (
                      <p style={{ fontSize: '0.72rem', color: '#8a7d6c', margin: '2px 0 0', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>+ may bring a guest</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setStep('form')}
                style={{
                  background: RED, color: CREAM, border: 'none',
                  padding: '12px 28px', fontFamily: 'Georgia, serif',
                  fontSize: '0.62rem', letterSpacing: '0.32em',
                  textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
                }}
              >
                Yes, that&rsquo;s me
              </button>
              <button
                onClick={() => { setStep('lookup'); setPhone(''); setError(''); }}
                style={{
                  background: 'transparent', color: RED,
                  border: `1px solid rgba(200,16,46,0.25)`,
                  padding: '12px 28px', fontFamily: 'Georgia, serif',
                  fontSize: '0.62rem', letterSpacing: '0.32em',
                  textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
                }}
              >
                That&rsquo;s not me
              </button>
            </div>
          </div>
        )}

        {/* Step 3: RSVP form */}
        {step === 'form' && household && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {household.guests.map(guest => (
              <div key={guest.id} style={{
                background: 'white', borderRadius: 4, padding: '28px 32px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                border: '1px solid rgba(201,166,132,0.2)',
              }}>
                <h2 style={{ fontFamily: 'var(--font-cursive)', fontSize: '1.6rem', color: RED, margin: '0 0 4px' }}>
                  {guest.first_name} {guest.last_name ?? ''}
                </h2>
                {guest.invitedByName && (
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: '#8a7d6c', fontStyle: 'italic', margin: '0 0 20px' }}>Guest of {guest.invitedByName}</p>
                )}

                {guest.invitations.length === 0 ? (
                  <p style={{ color: '#8a7d6c', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}>No events to RSVP for.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {guest.invitations.map(inv => {
                      const state = rsvpState[inv.id];
                      return (
                        <div key={inv.id} style={{ borderTop: '1px solid rgba(201,166,132,0.2)', paddingTop: 20 }}>
                          <p style={{ fontFamily: 'Georgia, serif', fontWeight: 600, color: '#3F3A36', fontSize: '0.95rem', margin: '0 0 4px' }}>{inv.event.name}</p>
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: '#8a7d6c', margin: '0 0 16px', fontStyle: 'italic' }}>
                            {formatDate(inv.event.event_date)}
                            {inv.event.start_time ? ` · ${formatTime(inv.event.start_time)}` : ''}
                            {inv.event.location_name ? ` · ${inv.event.location_name}` : ''}
                          </p>

                          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                            {(['accepted', 'declined'] as const).map(status => (
                              <button
                                key={status}
                                onClick={() => setRsvpState(prev => ({ ...prev, [inv.id]: { ...prev[inv.id], rsvpStatus: status } }))}
                                style={{
                                  padding: '9px 20px', borderRadius: 2,
                                  border: `1px solid ${state?.rsvpStatus === status ? (status === 'accepted' ? RED : '#3F3A36') : 'rgba(0,0,0,0.12)'}`,
                                  background: state?.rsvpStatus === status ? (status === 'accepted' ? RED : '#3F3A36') : 'transparent',
                                  color: state?.rsvpStatus === status ? CREAM : '#5a5048',
                                  fontFamily: 'Georgia, serif', fontSize: '0.68rem',
                                  letterSpacing: '0.22em', textTransform: 'uppercase',
                                  cursor: 'pointer', transition: 'all 0.15s ease',
                                }}
                              >
                                {status === 'accepted' ? 'Attending' : 'Not Attending'}
                              </button>
                            ))}
                          </div>

                          {state?.rsvpStatus === 'accepted' && (
                            <TextField
                              label="Dietary restrictions (optional)"
                              value={state.dietaryRestrictions}
                              onChange={e => setRsvpState(prev => ({ ...prev, [inv.id]: { ...prev[inv.id], dietaryRestrictions: e.target.value } }))}
                              placeholder="e.g. vegetarian, nut allergy"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Unnamed child — name entry */}
                {childNameState[guest.id] !== undefined && (
                  <div style={{ marginTop: 20, borderTop: '1px solid rgba(201,166,132,0.2)', paddingTop: 20 }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontWeight: 600, color: '#3F3A36', fontSize: '0.9rem', margin: '0 0 4px' }}>What&rsquo;s this child&rsquo;s name?</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: '#8a7d6c', fontStyle: 'italic', margin: '0 0 14px' }}>Optional — you can leave this blank.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <TextField
                        label="First name"
                        value={childNameState[guest.id].firstName}
                        onChange={e => setChildNameState(prev => ({ ...prev, [guest.id]: { ...prev[guest.id], firstName: e.target.value } }))}
                        placeholder="First"
                      />
                      <TextField
                        label="Last name (optional)"
                        value={childNameState[guest.id].lastName}
                        onChange={e => setChildNameState(prev => ({ ...prev, [guest.id]: { ...prev[guest.id], lastName: e.target.value } }))}
                        placeholder="Last"
                      />
                    </div>
                  </div>
                )}

                {/* Plus-one */}
                {plusOneState[guest.id] &&
                  Object.values(rsvpState).some(s => s.guestId === guest.id && s.rsvpStatus === 'accepted') && (
                  <div style={{ marginTop: 24, borderTop: '1px solid rgba(201,166,132,0.2)', paddingTop: 20 }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontWeight: 600, color: '#3F3A36', fontSize: '0.9rem', margin: '0 0 4px' }}>Are you bringing a plus-one?</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: '#8a7d6c', fontStyle: 'italic', margin: '0 0 14px' }}>You&rsquo;re welcome to bring a guest.</p>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      {[true, false].map(val => (
                        <button
                          key={String(val)}
                          onClick={() => setPlusOneState(prev => ({ ...prev, [guest.id]: { ...prev[guest.id], bringing: val } }))}
                          style={{
                            padding: '9px 20px', borderRadius: 2,
                            border: `1px solid ${plusOneState[guest.id].bringing === val ? (val ? RED : '#3F3A36') : 'rgba(0,0,0,0.12)'}`,
                            background: plusOneState[guest.id].bringing === val ? (val ? RED : '#3F3A36') : 'transparent',
                            color: plusOneState[guest.id].bringing === val ? CREAM : '#5a5048',
                            fontFamily: 'Georgia, serif', fontSize: '0.68rem',
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                        >
                          {val ? 'Yes, bringing someone' : 'No, just me'}
                        </button>
                      ))}
                    </div>
                    {plusOneState[guest.id].bringing && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
              </div>
            ))}

            {/* SMS consent checkbox */}
            <div style={{
              background: 'white',
              borderRadius: 4,
              padding: '20px 24px',
              border: `1px solid ${smsOptIn ? 'rgba(200,16,46,0.3)' : 'rgba(201,166,132,0.2)'}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            }}>
              <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer' }}>
                <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={e => setSmsOptIn(e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <div style={{
                    width: 20, height: 20, borderRadius: 3,
                    border: `1.5px solid ${smsOptIn ? RED : 'rgba(0,0,0,0.25)'}`,
                    background: smsOptIn ? RED : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}>
                    {smsOptIn && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.72rem',
                  color: '#5a5048',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  I agree to receive wedding-related text messages from Jeslin &amp; Myles via an automated texting service, including RSVP reminders, wedding updates, travel information, and event logistics. Message frequency may vary. Message and data rates may apply. Reply <strong>STOP</strong> to opt out or <strong>HELP</strong> for help.
                  <br /><br />
                  No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
                </p>
              </label>
            </div>

            {error && (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#9B2335', fontStyle: 'italic' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: loading ? 'rgba(200,16,46,0.4)' : RED, color: CREAM,
                  border: 'none', padding: '13px 32px', fontFamily: 'Georgia, serif',
                  fontSize: '0.62rem', letterSpacing: '0.38em', textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 2,
                }}
              >
                {loading ? 'Submitting…' : 'Submit RSVP'}
              </button>
              <button
                onClick={() => setStep('confirm')}
                style={{
                  background: 'transparent', color: RED,
                  border: `1px solid rgba(200,16,46,0.25)`,
                  padding: '13px 32px', fontFamily: 'Georgia, serif',
                  fontSize: '0.62rem', letterSpacing: '0.38em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2,
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
