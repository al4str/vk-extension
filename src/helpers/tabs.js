import { lastErrorCheck } from '~/src/helpers/error';

export const TAB_URL = 'https://vk.com/audios*';

export function getTabs(queryInfo) {
  return new Promise((resolve) => {
    window.chrome.tabs.query(queryInfo, (data) => {
      lastErrorCheck();
      resolve(data);
    });
  });
}
