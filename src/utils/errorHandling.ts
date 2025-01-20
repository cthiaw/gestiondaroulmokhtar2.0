export function handleError(message: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(message, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error(message, error);
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('Failed to fetch') || 
     error.message.includes('Network request failed'));
}