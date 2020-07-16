import { lastErrorCheck } from '~/src/helpers/error';

/**
 * Downloads file by URL
 * @param {string} url
 * @param {string} fileName
 * @param {boolean} [overwrite=false]
 * @return {Promise<void>}
 * */
export function downloadFromURL(url, fileName, overwrite = false) {
  return new Promise((resolve) => {
    window.chrome.downloads.download({
      url,
      filename: fileName,
      conflictAction: overwrite
        ? 'overwrite'
        : 'uniquify',
    }, (downloadId) => {
      if (!downloadId) {
        lastErrorCheck();
      }
      resolve();
    });
  });
}

/**
 * Toggles download shelve visibility
 * @param {boolean} value
 * @return {void}
 * */
export function toggleDownloadShelve(value) {
  window.chrome.downloads.setShelfEnabled(value);
}

/**
 * Checks if passed file name already downloaded
 * @param {string} fileName - File name
 * @return {Promise<boolean>}
 * */
export function isFileAlreadyDownloaded(fileName) {
  if (!fileName) {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const query = {
      query: [fileName],
      mime: 'audio/mpeg',
      state: 'complete',
      totalBytesGreater: 1024 * 100,
      exists: true,
      limit: 1,
    };
    /**
     * @typedef {Object} SearchResult
     * @property {string} filename
     * @property {number} totalBytes
     * */
    /**
     * @param {Array<SearchResult>} results
     * */
    function handleSearchResults(results) {
      resolve(results.length > 0);
    }
    window.chrome.downloads.search(query, handleSearchResults);
  });
}
