'use client';

import { usePathname } from 'next/navigation';
import { Container } from './Container';
import { getLastUpdated } from '@/lib/storage';

export function Footer() {
  const pathname = usePathname();
  const lastUpdated = getLastUpdated();

  if (pathname === '/save-the-date') return null;

  return (
    <footer className="border-t border-[#EDE6D8] py-8 mt-16 bg-[#FAF7F2]">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>Last updated: {lastUpdated}</p>
          <a
            href="mailto:hello@jeslinandmyles.com"
            className="hover:text-accent transition-colors"
          >
            hello@jeslinandmyles.com
          </a>
        </div>
      </Container>
    </footer>
  );
}
