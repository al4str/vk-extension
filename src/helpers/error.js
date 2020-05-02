export const ERROR_MESSAGE = 'Unknown error occurred';

export function lastErrorCheck() {
  const lastError = window.chrome.runtime.lastError;
  if (lastError) {
    throw lastError;
  }
}
