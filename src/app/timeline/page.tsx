'use client';

import { useState } from 'react';
import { Container, SectionHeader, TimelineItem, Button, Toast, useToast } from '@/components';
import { timelineEvents } from '@/lib/mockData';
import { getLastUpdated } from '@/lib/storage';

export default function TimelinePage() {
  const { toast, showToast, hideToast } = useToast();

  // Group events by date
  const eventsByDate = timelineEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, typeof timelineEvents>);

  const sortedDates = Object.keys(eventsByDate).sort();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied');
  };

  return (
    <section className="py-16">
      <Container size="md">
        <div className="flex items-start justify-between gap-4 mb-8">
          <SectionHeader
            title="Weekend Timeline"
            subtitle="Everything you need to know about the celebration weekend"
            className="mb-0"
          />
          <Button variant="ghost" size="sm" onClick={copyLink}>
            Copy link
          </Button>
        </div>

        {sortedDates.map((date) => (
          <div key={date} className="mb-12">
            <h3 className="text-lg font-semibold text-fg mb-6 pb-2 border-b border-border">
              {formatDate(date)}
            </h3>
            <div>
              {eventsByDate[date].map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={index === eventsByDate[date].length - 1}
                />
              ))}
            </div>
          </div>
        ))}

        <p className="text-sm text-muted mt-8">
          Last updated: {getLastUpdated()}
        </p>
      </Container>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </section>
  );
}
