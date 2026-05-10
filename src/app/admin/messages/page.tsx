import { createServerClient } from '@/lib/supabase';
import { Container, SectionHeader } from '@/components';
import { MessagingClient } from './MessagingClient';
import { getMessageHistory } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getAllTags() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('guests')
    .select('tags')
    .eq('is_named', true);
  const all = (data ?? []).flatMap((g: { tags: string[] }) => g.tags ?? []);
  return Array.from(new Set(all)).sort();
}

export default async function MessagesPage({ searchParams }: { searchParams: { guests?: string } }) {
  const [allTags, messageLogs] = await Promise.all([
    getAllTags(),
    getMessageHistory(),
  ]);

  const preselectedGuestIds = searchParams.guests
    ? searchParams.guests.split(',').filter(Boolean)
    : [];

  return (
    <section className="pt-28 pb-16 bg-[#FAF7F2] min-h-screen">
      <Container>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors mb-8">
          ← Back to dashboard
        </Link>
        <SectionHeader
          title="Messages"
          subtitle="Compose and send SMS to your guests"
          className="mb-8"
        />
        <MessagingClient
          allTags={allTags}
          isDev={process.env.NODE_ENV === 'development'}
          messageLogs={messageLogs as never}
          preselectedGuestIds={preselectedGuestIds}
        />
      </Container>
    </section>
  );
}
