export interface StudentFormData {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  french_level: string;
  arabic_level: string;
  matricule: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  level: string;
  class_type: string;
  matricule: string;
}