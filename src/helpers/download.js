/* eslint-disable no-await-in-loop */
import { storageSet, storageGet, storageDelete } from '~/src/helpers/storage';
import { getDirectAudiosURL } from '~/src/helpers/audio';
import { toggleDownloadShelve } from '~/src/helpers/downloader';
import { downloadTracksWithID3Tags } from '~/src/helpers/id3tags.pool';

const ALREADY_DOWNLOADED_CACHE_KEY = 'ALREADY_DOWNLOADED';

const OBTAINING_URL_CHUNK_SIZE = 3;

export const DOWNLOAD_BULK_READY_STATE = {
  INITIAL: 'INITIAL',
  NOT_READY: 'NOT_READY',
  FILTERING: 'FILTERING',
  OBTAINING_URL: 'OBTAINING_URL',
  DOWNLOADING: 'DOWNLOADING',
  FINISHED: 'FINISHED',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
};

/**
 * @typedef {Object} State
 * @property {string} userId
 * @property {string} cookie
 * @property {Map<string, Track>} tracksMap
 * @property {Array<string>} filteringQueue
 * @property {Array<string>} obtainingURLQueue
 * @property {Array<string>} downloadingQueue
 * @property {Set<string>} finished
 * @property {Set<string>} failed
 * @property {Map<string, string>} directURLMap
 * @property {Map<string, string>} errorsMap
 * */

/**
 * @typedef {Function} OnStop
 * @return {void}
 * */

/**
 * @typedef {Object} OnProgressState
 * @property {number} progress
 * @property {string} readyState
 * @property {Array<Track>} [track]
 * @property {Set<string>} [finished]
 * @property {Set<string>} [failed]
 * @property {Map<string, string>} [errorsMap]
 * @property {OnStop} [handleStop]
 * */

/**
 * @typedef {Object} Track
 * @property {string} id - ID
 * @property {boolean} [isClaimed] - Claimed
 * @property {boolean} [isUMA] - United Music Agency
 * @property {string} title - Title
 * @property {string} allPerformers - Comma separated performers
 * @property {string} fullTitle - Track performer and title
 * @property {string} coverUrlBig - Cover image URL
 * @property {string} tokenForEncodedURL
 * */

/**
 * @typedef {Function} OnReadyStateChange
 * @param {string} readyState
 * @return {void}
 * */

/**
 * @typedef {Function} OnProgressChange
 * @param {number} progress
 * @return {void}
 * */

/**
 * @typedef {Function} OnTrackProcess
 * @param {Array<Track>} tracks
 * @return {void}
 * */

/**
 * @typedef {Function} OnFinished
 * @param {Array<string>} failed
 * @param {Array<string>} finished
 * @return {void}
 * */

/**
 * @typedef {Function} OnStart
 * @param {Array<string>} trackIds
 * @return {void}
 * */

/**
 * @typedef {Function} OnEnd
 * @param {Array<string>} trackIds
 * @return {void}
 * */

/**
 * Starts bulk audio download
 * @param {Object} options
 * @param {Array<Track>} options.list
 * @param {string} options.userId
 * @param {string} options.cookie
 * @param {OnReadyStateChange} options.onReadyStateChange
 * @param {OnProgressChange} options.onProgressChange
 * @param {OnTrackProcess} options.onTrackProcess
 * @param {OnFinished} options.onFinished
 * @return {Promise<void>}
 * */
export async function startBulkDownload(options) {
  const {
    list,
    userId,
    cookie,
    onReadyStateChange,
    onProgressChange,
    onTrackProcess,
    onFinished,
  } = options || {};
  const state = getInitialState({
    userId,
    cookie,
  });
  if (!list || !list.length || !userId || !cookie) {
    onReadyStateChange(DOWNLOAD_BULK_READY_STATE.NOT_READY);
    return;
  }
  onProgressChange(0);
  onReadyStateChange(DOWNLOAD_BULK_READY_STATE.FILTERING);
  const preFiltered = list
    .filter((track) => {
      if (track.isClaimed) {
        state.failed.add(track.id);
        state.errorsMap.set(track.id, 'Claimed');
        return false;
      }
      if (track.isUMA) {
        state.failed.add(track.id);
        state.errorsMap.set(track.id, 'United Music Agency');
        return false;
      }
      return true;
    })
    .map((track) => ({
      id: track.id,
      title: track.title,
      allPerformers: track.allPerformers,
      fullTitle: track.fullTitle,
      coverUrlBig: track.coverUrlBig,
      tokenForEncodedURL: track.tokenForEncodedURL,
    }));
  preFiltered.forEach((track) => {
    state.tracksMap.set(track.id, track);
    state.filteringQueue.push(track.id);
  });
  const filteringAmount = state.filteringQueue.length;
  let filteringDone = 0;
  await startTracksFiltering(
    state,
    (ids) => {
      onTrackProcess(ids.map((id) => state.tracksMap.get(id)));
    },
    () => {
      filteringDone += 1;
      onProgressChange(Math.round((filteringDone * 100) / filteringAmount));
    },
  );
  onProgressChange(0);
  onReadyStateChange(DOWNLOAD_BULK_READY_STATE.OBTAINING_URL);
  toggleDownloadShelve(false);
  const obtainingAmount = state.obtainingURLQueue.length;
  let obtainingDone = 0;
  await startURLObtaining(
    state,
    (ids) => {
      onTrackProcess(ids.map((id) => state.tracksMap.get(id)));
    },
    () => {
      obtainingDone += 1;
      onProgressChange(Math.round((obtainingDone * 100) / obtainingAmount));
    },
  );
  onProgressChange(0);
  onReadyStateChange(DOWNLOAD_BULK_READY_STATE.DOWNLOADING);
  const downloadingAmount = state.downloadingQueue.length;
  let downloadingDone = 0;
  await startDownloading(
    state,
    (ids) => {
      onTrackProcess(ids.map((id) => state.tracksMap.get(id)));
    },
    () => {
      downloadingDone += 1;
      onProgressChange(Math.round((downloadingDone * 100) / downloadingAmount));
    },
  );
  state.tracksMap.clear();
  state.filteringQueue = [];
  state.obtainingURLQueue = [];
  state.downloadingQueue = [];
  state.directURLMap.clear();
  onProgressChange(100);
  onReadyStateChange(DOWNLOAD_BULK_READY_STATE.FINISHED);
  onFinished(
    Array.from(state.failed),
    Array.from(state.finished),
  );
  toggleDownloadShelve(true);
}

/**
 * Returns initial state
 * @param {Object} options
 * @param {string} options.userId
 * @param {string} options.cookie
 * @return {State}
 * */
function getInitialState(options) {
  return {
    userId: options.userId || '',
    cookie: options.cookie || '',
    tracksMap: new Map(),
    filteringQueue: [],
    obtainingURLQueue: [],
    downloadingQueue: [],
    finished: new Set(),
    failed: new Set(),
    directURLMap: new Map(),
    errorsMap: new Map(),
  };
}

/**
 * Starts filtering out already downloaded
 * @param {State} state
 * @param {OnStart} onStart
 * @param {OnEnd} onEnd
 * @return {Promise<void>}
 * */
async function startTracksFiltering(state, onStart, onEnd) {
  const {
    filteringQueue,
    obtainingURLQueue,
  } = state;
  const storage = await storageGet(ALREADY_DOWNLOADED_CACHE_KEY);
  const alreadyChecked = new Map();
  (storage[ALREADY_DOWNLOADED_CACHE_KEY] || []).forEach(([id, downloaded]) => {
    alreadyChecked.set(id, downloaded);
  });
  while (filteringQueue.length > 0) {
    const chunk = filteringQueue.splice(0, OBTAINING_URL_CHUNK_SIZE);
    onStart(chunk);
    chunk.forEach((id) => {
      const downloaded = alreadyChecked.get(id) || false;
      if (!downloaded) {
        obtainingURLQueue.push(id);
      }
    });
    onEnd(chunk);
  }
}

/**
 * Starts URL obtaining
 * @param {State} state
 * @param {OnStart} onStart
 * @param {OnEnd} onEnd
 * @return {Promise<void>}
 * */
async function startURLObtaining(state, onStart, onEnd) {
  const {
    userId,
    cookie,
    tracksMap,
    obtainingURLQueue,
    downloadingQueue,
    failed,
    directURLMap,
    errorsMap,
  } = state;
  if (tracksMap.size === 0) {
    return;
  }
  while (obtainingURLQueue.length > 0) {
    const chunk = obtainingURLQueue.splice(0, OBTAINING_URL_CHUNK_SIZE);
    onStart(chunk);
    try {
      const urls = await getDirectAudiosURL({
        tokens: chunk.reduce((result, id) => {
          const track = tracksMap.get(id);
          if (track.tokenForEncodedURL) {
            return result.concat([track.tokenForEncodedURL]);
          }
          return result;
        }, []),
        userId,
        cookie,
      });
      downloadingQueue.push(...chunk);
      urls.forEach(([id, directURL]) => directURLMap.set(id, directURL));
      onEnd(chunk);
    }
    catch (err) {
      console.warn(err);
      chunk.forEach((id) => {
        failed.add(id);
        errorsMap.set(id, err.toString());
      });
      onEnd(chunk);
    }
  }
}

/**
 * Starts ID3 tags applying and downloading
 * @param {State} state
 * @param {OnStart} onStart
 * @param {OnEnd} onEnd
 * @return {Promise<void>}
 * */
async function startDownloading(state, onStart, onEnd) {
  const {
    tracksMap,
    downloadingQueue,
    finished,
    failed,
    directURLMap,
    errorsMap,
  } = state;
  if (downloadingQueue.length === 0) {
    return;
  }
  await downloadTracksWithID3Tags({
    tracks: downloadingQueue.map((id) => {
      const track = tracksMap.get(id);
      const directURL = directURLMap.get(id);
      return {
        ...track,
        directURL,
      };
    }),
    onProcess(ids) {
      onStart(ids);
      ids.forEach((id) => {
        const index = downloadingQueue.findIndex((item) => item !== id);
        downloadingQueue.splice(index, 1);
      });
    },
    onReady(error, id) {
      if (error) {
        failed.add(id);
        errorsMap.set(id, error);
        onEnd([id]);
        return;
      }
      if (directURLMap.has(id)) {
        directURLMap.delete(id);
      }
      finished.add(id);
      onEnd([id]);
      updateAlreadyDownloadedCache([[id, true]]);
    },
  });
}

/**
 * @param {Array<[string, boolean]>} list
 * @return {Promise<void>}
 * */
async function updateAlreadyDownloadedCache(list) {
  const storage = await storageGet(ALREADY_DOWNLOADED_CACHE_KEY);
  const alreadyDownloadedCache = storage[ALREADY_DOWNLOADED_CACHE_KEY] || [];
  const tempMap = new Map();
  [...alreadyDownloadedCache, ...list].forEach(([id, downloaded]) => {
    tempMap.set(id, downloaded);
  });
  const tempArray = Array.from(tempMap.entries());
  await storageSet(ALREADY_DOWNLOADED_CACHE_KEY, tempArray);
}

/**
 * Clears already downloaded cache
 * @return {Promise<void>}
 * */
export function clearAlreadyDownloadedCache() {
  return storageDelete(ALREADY_DOWNLOADED_CACHE_KEY);
}
