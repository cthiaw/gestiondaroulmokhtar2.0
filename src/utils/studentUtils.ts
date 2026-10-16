import { StudentFormData } from '../types/student';

export function createStudentRecords(formData: StudentFormData) {
  const baseStudent = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    birth_date: formData.birth_date.trim() || 'XX/XX/XXXX',
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

const BIRTH_DATE_PATTERN = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/[0-9]{4}$/;

/**
 * Converts a stored birth date (DD/MM/YYYY, YYYY-MM-DD or the XX/XX/XXXX
 * placeholder) to the DD/MM/YYYY value shown in the student form.
 */
export function toFormBirthDate(value: string | null | undefined): string {
  if (!value || value === 'XX/XX/XXXX') return '';
  if (BIRTH_DATE_PATTERN.test(value)) return value;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return '';
}

export function isValidBirthDateInput(value: string): boolean {
  return value.trim() === '' || BIRTH_DATE_PATTERN.test(value.trim());
}
