import { supabase } from '../lib/supabase';
import { User, CreateUserData } from '../types/auth';

export async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: [], error };
  }
}

export async function createUser(userData: CreateUserData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) throw authError;

    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
}

export async function deleteUser(id: string) {
  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error };
  }
}