import React, { useState, useEffect } from 'react';
import { Subject } from '../../types/grades';
import { fetchSubjects } from '../../services/subjectService';
import { saveGrade } from '../../services/gradeService';
import { AbsenceField } from './AbsenceField';

interface GradeFormProps {
  studentId: string;
  onSuccess: () => void;
  onCancel: () => void;
  classType: string;
}

interface FormData {
  subject_id: string;
  trimester: number;
  score: string;
  max_score: string;
}

export function GradeForm({ studentId, onSuccess, onCancel, classType }: GradeFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState<FormData>({
    subject_id: '',
    trimester: 1,
    score: '',
    max_score: '20'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubjects();
  }, [classType]);

  async function loadSubjects() {
    const { data } = await fetchSubjects(classType);
    setSubjects(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.subject_id || !formData.score || !formData.max_score) {
      setError('Tous les champs sont requis');
      return;
    }

    const score = parseFloat(formData.score);
    const maxScore = parseFloat(formData.max_score);

    if (isNaN(score) || isNaN(maxScore)) {
      setError('Les notes doivent être des nombres valides');
      return;
    }

    if (score < 0 || score > maxScore) {
      setError(`La note doit être comprise entre 0 et ${maxScore}`);
      return;
    }

    try {
      await saveGrade({
        student_id: studentId,
        subject_id: formData.subject_id,
        trimester: formData.trimester,
        score,
        max_score: maxScore
      });
      
      setFormData(prev => ({
        ...prev,
        subject_id: '',
        score: '',
        max_score: '20'
      }));
      
      onSuccess();
    } catch (error) {
      setError('Une erreur est survenue');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6 border-2 border-black rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Matière</label>
          <select
            value={formData.subject_id}
            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
            className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Sélectionner une matière</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Trimestre</label>
          <select
            value={formData.trimester}
            onChange={(e) => setFormData({ ...formData, trimester: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value={1}>Premier trimestre</option>
            <option value={2}>Deuxième trimestre</option>
            <option value={3}>Troisième trimestre</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Note</label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Note maximale</label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.max_score}
              onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-black rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border-2 border-indigo-600 rounded-md hover:bg-indigo-700 hover:border-indigo-700"
          >
            Enregistrer
          </button>
        </div>
      </form>

      <div className="border-t-2 border-black pt-6">
        <AbsenceField 
          studentId={studentId} 
          trimester={formData.trimester}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}