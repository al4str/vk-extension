import { lastErrorCheck } from '~/src/helpers/error';

export function onMessage(type, cb) {
  window.chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === type && typeof cb === 'function') {
      cb(message.payload);
    }
    sendResponse();
  });
}

export function sendMessage(type, payload) {
  return new Promise((resolve, reject) => {
    const message = { type, payload };
    window.chrome.runtime.sendMessage(message, () => {
      try {
        lastErrorCheck();
        resolve();
      }
      catch (err) {
        reject(err);
      }
    });
  });
}
