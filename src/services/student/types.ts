export interface StudentBase {
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender: string;
  level: string;
  class_type: string;
}

export interface Student extends StudentBase {
  id: string;
  matricule: string;
  created_at: string;
}

export interface CreateStudentDTO {
  french_level: string;
  arabic_level: string;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  gender: string;
  matricule: string;
}

export interface UpdateStudentDTO extends CreateStudentDTO {
  id: string;
}