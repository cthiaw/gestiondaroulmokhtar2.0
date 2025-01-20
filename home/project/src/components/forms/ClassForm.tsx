import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CLASS_LEVELS } from '../../constants/classLevels';
import { CLASS_TYPES } from '../../constants/classTypes';
import { CLASS_NAMES } from '../../constants/classNames';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

interface ClassFormProps {
  classItem?: {
    id: string;
    name: string;
    level: string;
    class_type: string;
    teacher_id: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClassForm({ classItem, onSuccess, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState({
    name: classItem?.name || '',
    level: classItem?.level || '',
    class_type: classItem?.class_type || '',
    teacher_id: classItem?.teacher_id || ''
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      const { data } = await supabase
        .from('teachers')
        .select('id, first_name, last_name')
        .order('last_name');
      if (data) setTeachers(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (classItem?.id) {
        await supabase
          .from('classes')
          .update(formData)
          .eq('id', classItem.id);
      } else {
        await supabase
          .from('classes')
          .insert([formData]);
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom de la classe</label>
        <select
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Sélectionner</option>
          {CLASS_NAMES.map(name => (
            <option key={name.value} value={name.value}>
              {name.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Niveau</label>
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