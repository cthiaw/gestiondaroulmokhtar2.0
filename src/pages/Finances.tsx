import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
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
import { useSchoolYear } from '../contexts/SchoolYearContext';

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
  const { selectedYear, isCurrentYear } = useSchoolYear();
  // Past years can be viewed but not changed
  const readOnly = !isCurrentYear;
  const yearId = selectedYear?.id ?? '';

  useEffect(() => {
    if (!yearId) return;
    setLoading(true);
    Promise.all([loadPayments(), loadExpenses()]).then(() => setLoading(false));
  }, [yearId]);

  async function loadPayments() {
    const { data } = await fetchPayments(yearId);
    setPayments(data);
  }

  async function loadExpenses() {
    const { data } = await fetchExpenses(yearId);
    setExpenses(data);
  }

  const handlePaymentSubmit = async (data: Omit<Payment, 'id'>) => {
    const { error } = selectedPayment
      ? await updatePayment(selectedPayment.id, data)
      : await createPayment({ ...data, school_year_id: yearId });
    if (error) throw error;
    await loadPayments();
    paymentFormModal.closeModal();
    setSelectedPayment(null);
  };

  const handleExpenseSubmit = async (data: Omit<Expense, 'id'>) => {
    const { error } = selectedExpense
      ? await updateExpense(selectedExpense.id, data)
      : await createExpense({ ...data, school_year_id: yearId });
    if (error) throw error;
    await loadExpenses();
    expenseFormModal.closeModal();
    setSelectedExpense(null);
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    const { error } = await deletePayment(selectedPayment.id);
    if (error) {
      alert('La suppression du paiement a échoué. Veuillez réessayer.');
      return;
    }
    await loadPayments();
    deletePaymentModal.closeModal();
    setSelectedPayment(null);
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    const { error } = await deleteExpense(selectedExpense.id);
    if (error) {
      alert('La suppression de la dépense a échoué. Veuillez réessayer.');
      return;
    }
    await loadExpenses();
    deleteExpenseModal.closeModal();
    setSelectedExpense(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1 className="page-title mb-6">Gestion Financière · {selectedYear?.label}</h1>

      <FinanceSummary payments={payments} expenses={expenses} />

      <div className="space-y-8">
        <PaymentList
          payments={payments}
          readOnly={readOnly}
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
          readOnly={readOnly}
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