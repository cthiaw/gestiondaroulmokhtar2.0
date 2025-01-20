export interface Subject {
  id: string;
  name: string;
  class_type: string;
}

export interface CreateSubjectDTO {
  name: string;
  class_type: string;
}

export interface UpdateSubjectDTO extends Partial<CreateSubjectDTO> {
  id: string;
}