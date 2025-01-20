/**
 * Date validation and transformation utilities
 */

/**
 * Validates and transforms a date string to ISO format for the API
 */
export function validateAndTransformDate(date: string | null | undefined): string | null {
  if (!date || date.trim() === '') {
    return null;
  }

  try {
    // Handle DD/MM/YYYY format
    if (date.includes('/')) {
      const [day, month, year] = date.split('/');
      date = `${year}-${month}-${day}`;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return null;
    }

    // Validate date is not in the future
    if (parsedDate > new Date()) {
      return null;
    }

    // Return ISO date string
    return parsedDate.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Formats a date for display in DD/MM/YYYY format
 */
export function formatDisplayDate(date: string | null | undefined): string {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch {
    return '-';
  }
}