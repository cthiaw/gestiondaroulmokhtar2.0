import { supabase } from '../lib/supabase';
import { Student, StudentFormData } from '../types/student';
import { handleError } from '../utils/errorHandling';
import { createStudentRecords } from '../utils/studentUtils';

export async function fetchStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('last_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError('Error fetching students:', error);
    return [];
  }
}

export async function createStudent(formData: StudentFormData) {
  try {
    const { french, arabic } = createStudentRecords(formData);
    
    const { error } = await supabase
      .from('students')
      .insert([french, arabic]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    handleError('Error creating student:', error);
    return { error };
  }
}

export async function updateStudent(id: string, formData: StudentFormData) {
  try {
    const { data: currentStudent } = await supabase
      .from('students')
      .select('matricule')
      .eq('id', id)
      .single();

    if (!currentStudent) {
      throw new Error('Student not found');
    }

    const baseMatricule = currentStudent.matricule.replace('-AR', '');
    const { french, arabic } = createStudentRecords(formData);

    const { error } = await supabase.rpc('update_student', {
      p_id: id,
      p_base_matricule: baseMatricule,
      p_french_data: french,
      p_arabic_data: arabic
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    handleError('Error updating student:', error);
    return { error };
  }
}

export async function deleteStudent(id: string) {
  try {
    // First get the student's matricule
    const { data: student } = await supabase
      .from('students')
      .select('matricule')
      .eq('id', id)
      .single();

    if (!student) {
      throw new Error('Student not found');
    }

    // Get base matricule without -AR suffix
    const baseMatricule = student.matricule.replace('-AR', '');
    
    // Use the delete_student RPC function
    const { error } = await supabase.rpc('delete_student', {
      base_matricule: baseMatricule
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    handleError('Error deleting student:', error);
    return { error };
  }
}