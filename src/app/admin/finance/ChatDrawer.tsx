'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FinanceProfile, FinanceExpense } from './data';
import { fmtDollarFull, fmtDollar } from './data';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  profile: FinanceProfile;
  expenses: FinanceExpense[];
  combinedMonthly: number;
  totalExpenses: number;
  availableToSave: number;
  totalNetWorth: number;
  totalDebt: number;
  weddingTotal: number;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  function flushList() {
    if (listBuffer.length === 0) return;
    if (listType === 'ul') {
      nodes.push(
        <ul key={nodes.length} style={{ margin: '6px 0', paddingLeft: 18 }}>
          {listBuffer.map((item, i) => <li key={i} style={{ marginBottom: 2 }}>{inlineMarkdown(item)}</li>)}
        </ul>
      );
    } else {
      nodes.push(
        <ol key={nodes.length} style={{ margin: '6px 0', paddingLeft: 18 }}>
          {listBuffer.map((item, i) => <li key={i} style={{ marginBottom: 2 }}>{inlineMarkdown(item)}</li>)}
        </ol>
      );
    }
    listBuffer = [];
    listType = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ulMatch = line.match(/^[-•*]\s+(.+)/);
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    const h2Match = line.match(/^##\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);

    if (ulMatch) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listBuffer.push(ulMatch[1]);
    } else if (olMatch) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      listBuffer.push(olMatch[1]);
    } else {
      flushList();
      if (h2Match) {
        nodes.push(<p key={nodes.length} style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', margin: '10px 0 4px' }}>{h2Match[1]}</p>);
      } else if (h3Match) {
        nodes.push(<p key={nodes.length} style={{ fontWeight: 600, fontSize: 12, color: '#334155', margin: '8px 0 3px' }}>{h3Match[1]}</p>);
      } else if (line.trim() === '') {
        if (nodes.length > 0) nodes.push(<div key={nodes.length} style={{ height: 6 }} />);
      } else {
        nodes.push(<p key={nodes.length} style={{ margin: '2px 0' }}>{inlineMarkdown(line)}</p>);
      }
    }
  }
  flushList();
  return <>{nodes}</>;
}

function inlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} style={{ background: 'rgba(0,0,0,0.08)', padding: '1px 4px', borderRadius: 3, fontSize: '0.9em', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

// ── Context builder ───────────────────────────────────────────────────────────

function buildContext(props: Props): string {
  const { profile, expenses, combinedMonthly, totalExpenses, availableToSave, totalNetWorth, totalDebt, weddingTotal } = props;
  const debts = profile.household.debts ?? [];
  const activeExpenses = expenses.filter((e) => e.active);
  const savingsRate = combinedMonthly > 0 ? ((availableToSave / combinedMonthly) * 100).toFixed(0) : '0';

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `You are a personal financial advisor for Myles and Jeslin, a couple in their mid-20s building wealth together. Answer questions concisely and practically. Use their exact numbers. Be warm, encouraging, and honest about trade-offs. Format your answers clearly — use bullet points for lists, bold for key numbers.

Today's date: ${today}

## Their Financial Profile

**Partners:**
- ${profile.partner1.name}: Age ${profile.partner1.age}, Gross salary ${fmtDollarFull(profile.partner1.grossSalary)}/yr, ${profile.partner1.k401Pct}% 401k, ~${profile.partner1.salaryTaxRate}% tax rate
- ${profile.partner1.name} RSU: ${fmtDollarFull(profile.partner1.rsuAnnual)}/yr gross vesting, ${profile.partner1.rsuTaxRate}% tax withheld, current stock balance ${fmtDollarFull(profile.partner1.rsuStockBalance ?? 0)}
- ${profile.partner2.name}: Age ${profile.partner2.age}, Gross salary ${fmtDollarFull(profile.partner2.grossSalary)}/yr, ${profile.partner2.k401Pct}% 401k, ~${profile.partner2.salaryTaxRate}% tax rate

**Monthly Cash Flow:**
- Combined take-home (after 401k & taxes): ${fmtDollarFull(combinedMonthly)}/mo
- Total monthly expenses: ${fmtDollarFull(totalExpenses)}/mo
- Available to save/invest: ${fmtDollarFull(availableToSave)}/mo
- Savings rate: ${savingsRate}%

**Net Worth (true, after debt):**
- Cash / savings: ${fmtDollarFull(profile.household.currentSavings)}
- RSU stock balance: ${fmtDollarFull(profile.partner1.rsuStockBalance ?? 0)}
- ${profile.partner1.name} 401k: ${fmtDollarFull(profile.partner1.k401Balance ?? 0)}
- ${profile.partner2.name} 401k: ${fmtDollarFull(profile.partner2.k401Balance ?? 0)}
- Roth IRA (combined): ${fmtDollarFull((profile.partner1.rothBalance ?? 0) + (profile.partner2.rothBalance ?? 0))}
- Total debt: ${fmtDollarFull(totalDebt)}
- **True net worth: ${fmtDollarFull(totalNetWorth)}**

**Emergency Fund:** ${fmtDollarFull(profile.household.emergencyFund ?? 0)} (${totalExpenses > 0 ? ((profile.household.emergencyFund ?? 0) / totalExpenses).toFixed(1) : '?'} months of expenses)

**Debts:**
${debts.length === 0 ? 'None' : debts.map((d) => `- ${d.name}: ${fmtDollarFull(d.balance)} at ${d.interestRate}% APR, ${fmtDollar(d.minimumPayment)}/mo minimum`).join('\n')}

**Monthly Expenses (active):**
${activeExpenses.map((e) => `- ${e.name} [${e.tier}]: ${fmtDollarFull(e.amount)}/mo`).join('\n')}

**Goals:**
- Wedding: June 12, 2027 · budget ${fmtDollarFull(weddingTotal)} · saved ${fmtDollarFull(profile.household.currentSavings)}
- Target retirement age: ${profile.household.retirementAge}
- Assumed S&P growth: ${profile.household.spGrowthRate}%/yr · RSU growth: ${profile.household.rsuGrowthRate}%/yr
- Annual tax refund: ~${fmtDollarFull(profile.household.taxRefundAnnual)}
- Cash savings rate (% of leftover invested): ${profile.household.cashSavingsPct}%

Keep answers focused and under 250 words unless a detailed breakdown is requested.`;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { emoji: '📈', text: 'Are we on track for retirement at 65?' },
  { emoji: '💳', text: 'Should we pay off student loans or invest?' },
  { emoji: '🏠', text: 'When can we afford to buy a house?' },
  { emoji: '💰', text: 'How do we hit $500k net worth fastest?' },
  { emoji: '💍', text: 'Are we on track for the wedding budget?' },
  { emoji: '📊', text: "What's our biggest financial risk right now?" },
];

export function ChatDrawer(props: Props) {
  const { combinedMonthly, availableToSave, totalNetWorth, weddingTotal, profile } = props;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const savingsRate = combinedMonthly > 0 ? ((availableToSave / combinedMonthly) * 100).toFixed(0) : '0';
  const weddingSaved = profile.household.currentSavings;
  const weddingPct = weddingTotal > 0 ? Math.min(100, (weddingSaved / weddingTotal) * 100).toFixed(0) : '0';

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/finance/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: buildContext(props) }),
      });
      if (!res.ok || !res.body) throw new Error('Chat failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: reply };
          return updated;
        });
      }
    } catch {
      setLoading(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Make sure `ANTHROPIC_API_KEY` is set in `.env.local` and restart the dev server.' }]);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function useSuggestion(text: string) {
    setInput(text);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  return (
    <>
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .chat-msg { animation: msgIn 0.2s ease both; }
        .chat-panel { animation: panelIn 0.22s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      {/* ── Toggle button (hidden when panel is open) ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 101,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 99,
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFF', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ fontSize: 15 }}>✦</span>
          <span>Finance AI</span>
        </button>
      )}

      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', zIndex: 98, backdropFilter: 'blur(1px)' }}
        />
      )}

      {/* ── Panel ── */}
      {open && (
        <div
          className="chat-panel"
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: 500, zIndex: 99,
            background: '#FFFFFF',
            boxShadow: '-8px 0 48px rgba(0,0,0,0.14)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)',
            padding: '20px 20px 16px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>✦</span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#FFF', margin: 0, letterSpacing: '-0.01em' }}>Finance AI</p>
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Myles & Jeslin · Full context loaded</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    title="Clear chat"
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94A3B8', cursor: 'pointer', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 500 }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  title="Close"
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#CBD5E1', cursor: 'pointer', borderRadius: 6, padding: '5px 10px', fontSize: 16, lineHeight: 1, fontWeight: 400 }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Context chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <ContextChip label="Net Worth" value={fmtDollar(totalNetWorth)} />
              <ContextChip label="Monthly Cash" value={`${fmtDollar(combinedMonthly)}/mo`} />
              <ContextChip label="Savings Rate" value={`${savingsRate}%`} />
              <ContextChip label="Wedding" value={`${weddingPct}% saved`} />
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
                  ✦
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', margin: '0 0 4px' }}>Ask me anything</p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 24px', textAlign: 'center' }}>I have full context on your finances — income, net worth, debt, goals.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => useSuggestion(s.text)}
                      style={{
                        padding: '10px 12px', background: '#F8FAFC',
                        border: '1px solid #E2E8F0', borderRadius: 10,
                        fontSize: 12, color: '#334155', cursor: 'pointer',
                        textAlign: 'left', fontFamily: 'inherit', lineHeight: 1.4,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; }}
                    >
                      <span style={{ display: 'block', fontSize: 16, marginBottom: 4 }}>{s.emoji}</span>
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((m, i) => (
              <div key={i} className="chat-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                {m.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#FFF', fontWeight: 700, flexShrink: 0 }}>
                      ✦
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Finance AI</span>
                  </div>
                )}
                <div style={{
                  maxWidth: '88%',
                  padding: m.role === 'user' ? '10px 14px' : '12px 16px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : '#F8FAFC',
                  border: m.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
                  color: m.role === 'user' ? '#FFF' : '#0F172A',
                  fontSize: 13, lineHeight: 1.6,
                  boxShadow: m.role === 'user' ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  {m.role === 'assistant'
                    ? (m.content ? renderMarkdown(m.content) : <StreamCursor />)
                    : m.content
                  }
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chat-msg" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#FFF', flexShrink: 0 }}>✦</div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8', animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '12px 16px 20px', borderTop: '1px solid #F1F5F9', flexShrink: 0, background: '#FFF' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '10px 12px', transition: 'border-color 0.15s' }}
              onFocus={() => {}} // handled by CSS would be nicer but inline works
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKey}
                placeholder="Ask about your finances…"
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  resize: 'none', fontFamily: 'inherit', fontSize: 14,
                  color: '#0F172A', lineHeight: 1.5, padding: 0,
                  minHeight: 22, maxHeight: 120, overflowY: 'auto',
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: input.trim() ? 'linear-gradient(135deg, #0F172A, #1E293B)' : '#E2E8F0',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: input.trim() ? '#FFF' : '#94A3B8',
                  transition: 'all 0.15s', fontSize: 14,
                }}
              >
                ↑
              </button>
            </div>
            <p style={{ fontSize: 10, color: '#CBD5E1', margin: '6px 0 0', textAlign: 'center' }}>Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </>
  );
}

function ContextChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 8px' }}>
      <span style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 10, color: '#FFF', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function StreamCursor() {
  return <span style={{ display: 'inline-block', width: 2, height: 14, background: '#6366F1', borderRadius: 1, verticalAlign: 'middle', animation: 'dotBounce 1s ease-in-out infinite' }}>▌</span>;
}
