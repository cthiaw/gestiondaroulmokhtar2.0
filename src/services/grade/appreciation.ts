/**
 * Grade appreciation utilities
 */

/**
 * Calculate normalized score (0-20 scale)
 */
export function normalizeScore(score: number, maxScore: number): number {
  return maxScore > 0 ? (score / maxScore) * 20 : 0;
}

/**
 * Get appreciation based on score relative to max score
 */
export function getGradeAppreciation(score: number, maxScore: number): string {
  const normalizedScore = normalizeScore(score, maxScore);
  
  if (normalizedScore >= 18) return "Excellent";
  if (normalizedScore >= 16) return "Très Bien";
  if (normalizedScore >= 14) return "Bien";
  if (normalizedScore >= 12) return "Assez Bien";
  if (normalizedScore >= 10) return "Passable";
  return "Insuffisant";
}

/**
 * Get general appreciation for report card
 */
export function getGeneralAppreciation(average: number): string {
  if (average >= 18) return "Excellent travail ! Continue ainsi !";
  if (average >= 16) return "Très bon travail, félicitations !";
  if (average >= 14) return "Bon travail, continue tes efforts !";
  if (average >= 12) return "Travail satisfaisant, peut encore progresser.";
  if (average >= 10) return "Résultats moyens, des efforts sont nécessaires.";
  return "Résultats insuffisants, un travail plus soutenu est indispensable.";
}