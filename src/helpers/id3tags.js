import ID3Writer from 'browser-id3-writer';
import { getBufferFromURL } from '~/src/libs/buffer';

/**
 * @typedef {Object} Track
 * @property {string} id - ID
 * @property {string} title - Title
 * @property {string} allPerformers - Comma separated performers
 * @property {string} coverUrlBig - Cover image URL
 * @property {string} directURL - Audio URL
 * */

/**
 * Returns track's buffer URL with injected id3 tags
 * @param {Track} track - Track data
 * @return {Promise<string>}
 * */
export async function getTrackBufferURL(track) {
  if (!track || !track.directURL) {
    return '';
  }
  try {
    const trackBuffer = await getBufferFromURL(track.directURL);
    const tagWriter = new ID3Writer(trackBuffer);
    setTitle(tagWriter, track);
    setPerformer(tagWriter, track);
    await setCover(tagWriter, track);
    tagWriter.addTag();
    return tagWriter.getURL();
  }
  catch (err) {
    return '';
  }
}

function setTitle(tagWriter, track) {
  tagWriter.setFrame('TIT2', track.title || 'Unnamed');
}

function setPerformer(tagWriter, track) {
  let performer = 'Unknown';
  if (Array.isArray(track.allPerformers)) {
    performer = track.allPerformers;
  }
  else if (typeof track.allPerformers === 'string') {
    performer = track.allPerformers
      .split(',')
      .map((item) => item.trim());
  }
  tagWriter.setFrame('TPE1', performer);
}

function setCover(tagWriter, track) {
  return new Promise((resolve) => {
    if (!track.coverUrlBig) {
      resolve();
    }
    getBufferFromURL(track.coverUrlBig)
      .then((coverBuffer) => {
        tagWriter.setFrame('APIC', {
          type: 3,
          data: coverBuffer,
          description: 'Cover',
        });
        resolve();
      })
      .catch(() => {
        resolve();
      });
  });
}
