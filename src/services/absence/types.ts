export interface Absence {
  id: string;
  student_id: string;
  trimester: number;
  count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAbsenceDTO {
  student_id: string;
  trimester: number;
  count: number;
}

export interface UpdateAbsenceDTO extends CreateAbsenceDTO {
  id: string;
}