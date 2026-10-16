import React, { useState } from 'react';
import { Payment } from '../../types/finance';
import { PAYMENT_TYPES } from '../../constants/financeTypes';
import { PAYMENT_STATUS } from '../../constants/paymentStatus';
import { FileText } from 'lucide-react';
import { ReceiptViewer } from './ReceiptViewer';

interface PaymentListProps {
  payments: Payment[];
  onAdd: () => void;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export function PaymentList({ payments, onAdd, onEdit, onDelete }: PaymentListProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Paiements</h2>
        <button
          onClick={onAdd}
          className="btn-primary"
        >
          Nouveau Paiement
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Élève</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.student?.matricule} - {payment.student?.first_name} {payment.student?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {PAYMENT_TYPES.find(t => t.value === payment.payment_type)?.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {PAYMENT_STATUS.find(s => s.value === payment.status)?.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2 flex items-center">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        title="Voir reçu"
                      >
                        <FileText className="h-5 w-5" />
                        <span>Voir reçu</span>
                      </button>
                      <button
                        onClick={() => onEdit(payment)}
                        className="font-medium text-brand-700 hover:text-brand-900"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onDelete(payment)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPayment && (
        <ReceiptViewer
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}