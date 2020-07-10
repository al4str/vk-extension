import ID3Writer from 'browser-id3-writer';
import { fetch } from '~/src/libs/fetch';
import {
  WHITELISTED_AUDIO_FIELDS,
  getDirectAudiosURL,
} from '~/src/helpers/audio';

export const DOWNLOAD_BULK_READY_STATE = {
  INITIAL: 'INITIAL',
  NOT_READY: 'NOT_READY',
  DOWNLOADING: 'DOWNLOADING',
  FINISHED: 'FINISHED',
};

export async function startBulkDownload(options) {
  const {
    list = [],
    userId = '',
    cookie = '',
    onFail = Function.prototype,
    onProgress = Function.prototype,
  } = options || {};
  const bulkDownloadGenerator = bulkDownload({
    list,
    userId,
    cookie,
  });
  // eslint-disable-next-line no-restricted-syntax
  for await (const yielded of bulkDownloadGenerator) {
    if (yielded.error) {
      onFail(yielded.item, yielded.error);
    }
    else {
      onProgress(yielded.item, yielded.progress);
    }
  }
}

async function* bulkDownload(options) {
  const {
    list,
    userId,
    cookie,
  } = options;
  let index = 0;
  if (list.length === 0) {
    return {
      item: null,
      progress: 100,
    };
  }
  while (index <= list.length - 1) {
    const item = list[index];
    const progress = Math.round(((index + 1) * 100) / list.length);
    yield {
      item,
      progress,
    };
    try {
      const track = getTrackFromItem(item);
      // eslint-disable-next-line no-await-in-loop
      const [[, directURL]] = await getDirectAudiosURL({
        userId,
        cookie,
        tokens: [track.tokenForEncodedURL],
      });
      // eslint-disable-next-line no-await-in-loop
      const arrayBufferURL = await getArrayBufferFromURL(directURL);
      // eslint-disable-next-line no-await-in-loop
      const arrayBufferURLWithTags = await getArrayBufferURLOfTrackWithID3Tags(arrayBufferURL, track);
      // eslint-disable-next-line no-await-in-loop
      await downloadTrack(track, arrayBufferURLWithTags);
      revokeArrayBufferURL(arrayBufferURLWithTags);
    }
    catch (err) {
      yield {
        item,
        error: err,
      };
    }
    index += 1;
  }
  return {
    item: list[list.length - 1],
    progress: 100,
  };
}

function getTrackFromItem(item) {
  return WHITELISTED_AUDIO_FIELDS.reduce((result, key) => {
    const value = item[key];
    if (value !== undefined) {
      result[key] = value;
    }
    return result;
  }, {});
}

function getArrayBufferFromURL(url) {
  return new Promise((resolve) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          return new ArrayBuffer(0);
        }
        return response.arrayBuffer();
      })
      .then(resolve);
  });
}

function getArrayBufferURLOfTrackWithID3Tags(arrayBufferURL, track) {
  return new Promise((resolve) => {
    const tagWriter = new ID3Writer(arrayBufferURL);
    tagWriter
      .setFrame('TIT2', track.title)
      .setFrame('TPE1', track.allPerformers
        .split(',')
        .map((performer) => performer.trim()));
    if (track.coverUrlBig) {
      getArrayBufferFromURL(track.coverUrlBig)
        .then((coverArrayBuffer) => {
          tagWriter.setFrame('APIC', {
            type: 3,
            data: coverArrayBuffer,
            description: 'Cover',
          });
          tagWriter.addTag();
          resolve(tagWriter.getURL());
        });
    }
    else {
      tagWriter.addTag();
      resolve(tagWriter.getURL());
    }
  });
}

function revokeArrayBufferURL(arrayBufferURL) {
  URL.revokeObjectURL(arrayBufferURL);
}

function downloadTrack(track, directURL) {
  return downloadFromURL(directURL, `${track.fullTitle}.mp3`);
}

function downloadFromURL(url, fileName) {
  return new Promise((resolve) => {
    window.chrome.downloads.download({
      url,
      filename: fileName,
      conflictAction: 'overwrite',
    }, (downloadId) => {
      resolve(downloadId);
    });
  });
}
