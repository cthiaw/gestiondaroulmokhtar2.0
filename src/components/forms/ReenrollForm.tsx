import React, { useEffect, useMemo, useState } from 'react';
import { CLASS_LEVELS } from '../../constants/classLevels';
import { useSchoolYear } from '../../contexts/SchoolYearContext';
import { enrollStudent, fetchStudentsForYear, SchoolYear } from '../../services/schoolYearService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Student } from '../../types/student';

interface ReenrollFormProps {
  targetYear: SchoolYear;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Candidate {
  baseMatricule: string;
  first_name: string;
  last_name: string;
  previousFrench: string;
  previousArabic: string;
  french_level: string;
  arabic_level: string;
  selected: boolean;
}

const LAST_LEVEL = CLASS_LEVELS[CLASS_LEVELS.length - 1].value;

function nextLevel(level: string): string {
  const index = CLASS_LEVELS.findIndex((item) => item.value === level);
  if (index === -1) return level;
  return CLASS_LEVELS[Math.min(index + 1, CLASS_LEVELS.length - 1)].value;
}

function toCandidates(students: Student[], alreadyEnrolled: Set<string>): Candidate[] {
  const byMatricule = new Map<string, { french?: Student; arabic?: Student }>();
  for (const student of students) {
    const base = student.matricule.replace('-AR', '');
    if (alreadyEnrolled.has(base)) continue;
    const entry = byMatricule.get(base) || {};
    if (student.matricule.endsWith('-AR')) entry.arabic = student;
    else entry.french = student;
    byMatricule.set(base, entry);
  }

  return Array.from(byMatricule.entries())
    .map(([baseMatricule, { french, arabic }]) => {
      const student = (french || arabic)!;
      const previousFrench = french?.level || arabic?.level || 'CI';
      const previousArabic = arabic?.level || french?.level || 'CI';
      return {
        baseMatricule,
        first_name: student.first_name,
        last_name: student.last_name,
        previousFrench,
        previousArabic,
        french_level: nextLevel(previousFrench),
        arabic_level: nextLevel(previousArabic),
        // A student who finished CM2 has most likely left the school
        selected: previousFrench !== LAST_LEVEL
      };
    })
    .sort((a, b) => a.last_name.localeCompare(b.last_name, 'fr'));
}

export function ReenrollForm({ targetYear, onSuccess, onCancel }: ReenrollFormProps) {
  const { years } = useSchoolYear();
  const sourceYears = useMemo(
    () => years.filter((year) => year.start_date < targetYear.start_date),
    [years, targetYear]
  );
  const [sourceYearId, setSourceYearId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Start from the most recent previous year that has students to re-enroll
  useEffect(() => {
    let cancelled = false;
    async function pickDefaultSource() {
      setLoading(true);
      const enrolled = await loadEnrolledInTarget();
      for (const year of sourceYears) {
        const list = toCandidates(await fetchStudentsForYear(year.id), enrolled);
        if (list.length > 0) {
          if (!cancelled) {
            setSourceYearId(year.id);
            setCandidates(list);
            setLoading(false);
          }
          return;
        }
      }
      if (!cancelled) {
        setSourceYearId(sourceYears[0]?.id ?? null);
        setCandidates([]);
        setLoading(false);
      }
    }
    pickDefaultSource().catch((err) => {
      console.error('Error loading students to re-enroll:', err);
      if (!cancelled) {
        setError('Impossible de charger les élèves. Réessayez.');
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sourceYears, targetYear.id]);

  async function loadEnrolledInTarget(): Promise<Set<string>> {
    const students = await fetchStudentsForYear(targetYear.id);
    return new Set(students.map((student) => student.matricule.replace('-AR', '')));
  }

  async function changeSourceYear(id: string) {
    setSourceYearId(id);
    setLoading(true);
    setError('');
    try {
      const enrolled = await loadEnrolledInTarget();
      setCandidates(toCandidates(await fetchStudentsForYear(id), enrolled));
    } catch (err) {
      console.error('Error loading students to re-enroll:', err);
      setError('Impossible de charger les élèves. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  const updateCandidate = (baseMatricule: string, changes: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((item) => (item.baseMatricule === baseMatricule ? { ...item, ...changes } : item))
    );
  };

  const selectedCount = candidates.filter((item) => item.selected).length;
  const allSelected = candidates.length > 0 && selectedCount === candidates.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const failed: string[] = [];
    for (const item of candidates.filter((candidate) => candidate.selected)) {
      try {
        await enrollStudent(item.baseMatricule, targetYear.id, item.french_level, item.arabic_level);
      } catch (err) {
        console.error('Error re-enrolling student:', err);
        failed.push(`${item.first_name} ${item.last_name}`);
      }
    }

    setSaving(false);
    if (failed.length > 0) {
      setError(`La réinscription a échoué pour : ${failed.join(', ')}. Réessayez.`);
      const enrolled = await loadEnrolledInTarget();
      setCandidates((prev) => prev.filter((item) => !enrolled.has(item.baseMatricule)));
      return;
    }
    onSuccess();
  };

  if (sourceYears.length === 0) {
    return <p className="text-sm text-slate-600">Aucune année précédente à partir de laquelle réinscrire.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 p-3 text-red-600">{error}</div>}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Élèves inscrits en</label>
          <select
            value={sourceYearId ?? ''}
            onChange={(e) => changeSourceYear(e.target.value)}
            className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
          >
            {sourceYears.map((year) => (
              <option key={year.id} value={year.id}>{year.label}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-slate-500">
          Le niveau proposé est le niveau suivant ; modifiez-le pour un redoublement.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : candidates.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Tous les élèves de cette année sont déjà inscrits en {targetYear.label}.
        </p>
      ) : (
        <div className="max-h-[55vh] overflow-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) =>
                      setCandidates((prev) => prev.map((item) => ({ ...item, selected: e.target.checked })))
                    }
                    aria-label="Tout sélectionner"
                  />
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Élève</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Niveau Français</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Niveau Arabe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {candidates.map((item) => (
                <tr key={item.baseMatricule} className={item.selected ? '' : 'opacity-60'}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => updateCandidate(item.baseMatricule, { selected: e.target.checked })}
                      aria-label={`Réinscrire ${item.first_name} ${item.last_name}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span className="font-medium">{item.last_name} {item.first_name}</span>
                    <span className="ml-2 text-xs text-slate-500">{item.baseMatricule}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <LevelSelect
                      previous={item.previousFrench}
                      value={item.french_level}
                      onChange={(value) => updateCandidate(item.baseMatricule, { french_level: value })}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <LevelSelect
                      previous={item.previousArabic}
                      value={item.arabic_level}
                      onChange={(value) => updateCandidate(item.baseMatricule, { arabic_level: value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={saving || selectedCount === 0}>
          {saving ? 'Réinscription…' : `Réinscrire ${selectedCount} élève(s)`}
        </button>
      </div>
    </form>
  );
}

interface LevelSelectProps {
  previous: string;
  value: string;
  onChange: (value: string) => void;
}

function LevelSelect({ previous, value, onChange }: LevelSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">{previous} →</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border-gray-300 py-1 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
      >
        {CLASS_LEVELS.map((level) => (
          <option key={level.value} value={level.value}>{level.label}</option>
        ))}
      </select>
    </div>
  );
}
