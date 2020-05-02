import { lastErrorCheck } from '~/src/helpers/error';

export const COOKIE_URL = 'https://vk.com/';

export const COOKIE_NAME = 'remixsid';

export function isCookieExpired(shortTimestamp) {
  return Date.now() >= shortTimestamp * 1000;
}

export function getCookieData(details) {
  return new Promise((resolve) => {
    const chromeCookies = window.chrome.cookies || window.chrome.experimental.cookies;
    chromeCookies.get(details, (data) => {
      lastErrorCheck();
      resolve(data);
    });
  });
}

export function getCookieString(name, value) {
  return `${name}=${value}`;
}
