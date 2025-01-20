import { CreateStudentDTO } from './types';
import { validateAndTransformDate } from '../../utils/dateValidation';

export function createStudentRecords(data: CreateStudentDTO) {
  const baseStudent = {
    first_name: data.first_name,
    last_name: data.last_name,
    birth_date: validateAndTransformDate(data.birth_date),
    gender: data.gender,
  };

  return {
    french: {
      ...baseStudent,
      level: data.french_level,
      class_type: 'FRANCAIS',
      matricule: data.matricule
    },
    arabic: {
      ...baseStudent,
      level: data.arabic_level,
      class_type: 'ARABE',
      matricule: `${data.matricule}-AR`
    }
  };
}