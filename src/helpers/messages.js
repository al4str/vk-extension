import { lastErrorCheck } from '~/src/helpers/error';

/**
 * Chrome's inter process message listener
 * @param {string} type - Listen more messages of certain type
 * @param {Function} callback - Callback to execute on correct type arrival
 * @return {void}
 * */
export function onMessage(type, callback) {
  window.chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === type && typeof callback === 'function') {
      callback(message.payload);
    }
    sendResponse();
  });
}

/**
 * Chrome's inter process message sender
 * @param {string} type - Specifies message type
 * @param {null|boolean|number|string|Array|Object|Blob|ArrayBuffer} [payload] - Payload
 * @return {Promise<undefined|Error>}
 * */
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
