import { fetch } from '~/src/libs/fetch';

/**
 * Returns external resource's array buffer
 * @param {string} url - External resource's URL
 * @return {Promise<ArrayBuffer>}
 * */
export function getBufferFromURL(url) {
  return new Promise((resolve) => {
    const defaultValue = new ArrayBuffer(0);
    fetch(url, null, defaultValue)
      .then((rawResponse) => {
        if (!rawResponse.ok) {
          throw new Error(rawResponse.statusText);
        }
        return rawResponse.arrayBuffer();
      })
      .then((arrayBuffer) => {
        resolve(arrayBuffer);
      })
      .catch(() => {
        resolve(defaultValue);
      });
  });
}

/**
 * Revokes buffer URL
 * @param {string} arrayBufferURL
 * @return {void}
 * */
export function revokeBufferURL(arrayBufferURL) {
  if (!arrayBufferURL) {
    return;
  }
  try {
    window.URL.revokeObjectURL(arrayBufferURL);
  }
  catch (err) {
    // Silence
  }
}
