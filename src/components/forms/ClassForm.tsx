import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CLASS_LEVELS } from '../../constants/classLevels';
import { CLASS_TYPES } from '../../constants/classTypes';
import { Class } from '../../types/class';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

interface ClassFormProps {
  classItem?: Class;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClassForm({ classItem, onSuccess, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState({
    level: classItem?.level || '',
    class_type: classItem?.class_type || '',
    teacher_id: classItem?.teacher_id || '',
    name: ''
  });
  const [customLevel, setCustomLevel] = useState('');
  const [useCustomLevel, setUseCustomLevel] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
    // Check if current level is custom
    if (classItem?.level && !CLASS_LEVELS.some(l => l.value === classItem.level)) {
      setUseCustomLevel(true);
      setCustomLevel(classItem.level);
    }
  }, [classItem]);

  async function fetchTeachers() {
    try {
      const { data } = await supabase
        .from('teachers')
        .select('id, first_name, last_name')
        .eq('staff_type', 'PROFESSEUR')
        .order('last_name');
      if (data) setTeachers(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const level = useCustomLevel ? customLevel : formData.level;
      
      if (!level) {
        setError('Le niveau est requis');
        return;
      }

      // Generate name from level and class type
      const name = `${level}-${formData.class_type}`;
      const dataToSubmit = { 
        ...formData, 
        name,
        level: level
      };

      if (classItem?.id) {
        await supabase
          .from('classes')
          .update(dataToSubmit)
          .eq('id', classItem.id);
      } else {
        await supabase
          .from('classes')
          .insert([dataToSubmit]);
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue lors de l\'enregistrement');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Niveau</label>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useCustomLevel}
            onChange={(e) => setUseCustomLevel(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-600">Utiliser un niveau personnalisé</span>
        </div>
        
        {useCustomLevel ? (
          <input
            type="text"
            value={customLevel}
            onChange={(e) => setCustomLevel(e.target.value.toUpperCase())}
            placeholder="Entrez le niveau (ex: 6EME)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        ) : (
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
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
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de classe</label>
        <select
          value={formData.class_type}
          onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner</option>
          {CLASS_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Professeur</label>
        <select
          value={formData.teacher_id}
          onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Sélectionner</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.first_name} {teacher.last_name}
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
          {classItem ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}