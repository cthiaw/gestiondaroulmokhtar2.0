import { supabase } from '../../lib/supabase';
import { DashboardStats } from '../../types/dashboard';
import { handleError } from '../../utils/errorHandling';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      { data: studentCount },
      teachersResponse,
      classesResponse,
      paymentsResponse
    ] = await Promise.all([
      supabase.rpc('count_unique_students'),
      supabase.from('teachers')
        .select('id', { count: 'exact', head: true })
        .eq('staff_type', 'PROFESSEUR'),
      supabase.from('classes')
        .select('id', { count: 'exact', head: true }),
      supabase.from('payments')
        .select('amount')
        .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString())
    ]);

    const monthlyIncome = (paymentsResponse.data || [])
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      studentCount: studentCount || 0,
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