export const WEDDING_TAGS = [
  'bridesmaid',
  'groomsmen',
  'wedding-party',
  'family',
  'vip',
] as const;

export type WeddingTag = typeof WEDDING_TAGS[number];
