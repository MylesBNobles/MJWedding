'use client';

import Link from 'next/link';
import { Container } from './Container';
import { Button } from './Button';

type ComingSoonProps = {
  title: string;
  subtitle?: string;
};

export function ComingSoon({ title, subtitle }: ComingSoonProps) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <Container size="sm">
        <div className="text-center">
          {/* Decorative element */}
          <div className="mb-8 flex justify-center">
            <div className="h-px w-16 bg-accent/40" />
            <div className="mx-4 h-2 w-2 rotate-45 border border-accent/40" />
            <div className="h-px w-16 bg-accent/40" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fg mb-4">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg text-muted mb-8">{subtitle}</p>
          )}

          <p className="text-base text-muted leading-relaxed max-w-md mx-auto mb-8">
            We're still working on finalizing the details for this page.
            We'll post updates in our Updates section as soon as we have more information to share.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/updates">
              <Button variant="primary">
                Get Updates
              </Button>
            </Link>
            <Link href="/updates">
              <Button variant="ghost">
                View Updates
              </Button>
            </Link>
          </div>

          {/* Decorative element */}
          <div className="mt-12 flex justify-center">
            <div className="h-px w-16 bg-accent/40" />
            <div className="mx-4 h-2 w-2 rotate-45 border border-accent/40" />
            <div className="h-px w-16 bg-accent/40" />
          </div>
        </div>
      </Container>
    </section>
  );
}
