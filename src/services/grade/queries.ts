import { supabase } from '../../lib/supabase';
import { calculateAverage } from './calculations';
import { getGeneralAppreciation } from './appreciation';
import { findClassId, fetchGradingScales } from '../gradingScaleService';

/**
 * Replaces each grade's max_score with the scale set by the class's maître or
 * maîtresse for that year. A subject without a scale (as in years before
 * scales existed) keeps the max_score the grade was given with.
 */
async function applyClassScales<T extends { subject_id: string; max_score: number }>(
  grades: T[],
  studentId: string,
  schoolYearId: string
): Promise<T[]> {
  if (grades.length === 0) return grades;

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('level, class_type')
    .eq('student_id', studentId)
    .eq('school_year_id', schoolYearId)
    .maybeSingle();
  if (!enrollment) return grades;

  const classId = await findClassId(enrollment.level, enrollment.class_type);
  if (!classId) return grades;

  const scales = await fetchGradingScales(schoolYearId, classId);
  return grades.map((grade) => ({ ...grade, max_score: scales[grade.subject_id] ?? grade.max_score }));
}

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
    return { data: await applyClassScales(data || [], studentId, schoolYearId), error: null };
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
      .select('level, school_year:school_years(label, average_out_of)')
      .eq('student_id', studentId)
      .eq('school_year_id', schoolYearId)
      .maybeSingle();

    const student = studentRow && enrollment ? { ...studentRow, level: enrollment.level } : studentRow;
    const schoolYear = enrollment?.school_year as unknown as { label: string; average_out_of: number } | null;
    const averageOutOf = schoolYear?.average_out_of ?? 20;

    const { data: gradeRows } = await supabase
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

    // Points are counted on the class's scales
    const grades = gradeRows ? await applyClassScales(gradeRows, studentId, schoolYearId) : null;

    if (!student || !grades) {
      throw new Error('Student or grades not found');
    }

    const average = calculateAverage(grades, averageOutOf);
    const totalScore = grades.reduce((sum, grade) => sum + Number(grade.score), 0);
    const totalMaxScore = grades.reduce((sum, grade) => sum + grade.max_score, 0);

    return {
      student,
      trimester,
      school_year_label: schoolYear?.label ?? '',
      grades: grades.map(grade => ({
        subject_name: grade.subjects.name,
        score: grade.score,
        maxScore: grade.max_score
      })),
      total_score: totalScore,
      total_max_score: totalMaxScore,
      average: parseFloat(average.toFixed(2)),
      average_out_of: averageOutOf,
      rank: 1, // TODO: Implement ranking
      total_students: 1, // TODO: Implement total students count
      absences: absences?.count || 0,
      appreciation: getGeneralAppreciation(average, averageOutOf)
    };
  } catch (error) {
    console.error('Error generating report card:', error);
    throw error;
  }
}