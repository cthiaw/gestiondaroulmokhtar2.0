import { supabase } from '../lib/supabase';
import { AuthError, User } from '@supabase/supabase-js';

export interface AuthUser extends User {}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear all local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear Supabase cache
    await supabase.auth.refreshSession();
    
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      if ((error as AuthError).name !== 'AuthSessionMissingError') {
        console.error('Error getting session:', error);
      }
      return { user: null, error };
    }

    return { user: session?.user ?? null, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
}