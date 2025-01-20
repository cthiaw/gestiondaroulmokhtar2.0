import { useState, useCallback } from 'react';
import { Class } from '../services/class/types';
import { fetchClasses } from '../services/class/queries';
import { deleteClass as removeClass } from '../services/class/mutations';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClasses();
      setClasses(data);
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Une erreur est survenue lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClass = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await removeClass(id);
      
      if (deleteError) {
        setError(deleteError);
        return { error: deleteError };
      }
      
      return { error: null };
    } catch (err) {
      const errorMessage = 'Une erreur est survenue lors de la suppression de la classe';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  return {
    classes,
    selectedClass,
    setSelectedClass,
    loading,
    error,
    loadClasses,
    deleteClass
  };
}