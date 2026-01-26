'use client';

import { useState } from 'react';
import { EventItem } from '@/lib/types';
import { Badge } from './Badge';
import { Card } from './Card';

type TimelineItemProps = {
  event: EventItem;
  isLast?: boolean;
};

export function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const timeRange = event.endTime
    ? `${event.startTime} – ${event.endTime}`
    : event.startTime;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0" />
        {!isLast && (
          <div className="w-px flex-1 bg-border min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <Card className="flex-1 mb-4" padding="md">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-fg">{event.title}</h3>
          {event.dressCode && (
            <Badge variant="accent">{event.dressCode}</Badge>
          )}
        </div>

        <p className="text-muted text-sm mb-2">{timeRange}</p>

        <p className="text-fg font-medium">{event.venueName}</p>

        {event.address && (
          <p className="text-muted text-sm">{event.address}</p>
        )}

        {event.mapLink && (
          <a
            href={event.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-accent hover:underline"
          >
            View on map
          </a>
        )}

        {event.notes && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-sm text-muted hover:text-fg transition-colors"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
            </button>

            {isExpanded && (
              <p className="mt-2 text-sm text-muted border-t border-border pt-3">
                {event.notes}
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
