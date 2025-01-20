import { CreateClassDTO } from './types';
import { fetchClassStudents } from './students';

export class ClassValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClassValidationError';
  }
}

export function validateClassData(data: CreateClassDTO) {
  if (!data.name?.trim()) {
    throw new ClassValidationError('Le nom de la classe est requis');
  }

  if (!data.level?.trim()) {
    throw new ClassValidationError('Le niveau est requis');
  }

  if (!data.class_type?.trim()) {
    throw new ClassValidationError('Le type de classe est requis');
  }

  if (!data.teacher_id) {
    throw new ClassValidationError('Veuillez sélectionner un professeur');
  }
}

export async function canDeleteClass(level: string, classType: string): Promise<boolean> {
  const { studentCount } = await fetchClassStudents(level, classType);
  return studentCount === 0;
}