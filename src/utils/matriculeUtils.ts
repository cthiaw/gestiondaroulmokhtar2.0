import { supabase } from '../lib/supabase';

export const MATRICULE_PREFIXES = {
  STUDENT: 'ELDM',
  TEACHER: 'ENDM',
  SECRETARY: 'SCDM',
  GUARD: 'GADM'
} as const;

export async function generateUniqueMatricule(prefix: string): Promise<string> {
  // Get the latest matricule for this prefix
  const { data } = await supabase
    .from(prefix === MATRICULE_PREFIXES.STUDENT ? 'students' : 'teachers')
    .select('matricule')
    .ilike('matricule', `${prefix}%`)
    .order('matricule', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  
  if (data && data.length > 0) {
    const lastMatricule = data[0].matricule;
    // Extract just the numeric part without any year prefix
    const numericPart = lastMatricule.replace(prefix, '');
    const lastNumber = parseInt(numericPart, 10);
    nextNumber = lastNumber + 1;
  }

  // Format: PREFXXXX (where X is a number starting from 0001)
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

export async function isMatriculeUnique(matricule: string, table: 'students' | 'teachers', currentId?: string): Promise<boolean> {
  let query = supabase
    .from(table)
    .select('id')
    .eq('matricule', matricule);
    
  if (currentId) {
    query = query.neq('id', currentId);
  }

  const { data } = await query;
  return !data || data.length === 0;
}