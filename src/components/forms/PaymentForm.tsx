import React, { useState, useEffect } from 'react';
import { Payment } from '../../types/finance';
import { fetchStudents } from '../../services/student/queries';
import { PAYMENT_TYPES } from '../../constants/financeTypes';
import { PAYMENT_STATUS } from '../../constants/paymentStatus';
import { Student } from '../../services/student/types';

interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (data: Omit<Payment, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function PaymentForm({ payment, onSubmit, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    student_id: payment?.student_id || '',
    amount: payment?.amount || 0,
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    payment_type: payment?.payment_type || '',
    status: payment?.status || 'COMPLETED'
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const data = await fetchStudents();
    // Group students by base matricule to show each student only once
    const uniqueStudents = data.reduce((acc, student) => {
      const baseMatricule = student.matricule.replace('-AR', '');
      if (!acc[baseMatricule]) {
        acc[baseMatricule] = student;
      }
      return acc;
    }, {} as Record<string, Student>);
    
    setStudents(Object.values(uniqueStudents));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.student_id || !formData.amount || !formData.payment_type) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      await onSubmit(formData);
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
        <label className="block text-sm font-medium text-gray-700">Élève</label>
        <select
          value={formData.student_id}
          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner un élève</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.matricule} - {student.first_name} {student.last_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de paiement</label>
        <select
          value={formData.payment_type}
          onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner le type</option>
          {PAYMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {payment && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Statut</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            {PAYMENT_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      )}

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
          value={formData.payment_date}
          onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
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
          {payment ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}