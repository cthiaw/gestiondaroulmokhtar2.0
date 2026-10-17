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
  school_year_id: string;
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
  school_year_label: string;
  grades: Array<{
    subject_name: string;
    score: number;
    maxScore: number;
  }>;
  total_score: number;
  total_max_score: number;
  average: number;
  average_out_of: number;
  rank: number;
  total_students: number;
  absences: number;
  appreciation: string;
}