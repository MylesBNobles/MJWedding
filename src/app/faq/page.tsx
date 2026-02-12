'use client';

import { useState } from 'react';
import { Container, SectionHeader, Card } from '@/components';
import { faqItems } from '@/lib/mockData';

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const email = 'hello@jeslinandmyles.com';

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const renderAnswer = (answer: string) => {
    if (!answer.includes(email)) {
      return answer;
    }

    const [before, after] = answer.split(email);

    return (
      <>
        {before}
        <a
          href={`mailto:${email}`}
          className="text-accent underline underline-offset-4"
        >
          {email}
        </a>
        {after}
      </>
    );
  };

  return (
    <section className="pt-24 pb-16">
      <Container size="md">
        <SectionHeader
          title="FAQ"
          subtitle="Answers to common questions"
        />

        <div className="space-y-3">
          {faqItems.map((item) => (
            <Card key={item.id} padding="sm" className="overflow-hidden">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-start justify-between gap-4 text-left py-2"
              >
                <span className="font-medium text-fg">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-muted flex-shrink-0 transition-transform ${
                    openId === item.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openId === item.id && (
                <div className="pt-2 pb-2 border-t border-border mt-2">
                  <p className="text-sm text-muted">{renderAnswer(item.a)}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
