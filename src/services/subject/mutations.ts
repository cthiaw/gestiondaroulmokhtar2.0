import { supabase } from '../../lib/supabase';
import { CreateSubjectDTO, UpdateSubjectDTO } from './types';

export async function createSubject(data: CreateSubjectDTO) {
  const { data: subject, error } = await supabase
    .from('subjects')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return subject;
}

export async function updateSubject(data: UpdateSubjectDTO) {
  const { id, ...updateData } = data;
  const { data: subject, error } = await supabase
    .from('subjects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return subject;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}