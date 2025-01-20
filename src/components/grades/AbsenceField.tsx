import React, { useState, useEffect } from 'react';
import { getStudentAbsences, createOrUpdateAbsences } from '../../services/absence';

interface AbsenceFieldProps {
  studentId: string;
  trimester: number;
  onSuccess: () => void;
}

export function AbsenceField({ studentId, trimester, onSuccess }: AbsenceFieldProps) {
  const [absences, setAbsences] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAbsences();
  }, [studentId, trimester]);

  async function loadAbsences() {
    setLoading(true);
    const data = await getStudentAbsences(studentId, trimester);
    if (data) {
      setAbsences(data.count);
    }
    setLoading(false);
  }

  const handleAbsenceChange = async (newCount: number) => {
    try {
      setError('');
      if (newCount < 0) {
        setError('Le nombre d\'absences ne peut pas être négatif');
        return;
      }

      setLoading(true);
      const success = await createOrUpdateAbsences({
        student_id: studentId,
        trimester,
        count: newCount
      });

      if (success) {
        setAbsences(newCount);
        onSuccess();
      } else {
        setError('Une erreur est survenue lors de la mise à jour des absences');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la mise à jour des absences');
      console.error('Error updating absences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre d'absences
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            min="0"
            value={absences}
            onChange={(e) => handleAbsenceChange(parseInt(e.target.value) || 0)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
            disabled={loading}
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}