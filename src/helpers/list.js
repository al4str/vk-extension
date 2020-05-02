import { storageGet, storageSet } from '~/src/helpers/storage';

const STORAGE_KEY_PREFIX = 'LIST_DATA';

export const LIST_READY_STATE = {
  INITIAL: 'INITIAL',
  STORAGE: 'STORAGE',
  NO_USER: 'NO_USER',
  EXPIRED: 'EXPIRED',
  FETCH: 'FETCH',
  SYNC: 'SYNC',
  READY: 'READY',
};

export function getListFromStorage(ownerId) {
  return new Promise((resolve, reject) => {
    const key = `${STORAGE_KEY_PREFIX}_${ownerId}`;
    storageGet(key)
      .then((store) => {
        resolve(store[key]);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function setListToStorage(ownerId, list) {
  return new Promise((resolve, reject) => {
    const key = `${STORAGE_KEY_PREFIX}_${ownerId}`;
    storageSet(key, list)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getTrackByOffset(list, currentTrack, offset) {
  const defaultTrack = (list || [])[0] || null;
  if (!currentTrack) {
    return defaultTrack;
  }
  const currentIndex = list.findIndex((item) => item.id === currentTrack.id);
  if (!currentTrack) {
    return defaultTrack;
  }
  let nextIndex = currentIndex + 1 * offset;
  if (offset < 0 && nextIndex < 0) {
    nextIndex = list.length - 1;
  }
  if (offset > 0 && nextIndex === list.length) {
    nextIndex = 0;
  }
  return list[nextIndex] || defaultTrack;
}
