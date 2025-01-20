import { useState, useEffect } from 'react';
import { Student } from '../services/student/types';
import { fetchStudents } from '../services/student/queries';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadStudents() {
    try {
      setLoading(true);
      const data = await fetchStudents();
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
  }, []);

  return {
    students,
    loading,
    error,
    reloadStudents: loadStudents
  };
}