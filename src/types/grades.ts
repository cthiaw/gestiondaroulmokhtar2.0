export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  trimester: number;
  score: number;
  maxScore: number;
  subject?: {
    name: string;
  };
}

export interface ReportCardData {
  student: {
    matricule: string;
    first_name: string;
    last_name: string;
    level: string;
    class_type: string;
    birth_date: string;
  };
  trimester: 1 | 2 | 3;
  grades: Array<{
    subject_name: string;
    score: number;
    maxScore: number;
  }>;
  average: number;
  absences: number;
}