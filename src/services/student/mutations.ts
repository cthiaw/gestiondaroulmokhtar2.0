import { supabase } from '../../lib/supabase';
import { CreateStudentDTO, UpdateStudentDTO } from './types';
import { createStudentRecords } from './utils';

export async function createStudent(data: CreateStudentDTO) {
  const { french, arabic } = createStudentRecords(data);
  
  const { error } = await supabase
    .from('students')
    .insert([french, arabic]);

  if (error) throw error;
}

export async function updateStudent(data: UpdateStudentDTO) {
  const { french, arabic } = createStudentRecords(data);
  const baseMatricule = data.matricule.replace('-AR', '');

  const { error } = await supabase.rpc('update_student', {
    p_id: data.id,
    p_base_matricule: baseMatricule,
    p_french_data: french,
    p_arabic_data: arabic
  });

  if (error) throw error;
}

export async function deleteStudent(matricule: string) {
  const baseMatricule = matricule.replace('-AR', '');
  
  const { error } = await supabase.rpc('delete_student', {
    base_matricule: baseMatricule
  });

  if (error) throw error;
}