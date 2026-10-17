import { supabase } from '../../lib/supabase';
import { DashboardStats } from '../../types/dashboard';
import { handleError } from '../../utils/errorHandling';
import { fetchStudentsForYear } from '../schoolYearService';

/**
 * Figures for a school year. Income is the current month's for the current
 * year, and the whole year's for a past year.
 */
export async function fetchDashboardStats(schoolYearId: string, isCurrentYear: boolean): Promise<DashboardStats> {
  try {
    const now = new Date();
    let paymentsQuery = supabase
      .from('payments')
      .select('amount')
      .eq('school_year_id', schoolYearId);
    if (isCurrentYear) {
      paymentsQuery = paymentsQuery
        .gte('payment_date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
        .lte('payment_date', new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString());
    }

    const [
      students,
      teachersResponse,
      classesResponse,
      paymentsResponse
    ] = await Promise.all([
      fetchStudentsForYear(schoolYearId),
      supabase.from('teachers')
        .select('id', { count: 'exact', head: true })
        .eq('staff_type', 'MAITRE'),
      supabase.from('classes')
        .select('id', { count: 'exact', head: true }),
      paymentsQuery
    ]);

    // Each student has a French and an Arabic record
    const studentCount = new Set(students.map((student) => student.matricule.replace('-AR', ''))).size;
    const monthlyIncome = (paymentsResponse.data || [])
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      studentCount,
      teacherCount: teachersResponse.count || 0,
      classCount: classesResponse.count || 0,
      monthlyIncome
    };
  } catch (error) {
    handleError('Error fetching dashboard stats:', error);
    return {
      studentCount: 0,
      teacherCount: 0,
      classCount: 0,
      monthlyIncome: 0
    };
  }
}
