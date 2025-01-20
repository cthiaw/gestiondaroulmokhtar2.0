import React, { useState, useEffect } from 'react';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { useModal } from '../hooks/useModal';
import { PaymentForm } from '../components/forms/PaymentForm';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { 
  fetchPayments,
  fetchExpenses,
  createPayment,
  createExpense,
  updatePayment,
  updateExpense,
  deletePayment,
  deleteExpense
} from '../services/financeService';
import { Payment, Expense } from '../types/finance';
import { PaymentList } from '../components/finance/PaymentList';
import { ExpenseList } from '../components/finance/ExpenseList';
import { FinanceSummary } from '../components/finance/FinanceSummary';

export function Finances() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  const paymentFormModal = useModal();
  const expenseFormModal = useModal();
  const deletePaymentModal = useModal();
  const deleteExpenseModal = useModal();

  useEffect(() => {
    Promise.all([loadPayments(), loadExpenses()]).then(() => setLoading(false));
  }, []);

  async function loadPayments() {
    const { data } = await fetchPayments();
    setPayments(data);
  }

  async function loadExpenses() {
    const { data } = await fetchExpenses();
    setExpenses(data);
  }

  const handlePaymentSubmit = async (data: Omit<Payment, 'id'>) => {
    if (selectedPayment) {
      await updatePayment(selectedPayment.id, data);
    } else {
      await createPayment(data);
    }
    await loadPayments();
    paymentFormModal.closeModal();
    setSelectedPayment(null);
  };

  const handleExpenseSubmit = async (data: Omit<Expense, 'id'>) => {
    if (selectedExpense) {
      await updateExpense(selectedExpense.id, data);
    } else {
      await createExpense(data);
    }
    await loadExpenses();
    expenseFormModal.closeModal();
    setSelectedExpense(null);
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    await deletePayment(selectedPayment.id);
    await loadPayments();
    deletePaymentModal.closeModal();
    setSelectedPayment(null);
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    await deleteExpense(selectedExpense.id);
    await loadExpenses();
    deleteExpenseModal.closeModal();
    setSelectedExpense(null);
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion Financière</h1>

      <FinanceSummary payments={payments} expenses={expenses} />

      <div className="space-y-8">
        <PaymentList
          payments={payments}
          onAdd={() => {
            setSelectedPayment(null);
            paymentFormModal.openModal();
          }}
          onEdit={(payment) => {
            setSelectedPayment(payment);
            paymentFormModal.openModal();
          }}
          onDelete={(payment) => {
            setSelectedPayment(payment);
            deletePaymentModal.openModal();
          }}
        />

        <ExpenseList
          expenses={expenses}
          onAdd={() => {
            setSelectedExpense(null);
            expenseFormModal.openModal();
          }}
          onEdit={(expense) => {
            setSelectedExpense(expense);
            expenseFormModal.openModal();
          }}
          onDelete={(expense) => {
            setSelectedExpense(expense);
            deleteExpenseModal.openModal();
          }}
        />
      </div>

      <Modal
        isOpen={paymentFormModal.isOpen}
        onClose={paymentFormModal.closeModal}
        title={selectedPayment ? 'Modifier un paiement' : 'Nouveau paiement'}
      >
        <PaymentForm
          payment={selectedPayment || undefined}
          onSubmit={handlePaymentSubmit}
          onCancel={paymentFormModal.closeModal}
        />
      </Modal>

      <Modal
        isOpen={expenseFormModal.isOpen}
        onClose={expenseFormModal.closeModal}
        title={selectedExpense ? 'Modifier une dépense' : 'Nouvelle dépense'}
      >
        <ExpenseForm
          expense={selectedExpense || undefined}
          onSubmit={handleExpenseSubmit}
          onCancel={expenseFormModal.closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deletePaymentModal.isOpen}
        onClose={deletePaymentModal.closeModal}
        onConfirm={handleDeletePayment}
        title="Supprimer le paiement"
        message="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
      />

      <ConfirmDialog
        isOpen={deleteExpenseModal.isOpen}
        onClose={deleteExpenseModal.closeModal}
        onConfirm={handleDeleteExpense}
        title="Supprimer la dépense"
        message="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible."
      />
    </div>
  );
}