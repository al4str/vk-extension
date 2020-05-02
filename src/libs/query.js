export function getStringFromQuery(query) {
  return Object
    .entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

export function getQueryFromString(string) {
  return string
    .split('&')
    .map((item) => item.split('='))
    .reduce((query, [key, value]) => ({
      ...query,
      [key]: value,
    }), {});
}
