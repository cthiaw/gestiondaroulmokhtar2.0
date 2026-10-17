import React, { useState, useEffect } from 'react';
import { Subject } from '../../types/grades';
import { fetchSubjects } from '../../services/subjectService';
import { saveGrade } from '../../services/gradeService';
import { AbsenceField } from './AbsenceField';
import { useSchoolYear } from '../../contexts/SchoolYearContext';
import { findClassId, fetchGradingScales, saveGradingScales, GradingScales } from '../../services/gradingScaleService';

interface GradeFormProps {
  studentId: string;
  onSuccess: () => void;
  onCancel: () => void;
  classType: string;
  level: string;
}

interface FormData {
  subject_id: string;
  trimester: number;
  score: string;
  max_score: string;
}

export function GradeForm({ studentId, onSuccess, onCancel, classType, level }: GradeFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState<FormData>({
    subject_id: '',
    trimester: 1,
    score: '',
    max_score: '20'
  });
  const [error, setError] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [scales, setScales] = useState<GradingScales>({});
  const { selectedYear } = useSchoolYear();
  const yearId = selectedYear?.id;

  useEffect(() => {
    loadSubjects();
  }, [classType]);

  useEffect(() => {
    loadScales();
  }, [level, classType, yearId]);

  async function loadSubjects() {
    const { data } = await fetchSubjects(classType);
    setSubjects(data);
  }

  // The class's scales, set by its maître or maîtresse
  async function loadScales() {
    if (!yearId) return;
    const id = await findClassId(level, classType);
    setClassId(id);
    setScales(id ? await fetchGradingScales(yearId, id) : {});
  }

  const subjectScale = formData.subject_id ? scales[formData.subject_id] : undefined;

  const handleSubjectChange = (subjectId: string) => {
    const scale = scales[subjectId];
    setFormData({ ...formData, subject_id: subjectId, max_score: scale ? String(scale) : '20' });
  };

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

    if (!Number.isInteger(maxScore) || maxScore <= 0) {
      setError('Le barème doit être un nombre entier supérieur à 0');
      return;
    }

    if (score < 0 || score > maxScore) {
      setError(`La note doit être comprise entre 0 et ${maxScore}`);
      return;
    }

    if (!selectedYear) {
      setError('Aucune année scolaire sélectionnée');
      return;
    }

    try {
      const { error: saveError } = await saveGrade({
        student_id: studentId,
        subject_id: formData.subject_id,
        trimester: formData.trimester,
        score,
        max_score: maxScore,
        school_year_id: selectedYear.id
      });
      if (saveError) throw saveError;

      // The first grade given in a subject sets the class's scale
      if (!subjectScale && classId) {
        try {
          await saveGradingScales(selectedYear.id, classId, { [formData.subject_id]: maxScore });
          setScales({ ...scales, [formData.subject_id]: maxScore });
        } catch (scaleError) {
          console.error('Error saving grading scale:', scaleError);
        }
      }

      setFormData(prev => ({
        ...prev,
        subject_id: '',
        score: '',
        max_score: '20'
      }));
      
      onSuccess();
    } catch (error) {
      setError('Échec de l\'enregistrement : la note n\'a pas été sauvegardée. Réessayez.');
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
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-brand-500 focus:ring-brand-500"
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
            className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-brand-500 focus:ring-brand-500"
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
              className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-brand-500 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notée sur</label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.max_score}
              onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-brand-500 focus:ring-brand-500 read-only:bg-slate-100"
              readOnly={!!subjectScale}
              required
            />
          </div>
        </div>
        {formData.subject_id && (
          <p className="text-sm text-slate-500">
            {subjectScale
              ? `Barème de la classe : sur ${subjectScale}. Il se modifie avec le bouton Barèmes.`
              : 'Pas encore de barème pour cette matière dans la classe : celui saisi ici deviendra le barème de la classe.'}
          </p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
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