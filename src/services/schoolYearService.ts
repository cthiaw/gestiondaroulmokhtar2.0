import { supabase } from '../lib/supabase';
import { handleError } from '../utils/errorHandling';
import type { Student } from '../types/student';

export interface SchoolYear {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export async function fetchSchoolYears(): Promise<SchoolYear[]> {
  try {
    const { data, error } = await supabase
      .from('school_years')
      .select('id, label, start_date, end_date, is_current')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError('Error fetching school years:', error);
    return [];
  }
}

interface EnrollmentRow {
  level: string;
  class_type: string;
  student: Omit<Student, 'level' | 'class_type'> & { archived_at: string | null };
}

/**
 * Students (French and Arabic records) enrolled in a school year, with the
 * level they have that year.
 */
export async function fetchStudentsForYear(schoolYearId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      level,
      class_type,
      student:students!inner (
        id, matricule, first_name, last_name, birth_date, gender, archived_at
      )
    `)
    .eq('school_year_id', schoolYearId)
    .is('student.archived_at', null);

  if (error) throw error;

  return ((data || []) as unknown as EnrollmentRow[])
    .map(({ level, class_type, student }) => ({
      id: student.id,
      matricule: student.matricule,
      first_name: student.first_name,
      last_name: student.last_name,
      birth_date: student.birth_date,
      gender: student.gender,
      level,
      class_type
    }))
    .sort((a, b) => a.last_name.localeCompare(b.last_name, 'fr'));
}

/**
 * Enrolls both records (French and Arabic) of a student in a school year.
 */
export async function enrollStudent(
  baseMatricule: string,
  schoolYearId: string,
  frenchLevel: string,
  arabicLevel: string
) {
  const { error } = await supabase.rpc('enroll_student', {
    p_base_matricule: baseMatricule,
    p_school_year_id: schoolYearId,
    p_french_level: frenchLevel,
    p_arabic_level: arabicLevel
  });

  if (error) throw error;
}
