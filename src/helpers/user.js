import {
  storageGet,
  storageSet,
  storageDelete,
} from '~/src/helpers/storage';
import {
  TAB_URL,
  getTabs,
} from '~/src/helpers/tabs';
import {
  COOKIE_URL,
  COOKIE_NAME,
  getCookieData,
} from '~/src/helpers/cookies';

const USER_ID_REGEXP = /audios(\d+)/;

const STORAGE_KEY = 'USER_DATA';

export const USER_READY_STATE = {
  INITIAL: 'INITIAL',
  STORAGE: 'STORAGE',
  TABS: 'TABS',
  COOKIES: 'COOKIES',
  EXPIRED: 'EXPIRED',
  NOT_FOUND: 'NOT_FOUND',
  SYNC: 'SYNC',
  READY: 'READY',
};

export function getUserDataFromStorage() {
  return new Promise((resolve, reject) => {
    storageGet(STORAGE_KEY)
      .then((store) => {
        resolve(store[STORAGE_KEY]);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getUserCookieFromCookiesJar() {
  return new Promise((resolve, reject) => {
    getCookieData({
      url: COOKIE_URL,
      name: COOKIE_NAME,
    })
      .then((cookieData) => {
        resolve(cookieData);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getUserIdFromOpenedTab() {
  return new Promise((resolve, reject) => {
    getTabs({ url: TAB_URL })
      .then((tabs) => {
        const [firstTab] = tabs;
        const firstTabURL = (firstTab || { url: '' }).url;
        const [, userId] = firstTabURL.match(USER_ID_REGEXP) || ['', ''];
        resolve(userId);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function setUserDataToStorage(userData) {
  return new Promise((resolve, reject) => {
    storageSet(STORAGE_KEY, userData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function deleteUserDataFromStorage() {
  return new Promise((resolve, reject) => {
    storageDelete(STORAGE_KEY)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}
