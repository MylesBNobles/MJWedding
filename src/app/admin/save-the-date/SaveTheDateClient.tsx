'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { toggleSaveTheDateSent } from './actions';
import type { SaveTheDateHousehold } from './actions';
import { Fireworks } from '@/components/Fireworks';

type Props = {
  households: SaveTheDateHousehold[];
};

const GOLD = '#c9a96e';
const GOLD_GLOW = 'rgba(201,169,110,0.35)';
const GREEN = '#10b981';
const GREEN_GLOW = 'rgba(16,185,129,0.35)';
const TEXT = '#2d2926';
const TEXT_MID = 'rgba(0,0,0,0.45)';
const TEXT_MUTED = 'rgba(0,0,0,0.28)';

const MESSAGE = `Myles & Jeslin have something special to share.

Open your Save the Date below ✨

https://jeslinandmyles.com/save-the-date`;

function isInternational(phone: string): boolean {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return false;
  if (d.length === 11 && d[0] === '1') return false;
  return d.length > 0;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') {
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return raw.startsWith('+') ? raw : `+${d}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy number"
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
      style={copied
        ? { background: 'rgba(16,185,129,0.15)', color: GREEN }
        : { background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.35)' }
      }
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}

function MsgCopyButton({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (size === 'lg') {
    return (
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
        style={copied
          ? { background: 'rgba(16,185,129,0.12)', color: GREEN, border: `1px solid rgba(16,185,129,0.25)` }
          : { background: 'rgba(201,169,110,0.1)', color: GOLD, border: `1px solid rgba(201,169,110,0.25)` }
        }
      >
        {copied ? (
          <>
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <path d="M1 5.5L5 9.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 4V2.5A1.5 1.5 0 015.5 1h6A1.5 1.5 0 0113 2.5v6A1.5 1.5 0 0111.5 10H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Copy message
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 shrink-0 active:scale-95"
      style={copied
        ? { background: 'rgba(16,185,129,0.12)', color: GREEN }
        : { background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.4)' }
      }
      title="Copy message"
    >
      {copied ? '✓ Copied' : '⎘ msg'}
    </button>
  );
}

function getEmoji(pct: number) {
  if (pct === 0) return '✉️';
  if (pct < 25) return '📬';
  if (pct < 50) return '📮';
  if (pct < 75) return '💌';
  if (pct < 100) return '🎊';
  return '🎉';
}

function getMessage(pct: number, remaining: number) {
  if (pct === 0) return "Ready when you are — let's get the word out!";
  if (pct < 25) return `Great start! ${remaining} more to go.`;
  if (pct < 50) return "You're on a roll 🔥";
  if (pct < 75) return "More than halfway — you're doing amazing!";
  if (pct < 90) return `Almost done — just ${remaining} left!`;
  if (pct < 100) return `So close! Only ${remaining} remaining!`;
  return "All save the dates are out! 🥳";
}

export function SaveTheDateClient({ households }: Props) {
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | 'jeslin' | 'myles'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [sentState, setSentState] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    households.forEach(h =>
      h.guests.forEach(g => { if (g.phone) map[g.id] = g.save_the_date_sent; })
    );
    return map;
  });
  const [, startTransition] = useTransition();
  const [showFireworks, setShowFireworks] = useState(false);

  const totalWithPhone = households.reduce(
    (sum, h) => sum + h.guests.filter(g => g.phone).length, 0
  );
  const totalSent = Object.values(sentState).filter(Boolean).length;
  const pct = totalWithPhone > 0 ? Math.round((totalSent / totalWithPhone) * 100) : 0;
  const totalHouseholds = households.length;
  const completedHouseholds = households.filter(h => {
    const pg = h.guests.filter(g => g.phone);
    return pg.length > 0 && pg.every(g => sentState[g.id] ?? g.save_the_date_sent);
  }).length;

  useEffect(() => {
    if (pct === 100 && totalWithPhone > 0) {
      setShowFireworks(true);
      const t = setTimeout(() => setShowFireworks(false), 6000);
      return () => clearTimeout(t);
    }
  }, [pct, totalWithPhone]);

  function handleToggle(guestId: string, currentSent: boolean) {
    const next = !currentSent;
    setSentState(prev => ({ ...prev, [guestId]: next }));
    startTransition(() => { toggleSaveTheDateSent(guestId, next); });
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return households
      .filter(h => sideFilter === 'all' || h.side === sideFilter)
      .filter(h => {
        const pg = h.guests.filter(g => g.phone);
        if (pg.length === 0) return statusFilter === 'all';
        const allSent = pg.every(g => sentState[g.id] ?? g.save_the_date_sent);
        if (statusFilter === 'sent') return allSent;
        if (statusFilter === 'pending') return !allSent;
        return true;
      })
      .filter(h => {
        if (!q) return true;
        return h.household_name.toLowerCase().includes(q) ||
          h.guests.some(g => {
            const name = `${g.first_name} ${g.last_name ?? ''}`.toLowerCase();
            return name.includes(q) || (g.phone && g.phone.includes(q));
          });
      });
  }, [households, sideFilter, statusFilter, search, sentState]);

  const isDone = pct === 100 && totalWithPhone > 0;

  return (
    <>
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
          <Fireworks playing={showFireworks} />
        </div>
      )}

      <div>
        {/* ── Hero progress card ── */}
        <div
          className="relative overflow-hidden rounded-3xl mb-8 p-7"
          style={{
            background: isDone
              ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, #fff 60%)'
              : 'linear-gradient(135deg, rgba(201,169,110,0.1) 0%, #fff 60%)',
            border: isDone ? '1px solid rgba(16,185,129,0.2)' : `1px solid rgba(201,169,110,0.2)`,
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none blur-3xl"
            style={{ background: isDone ? 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)' }}
          />

          <div className="relative flex items-start justify-between gap-6">
            <div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl select-none">{getEmoji(pct)}</span>
                <div className="flex items-baseline">
                  <span
                    className="font-black leading-none"
                    style={{ fontSize: '5.5rem', color: isDone ? GREEN : GOLD, lineHeight: 1 }}
                  >
                    {pct}
                  </span>
                  <span className="text-4xl font-black ml-1" style={{ color: isDone ? 'rgba(16,185,129,0.35)' : 'rgba(201,169,110,0.35)' }}>%</span>
                </div>
              </div>
              <p className="text-sm" style={{ color: TEXT_MID }}>
                {getMessage(pct, totalWithPhone - totalSent)}
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-4 text-right pt-1">
              <div>
                <p className="text-3xl font-bold leading-none" style={{ color: TEXT }}>
                  {totalSent}
                  <span className="text-lg font-normal" style={{ color: TEXT_MUTED }}> / {totalWithPhone}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>people reached</p>
              </div>
              <div>
                <p className="text-xl font-semibold leading-none" style={{ color: TEXT }}>
                  {completedHouseholds}
                  <span className="text-sm font-normal" style={{ color: TEXT_MUTED }}> / {totalHouseholds}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>households done</p>
              </div>
            </div>
          </div>

          <div
            className="relative mt-7 h-2.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: isDone
                  ? `linear-gradient(90deg, #34d399, ${GREEN})`
                  : `linear-gradient(90deg, ${GOLD}, #e2c080)`,
                boxShadow: pct > 0 ? `0 0 14px ${isDone ? GREEN_GLOW : GOLD_GLOW}` : 'none',
              }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: TEXT_MUTED }}>{totalSent} sent</span>
            {isDone
              ? <span className="text-xs font-semibold" style={{ color: GREEN }}>Complete! 🎉</span>
              : <span className="text-xs" style={{ color: TEXT_MUTED }}>{totalWithPhone - totalSent} remaining</span>
            }
          </div>
        </div>

        {/* ── Message template ── */}
        <div
          className="rounded-2xl mb-6 overflow-hidden"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: GOLD }}>
              Message Template
            </span>
            <MsgCopyButton size="lg" />
          </div>

          <div className="px-5 py-4 flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div
                className="inline-block rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-line max-w-full"
                style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.7)' }}
              >
                {MESSAGE}
              </div>
            </div>

            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-[11px] leading-relaxed" style={{ color: TEXT_MUTED }}>
                1. Copy phone →<br />
                2. Open iMessage →<br />
                3. Copy message →<br />
                4. Send → Check off ✓
              </p>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, household or number…"
            className="flex-1 min-w-52 px-4 py-2.5 text-sm rounded-xl placeholder:text-black/25 focus:outline-none transition-all"
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.1)',
              color: TEXT,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
          />

          <div className="flex rounded-xl overflow-hidden text-sm" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
            {(['all', 'jeslin', 'myles'] as const).map(s => {
              const active = sideFilter === s;
              const activeBg = s === 'jeslin' ? 'rgba(167,139,250,0.12)' : s === 'myles' ? 'rgba(96,165,250,0.12)' : 'rgba(201,169,110,0.12)';
              const activeColor = s === 'jeslin' ? '#7c3aed' : s === 'myles' ? '#2563eb' : '#a07840';
              return (
                <button
                  key={s}
                  onClick={() => setSideFilter(s)}
                  className="px-4 py-2.5 font-medium transition-all duration-200"
                  style={{
                    background: active ? activeBg : '#fff',
                    color: active ? activeColor : 'rgba(0,0,0,0.35)',
                  }}
                >
                  {s === 'all' ? 'Everyone' : s === 'jeslin' ? "Jeslin's" : "Myles's"}
                </button>
              );
            })}
          </div>

          <div className="flex rounded-xl overflow-hidden text-sm" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
            {(['all', 'pending', 'sent'] as const).map(s => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-4 py-2.5 font-medium transition-all duration-200"
                  style={{
                    background: active ? 'rgba(0,0,0,0.06)' : '#fff',
                    color: active ? TEXT : 'rgba(0,0,0,0.35)',
                  }}
                >
                  {s === 'all' ? 'All' : s === 'pending' ? 'Pending' : 'Sent ✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs mb-3 px-1" style={{ color: TEXT_MUTED }}>
          {filtered.length} household{filtered.length !== 1 ? 's' : ''}
          {(search || sideFilter !== 'all' || statusFilter !== 'all') ? ' matching filters' : ''}
        </p>

        {/* ── Household cards ── */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div
              className="text-center py-16 text-sm rounded-2xl"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', color: TEXT_MUTED }}
            >
              No households match your filters.
            </div>
          )}

          {filtered.map(h => {
            const phoneGuests = h.guests.filter(g => g.phone);
            const sentGuests = phoneGuests.filter(g => sentState[g.id] ?? g.save_the_date_sent);
            const allSent = phoneGuests.length > 0 && sentGuests.length === phoneGuests.length;

            return (
              <div
                key={h.id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: allSent ? 'rgba(16,185,129,0.04)' : '#fff',
                  border: allSent ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(0,0,0,0.07)',
                  boxShadow: allSent ? `0 0 20px rgba(16,185,129,0.06)` : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm" style={{ color: TEXT }}>{h.household_name}</span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      style={h.side === 'jeslin'
                        ? { background: 'rgba(167,139,250,0.12)', color: '#7c3aed' }
                        : { background: 'rgba(96,165,250,0.12)', color: '#2563eb' }
                      }
                    >
                      {h.side === 'jeslin' ? "Jeslin's" : "Myles's"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {phoneGuests.length > 0 && (
                      <div className="flex items-center gap-1">
                        {phoneGuests.map(g => (
                          <div
                            key={g.id}
                            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              background: (sentState[g.id] ?? g.save_the_date_sent)
                                ? GREEN
                                : 'rgba(0,0,0,0.12)',
                              boxShadow: (sentState[g.id] ?? g.save_the_date_sent)
                                ? `0 0 4px ${GREEN}`
                                : 'none',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {phoneGuests.length > 0 && <MsgCopyButton size="sm" />}

                    {allSent && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GREEN }}>
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN_GLOW}` }}
                        >✓</span>
                        Done
                      </span>
                    )}
                    {!allSent && phoneGuests.length === 0 && (
                      <span className="text-xs italic" style={{ color: TEXT_MUTED }}>No numbers</span>
                    )}
                  </div>
                </div>

                {/* Guest rows */}
                <div>
                  {h.guests.map((g, idx) => {
                    const hasPhone = !!g.phone;
                    const sent = hasPhone ? (sentState[g.id] ?? g.save_the_date_sent) : false;
                    const intl = hasPhone && isInternational(g.phone!);
                    const displayName = g.is_named
                      ? `${g.first_name} ${g.last_name ?? ''}`.trim()
                      : g.guest_type === 'child' ? 'Unnamed Child' : 'Unnamed Guest';

                    return (
                      <div
                        key={g.id}
                        className="flex items-center gap-3.5 px-5 py-3 transition-all duration-150"
                        style={{
                          borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)',
                          opacity: sent ? 0.35 : hasPhone ? 1 : 0.45,
                        }}
                      >
                        {hasPhone ? (
                          <button
                            onClick={() => handleToggle(g.id, sent)}
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 active:scale-90"
                            style={sent
                              ? { background: GREEN, border: `2px solid ${GREEN}`, boxShadow: `0 0 10px ${GREEN_GLOW}` }
                              : { background: 'transparent', border: '2px solid rgba(0,0,0,0.18)' }
                            }
                            title={sent ? 'Mark as not sent' : 'Mark as sent'}
                          >
                            {sent && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full shrink-0"
                            style={{ border: '2px dashed rgba(0,0,0,0.12)' }}
                          />
                        )}

                        <span
                          className="text-sm flex-1 min-w-0 truncate"
                          style={{
                            color: sent ? TEXT_MUTED : hasPhone ? TEXT : 'rgba(0,0,0,0.35)',
                            textDecoration: sent ? 'line-through' : 'none',
                            fontStyle: !g.is_named ? 'italic' : 'normal',
                          }}
                        >
                          {displayName}
                          {g.guest_type === 'plus_one' && (
                            <span className="ml-1.5 text-xs not-italic" style={{ color: TEXT_MUTED }}>(+1)</span>
                          )}
                        </span>

                        {hasPhone ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {intl && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                style={{ background: 'rgba(217,119,6,0.1)', color: '#b45309' }}
                              >
                                🌍 Intl
                              </span>
                            )}
                            <span className="text-xs font-mono" style={{ color: 'rgba(0,0,0,0.38)' }}>
                              {formatPhone(g.phone!)}
                            </span>
                            <CopyButton text={g.phone!} />
                          </div>
                        ) : (
                          <span className="text-xs italic shrink-0" style={{ color: 'rgba(0,0,0,0.2)' }}>
                            No number
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
