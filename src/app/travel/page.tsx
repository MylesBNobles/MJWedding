'use client';

import { Container, SectionHeader, Card, Badge, Button, Toast, useToast } from '@/components';
import { travelInfo } from '@/lib/mockData';
import { getLastUpdated } from '@/lib/storage';

export default function TravelPage() {
  const { toast, showToast, hideToast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied');
  };

  const itinerary = `Wedding Weekend Itinerary
========================

Friday, June 13
- Welcome Drinks: 6:00 PM - 9:00 PM
  The Rooftop at Hotel Luna

Saturday, June 14
- Ceremony: 4:30 PM
- Cocktail Hour: 5:30 PM
- Reception & Dinner: 6:30 PM - 11:00 PM
  Villa Rosa, Napa Valley

Sunday, June 15
- Farewell Brunch: 10:00 AM - 1:00 PM
  Hotel Luna Restaurant`;

  const copyItinerary = () => {
    navigator.clipboard.writeText(itinerary);
    showToast('Itinerary copied');
  };

  return (
    <section className="py-16">
      <Container size="md">
        <div className="flex items-start justify-between gap-4 mb-8">
          <SectionHeader
            title="Travel"
            subtitle="Everything you need to plan your trip"
            className="mb-0"
          />
          <Button variant="ghost" size="sm" onClick={copyLink}>
            Copy link
          </Button>
        </div>

        {/* Airports */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-fg mb-4">Airports</h3>
          <div className="grid gap-3">
            {travelInfo.airports.map((airport) => (
              <Card key={airport.code} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-fg">{airport.name}</span>
                    <span className="text-muted ml-2">({airport.code})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">{airport.driveTime}</span>
                    {airport.recommended && (
                      <Badge variant="accent">Recommended</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Travel Windows */}
        <div className="mb-12 grid sm:grid-cols-2 gap-6">
          <Card>
            <h4 className="font-semibold text-fg mb-3">Arrival</h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted">
                <span className="font-medium text-fg">Ideal:</span> {travelInfo.arrivalWindow.ideal}
              </p>
              <p className="text-muted">
                <span className="font-medium text-fg">Latest:</span> {travelInfo.arrivalWindow.latest}
              </p>
            </div>
          </Card>
          <Card>
            <h4 className="font-semibold text-fg mb-3">Departure</h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted">
                <span className="font-medium text-fg">Earliest:</span> {travelInfo.departureWindow.earliest}
              </p>
              <p className="text-muted">
                <span className="font-medium text-fg">Ideal:</span> {travelInfo.departureWindow.ideal}
              </p>
            </div>
          </Card>
        </div>

        {/* Hotel Block */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-fg mb-4">Hotel Block</h3>
          <Card className="border-accent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-semibold text-fg">{travelInfo.hotelBlock.name}</h4>
                <p className="text-sm text-muted mt-1">
                  Use code <span className="font-mono font-medium text-fg">{travelInfo.hotelBlock.code}</span>
                </p>
                <p className="text-sm text-muted">
                  Book by {travelInfo.hotelBlock.bookBy}
                </p>
              </div>
              <Button variant="secondary">Book Now</Button>
            </div>
          </Card>
        </div>

        {/* Lodging Areas */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-fg mb-4">Lodging Areas</h3>
          <div className="grid gap-3">
            {travelInfo.lodgingAreas.map((area) => (
              <Card key={area.name} padding="sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium text-fg">{area.name}</span>
                    <p className="text-sm text-muted mt-1">{area.description}</p>
                  </div>
                  <span className="text-sm text-muted flex-shrink-0">{area.priceRange}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Transportation */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-fg mb-4">Getting Around</h3>
          <div className="grid gap-3">
            {travelInfo.transport.map((option) => (
              <Card key={option.type} padding="sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium text-fg">{option.type}</span>
                    <p className="text-sm text-muted mt-1">{option.description}</p>
                  </div>
                  {option.recommended && (
                    <Badge variant="accent">Recommended</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Itinerary */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-fg">Quick Itinerary</h3>
            <Button variant="ghost" size="sm" onClick={copyItinerary}>
              Copy
            </Button>
          </div>
          <Card className="bg-border/30">
            <pre className="text-sm text-fg whitespace-pre-wrap font-mono">
              {itinerary}
            </pre>
          </Card>
        </div>

        {/* Tips */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-fg mb-4">Tips for Visitors</h3>
          <Card>
            <ul className="space-y-3">
              {travelInfo.tips.map((tip, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="text-accent flex-shrink-0">•</span>
                  <span className="text-muted">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <p className="text-sm text-muted">
          Last updated: {getLastUpdated()}
        </p>
      </Container>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </section>
  );
}
