import Link from 'next/link';
import { Container, Card, Button, Badge } from '@/components';
import { weddingDetails, updateItems, travelInfo } from '@/lib/mockData';

export default function HomePage() {
  const latestUpdate = updateItems.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];

  const checklist = [
    { text: 'Share your travel plans', href: '/plans', done: false },
    { text: 'Book accommodations', href: '/travel', done: false },
    { text: 'Check the dress code', href: '/attire', done: false },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <Container size="md">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-fg mb-6">
              {weddingDetails.couple}
            </h1>
            <p className="text-xl sm:text-2xl text-muted mb-2">
              {weddingDetails.date}
            </p>
            <p className="text-lg text-muted mb-10">
              {weddingDetails.location}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/plans">
                <Button size="lg">Share Your Plans</Button>
              </Link>
              <Link href="/travel">
                <Button variant="secondary" size="lg">Travel Info</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Key Facts */}
      <section className="py-12 border-y border-border bg-card">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-sm text-muted mb-1">Nearest Airports</p>
              <p className="font-medium text-fg">
                {travelInfo.airports.filter(a => a.recommended).map(a => a.code).join(', ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Arrive By</p>
              <p className="font-medium text-fg">Fri, Jun 13</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Dress Code</p>
              <p className="font-medium text-fg">{weddingDetails.dressCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Timezone</p>
              <p className="font-medium text-fg">{weddingDetails.timezone}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* What to do next */}
      <section className="py-16">
        <Container size="md">
          <h2 className="text-2xl font-semibold text-fg mb-6 text-center">
            What to do next
          </h2>
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <Link key={index} href={item.href}>
                <Card className="flex items-center gap-4 hover:border-accent transition-colors cursor-pointer">
                  <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0">
                    {item.done && (
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-fg ${item.done ? 'line-through text-muted' : ''}`}>
                    {item.text}
                  </span>
                  <svg className="w-5 h-5 text-muted ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Latest Update */}
      <section className="py-16 bg-card border-y border-border">
        <Container size="md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-fg">Latest Update</h2>
            <Link href="/updates" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <Card>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-lg font-medium text-fg">{latestUpdate.title}</h3>
              <Badge>{latestUpdate.category}</Badge>
            </div>
            <p className="text-muted mb-3">{latestUpdate.body}</p>
            <p className="text-sm text-muted">
              {new Date(latestUpdate.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </Card>
        </Container>
      </section>
    </>
  );
}
