/**
 * Returns search query string
 * @param {Object} query
 * @return {string}
 * */
export function getStringFromQuery(query) {
  return Object
    .entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

/**
 * Returns search query object
 * @param {string} string
 * @return {Object}
 * */
export function getQueryFromString(string) {
  return string
    .split('&')
    .map((item) => item.split('='))
    .reduce((query, [key, value]) => ({
      ...query,
      [key]: value,
    }), {});
}
