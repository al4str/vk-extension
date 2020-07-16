/* eslint-disable no-await-in-loop */
import { getSanitizedFileName } from '~/src/libs/filename';
import { downloadFromURL } from '~/src/helpers/downloader';
import { AUDIO_DIR_NAME } from '~/src/helpers/audio';
import ID3TagsWorker from '~/src/helpers/id3tags.worker';

const MAX_WORKERS = window.navigator.hardwareConcurrency || 4;

/**
 * @typedef {Object} Track
 * @property {string} id - ID
 * @property {string} title - Title
 * @property {string} allPerformers - Comma separated performers
 * @property {string} coverUrlBig - Cover image URL
 * @property {string} directURL - Audio URL
 * */

/**
 * @typedef {Function} OnTrackProcessStart
 * @param {Array<string>} id - trackIds
 * @return {void}
 * */

/**
 * @typedef {Function} OnBufferURLReady
 * @param {string} [error=''] - Error
 * @param {string} id - Track ID
 * @return {void}
 * */

/**
 * Downloads tracks with applied ID3 tags
 * @param {Object} options
 * @param {Array<Track>} options.tracks - Tracks array
 * @param {OnTrackProcessStart} options.onProcess - On track process callback
 * @param {OnBufferURLReady} options.onReady - On URL ready callback
 * @return {Promise<void>}
 * */
export async function downloadTracksWithID3Tags(options) {
  const {
    tracks = [],
    onProcess = Function.prototype,
    onReady = Function.prototype,
  } = options || {};
  if (!tracks.length) {
    return;
  }
  const pool = getWorkersPool();
  await processTracks(pool, tracks, onProcess, onReady);
  pool.forEach((worker) => {
    worker.terminate();
  });
}

/**
 * @return {Array<Worker>}
 * */
function getWorkersPool() {
  return new Array(MAX_WORKERS)
    .fill(null)
    .map(() => new ID3TagsWorker());
}

/**
 * @param {Array<Worker>} pool
 * @param {Array<Track>} tracks
 * @param {OnTrackProcessStart} onTrackProcess
 * @param {OnBufferURLReady} onBufferURLReady
 * @return {Promise<void>}
 * */
async function processTracks(pool, tracks, onTrackProcess, onBufferURLReady) {
  const tracksQueue = tracks.slice();
  while (tracksQueue.length > 0) {
    const chunk = tracksQueue.splice(0, pool.length);
    onTrackProcess(chunk.map(({ id }) => id));
    const promises = chunk.map((track, index) => {
      const worker = pool[index];
      return processTrack(worker, track, onBufferURLReady);
    });
    await Promise.all(promises);
  }
}

/**
 * @param {Worker} worker
 * @param {Track} track
 * @param {OnBufferURLReady} onBufferURLReady
 * @return {Promise<void>}
 * */
function processTrack(worker, track, onBufferURLReady) {
  return new Promise((resolve) => {
    worker.onmessage = ({ data }) => {
      const {
        status,
        error,
        id,
        bufferURL,
      } = data;
      if (status === 'success') {
        downloadTrack(track, bufferURL)
          .then((downloadError) => {
            if (downloadError) {
              onBufferURLReady(downloadError, id);
              resolve();
              return;
            }
            onBufferURLReady('', id);
            resolve();
          });
      }
      else {
        onBufferURLReady(error, id);
        resolve();
      }
    };
    worker.postMessage(track);
  });
}

/**
 * @param {Track} track
 * @param {string} url
 * @return {Promise<string>}
 * */
export function downloadTrack(track, url) {
  return new Promise((resolve) => {
    const sanitizedFileName = getSanitizedFileName(track.fullTitle);
    const path = `${AUDIO_DIR_NAME}/${sanitizedFileName}.mp3`;
    downloadFromURL(url, path, true)
      .then(() => {
        resolve('');
      })
      .catch((err) => {
        resolve(err.toString());
      });
  });
}
