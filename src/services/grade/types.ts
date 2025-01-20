export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  trimester: number;
  score: number;
  max_score: number;
  subject?: {
    name: string;
  };
}

export interface SaveGradeData {
  student_id: string;
  subject_id: string;
  trimester: number;
  score: number;
  max_score: number;
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
  trimester: number;
  grades: Array<{
    subject_name: string;
    score: number;
    maxScore: number;
  }>;
  average: number;
  rank: number;
  total_students: number;
  absences: number;
  appreciation: string;
}