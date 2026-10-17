import { useState, useEffect } from 'react';
import { fetchSubjects } from '../../services/subjectService';
import {
  fetchScaleClasses,
  fetchGradingScales,
  saveGradingScales,
  ScaleClass
} from '../../services/gradingScaleService';
import { useSchoolYear } from '../../contexts/SchoolYearContext';
import { CLASS_LEVELS } from '../../constants/classLevels';
import { CLASS_TYPES } from '../../constants/classTypes';
import { teacherTitle } from '../../constants/staffTypes';

interface GradingScaleEditorProps {
  onClose: () => void;
  readOnly?: boolean;
}

interface SubjectRow {
  id: string;
  name: string;
}

/**
 * Lets the class's maître or maîtresse set what each subject is graded on (sur 10, 20, 50…).
 */
export function GradingScaleEditor({ onClose, readOnly = false }: GradingScaleEditorProps) {
  const { selectedYear } = useSchoolYear();
  const yearId = selectedYear?.id;
  const [classes, setClasses] = useState<ScaleClass[]>([]);
  const [classId, setClassId] = useState('');
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchScaleClasses().then(setClasses);
  }, []);

  const selectedClass = classes.find((classItem) => classItem.id === classId);

  useEffect(() => {
    setError('');
    setSaved(false);
    if (!selectedClass || !yearId) {
      setSubjects([]);
      setValues({});
      return;
    }
    Promise.all([
      fetchSubjects(selectedClass.class_type),
      fetchGradingScales(yearId, selectedClass.id)
    ]).then(([{ data }, scales]) => {
      setSubjects(data);
      setValues(Object.fromEntries(
        data.map((subject: SubjectRow) => [subject.id, scales[subject.id] ? String(scales[subject.id]) : ''])
      ));
    });
  }, [classId, yearId, classes]);

  const getClassLabel = (classItem: ScaleClass) => {
    const level = CLASS_LEVELS.find((l) => l.value === classItem.level)?.label || classItem.level;
    const type = CLASS_TYPES.find((t) => t.value === classItem.class_type)?.label || classItem.class_type;
    return `${level} · ${type}`;
  };

  const handleSave = async () => {
    if (!selectedClass || !yearId) return;
    setError('');
    setSaved(false);

    const scales: Record<string, number | null> = {};
    for (const subject of subjects) {
      const raw = (values[subject.id] || '').trim();
      if (!raw) {
        scales[subject.id] = null;
        continue;
      }
      const maxScore = Number(raw);
      if (!Number.isInteger(maxScore) || maxScore <= 0) {
        setError(`Le barème de « ${subject.name.trim()} » doit être un nombre entier supérieur à 0`);
        return;
      }
      scales[subject.id] = maxScore;
    }

    try {
      setSaving(true);
      await saveGradingScales(yearId, selectedClass.id, scales);
      setSaved(true);
    } catch (err) {
      console.error('Error saving grading scales:', err);
      setError('Échec de l\'enregistrement : les barèmes n\'ont pas été sauvegardés. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Indiquez sur combien chaque matière est notée dans la classe. Les notes saisies ensuite
        reprennent ce barème, et la moyenne se calcule à partir du total des points.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">Classe</label>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
        >
          <option value="">Sélectionner une classe</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {getClassLabel(classItem)}
            </option>
          ))}
        </select>
        {selectedClass && (
          <p className="mt-1 text-sm text-slate-500">
            {teacherTitle(selectedClass.teachers?.gender)} :{' '}
            {selectedClass.teachers
              ? `${selectedClass.teachers.first_name} ${selectedClass.teachers.last_name}`
              : 'Non assigné'}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}
      {saved && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md">Barèmes enregistrés.</div>
      )}

      {selectedClass && (
        subjects.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune matière pour ce type de classe.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Matière</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Notée sur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-4 py-2">{subject.name}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={values[subject.id] ?? ''}
                        onChange={(e) => setValues({ ...values, [subject.id]: e.target.value })}
                        placeholder="ex. 20"
                        className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:opacity-50"
                        disabled={readOnly}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {readOnly && (
        <p className="text-sm text-slate-500">
          Année {selectedYear?.label} en lecture seule : les barèmes se modifient sur l'année en cours.
        </p>
      )}

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          Fermer
        </button>
        {!readOnly && (
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            disabled={!selectedClass || saving}
          >
            Enregistrer
          </button>
        )}
      </div>
    </div>
  );
}
