import { supabase } from '../lib/supabase';
import { ClassStudent } from '../types/class';

export async function fetchClassStudents(level: string, classType: string): Promise<{
  students: ClassStudent[];
  studentCount: number;
}> {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, matricule, first_name, last_name')
      .eq('level', level)
      .eq('class_type', classType)
      .order('last_name');

    if (error) throw error;

    return {
      students: students || [],
      studentCount: students?.length || 0
    };
  } catch (error) {
    console.error('Error fetching class students:', error);
    return { students: [], studentCount: 0 };
  }
}