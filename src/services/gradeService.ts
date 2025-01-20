import { supabase } from '../lib/supabase';
import { Grade, SaveGradeData, ReportCardData } from './grade/types';
import { calculateAverage } from './grade/calculations';
import { getGeneralAppreciation } from './grade/appreciation';

export { saveGrade, deleteGrade } from './grade/mutations';
export { fetchStudentGrades, generateReportCard } from './grade/queries';
export { calculateAverage } from './grade/calculations';
export { getGradeAppreciation, getGeneralAppreciation } from './grade/appreciation';
export type { Grade, SaveGradeData, ReportCardData } from './grade/types';