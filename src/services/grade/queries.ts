import { supabase } from '../../lib/supabase';
import { Grade } from './types';
import { calculateAverage } from './calculations';
import { getGeneralAppreciation } from './appreciation';

/**
 * Fetch grades for a student and trimester
 */
export async function fetchStudentGrades(studentId: string, trimester: number, schoolYearId: string) {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('student_id', studentId)
      .eq('trimester', trimester)
      .eq('school_year_id', schoolYearId);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching grades:', error);
    return { data: [], error };
  }
}

/**
 * Generate report card data
 */
export async function generateReportCard(studentId: string, trimester: number, schoolYearId: string) {
  try {
    const { data: studentRow } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    // The level shown is the student's level in that school year
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('level, school_year:school_years(label)')
      .eq('student_id', studentId)
      .eq('school_year_id', schoolYearId)
      .maybeSingle();

    const student = studentRow && enrollment ? { ...studentRow, level: enrollment.level } : studentRow;
    const schoolYear = enrollment?.school_year as unknown as { label: string } | null;

    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        subjects(*)
      `)
      .eq('student_id', studentId)
      .eq('trimester', trimester)
      .eq('school_year_id', schoolYearId);

    const { data: absences } = await supabase
      .from('absences')
      .select('*')
      .eq('student_id', studentId)
      .eq('trimester', trimester)
      .eq('school_year_id', schoolYearId)
      .maybeSingle();

    if (!student || !grades) {
      throw new Error('Student or grades not found');
    }

    const average = calculateAverage(grades);

    return {
      student,
      trimester,
      school_year_label: schoolYear?.label ?? '',
      grades: grades.map(grade => ({
        subject_name: grade.subjects.name,
        score: grade.score,
        maxScore: grade.max_score
      })),
      average: parseFloat(average.toFixed(2)),
      rank: 1, // TODO: Implement ranking
      total_students: 1, // TODO: Implement total students count
      absences: absences?.count || 0,
      appreciation: getGeneralAppreciation(average)
    };
  } catch (error) {
    console.error('Error generating report card:', error);
    throw error;
  }
}