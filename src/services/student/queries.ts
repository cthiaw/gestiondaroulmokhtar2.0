import { supabase } from '../../lib/supabase';
import { Student } from './types';
import { handleError } from '../../utils/errorHandling';
import { withRetry } from '../../utils/apiUtils';

export async function fetchStudents(): Promise<Student[]> {
  try {
    const { data, error } = await withRetry(() => 
      supabase
        .from('students')
        .select('id, matricule, first_name, last_name, birth_date, gender, level, class_type')
        .order('last_name')
    );

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError('Error fetching students:', error);
    return [];
  }
}