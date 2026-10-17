/**
 * Grade calculation utilities
 */

/**
 * Average of a list of grades: points obtained over the sum of the scales,
 * brought to `outOf` (sur 10 or sur 20)
 */
export function calculateAverage(grades: Array<{ score: number; max_score: number }>, outOf = 20): number {
  if (grades.length === 0) return 0;

  const totalMaxScore = grades.reduce((sum, grade) => sum + grade.max_score, 0);
  const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);

  return totalMaxScore > 0 ? (totalScore / totalMaxScore) * outOf : 0;
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