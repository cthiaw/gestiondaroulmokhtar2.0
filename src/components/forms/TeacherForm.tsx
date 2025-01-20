import React, { useState, useEffect } from 'react';
import { createTeacher, updateTeacher, Teacher } from '../../services/teacherService';
import { STAFF_TYPES } from '../../constants/staffTypes';
import { useMatricule } from '../../hooks/useMatricule';

interface TeacherFormProps {
  teacher?: Teacher;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TeacherForm({ teacher, onSuccess, onCancel }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    first_name: teacher?.first_name || '',
    last_name: teacher?.last_name || '',
    matricule: teacher?.matricule || '',
    staff_type: teacher?.staff_type || ''
  });
  const [error, setError] = useState('');

  // Get the staff type for matricule generation
  const staffType = formData.staff_type === 'SECRETAIRE' ? 'secretary' :
                   formData.staff_type === 'GARDIEN' ? 'guard' : 'teacher';
                   
  const { matricule, loading: matriculeLoading, validateMatricule, generateMatricule } = 
    useMatricule(staffType as 'teacher' | 'secretary' | 'guard', teacher?.id);

  // Update matricule when staff type changes or on initial load
  useEffect(() => {
    if (!teacher && matricule && !matriculeLoading) {
      setFormData(prev => ({ ...prev, matricule }));
    }
  }, [teacher, matricule, matriculeLoading]);

  // Regenerate matricule when staff type changes
  useEffect(() => {
    if (!teacher && formData.staff_type) {
      generateMatricule();
    }
  }, [formData.staff_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name.trim() || !formData.last_name.trim() || 
        !formData.matricule.trim() || !formData.staff_type) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      // Validate matricule uniqueness
      const isUnique = await validateMatricule(formData.matricule);
      if (!isUnique) {
        setError('Ce matricule existe déjà');
        return;
      }

      if (teacher?.id) {
        const { error } = await updateTeacher(teacher.id, formData);
        if (error) throw error;
      } else {
        const { error } = await createTeacher(formData);
        if (error) throw error;
      }
      onSuccess();
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement');
      console.error('Erreur:', err);
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
        <label className="block text-sm font-medium text-gray-700">Type de personnel</label>
        <select
          value={formData.staff_type}
          onChange={(e) => setFormData({ ...formData, staff_type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner le type</option>
          {STAFF_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

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
          {teacher ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}