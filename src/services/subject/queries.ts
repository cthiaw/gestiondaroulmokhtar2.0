import { supabase } from '../../lib/supabase';
import { Subject } from './types';
import { handleError } from '../../utils/errorHandling';

export async function fetchSubjects(classType?: string): Promise<Subject[]> {
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
    
    return data || [];
  } catch (error) {
    handleError('Error fetching subjects:', error);
    return [];
  }
}