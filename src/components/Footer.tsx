'use client';

import { Container } from './Container';
import { getLastUpdated } from '@/lib/storage';

export function Footer() {
  const lastUpdated = getLastUpdated();

  return (
    <footer className="border-t border-border py-8 mt-16">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>Last updated: {lastUpdated}</p>
          <a
            href="mailto:hello@mylesandjeslin.com"
            className="hover:text-fg transition-colors"
          >
            hello@mylesandjeslin.com
          </a>
        </div>
      </Container>
    </footer>
  );
}
