import { supabase } from '../../lib/supabase';
import { CreateAbsenceDTO } from './types';
import { handleError } from '../../utils/errorHandling';

export async function createOrUpdateAbsences(data: CreateAbsenceDTO): Promise<boolean> {
  try {
    // First try to get existing record
    const { data: existing } = await supabase
      .from('absences')
      .select('id')
      .eq('student_id', data.student_id)
      .eq('trimester', data.trimester)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('absences')
        .update({ count: data.count })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('absences')
        .insert([data]);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    handleError('Error updating absences:', error);
    return false;
  }
}