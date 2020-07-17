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
    searchFileInDownloads(query, (results) => {
      resolve(results.length > 0);
    });
  });
}

/**
 * @typedef {Object} SearchQuery
 * @property {Array<string>} [query]
 * @property {string} [mime]
 * @property {string} [state]
 * @property {number} [totalBytesGreater]
 * @property {boolean} [exists]
 * @property {number} [limit]
 * */

/**
 * @typedef {Object} SearchResult
 * @property {string} id
 * @property {string} filename
 * @property {number} totalBytes
 * */

/**
 * @typedef {Function} OnSearch
 * @param {Array<SearchResult>} results
 * @return {void}
 * */

/**
 * @param {SearchQuery} query
 * @param {OnSearch} onSearch
 * */
function searchFileInDownloads(query, onSearch) {
  window.chrome.downloads.search(query, onSearch);
}

/**
 * Shows file in a file manager
 * @param {string} fileName
 * @return {void}
 * */
export function showDownloadedFile(fileName) {
  const query = {
    query: [fileName],
    exists: true,
    limit: 1,
  };
  searchFileInDownloads(query, ([first]) => {
    if (first && first.id) {
      window.chrome.downloads.show(first.id);
    }
  });
}

/**
 * Shows default `downloads` directory in a file manager
 * @return {void}
 * */
export function showDefaultDownloadDirectory() {
  window.chrome.downloads.showDefaultFolder();
}
