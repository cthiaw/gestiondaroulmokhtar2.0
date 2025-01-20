import { supabase } from '../../lib/supabase';
import { Class } from './types';
import { fetchClassStudents } from './students';

export async function fetchClasses(): Promise<Class[]> {
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

    // Fetch students for each class
    const classesWithStudents = await Promise.all(
      (classes || []).map(async (classItem) => {
        const { students, studentCount } = await fetchClassStudents(
          classItem.level,
          classItem.class_type
        );
        return {
          ...classItem,
          student_count: studentCount,
          students
        };
      })
    );

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