import React, { useState, useEffect } from 'react';
import { createStudent, updateStudent } from '../../services/studentService';
import { CLASS_LEVELS } from '../../constants/classLevels';
import { useMatricule } from '../../hooks/useMatricule';
import { Student, StudentFormData } from '../../types/student';
import { formatDisplayDate } from '../../utils/dateValidation';

interface StudentFormProps {
  student?: Student;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const { matricule, loading: matriculeLoading } = useMatricule('student', student?.id);
  const [formData, setFormData] = useState<StudentFormData>({
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    birth_date: student?.birth_date ? formatDisplayDate(student.birth_date) : '',
    gender: student?.gender || '',
    french_level: student?.level || 'CI',
    arabic_level: student?.level || 'CI',
    matricule: student?.matricule || ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!student && matricule && !matriculeLoading) {
      setFormData(prev => ({ ...prev, matricule }));
    }
  }, [student, matricule, matriculeLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (student?.id) {
        const { error: updateError } = await updateStudent(student.id, formData);
        if (updateError) throw updateError;
      } else {
        const { error: createError } = await createStudent(formData);
        if (createError) throw createError;
      }
      onSuccess();
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement');
      console.error('Error:', err);
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
        <label className="block text-sm font-medium text-gray-700">Matricule</label>
        <input
          type="text"
          value={formData.matricule}
          readOnly
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Prénom</label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date de naissance (JJ/MM/AAAA)</label>
        <input
          type="text"
          value={formData.birth_date}
          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
          placeholder="JJ/MM/AAAA"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Genre</label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Niveau Français</label>
        <select
          value={formData.french_level}
          onChange={(e) => setFormData({ ...formData, french_level: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner</option>
          {CLASS_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Niveau Arabe</label>
        <select
          value={formData.arabic_level}
          onChange={(e) => setFormData({ ...formData, arabic_level: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner</option>
          {CLASS_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
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
          {student ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}