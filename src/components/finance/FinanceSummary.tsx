import React from 'react';
import { Receipt, CreditCard } from 'lucide-react';
import { Payment, Expense } from '../../types/finance';

interface FinanceSummaryProps {
  payments: Payment[];
  expenses: Expense[];
}

export function FinanceSummary({ payments, expenses }: FinanceSummaryProps) {
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalPayments - totalExpenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <div className="bg-green-50 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Recettes</p>
            <p className="mt-2 text-xl sm:text-3xl font-semibold text-gray-900">
              {totalPayments.toLocaleString()} FCFA
            </p>
          </div>
          <Receipt className="h-6 w-6 text-green-600" />
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Dépenses</p>
            <p className="mt-2 text-xl sm:text-3xl font-semibold text-gray-900">
              {totalExpenses.toLocaleString()} FCFA
            </p>
          </div>
          <CreditCard className="h-6 w-6 text-red-600" />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 sm:p-6 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Solde</p>
            <p className="mt-2 text-xl sm:text-3xl font-semibold text-gray-900">
              {balance.toLocaleString()} FCFA
            </p>
          </div>
          <Receipt className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}