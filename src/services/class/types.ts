export interface ClassBase {
  name: string;
  level: string;
  class_type: string;
  teacher_id?: string | null;
}

export interface Class extends ClassBase {
  id: string;
  created_at: string;
  teachers?: {
    first_name: string;
    last_name: string;
  };
  student_count?: number;
  students?: Array<{
    id: string;
    matricule: string;
    first_name: string;
    last_name: string;
  }>;
}

export interface CreateClassDTO extends ClassBase {}
export interface UpdateClassDTO extends Partial<ClassBase> {
  id: string;
}