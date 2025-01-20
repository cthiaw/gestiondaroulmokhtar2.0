import { supabase } from '../../lib/supabase';
import { CreateClassDTO, UpdateClassDTO } from './types';
import { validateClassData, canDeleteClass, ClassValidationError } from './validation';

// ... other functions remain the same ...

export async function deleteClass(id: string) {
  try {
    // First get the class details
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('level, class_type')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!classData) throw new Error('Classe non trouvée');

    // Check if class can be deleted
    const isDeletable = await canDeleteClass(classData.level, classData.class_type);
    if (!isDeletable) {
      throw new ClassValidationError('Impossible de supprimer une classe qui contient des élèves');
    }

    // If we can delete, proceed with deletion
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    return { error: null };
  } catch (error) {
    console.error('Error deleting class:', error);
    return { 
      error: error instanceof ClassValidationError 
        ? error.message 
        : 'Une erreur est survenue lors de la suppression'
    };
  }
}