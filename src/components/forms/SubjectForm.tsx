import React, { useState } from 'react';
import { Subject } from '../../types/grades';
import { createSubject, updateSubject } from '../../services/subjectService';
import { CLASS_TYPES } from '../../constants/classTypes';

interface SubjectFormProps {
  subject?: Subject | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SubjectForm({ subject, onSuccess, onCancel }: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: subject?.name || '',
    class_type: subject?.class_type || ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.class_type) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      if (subject?.id) {
        await updateSubject(subject.id, formData);
      } else {
        await createSubject(formData);
      }
      onSuccess();
    } catch (err) {
      setError('Une erreur est survenue');
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
        <label className="block text-sm font-medium text-gray-700">Nom de la matière</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de classe</label>
        <select
          value={formData.class_type}
          onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner le type</option>
          {CLASS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
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
          {subject ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}