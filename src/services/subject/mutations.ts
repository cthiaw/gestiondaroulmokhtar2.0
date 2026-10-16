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
  // Archive instead of deleting so the grades given in this subject are kept
  const { error } = await supabase
    .from('subjects')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}