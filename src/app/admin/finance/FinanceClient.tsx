'use client';

import { useState } from 'react';
import type { FinanceProfile, FinanceExpense, MonthlyRecord } from './data';
import { monthlyTakeHome, monthlyRsu } from './data';
import { OverviewTab } from './OverviewTab';
import { BudgetTab } from './BudgetTab';
import { ProjectionsTab } from './ProjectionsTab';
import { ScenariosTab } from './ScenariosTab';
import { MonthlyTab } from './MonthlyTab';
import { ChatDrawer } from './ChatDrawer';

type Tab = 'overview' | 'budget' | 'projections' | 'scenarios' | 'monthly';

interface Props {
  initialProfile: FinanceProfile;
  initialExpenses: FinanceExpense[];
  initialMonthlyRecords: MonthlyRecord[];
  weddingTotal: number;
}

export function FinanceClient({ initialProfile, initialExpenses, initialMonthlyRecords, weddingTotal }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<FinanceProfile>(initialProfile);
  const [expenses, setExpenses] = useState<FinanceExpense[]>(initialExpenses);

  // Derived values
  const p1TakeHome = monthlyTakeHome(
    profile.partner1.grossSalary,
    profile.partner1.k401Pct,
    profile.partner1.salaryTaxRate
  );
  const p1Rsu = monthlyRsu(profile.partner1.rsuAnnual, profile.partner1.rsuTaxRate);
  const p2TakeHome = monthlyTakeHome(
    profile.partner2.grossSalary,
    profile.partner2.k401Pct,
    profile.partner2.salaryTaxRate
  );
  const combinedMonthly = p1TakeHome + p2TakeHome;
  const totalExpenses = expenses.filter((e) => e.active).reduce((s, e) => s + e.amount, 0);
  const availableToSave = combinedMonthly - totalExpenses;
  const savingsRate = combinedMonthly > 0 ? (availableToSave / combinedMonthly) * 100 : 0;

  // Net worth (shared across tabs)
  const p1_401k = profile.partner1.k401Balance ?? 0;
  const p2_401k = profile.partner2.k401Balance ?? 0;
  const p1Roth = profile.partner1.rothBalance ?? 0;
  const p2Roth = profile.partner2.rothBalance ?? 0;
  const rsuStock = profile.partner1.rsuStockBalance ?? 0;
  const totalAssets = profile.household.currentSavings + rsuStock + p1_401k + p2_401k + p1Roth + p2Roth;
  const totalDebt = (profile.household.debts ?? []).reduce((s, d) => s + d.balance, 0);
  const totalNetWorth = totalAssets - totalDebt;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'budget', label: 'Budget' },
    { id: 'projections', label: 'Projections' },
    { id: 'scenarios', label: 'Scenarios' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F1F5F9',
        color: '#0F172A',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          background: '#FFFFFF',
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <a
          href="/admin"
          style={{ color: '#94A3B8', fontSize: 13, textDecoration: 'none' }}
        >
          ← Admin
        </a>
        <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
        <h1 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0F172A', letterSpacing: '-0.01em' }}>
          Finance HQ
        </h1>

        {/* Tab bar */}
        <div style={{ marginLeft: 24, display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 18px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.15s',
                background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                color: activeTab === tab.id ? '#0F172A' : '#64748B',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        {activeTab === 'overview' && (
          <OverviewTab
            profile={profile}
            expenses={expenses}
            weddingTotal={weddingTotal}
            combinedMonthly={combinedMonthly}
            p1TakeHome={p1TakeHome}
            p1Rsu={p1Rsu}
            p2TakeHome={p2TakeHome}
            totalExpenses={totalExpenses}
            availableToSave={availableToSave}
            savingsRate={savingsRate}
            onProfileChange={setProfile}
          />
        )}
        {activeTab === 'monthly' && (
          <MonthlyTab
            profile={profile}
            expenses={expenses}
            initialRecords={initialMonthlyRecords}
            combinedMonthly={combinedMonthly}
            totalExpenses={totalExpenses}
            availableToSave={availableToSave}
            totalNetWorth={totalNetWorth}
            totalDebt={totalDebt}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetTab
            profile={profile}
            expenses={expenses}
            combinedMonthly={combinedMonthly}
            availableToSave={availableToSave}
            savingsRate={savingsRate}
            onProfileChange={setProfile}
            onExpensesChange={setExpenses}
          />
        )}
        {activeTab === 'projections' && (
          <ProjectionsTab
            profile={profile}
            availableToSave={availableToSave}
            weddingTotal={weddingTotal}
            onProfileChange={setProfile}
          />
        )}
        {activeTab === 'scenarios' && (
          <ScenariosTab
            profile={profile}
            weddingTotal={weddingTotal}
            availableToSave={availableToSave}
            onProfileChange={setProfile}
          />
        )}
      </div>

      {/* AI Chat — always visible */}
      <ChatDrawer
        profile={profile}
        expenses={expenses}
        combinedMonthly={combinedMonthly}
        totalExpenses={totalExpenses}
        availableToSave={availableToSave}
        totalNetWorth={totalNetWorth}
        totalDebt={totalDebt}
        weddingTotal={weddingTotal}
      />
    </div>
  );
}
