import { supabase } from '../lib/supabase';
import { Subject } from '../types/grades';

export async function fetchSubjects(classType: string) {
  try {
    let query = supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (classType) {
      query = query.eq('class_type', classType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return { data: [], error };
  }
}

export async function createSubject(subject: Omit<Subject, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating subject:', error);
    return { data: null, error };
  }
}

export async function updateSubject(id: string, subject: Partial<Subject>) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update(subject)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating subject:', error);
    return { data: null, error };
  }
}

export async function deleteSubject(id: string) {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting subject:', error);
    return { error };
  }
}