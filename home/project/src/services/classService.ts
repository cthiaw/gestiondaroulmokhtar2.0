import { supabase } from '../lib/supabase';

export interface Class {
  id: string;
  name: string;
  level: string;
  class_type: string;
  teacher_id: string | null;
  teachers?: {
    first_name: string;
    last_name: string;
  };
}

export async function fetchClasses() {
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
      .order('level');

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { data: [], error };
  }
}

export async function createClass(classData: Omit<Class, 'id'>) {
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

export async function updateClass(id: string, classData: Partial<Class>) {
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