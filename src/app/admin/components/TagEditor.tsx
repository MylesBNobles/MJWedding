'use client';

import { useState } from 'react';
import { WEDDING_TAGS } from '@/lib/tags';
import { addTag, removeTag } from '../guests/[id]/actions';

type Props = {
  guestId: string;
  initialTags: string[];
};

export function TagEditor({ guestId, initialTags }: Props) {
  const [tags, setTags] = useState(initialTags);
  const [loading, setLoading] = useState(false);

  const available = WEDDING_TAGS.filter(t => !tags.includes(t));

  async function handleAdd(tag: string) {
    setLoading(true);
    await addTag(guestId, tag);
    setTags(prev => [...prev, tag]);
    setLoading(false);
  }

  async function handleRemove(tag: string) {
    setLoading(true);
    await removeTag(guestId, tag);
    setTags(prev => prev.filter(t => t !== tag));
    setLoading(false);
  }

  return (
    <div>
      {/* Current tags */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
        {tags.length === 0 && (
          <span className="text-sm text-muted">No tags assigned</span>
        )}
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full"
          >
            {tag}
            <button
              onClick={() => handleRemove(tag)}
              disabled={loading}
              className="hover:text-red-500 transition-colors leading-none"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Add from available tags */}
      {available.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-2">Add tag:</p>
          <div className="flex flex-wrap gap-2">
            {available.map(tag => (
              <button
                key={tag}
                onClick={() => handleAdd(tag)}
                disabled={loading}
                className="px-2.5 py-1 border border-dashed border-border text-muted text-xs rounded-full hover:border-accent hover:text-accent transition-all disabled:opacity-50"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {available.length === 0 && (
        <p className="text-xs text-muted">All tags assigned.</p>
      )}
    </div>
  );
}
