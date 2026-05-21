export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Container } from '@/components';
import { getSaveTheDateData } from './actions';
import { SaveTheDateClient } from './SaveTheDateClient';

export default async function SaveTheDatePage() {
  const households = await getSaveTheDateData();

  return (
    <div className="min-h-screen pt-28 pb-20" style={{ background: '#080a10' }}>
      <Container>
        <div className="mb-10">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs mb-4 transition-colors hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            ← Admin
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-white">Save the Date</h1>
          <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Track who&apos;s been reached — check off as you go
          </p>
        </div>

        <SaveTheDateClient households={households} />
      </Container>
    </div>
  );
}
