import { fetch } from '~/src/libs/fetch';
import { LIBRARY_URL } from '~/src/helpers/const';

const SOURCE = 'vk';

export function createTrack(track) {
  return new Promise(((resolve, reject) => {
    fetch(`${LIBRARY_URL}/tracks/${SOURCE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: track,
      }),
    })
      .then((raw) => {
        return raw.json();
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  }));
}
