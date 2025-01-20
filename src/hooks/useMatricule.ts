import { useState, useEffect } from 'react';
import { generateUniqueMatricule, isMatriculeUnique, MATRICULE_PREFIXES } from '../utils/matriculeUtils';

export function useMatricule(type: 'student' | 'teacher' | 'secretary' | 'guard', currentId?: string) {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateMatricule();
  }, [type]);

  async function generateMatricule() {
    try {
      setLoading(true);
      setError(null);
      
      const prefix = type === 'student' ? MATRICULE_PREFIXES.STUDENT :
                    type === 'teacher' ? MATRICULE_PREFIXES.TEACHER :
                    type === 'secretary' ? MATRICULE_PREFIXES.SECRETARY :
                    MATRICULE_PREFIXES.GUARD;
                    
      const newMatricule = await generateUniqueMatricule(prefix);
      setMatricule(newMatricule);
    } catch (err) {
      setError('Erreur lors de la génération du matricule');
      console.error('Error generating matricule:', err);
    } finally {
      setLoading(false);
    }
  }

  async function validateMatricule(value: string): Promise<boolean> {
    try {
      const table = type === 'student' ? 'students' : 'teachers';
      return await isMatriculeUnique(value, table, currentId);
    } catch (err) {
      console.error('Error validating matricule:', err);
      return false;
    }
  }

  return {
    matricule,
    loading,
    error,
    validateMatricule,
    generateMatricule
  };
}