
export const DEFAULT_RESPONSE = {
  status: 'error',
  code: 520,
  errors: 'Request failed',
  data: null,
};

export async function fetch(url, options, defaultResponse = DEFAULT_RESPONSE) {
  try {
    const response = await window.fetch(url, options);
    return response;
  }
  catch (err) {
    console.warn(err);
    return defaultResponse;
  }
}
