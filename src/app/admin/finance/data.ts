export type DebtType = 'student_loan' | 'car' | 'credit_card' | 'personal' | 'mortgage' | 'other';

export type Debt = {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // annual %
  minimumPayment: number;
  type: DebtType;
};

export const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  student_loan: 'Student Loan',
  car: 'Car Loan',
  credit_card: 'Credit Card',
  personal: 'Personal Loan',
  mortgage: 'Mortgage',
  other: 'Other',
};

// Returns months to payoff given a fixed monthly payment
export function monthsToPayoff(balance: number, annualRate: number, monthlyPayment: number): number {
  if (balance <= 0) return 0;
  if (annualRate === 0) return Math.ceil(balance / monthlyPayment);
  const r = annualRate / 100 / 12;
  if (monthlyPayment <= balance * r) return Infinity;
  return Math.ceil(-Math.log(1 - (balance * r) / monthlyPayment) / Math.log(1 + r));
}

export function totalInterestPaid(balance: number, annualRate: number, monthlyPayment: number): number {
  const months = monthsToPayoff(balance, annualRate, monthlyPayment);
  if (!isFinite(months)) return Infinity;
  return Math.max(0, monthlyPayment * months - balance);
}

export type CustomScenario = {
  id: string;
  name: string;
  emoji: string;
  goalAmount: number;
  targetDate: string;
  savedSoFar: number;
};

export type FinanceProfile = {
  partner1: {
    name: string;
    age: number;
    grossSalary: number;
    k401Pct: number;
    k401Balance: number;
    rothMonthly: number;
    rsuAnnual: number;
    rsuTaxRate: number;
    salaryTaxRate: number;
    rsuStockBalance: number;
    rothBalance: number;
  };
  partner2: {
    name: string;
    age: number;
    grossSalary: number;
    k401Pct: number;
    k401Balance: number;
    rothMonthly: number;
    salaryTaxRate: number;
    rothBalance: number;
  };
  household: {
    currentSavings: number;
    taxRefundAnnual: number;
    spGrowthRate: number;
    rsuGrowthRate: number;
    cashSavingsPct: number;
    retirementAge: number;
    emergencyFund: number;
    debts?: Debt[];
    customScenarios?: CustomScenario[];
  };
};

export type MonthlyLineCategory = 'income' | 'essential' | 'important' | 'lifestyle' | 'savings';

export type MonthlyLineItem = {
  id: string;
  name: string;
  category: MonthlyLineCategory;
  plannedAmount: number;
  actualAmount: number | null;
};

export const MONTHLY_CATEGORY_CONFIG: Record<
  MonthlyLineCategory,
  { label: string; color: string; bg: string; description: string }
> = {
  income:    { label: 'Income',            color: '#059669', bg: 'rgba(5,150,105,0.08)',   description: 'All income sources' },
  essential: { label: 'Essential',         color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   description: 'Non-negotiable fixed costs' },
  important: { label: 'Important',         color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  description: 'Necessary but adjustable' },
  lifestyle: { label: 'Lifestyle',         color: '#6366F1', bg: 'rgba(99,102,241,0.08)',  description: 'Discretionary spending' },
  savings:   { label: 'Savings & Goals',   color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)', description: 'Where your leftover goes' },
};

export type MonthlyRecord = {
  id: string;
  month: string; // "2026-05"
  status: 'planned' | 'complete';
  lineItems: MonthlyLineItem[];
  netWorthSnapshot: number | null;
  debtSnapshot: number | null;
  notes: string | null;
  createdAt: string;
};

export function monthLabel(month: string): string {
  const [y, m] = month.split('-');
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function lineItemTotals(items: MonthlyLineItem[], category: MonthlyLineCategory) {
  const cat = items.filter((i) => i.category === category);
  return {
    planned: cat.reduce((s, i) => s + i.plannedAmount, 0),
    actual: cat.some((i) => i.actualAmount !== null)
      ? cat.reduce((s, i) => s + (i.actualAmount ?? i.plannedAmount), 0)
      : null,
  };
}

export type ExpenseTier = 'essential' | 'important' | 'lifestyle';

export type FinanceExpense = {
  id: string;
  name: string;
  amount: number;
  tier: ExpenseTier;
  active: boolean;
  sortOrder: number;
};

export const TIER_CONFIG: Record<
  ExpenseTier,
  { label: string; color: string; bg: string; description: string }
> = {
  essential: {
    label: 'Essential',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    description: 'Non-negotiable fixed costs',
  },
  important: {
    label: 'Important',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    description: 'Necessary but adjustable',
  },
  lifestyle: {
    label: 'Lifestyle',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.1)',
    description: 'Discretionary spending',
  },
};

export const DEFAULT_PROFILE: FinanceProfile = {
  partner1: {
    name: 'Myles',
    age: 24,
    grossSalary: 184500,
    k401Pct: 15,
    k401Balance: 0,
    rothMonthly: 0,
    rsuAnnual: 100000,
    rsuTaxRate: 43,
    salaryTaxRate: 37,
    rsuStockBalance: 70000,
    rothBalance: 0,
  },
  partner2: {
    name: 'Jeslin',
    age: 25,
    grossSalary: 64237,
    k401Pct: 15,
    k401Balance: 0,
    rothMonthly: 0,
    salaryTaxRate: 30,
    rothBalance: 0,
  },
  household: {
    currentSavings: 60000,
    taxRefundAnnual: 5000,
    spGrowthRate: 7,
    rsuGrowthRate: 10,
    cashSavingsPct: 80,
    retirementAge: 65,
    emergencyFund: 20000,
    debts: [
      {
        id: 'student-loan-1',
        name: 'Student Loans',
        balance: 20000,
        interestRate: 5.5,
        minimumPayment: 200,
        type: 'student_loan' as DebtType,
      },
    ],
    customScenarios: [],
  },
};

// Math helpers
export function monthlyTakeHome(
  gross: number,
  k401Pct: number,
  taxRate: number
): number {
  return (gross * (1 - k401Pct / 100) * (1 - taxRate / 100)) / 12;
}

export function monthlyRsu(rsuAnnual: number, taxRate: number): number {
  return (rsuAnnual * (1 - taxRate / 100)) / 12;
}

export function monthly401k(gross: number, k401Pct: number): number {
  return (gross * (k401Pct / 100)) / 12;
}

export function fmtDollar(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function fmtDollarFull(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}
