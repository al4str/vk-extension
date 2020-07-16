export const ERROR_MESSAGE = 'Unknown error occurred';

/**
 * Throws chrome's `runtime.lastError` error
 * @throws Error
 * */
export function lastErrorCheck() {
  const lastError = window.chrome.runtime.lastError;
  if (lastError) {
    throw lastError;
  }
}
