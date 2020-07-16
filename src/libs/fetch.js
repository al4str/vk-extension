/* eslint-env browser, worker */

export const DEFAULT_RESPONSE = getDefaultResponse(null);

/**
 * @typedef {null|string|Object|Blob|ArrayBuffer|FormData|URLSearchParams} Body
 * */

/**
 * @param {Body} data
 * @return {Response<Body>}
 * */
function getDefaultResponse(data) {
  let body;
  if (data instanceof global.Blob
  || data instanceof ArrayBuffer
  || data instanceof global.FormData
  || data instanceof global.URLSearchParams
  || typeof data === 'string'
  || data === null) {
    body = data;
  }
  else if (typeof data === 'object') {
    body = JSON.stringify(data);
  }
  return new global.Response(body, {
    status: 520,
    statusText: 'Request error: Network, CORS or Server failure',
  });
}

/**
 * Executes `fetch`
 * @param {string} url
 * @param {Object} [options]
 * @param {Body} [defaultData]
 * @return {Promise<Response>}
 * */
export async function fetch(url, options, defaultData = null) {
  try {
    const response = await global.fetch(url, options || undefined);
    return response;
  }
  catch (err) {
    return getDefaultResponse(defaultData);
  }
}
