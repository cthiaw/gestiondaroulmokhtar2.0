import { StudentFormData } from '../types/student';
import { validateAndTransformDate } from './dateValidation';

export function createStudentRecords(formData: StudentFormData) {
  const baseStudent = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    birth_date: formData.birth_date || 'XX/XX/XXXX',
    gender: formData.gender,
  };

  return {
    french: {
      ...baseStudent,
      level: formData.french_level,
      class_type: 'FRANCAIS',
      matricule: formData.matricule
    },
    arabic: {
      ...baseStudent,
      level: formData.arabic_level,
      class_type: 'ARABE',
      matricule: `${formData.matricule}-AR`
    }
  };
}