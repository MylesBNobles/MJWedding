'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  SectionHeader,
  Card,
  Button,
  Select,
  Badge,
  Toast,
  useToast,
} from '@/components';
import { GuestPlan } from '@/lib/types';
import { getPlans, getUpdatesSubscription, exportPlansToCSV, downloadCSV } from '@/lib/storage';
import { travelInfo } from '@/lib/mockData';

export default function AdminPage() {
  const [plans, setPlans] = useState<GuestPlan[]>([]);
  const [subscriberEmail, setSubscriberEmail] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    attendingStatus: '',
    arrivalAirport: '',
    lodgingArea: '',
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    setPlans(getPlans());
    const subscription = getUpdatesSubscription();
    setSubscriberEmail(subscription?.email || null);
  }, []);

  const filteredPlans = plans.filter((plan) => {
    if (filters.attendingStatus && plan.attendingStatus !== filters.attendingStatus) {
      return false;
    }
    if (filters.arrivalAirport && plan.arrivalAirport !== filters.arrivalAirport) {
      return false;
    }
    if (filters.lodgingArea && plan.lodgingArea !== filters.lodgingArea) {
      return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const csv = exportPlansToCSV();
    if (!csv) {
      showToast('No data to export');
      return;
    }
    downloadCSV('wedding-guest-plans.csv', csv);
    showToast('CSV exported');
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'yes', label: 'Attending' },
    { value: 'maybe', label: 'Maybe' },
    { value: 'no', label: 'Not Attending' },
  ];

  const airportOptions = [
    { value: '', label: 'All Airports' },
    ...travelInfo.airports.map((a) => ({
      value: a.code,
      label: a.code,
    })),
  ];

  const lodgingOptions = [
    { value: '', label: 'All Areas' },
    ...travelInfo.lodgingAreas.map((a) => ({
      value: a.name,
      label: a.name,
    })),
  ];

  const stats = {
    total: plans.length,
    attending: plans.filter((p) => p.attendingStatus === 'yes').length,
    maybe: plans.filter((p) => p.attendingStatus === 'maybe').length,
    notAttending: plans.filter((p) => p.attendingStatus === 'no').length,
    totalPartySize: plans
      .filter((p) => p.attendingStatus === 'yes')
      .reduce((acc, p) => acc + (p.partySize || 1), 0),
  };

  return (
    <section className="py-16">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <SectionHeader
            title="Admin Dashboard"
            subtitle="View and manage guest plans (dev mode)"
            className="mb-0"
          />
          <Badge variant="warning">Dev Only</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card padding="sm">
            <p className="text-sm text-muted">Total Responses</p>
            <p className="text-2xl font-semibold text-fg">{stats.total}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-muted">Attending</p>
            <p className="text-2xl font-semibold text-green-600">{stats.attending}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-muted">Maybe</p>
            <p className="text-2xl font-semibold text-yellow-600">{stats.maybe}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-muted">Not Attending</p>
            <p className="text-2xl font-semibold text-muted">{stats.notAttending}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-muted">Est. Guests</p>
            <p className="text-2xl font-semibold text-fg">{stats.totalPartySize}</p>
          </Card>
        </div>

        {/* Subscriber */}
        <Card className="mb-8" padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Newsletter Subscriber</p>
              <p className="font-medium text-fg">
                {subscriberEmail || 'No subscriber yet'}
              </p>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-full sm:w-auto">
              <Select
                label="Attending Status"
                options={statusOptions}
                value={filters.attendingStatus}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, attendingStatus: e.target.value }))
                }
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select
                label="Arrival Airport"
                options={airportOptions}
                value={filters.arrivalAirport}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, arrivalAirport: e.target.value }))
                }
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select
                label="Lodging Area"
                options={lodgingOptions}
                value={filters.lodgingArea}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, lodgingArea: e.target.value }))
                }
              />
            </div>
            <div className="ml-auto">
              <Button onClick={handleExportCSV}>Export CSV</Button>
            </div>
          </div>
        </Card>

        {/* Plans Table */}
        {plans.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted">No guest plans submitted yet.</p>
            <p className="text-sm text-muted mt-2">
              Plans will appear here when guests submit them on the /plans page.
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Party</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Arrival</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Lodging</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="border-b border-border hover:bg-border/30">
                    <td className="py-3 px-4 text-sm text-fg font-medium">{plan.name}</td>
                    <td className="py-3 px-4 text-sm text-muted">{plan.email}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          plan.attendingStatus === 'yes'
                            ? 'success'
                            : plan.attendingStatus === 'maybe'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {plan.attendingStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{plan.partySize || 1}</td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {plan.arrivalAirport || '-'}
                      {plan.arrivalDateTime && (
                        <span className="block text-xs">
                          {new Date(plan.arrivalDateTime).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {plan.lodgingName || plan.lodgingArea || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {new Date(plan.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredPlans.length === 0 && plans.length > 0 && (
          <Card className="text-center py-8 mt-4">
            <p className="text-muted">No plans match the current filters.</p>
          </Card>
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
