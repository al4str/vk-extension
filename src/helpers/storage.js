import { lastErrorCheck } from '~/src/helpers/error';

/**
 * @typedef {null|boolean|number|string|Object} Value
 * */

/**
 * Saves value to Chrome's local storage
 * @param {string} key
 * @param {Value} value
 * @return {Promise<void>}
 * */
export function storageSet(key, value) {
  return new Promise((resolve) => {
    window.chrome.storage.local.set({ [key]: value }, () => {
      lastErrorCheck();
      resolve();
    });
  });
}

/**
 * Returns value from Chrome's local storage
 * @param {string} key
 * @return {Promise<Value>}
 * */
export function storageGet(key) {
  return new Promise((resolve) => {
    window.chrome.storage.local.get(key, (value) => {
      lastErrorCheck();
      resolve(value);
    });
  });
}

/**
 * Deletes value from Chrome's local storage
 * @param {string} key
 * @return {Promise<void>}
 * */
export function storageDelete(key) {
  return new Promise((resolve) => {
    window.chrome.storage.local.remove(key, () => {
      lastErrorCheck();
      resolve();
    });
  });
}

/**
 * Clears Chrome's local storage
 * @return {Promise<void>}
 * */
export function storageClear() {
  return new Promise((resolve) => {
    window.chrome.storage.local.clear(() => {
      lastErrorCheck();
      resolve();
    });
  });
}

/**
 * Returns Chrome's local storage usage
 * @return {Promise<number>}
 * */
export function storageGetUsage() {
  return new Promise((resolve) => {
    window.chrome.storage.local.getBytesInUse((bytes) => {
      lastErrorCheck();
      resolve(bytes);
    });
  });
}
