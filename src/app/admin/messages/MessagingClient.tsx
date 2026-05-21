'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components';
import { previewMessage, sendMessages } from './actions';
import type { RecipientTarget, MessagePreview } from './actions';

type Props = {
  allTags: string[];
  isDev?: boolean;
  preselectedGuestIds?: string[];
  messageLogs: {
    id: string;
    recipient: string;
    body: string;
    status: string;
    sent_at: string | null;
    created_at: string;
    guest: { first_name: string; last_name: string | null } | null;
  }[];
};

const TARGET_OPTIONS = [
  { label: 'All guests', value: 'all' as const },
  { label: 'Pending RSVP', value: 'pending' as const },
  { label: 'Accepted', value: 'accepted' as const },
  { label: 'Declined', value: 'declined' as const },
];

function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'default' {
  if (status === 'sent' || status === 'delivered') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}

export function MessagingClient({ allTags, isDev, messageLogs, preselectedGuestIds = [] }: Props) {
  const hasPreselected = preselectedGuestIds.length > 0;
  const [targetType, setTargetType] = useState<'preset' | 'tag' | 'specific'>(hasPreselected ? 'specific' : 'preset');
  const [preset, setPreset] = useState<string>('pending');
  const [selectedTag, setSelectedTag] = useState<string>(allTags[0] ?? '');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState<MessagePreview[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<{ sent: number; failed: number } | null>(null);
  const [step, setStep] = useState<'compose' | 'preview' | 'done'>('compose');

  function buildTarget(): RecipientTarget {
    if (targetType === 'specific') return { type: 'specific', guestIds: preselectedGuestIds };
    if (targetType === 'tag') return { type: 'tag', value: selectedTag };
    if (preset === 'all') return { type: 'all' };
    return { type: 'status', value: preset };
  }

  async function handlePreview() {
    if (!body.trim()) return;
    setLoading(true);
    const { recipients } = await previewMessage(buildTarget(), body);
    setPreview(recipients);
    setStep('preview');
    setLoading(false);
  }

  async function handleSend() {
    setLoading(true);
    const result = await sendMessages(buildTarget(), body);
    if (result.error === 'MISSING_CONFIG') {
      alert('SimpleTexting is not configured. Set SIMPLE_TEXTING_API_KEY and SIMPLE_TEXTING_FROM_NUMBER in .env.local');
      setLoading(false);
      return;
    }
    setSent(result);
    setStep('done');
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {isDev && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex gap-3 items-start">
          <span className="text-blue-600 text-lg leading-none mt-0.5">ℹ</span>
          <div>
            <p className="text-sm font-medium text-blue-800">Dev mode — messages will go to SIMPLE_TEXTING_DEV_TO_OVERRIDE if set</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Set <code>SIMPLE_TEXTING_DEV_TO_OVERRIDE</code> in .env.local to redirect all sends to your test number.
            </p>
          </div>
        </div>
      )}

      {step === 'compose' && (
        <Card>
          <h2 className="text-base font-semibold text-fg mb-5">Compose Message</h2>

          {/* Target selector */}
          <div className="mb-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Send to</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {hasPreselected && (
                <button
                  onClick={() => setTargetType('specific')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    targetType === 'specific' ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:border-accent'
                  }`}
                >
                  Selected guests ({preselectedGuestIds.length})
                </button>
              )}
              <button
                onClick={() => setTargetType('preset')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  targetType === 'preset' ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:border-accent'
                }`}
              >
                Preset group
              </button>
              {allTags.length > 0 && (
                <button
                  onClick={() => setTargetType('tag')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    targetType === 'tag' ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:border-accent'
                  }`}
                >
                  By tag
                </button>
              )}
            </div>

            {targetType === 'preset' && (
              <div className="flex gap-2 flex-wrap">
                {TARGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPreset(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      preset === opt.value ? 'bg-fg text-white border-fg' : 'border-border text-muted hover:border-fg'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {targetType === 'tag' && (
              <div className="flex gap-2 flex-wrap">
                {allTags.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedTag === t ? 'bg-fg text-white border-fg' : 'border-border text-muted hover:border-fg'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message body */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-2">
              Message
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Hi {{first_name}}, just a reminder to RSVP for Jeslin & Myles's wedding! ..."
              className="w-full px-3 py-2 text-sm bg-card text-fg border border-border rounded-md placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
            <p className="text-xs text-muted mt-1">
              Use <code className="bg-border px-1 rounded">{'{{first_name}}'}</code>, <code className="bg-border px-1 rounded">{'{{last_name}}'}</code>, or <code className="bg-border px-1 rounded">{'{{full_name}}'}</code> for personalization.
            </p>
          </div>

          <div className="mt-4">
            <Button onClick={handlePreview} disabled={loading || !body.trim()}>
              {loading ? 'Loading preview...' : 'Preview recipients →'}
            </Button>
          </div>
        </Card>
      )}

      {step === 'preview' && preview && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-fg">
              Preview — {preview.length} recipient{preview.length !== 1 ? 's' : ''}
            </h2>
            <button onClick={() => setStep('compose')} className="text-sm text-muted hover:text-fg transition-colors">
              ← Edit message
            </button>
          </div>

          {preview.length === 0 ? (
            <p className="text-muted text-sm">No guests match this target with a phone number on file.</p>
          ) : (
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
              {preview.map(r => (
                <div key={r.guestId} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-fg">{r.name}</span>
                    <span className="text-xs text-muted">{r.phone}</span>
                  </div>
                  <p className="text-sm text-muted whitespace-pre-wrap">{r.preview}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-center flex-wrap">
            <Button onClick={handleSend} disabled={loading || preview.length === 0}>
              {loading ? 'Sending...' : `Send to ${preview.length} guests`}
            </Button>
          </div>
        </Card>
      )}

      {step === 'done' && sent && (
        <Card className="text-center py-8">
          <p className="text-2xl mb-2">✓</p>
          <p className="font-semibold text-fg">{sent.sent} messages sent</p>
          {sent.failed > 0 && <p className="text-sm text-red-600 mt-1">{sent.failed} failed — check history below</p>}
          <button onClick={() => { setStep('compose'); setBody(''); setPreview(null); setSent(null); }}
            className="text-sm text-accent hover:underline mt-4 block mx-auto">
            Send another
          </button>
        </Card>
      )}

      {/* Message history */}
      <div>
        <h2 className="text-lg font-semibold text-fg mb-4">Message History</h2>
        {messageLogs.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-muted text-sm">No messages sent yet.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse bg-card">
              <thead>
                <tr className="border-b border-border bg-[#FAF7F2]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">To</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Message</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Sent</th>
                </tr>
              </thead>
              <tbody>
                {messageLogs.map((log: Props['messageLogs'][number]) => (
                  <tr key={log.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-sm text-fg whitespace-nowrap">
                      {log.guest ? `${log.guest.first_name} ${log.guest.last_name ?? ''}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{log.recipient}</td>
                    <td className="py-3 px-4 text-sm text-muted max-w-xs truncate">{log.body}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted whitespace-nowrap">
                      {log.sent_at ? new Date(log.sent_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
