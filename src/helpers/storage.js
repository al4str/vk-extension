import { lastErrorCheck } from '~/src/helpers/error';

export function storageSet(key, value) {
  return new Promise((resolve) => {
    window.chrome.storage.local.set({ [key]: value }, () => {
      lastErrorCheck();
      resolve();
    });
  });
}

export function storageGet(key) {
  return new Promise((resolve) => {
    window.chrome.storage.local.get(key, (value) => {
      lastErrorCheck();
      resolve(value);
    });
  });
}

export function storageDelete(key) {
  return new Promise((resolve) => {
    window.chrome.storage.local.remove(key, () => {
      lastErrorCheck();
      resolve();
    });
  });
}

export function storageClear() {
  return new Promise((resolve) => {
    window.chrome.storage.local.clear(() => {
      lastErrorCheck();
      resolve();
    });
  });
}

export function storageGetUsage() {
  return new Promise((resolve) => {
    window.chrome.storage.local.getBytesInUse((bytes) => {
      lastErrorCheck();
      resolve(bytes);
    });
  });
}
