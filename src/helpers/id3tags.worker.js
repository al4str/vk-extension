/* eslint-env worker */
/* eslint-disable no-restricted-globals */
import { revokeBufferURL } from '~/src/libs/buffer';
import { getTrackBufferURL } from '~/src/helpers/id3tags';

/**
 * @typedef {Object} Track
 * @property {string} id - ID
 * @property {string} title - Title
 * @property {string} allPerformers - Comma separated performers
 * @property {string} coverUrlBig - Cover image URL
 * @property {string} directURL - Audio URL
 * */

/**
 * @param {Track} track
 * */
async function handleTrackProcess(track) {
  try {
    const bufferURL = await getTrackBufferURL(track);
    if (!bufferURL) {
      throw new Error('`ArrayBuffer` URL is empty');
    }
    self.postMessage({
      status: 'success',
      id: track.id,
      error: null,
      bufferURL,
    });
    revokeBufferURL(bufferURL);
  }
  catch (err) {
    self.postMessage({
      status: 'error',
      id: track.id,
      error: err.toString(),
      bufferURL: '',
    });
  }
}

self.addEventListener('message', async ({ data }) => {
  await handleTrackProcess(data);
});
