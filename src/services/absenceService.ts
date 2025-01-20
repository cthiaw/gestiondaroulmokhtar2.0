import { supabase } from '../lib/supabase';

export interface Absence {
  id: string;
  student_id: string;
  semester: 1 | 2;
  count: number;
  created_at: string;
  updated_at: string;
}

export async function getStudentAbsences(studentId: string, semester: number) {
  try {
    // First try to get existing record
    const { data, error } = await supabase
      .from('absences')
      .select('*')
      .eq('student_id', studentId)
      .eq('semester', semester)
      .maybeSingle();

    if (error) throw error;

    // If no record exists, create one with count 0
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from('absences')
        .insert({
          student_id: studentId,
          semester,
          count: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return { data: newData, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error handling absences:', error);
    return { data: null, error };
  }
}

export async function updateAbsences(studentId: string, semester: number, count: number) {
  try {
    const { data, error } = await supabase
      .from('absences')
      .upsert({
        student_id: studentId,
        semester,
        count
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating absences:', error);
    return { data: null, error };
  }
}