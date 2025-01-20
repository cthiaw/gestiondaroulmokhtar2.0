import { useState, useCallback } from 'react';
import { Subject, fetchSubjects, createSubject, updateSubject, deleteSubject as removeSubject } from '../services/subject';
import { handleError } from '../utils/errorHandling';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (err) {
      handleError('Error loading subjects:', err);
      setError('Une erreur est survenue lors du chargement des matières');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (data: Omit<Subject, 'id'>) => {
    try {
      setError(null);
      await createSubject(data);
      await loadSubjects();
    } catch (err) {
      handleError('Error creating subject:', err);
      throw err;
    }
  };

  const handleUpdate = async (data: Subject) => {
    try {
      setError(null);
      await updateSubject(data);
      await loadSubjects();
    } catch (err) {
      handleError('Error updating subject:', err);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await removeSubject(id);
      await loadSubjects();
    } catch (err) {
      handleError('Error deleting subject:', err);
      throw err;
    }
  };

  return {
    subjects,
    selectedSubject,
    setSelectedSubject,
    loadSubjects,
    createSubject: handleCreate,
    updateSubject: handleUpdate,
    deleteSubject: handleDelete,
    loading,
    error
  };
}