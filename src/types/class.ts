export interface ClassStudent {
  id: string;
  matricule: string;
  first_name: string;
  last_name: string;
}

export interface Class {
  id: string;
  name: string; // Add name field
  level: string;
  class_type: string;
  teacher_id: string | null;
  teachers?: {
    first_name: string;
    last_name: string;
  };
  student_count?: number;
  students?: ClassStudent[];
}

export interface CreateClassData {
  name: string; // Add name field
  level: string;
  class_type: string;
  teacher_id?: string | null;
}

export interface UpdateClassData {
  name?: string; // Add name field
  level?: string;
  class_type?: string;
  teacher_id?: string | null;
}