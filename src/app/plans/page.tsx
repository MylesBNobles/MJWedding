'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  SectionHeader,
  Card,
  Button,
  TextField,
  TextArea,
  Select,
  Checkbox,
  Badge,
  Toast,
  useToast,
} from '@/components';
import { GuestPlan } from '@/lib/types';
import { savePlan, getPlanByEmail } from '@/lib/storage';
import { travelInfo } from '@/lib/mockData';

type Step = 'lookup' | 'form' | 'summary';

const emptyPlan: Omit<GuestPlan, 'id' | 'updatedAt'> = {
  name: '',
  email: '',
  partySize: 1,
  attendingStatus: 'yes',
  arrivalDateTime: '',
  arrivalAirport: '',
  arrivalFlight: '',
  departureDateTime: '',
  departureAirport: '',
  departureFlight: '',
  lodgingName: '',
  lodgingArea: '',
  transportNeeds: [],
  dietaryNotes: '',
  notes: '',
};

export default function PlansPage() {
  const [step, setStep] = useState<Step>('lookup');
  const [lookupEmail, setLookupEmail] = useState('');
  const [plan, setPlan] = useState(emptyPlan);
  const [existingPlan, setExistingPlan] = useState<GuestPlan | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const handleLookup = () => {
    if (!lookupEmail) return;
    const found = getPlanByEmail(lookupEmail);
    if (found) {
      setPlan(found);
      setExistingPlan(found);
    } else {
      setPlan({ ...emptyPlan, email: lookupEmail });
      setExistingPlan(null);
    }
    setStep('form');
  };

  const handleChange = (field: keyof typeof plan, value: string | number | string[]) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
  };

  const handleTransportChange = (type: string, checked: boolean) => {
    const current = plan.transportNeeds;
    if (checked) {
      handleChange('transportNeeds', [...current, type]);
    } else {
      handleChange('transportNeeds', current.filter((t) => t !== type));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan.name || !plan.email) return;

    savePlan({
      ...plan,
      id: existingPlan?.id || '',
      updatedAt: new Date().toISOString(),
    } as GuestPlan);

    showToast('Saved');
    setExistingPlan(getPlanByEmail(plan.email));
    setStep('summary');
  };

  const handleEdit = () => {
    setStep('form');
  };

  const handleStartOver = () => {
    setPlan(emptyPlan);
    setExistingPlan(null);
    setLookupEmail('');
    setStep('lookup');
  };

  const airportOptions = travelInfo.airports.map((a) => ({
    value: a.code,
    label: `${a.code} - ${a.name}`,
  }));

  const lodgingAreaOptions = travelInfo.lodgingAreas.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  const attendingOptions = [
    { value: 'yes', label: 'Yes, I\'ll be there' },
    { value: 'maybe', label: 'Maybe' },
    { value: 'no', label: 'Sorry, can\'t make it' },
  ];

  return (
    <section className="py-16">
      <Container size="sm">
        <SectionHeader
          title="Share Your Plans"
          subtitle="Help us prepare for your arrival"
        />

        {step === 'lookup' && (
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
            >
              <p className="text-muted mb-6">
                Enter your email to share your plans or update existing ones.
              </p>
              <TextField
                label="Email"
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <div className="mt-6">
                <Button type="submit" fullWidth>
                  Continue
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            {existingPlan && (
              <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-sm text-accent">
                  Welcome back! We found your existing plans. Update them below.
                </p>
              </div>
            )}

            {/* Basic Info */}
            <Card className="mb-6">
              <h3 className="font-semibold text-fg mb-4">Basic Information</h3>
              <div className="space-y-4">
                <TextField
                  label="Name"
                  value={plan.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={plan.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={!!existingPlan}
                />
                <TextField
                  label="Party Size"
                  type="number"
                  min={1}
                  max={10}
                  value={plan.partySize || 1}
                  onChange={(e) => handleChange('partySize', parseInt(e.target.value) || 1)}
                />
                <Select
                  label="Will you attend?"
                  options={attendingOptions}
                  value={plan.attendingStatus}
                  onChange={(e) => handleChange('attendingStatus', e.target.value as 'yes' | 'no' | 'maybe')}
                />
              </div>
            </Card>

            {plan.attendingStatus !== 'no' && (
              <>
                {/* Arrival */}
                <Card className="mb-6">
                  <h3 className="font-semibold text-fg mb-4">Arrival</h3>
                  <div className="space-y-4">
                    <TextField
                      label="Arrival Date & Time"
                      type="datetime-local"
                      value={plan.arrivalDateTime || ''}
                      onChange={(e) => handleChange('arrivalDateTime', e.target.value)}
                    />
                    <Select
                      label="Arrival Airport"
                      options={airportOptions}
                      placeholder="Select airport"
                      value={plan.arrivalAirport || ''}
                      onChange={(e) => handleChange('arrivalAirport', e.target.value)}
                    />
                    <TextField
                      label="Flight Number (optional)"
                      value={plan.arrivalFlight || ''}
                      onChange={(e) => handleChange('arrivalFlight', e.target.value)}
                      placeholder="e.g., AA123"
                    />
                  </div>
                </Card>

                {/* Departure */}
                <Card className="mb-6">
                  <h3 className="font-semibold text-fg mb-4">Departure</h3>
                  <div className="space-y-4">
                    <TextField
                      label="Departure Date & Time"
                      type="datetime-local"
                      value={plan.departureDateTime || ''}
                      onChange={(e) => handleChange('departureDateTime', e.target.value)}
                    />
                    <Select
                      label="Departure Airport"
                      options={airportOptions}
                      placeholder="Select airport"
                      value={plan.departureAirport || ''}
                      onChange={(e) => handleChange('departureAirport', e.target.value)}
                    />
                    <TextField
                      label="Flight Number (optional)"
                      value={plan.departureFlight || ''}
                      onChange={(e) => handleChange('departureFlight', e.target.value)}
                      placeholder="e.g., UA456"
                    />
                  </div>
                </Card>

                {/* Lodging */}
                <Card className="mb-6">
                  <h3 className="font-semibold text-fg mb-4">Lodging</h3>
                  <div className="space-y-4">
                    <TextField
                      label="Hotel / Lodging Name"
                      value={plan.lodgingName || ''}
                      onChange={(e) => handleChange('lodgingName', e.target.value)}
                      placeholder="e.g., Hotel Luna"
                    />
                    <Select
                      label="Area"
                      options={lodgingAreaOptions}
                      placeholder="Select area"
                      value={plan.lodgingArea || ''}
                      onChange={(e) => handleChange('lodgingArea', e.target.value)}
                    />
                  </div>
                </Card>

                {/* Transportation */}
                <Card className="mb-6">
                  <h3 className="font-semibold text-fg mb-4">Transportation Needs</h3>
                  <div className="space-y-3">
                    <Checkbox
                      label="Shuttle service between hotel and events"
                      checked={plan.transportNeeds.includes('shuttle')}
                      onChange={(e) => handleTransportChange('shuttle', e.target.checked)}
                    />
                    <Checkbox
                      label="Rental car"
                      checked={plan.transportNeeds.includes('rental_car')}
                      onChange={(e) => handleTransportChange('rental_car', e.target.checked)}
                    />
                    <Checkbox
                      label="Rideshare / Uber / Lyft"
                      checked={plan.transportNeeds.includes('rideshare')}
                      onChange={(e) => handleTransportChange('rideshare', e.target.checked)}
                    />
                  </div>
                </Card>

                {/* Additional Notes */}
                <Card className="mb-6">
                  <h3 className="font-semibold text-fg mb-4">Additional Notes</h3>
                  <div className="space-y-4">
                    <TextArea
                      label="Dietary Restrictions"
                      value={plan.dietaryNotes || ''}
                      onChange={(e) => handleChange('dietaryNotes', e.target.value)}
                      placeholder="Any allergies or dietary requirements"
                    />
                    <TextArea
                      label="Other Notes"
                      value={plan.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Anything else we should know"
                    />
                  </div>
                </Card>
              </>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={handleStartOver}>
                Start Over
              </Button>
              <Button type="submit" fullWidth>
                {existingPlan ? 'Update Plans' : 'Save Plans'}
              </Button>
            </div>
          </form>
        )}

        {step === 'summary' && existingPlan && (
          <>
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-fg">Your Plans</h3>
                <Badge variant={
                  existingPlan.attendingStatus === 'yes' ? 'success' :
                  existingPlan.attendingStatus === 'maybe' ? 'warning' : 'default'
                }>
                  {existingPlan.attendingStatus === 'yes' ? 'Attending' :
                   existingPlan.attendingStatus === 'maybe' ? 'Maybe' : 'Not Attending'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted">Name</p>
                  <p className="font-medium text-fg">{existingPlan.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Email</p>
                  <p className="font-medium text-fg">{existingPlan.email}</p>
                </div>
                {existingPlan.partySize && (
                  <div>
                    <p className="text-sm text-muted">Party Size</p>
                    <p className="font-medium text-fg">{existingPlan.partySize}</p>
                  </div>
                )}

                {existingPlan.attendingStatus !== 'no' && (
                  <>
                    {existingPlan.arrivalDateTime && (
                      <div>
                        <p className="text-sm text-muted">Arrival</p>
                        <p className="font-medium text-fg">
                          {new Date(existingPlan.arrivalDateTime).toLocaleString()}
                          {existingPlan.arrivalAirport && ` via ${existingPlan.arrivalAirport}`}
                        </p>
                      </div>
                    )}
                    {existingPlan.departureDateTime && (
                      <div>
                        <p className="text-sm text-muted">Departure</p>
                        <p className="font-medium text-fg">
                          {new Date(existingPlan.departureDateTime).toLocaleString()}
                          {existingPlan.departureAirport && ` via ${existingPlan.departureAirport}`}
                        </p>
                      </div>
                    )}
                    {existingPlan.lodgingName && (
                      <div>
                        <p className="text-sm text-muted">Lodging</p>
                        <p className="font-medium text-fg">
                          {existingPlan.lodgingName}
                          {existingPlan.lodgingArea && ` (${existingPlan.lodgingArea})`}
                        </p>
                      </div>
                    )}
                    {existingPlan.transportNeeds.length > 0 && (
                      <div>
                        <p className="text-sm text-muted">Transportation</p>
                        <p className="font-medium text-fg">
                          {existingPlan.transportNeeds.map(t =>
                            t.replace('_', ' ')
                          ).join(', ')}
                        </p>
                      </div>
                    )}
                    {existingPlan.dietaryNotes && (
                      <div>
                        <p className="text-sm text-muted">Dietary Notes</p>
                        <p className="font-medium text-fg">{existingPlan.dietaryNotes}</p>
                      </div>
                    )}
                    {existingPlan.notes && (
                      <div>
                        <p className="text-sm text-muted">Notes</p>
                        <p className="font-medium text-fg">{existingPlan.notes}</p>
                      </div>
                    )}
                  </>
                )}

                <p className="text-xs text-muted pt-2 border-t border-border">
                  Last updated: {new Date(existingPlan.updatedAt).toLocaleString()}
                </p>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleStartOver}>
                Start Over
              </Button>
              <Button onClick={handleEdit} fullWidth>
                Edit Plans
              </Button>
            </div>
          </>
        )}
      </Container>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </section>
  );
}
