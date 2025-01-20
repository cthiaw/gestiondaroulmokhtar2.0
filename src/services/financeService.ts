import { supabase } from '../lib/supabase';
import { Payment, Expense } from '../types/finance';

export async function fetchPayments() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        student:students (
          first_name,
          last_name,
          matricule
        )
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { data: [], error };
  }
}

export async function createPayment(payment: Omit<Payment, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ ...payment, status: 'COMPLETED' }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { data: null, error };
  }
}

export async function updatePayment(id: string, payment: Partial<Payment>) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating payment:', error);
    return { data: null, error };
  }
}

export async function deletePayment(id: string) {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { error };
  }
}

export async function fetchExpenses() {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        staff:teachers (
          first_name,
          last_name,
          matricule
        )
      `)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return { data: [], error };
  }
}

export async function createExpense(expense: Omit<Expense, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { data: null, error };
  }
}

export async function updateExpense(id: string, expense: Partial<Expense>) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { data: null, error };
  }
}

export async function deleteExpense(id: string) {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error };
  }
}