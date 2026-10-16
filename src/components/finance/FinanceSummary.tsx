import React from 'react';
import { Receipt, CreditCard, Scale } from 'lucide-react';
import { Payment, Expense } from '../../types/finance';
import { StatCard } from '../ui/StatCard';

interface FinanceSummaryProps {
  payments: Payment[];
  expenses: Expense[];
}

export function FinanceSummary({ payments, expenses }: FinanceSummaryProps) {
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalPayments - totalExpenses;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      <StatCard title="Total Recettes" value={`${totalPayments.toLocaleString()} FCFA`} icon={Receipt} color="brand" />
      <StatCard title="Total Dépenses" value={`${totalExpenses.toLocaleString()} FCFA`} icon={CreditCard} color="red" />
      <div className="sm:col-span-2 lg:col-span-1">
        <StatCard
          title="Solde"
          value={`${balance.toLocaleString()} FCFA`}
          icon={Scale}
          color={balance < 0 ? 'red' : 'blue'}
        />
      </div>
    </div>
  );
}
