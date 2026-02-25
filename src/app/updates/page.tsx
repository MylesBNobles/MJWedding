'use client';

import { useState, useEffect, useCallback } from 'react';
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

// Mailchimp configuration
const MAILCHIMP_URL = 'https://gmail.us14.list-manage.com/subscribe/post-json';
const MAILCHIMP_U = '5f1f113d40fd804816ba4788a';
const MAILCHIMP_ID = 'c16355d9fb';
const MAILCHIMP_TAG = '7337904';

export default function UpdatesPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const subscription = getUpdatesSubscription();
    if (subscription) {
      setIsSubscribed(true);
      setSubscribedEmail(subscription.email);
    }
  }, []);

  const handleSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    // Create JSONP callback
    const callbackName = `mailchimpCallback_${Date.now()}`;
    const url = `${MAILCHIMP_URL}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}&EMAIL=${encodeURIComponent(email)}&tags=${MAILCHIMP_TAG}&c=${callbackName}`;

    // Create promise to handle the JSONP response
    const jsonpPromise = new Promise<{ result: string; msg: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Request timed out'));
      }, 10000);

      // Define the callback function
      (window as unknown as Record<string, unknown>)[callbackName] = (data: { result: string; msg: string }) => {
        cleanup();
        resolve(data);
      };

      function cleanup() {
        clearTimeout(timeout);
        delete (window as unknown as Record<string, unknown>)[callbackName];
        const script = document.getElementById(callbackName);
        if (script) script.remove();
      }

      // Create and append script tag
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = url;
      script.onerror = () => {
        cleanup();
        reject(new Error('Network error'));
      };
      document.body.appendChild(script);
    });

    try {
      const response = await jsonpPromise;

      if (response.result === 'success') {
        saveUpdatesSubscription(email);
        setIsSubscribed(true);
        setSubscribedEmail(email);
        showToast("You're signed up!");
      } else if (response.msg.includes('already subscribed')) {
        // Already subscribed is still a success for our purposes
        saveUpdatesSubscription(email);
        setIsSubscribed(true);
        setSubscribedEmail(email);
        showToast("You're already subscribed!");
      } else {
        // Clean up error message from Mailchimp
        const cleanMsg = response.msg.replace(/<[^>]*>/g, '').replace(/^\d+ - /, '');
        showToast(cleanMsg || 'Something went wrong. Please try again.');
      }
    } catch {
      showToast('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, showToast]);

  const sortedUpdates = [...updateItems].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const categoryColors: Record<string, 'default' | 'accent' | 'success' | 'warning'> = {
    itinerary: 'accent',
    travel: 'success',
    lodging: 'warning',
    general: 'default',
  };

  return (
    <section className="pt-24 pb-16">
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
              <h3 className="font-semibold text-fg mb-1">You're signed up</h3>
              <p className="text-sm text-muted mb-3">
                Updates will be sent to {subscribedEmail}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubscribed(false);
                  setEmail(subscribedEmail);
                }}
                className="text-sm text-accent hover:underline"
              >
                Change email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe}>
              <h3 className="font-semibold text-fg mb-2">Get notified</h3>
              <p className="text-sm text-muted mb-4">
                Sign up to receive updates about wedding details.
              </p>
              <div className="flex items-center gap-3">
                <TextField
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="whitespace-nowrap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing up...' : 'Sign Up'}
                </Button>
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
