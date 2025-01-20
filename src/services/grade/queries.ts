import { supabase } from '../../lib/supabase';
import { Grade } from './types';
import { calculateAverage } from './calculations';
import { getGeneralAppreciation } from './appreciation';

/**
 * Fetch grades for a student and trimester
 */
export async function fetchStudentGrades(studentId: string, trimester: number) {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('student_id', studentId)
      .eq('trimester', trimester);

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
export async function generateReportCard(studentId: string, trimester: number) {
  try {
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        subjects(*)
      `)
      .eq('student_id', studentId)
      .eq('trimester', trimester);

    const { data: absences } = await supabase
      .from('absences')
      .select('*')
      .eq('student_id', studentId)
      .eq('trimester', trimester)
      .maybeSingle();

    if (!student || !grades) {
      throw new Error('Student or grades not found');
    }

    const average = calculateAverage(grades);

    return {
      student,
      trimester,
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