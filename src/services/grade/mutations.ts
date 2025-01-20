import { supabase } from '../../lib/supabase';
import { SaveGradeData } from './types';

/**
 * Save or update a grade
 */
export async function saveGrade(data: SaveGradeData) {
  try {
    const { data: grade, error } = await supabase
      .from('grades')
      .upsert([data], {
        onConflict: 'student_id,subject_id,trimester'
      })
      .select()
      .single();

    if (error) throw error;
    return { data: grade, error: null };
  } catch (error) {
    console.error('Error saving grade:', error);
    return { data: null, error };
  }
}

/**
 * Delete a grade
 */
export async function deleteGrade(id: string) {
  try {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting grade:', error);
    return { error };
  }
}