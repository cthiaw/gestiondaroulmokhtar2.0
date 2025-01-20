import { ApiError } from '@supabase/supabase-js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isNetworkError(error)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('Failed to fetch') || 
     error.message.includes('Network request failed'));
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack || '',
      hint: '',
      code: error.name
    };
  }
  return error as ApiError;
}