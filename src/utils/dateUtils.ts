import { formatDisplayDate } from './dateValidation';

export function formatDate(dateString: string | null): string {
  // Handle the default placeholder value
  if (!dateString || dateString === 'XX/XX/XXXX') {
    return '-';
  }

  // If the date is already in DD/MM/YYYY format, return as is
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateString;
  }

  // Try to format the date
  try {
    return formatDisplayDate(dateString);
  } catch {
    return '-';
  }
}