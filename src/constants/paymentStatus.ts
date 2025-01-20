export const PAYMENT_STATUS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'COMPLETED', label: 'Complété' },
  { value: 'CANCELLED', label: 'Annulé' },
  { value: 'PARTIAL', label: 'Partiel' }
] as const;

export type PaymentStatus = typeof PAYMENT_STATUS[number]['value'];