import { useState, useEffect } from 'react';
import { Student } from '../services/student/types';
import { fetchStudents } from '../services/student/queries';
import { useSchoolYear } from '../contexts/SchoolYearContext';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { selectedYear } = useSchoolYear();
  const yearId = selectedYear?.id;

  async function loadStudents() {
    if (!yearId) return;
    try {
      setLoading(true);
      const data = await fetchStudents(yearId);
      setStudents(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, [yearId]);

  return {
    students,
    loading,
    error,
    reloadStudents: loadStudents
  };
}