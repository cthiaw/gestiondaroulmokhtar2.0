import { supabase } from '../../lib/supabase';
import { Class } from './types';
import { fetchClassStudents } from './students';
import { fetchStudentsForYear } from '../schoolYearService';

export async function fetchClasses(schoolYearId: string): Promise<Class[]> {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        teachers (
          first_name,
          last_name
        )
      `)
      .order('level');

    if (error) throw error;

    // One query for the whole year, then split by class
    const yearStudents = await fetchStudentsForYear(schoolYearId);
    const classesWithStudents = (classes || []).map((classItem) => {
      const students = yearStudents
        .filter((student) => student.level === classItem.level && student.class_type === classItem.class_type)
        .map(({ id, matricule, first_name, last_name }) => ({ id, matricule, first_name, last_name }));
      return {
        ...classItem,
        student_count: students.length,
        students
      };
    });

    return classesWithStudents;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}

export async function fetchClassById(id: string): Promise<Class | null> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        teachers (
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      const { students, studentCount } = await fetchClassStudents(
        data.level,
        data.class_type
      );
      return {
        ...data,
        student_count: studentCount,
        students
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching class:', error);
    return null;
  }
}