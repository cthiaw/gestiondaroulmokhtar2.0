import { supabase } from '../lib/supabase';
import { handleError } from '../utils/errorHandling';

export interface ScaleClass {
  id: string;
  level: string;
  class_type: string;
  teachers?: {
    first_name: string;
    last_name: string;
    gender?: string | null;
  } | null;
}

/** Scale of each subject (subject_id → max_score) */
export type GradingScales = Record<string, number>;

export async function fetchScaleClasses(): Promise<ScaleClass[]> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, level, class_type, teachers (first_name, last_name, gender)')
      .order('level');

    if (error) throw error;
    return (data || []) as unknown as ScaleClass[];
  } catch (error) {
    handleError('Error fetching classes:', error);
    return [];
  }
}

/**
 * The class a student belongs to in a year, found from their level and class type.
 */
export async function findClassId(level: string, classType: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('id')
    .eq('level', level)
    .eq('class_type', classType)
    .limit(1)
    .maybeSingle();

  if (error) {
    handleError('Error finding class:', error);
    return null;
  }
  return data?.id ?? null;
}

export async function fetchGradingScales(schoolYearId: string, classId: string): Promise<GradingScales> {
  try {
    const { data, error } = await supabase
      .from('grading_scales')
      .select('subject_id, max_score')
      .eq('school_year_id', schoolYearId)
      .eq('class_id', classId);

    if (error) throw error;
    return Object.fromEntries((data || []).map((row) => [row.subject_id, row.max_score]));
  } catch (error) {
    handleError('Error fetching grading scales:', error);
    return {};
  }
}

/**
 * Saves the scales of a class. A subject left empty has its scale removed.
 */
export async function saveGradingScales(
  schoolYearId: string,
  classId: string,
  scales: Record<string, number | null>
) {
  const toSave = Object.entries(scales)
    .filter(([, maxScore]) => maxScore !== null)
    .map(([subject_id, max_score]) => ({ school_year_id: schoolYearId, class_id: classId, subject_id, max_score }));
  const toRemove = Object.entries(scales)
    .filter(([, maxScore]) => maxScore === null)
    .map(([subjectId]) => subjectId);

  if (toSave.length > 0) {
    const { error } = await supabase
      .from('grading_scales')
      .upsert(toSave, { onConflict: 'school_year_id,class_id,subject_id' });
    if (error) throw error;
  }

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('grading_scales')
      .delete()
      .eq('school_year_id', schoolYearId)
      .eq('class_id', classId)
      .in('subject_id', toRemove);
    if (error) throw error;
  }
}

/**
 * Highest grade given in each subject (subject_id → score) to the students of a
 * class in a year, so a scale is never set below a grade already given.
 */
export async function fetchHighestScores(
  schoolYearId: string,
  level: string,
  classType: string
): Promise<Record<string, number>> {
  const { data: enrollments, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('school_year_id', schoolYearId)
    .eq('level', level)
    .eq('class_type', classType);
  if (enrollmentError) throw enrollmentError;

  const studentIds = (enrollments || []).map((row) => row.student_id);
  if (studentIds.length === 0) return {};

  const { data: grades, error } = await supabase
    .from('grades')
    .select('subject_id, score')
    .eq('school_year_id', schoolYearId)
    .in('student_id', studentIds);
  if (error) throw error;

  const highest: Record<string, number> = {};
  for (const grade of grades || []) {
    highest[grade.subject_id] = Math.max(highest[grade.subject_id] ?? 0, Number(grade.score));
  }
  return highest;
}
