/**
 * Grade calculation utilities
 */

/**
 * Calculate average score from a list of grades
 */
export function calculateAverage(grades: Array<{ score: number; max_score: number }>): number {
  if (grades.length === 0) return 0;

  const totalMaxScore = grades.reduce((sum, grade) => sum + grade.max_score, 0);
  const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);

  return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 20 : 0;
}

/**
 * Calculate class ranking for a student
 */
export async function calculateRanking(
  classId: string,
  studentId: string,
  trimester: number
): Promise<{ rank: number; totalStudents: number }> {
  // TODO: Implement actual ranking calculation
  return {
    rank: 1,
    totalStudents: 1
  };
}