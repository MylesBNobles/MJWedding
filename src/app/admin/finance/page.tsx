export const dynamic = 'force-dynamic';

import { getFinanceData, getMonthlyRecords } from './actions';
import { FinanceClient } from './FinanceClient';

export default async function FinancePage() {
  const [{ profile, expenses, weddingTotal }, monthlyRecords] = await Promise.all([
    getFinanceData(),
    getMonthlyRecords(),
  ]);

  return (
    <FinanceClient
      initialProfile={profile}
      initialExpenses={expenses}
      initialMonthlyRecords={monthlyRecords}
      weddingTotal={weddingTotal}
    />
  );
}
