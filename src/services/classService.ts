import { supabase } from '../lib/supabase';
import { Class, CreateClassData, UpdateClassData } from '../types/class';
import { fetchClassStudents } from './classStudentService';

export async function fetchClasses(): Promise<{ data: Class[]; error: any }> {
  try {
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        teachers (
          first_name,
          last_name
        )
      `)
      .order('level');

    if (classError) throw classError;

    const classesWithStudents = await Promise.all(
      (classes || []).map(async (classItem) => {
        const { students, studentCount } = await fetchClassStudents(classItem.level, classItem.class_type);
        return {
          ...classItem,
          student_count: studentCount,
          students
        };
      })
    );

    return { data: classesWithStudents, error: null };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { data: [], error };
  }
}

export async function createClass(classData: CreateClassData) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating class:', error);
    return { data: null, error };
  }
}

export async function updateClass(id: string, classData: UpdateClassData) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .update(classData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating class:', error);
    return { data: null, error };
  }
}

export async function deleteClass(id: string) {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting class:', error);
    return { error };
  }
}

export async function fetchClassById(id: string) {
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
      const { students, studentCount } = await fetchClassStudents(data.level, data.class_type);
      return {
        data: {
          ...data,
          student_count: studentCount,
          students
        },
        error: null
      };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error fetching class:', error);
    return { data: null, error };
  }
}