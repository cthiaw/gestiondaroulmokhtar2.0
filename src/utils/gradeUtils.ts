/**
 * Calculate the normalized score out of 20
 */
export function normalizeScore(score: number, maxScore: number): number {
  return (score / maxScore) * 20;
}

/**
 * Get appreciation based on score and max score
 */
export function getAppreciation(score: number, maxScore: number = 20): string {
  const normalizedScore = normalizeScore(score, maxScore);
  
  if (normalizedScore >= 18) return "Excellent";
  if (normalizedScore >= 16) return "Très Bien";
  if (normalizedScore >= 14) return "Bien";
  if (normalizedScore >= 12) return "Assez Bien";
  if (normalizedScore >= 10) return "Passable";
  return "Insuffisant";
}

/**
 * Get general appreciation based on average score (out of 20)
 */
export function getGeneralAppreciation(average: number): string {
  if (average >= 18) return "Excellent travail ! Continue ainsi !";
  if (average >= 16) return "Très bon travail, félicitations !";
  if (average >= 14) return "Bon travail, continue tes efforts !";
  if (average >= 12) return "Travail satisfaisant, peut encore progresser.";
  if (average >= 10) return "Résultats moyens, des efforts sont nécessaires.";
  return "Résultats insuffisants, un travail plus soutenu est indispensable.";
}