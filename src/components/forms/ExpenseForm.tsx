import React, { useState, useEffect } from 'react';
import { Expense } from '../../services/financeService';
import { EXPENSE_TYPES } from '../../constants/financeTypes';
import { fetchTeachers, Teacher } from '../../services/teacherService';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: Omit<Expense, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    expense_type: expense?.expense_type || '',
    staff_id: expense?.staff_id || ''
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.expense_type === 'SALAIRE') {
      loadTeachers();
    }
  }, [formData.expense_type]);

  async function loadTeachers() {
    const { data } = await fetchTeachers();
    setTeachers(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.description || !formData.amount || !formData.expense_type) {
      setError('Tous les champs sont requis');
      return;
    }

    if (formData.expense_type === 'SALAIRE' && !formData.staff_id) {
      setError('Veuillez sélectionner un membre du personnel');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        staff_id: formData.expense_type === 'SALAIRE' ? formData.staff_id : null
      };
      await onSubmit(expenseData);
    } catch (error) {
      setError('Une erreur est survenue');
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de dépense</label>
        <select
          value={formData.expense_type}
          onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner le type</option>
          {EXPENSE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {formData.expense_type === 'SALAIRE' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Personnel</label>
          <select
            value={formData.staff_id}
            onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Sélectionner le personnel</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.matricule} - {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Montant</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={formData.expense_date}
          onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          {expense ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}