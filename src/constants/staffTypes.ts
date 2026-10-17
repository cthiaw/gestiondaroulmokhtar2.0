export const STAFF_TYPES = [
  { value: 'MAITRE', label: 'Maître / Maîtresse' },
  { value: 'SECRETAIRE', label: 'Secrétaire' },
  { value: 'GARDIEN', label: 'Gardien' }
];

export const GENDERS = [
  { value: 'M', label: 'Homme' },
  { value: 'F', label: 'Femme' }
];

/**
 * « Maître » for a man, « Maîtresse » for a woman.
 */
export function teacherTitle(gender?: string | null): string {
  if (gender === 'M') return 'Maître';
  if (gender === 'F') return 'Maîtresse';
  return 'Maître / Maîtresse';
}
