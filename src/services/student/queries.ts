import { Student } from './types';
import { handleError } from '../../utils/errorHandling';
import { withRetry } from '../../utils/apiUtils';
import { fetchStudentsForYear } from '../schoolYearService';

export async function fetchStudents(schoolYearId: string): Promise<Student[]> {
  try {
    const data = await withRetry(() => fetchStudentsForYear(schoolYearId));
    return data as Student[];
  } catch (error) {
    handleError('Error fetching students:', error);
    return [];
  }
}
