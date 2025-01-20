import { supabase } from '../../lib/supabase';
import { Absence } from './types';
import { handleError } from '../../utils/errorHandling';

export async function getStudentAbsences(studentId: string, trimester: number): Promise<Absence | null> {
  try {
    const { data, error } = await supabase
      .from('absences')
      .select('*')
      .eq('student_id', studentId)
      .eq('trimester', trimester)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError('Error fetching absences:', error);
    return null;
  }
}