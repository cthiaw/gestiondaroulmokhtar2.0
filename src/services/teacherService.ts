import { supabase } from '../lib/supabase';

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  matricule: string;
  staff_type: string;
}

export async function fetchTeachers() {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('last_name');

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return { data: [], error };
  }
}

export async function createTeacher(teacher: Omit<Teacher, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .insert([teacher])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating teacher:', error);
    return { data: null, error };
  }
}

export async function updateTeacher(id: string, teacher: Partial<Teacher>) {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .update(teacher)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating teacher:', error);
    return { data: null, error };
  }
}

export async function deleteTeacher(id: string) {
  try {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return { error };
  }
}