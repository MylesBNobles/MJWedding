'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  SectionHeader,
  Card,
  Button,
  TextField,
  Badge,
  Toast,
  useToast,
} from '@/components';
import { updateItems } from '@/lib/mockData';
import { getUpdatesSubscription, saveUpdatesSubscription } from '@/lib/storage';

export default function UpdatesPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const subscription = getUpdatesSubscription();
    if (subscription) {
      setIsSubscribed(true);
      setSubscribedEmail(subscription.email);
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    saveUpdatesSubscription(email);
    setIsSubscribed(true);
    setSubscribedEmail(email);
    showToast('You\'re signed up!');
  };

  const sortedUpdates = [...updateItems].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const categoryColors: Record<string, 'default' | 'accent' | 'success' | 'warning'> = {
    timeline: 'accent',
    travel: 'success',
    lodging: 'warning',
    general: 'default',
  };

  return (
    <section className="py-16">
      <Container size="md">
        <SectionHeader
          title="Updates"
          subtitle="Stay informed about wedding details"
        />

        {/* Subscribe Section */}
        <Card className="mb-12">
          {isSubscribed ? (
            <div className="text-center py-4">
              <svg
                className="w-12 h-12 text-green-500 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-fg mb-1">You're subscribed</h3>
              <p className="text-sm text-muted">
                Updates will be sent to {subscribedEmail}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe}>
              <h3 className="font-semibold text-fg mb-2">Get notified</h3>
              <p className="text-sm text-muted mb-4">
                Sign up to receive updates about wedding details.
              </p>
              <div className="flex gap-3">
                <TextField
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1"
                />
                <Button type="submit">Sign Up</Button>
              </div>
            </form>
          )}
        </Card>

        {/* Updates Archive */}
        <div>
          <h3 className="text-lg font-semibold text-fg mb-6">All Updates</h3>

          {sortedUpdates.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-muted">No updates yet. Check back soon!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedUpdates.map((update) => (
                <Card key={update.id}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-medium text-fg">{update.title}</h4>
                    <Badge variant={categoryColors[update.category]}>
                      {update.category}
                    </Badge>
                  </div>
                  <p className="text-muted text-sm mb-3">{update.body}</p>
                  <p className="text-xs text-muted">
                    {new Date(update.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </section>
  );
}
