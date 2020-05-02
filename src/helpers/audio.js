import { DEFAULT_RESPONSE, fetch } from '~/src/libs/fetch';
import { getStringFromQuery } from '~/src/libs/query';
import { decoder } from '~/src/libs/decoder';

const CONSTANTS = {
  INDEX_ID: 0,
  INDEX_OWNER_ID: 1,
  INDEX_URL: 2,
  INDEX_TITLE: 3,
  INDEX_PERFORMER: 4,
  INDEX_DURATION: 5,
  INDEX_ALBUM_ID: 6,
  INDEX_AUTHOR_LINK: 8,
  INDEX_LYRICS: 9,
  INDEX_FLAGS: 10,
  INDEX_CONTEXT: 11,
  INDEX_EXTRA: 12,
  INDEX_HASHES: 13,
  INDEX_COVER_URL: 14,
  INDEX_ADS: 15,
  INDEX_SUBTITLE: 16,
  INDEX_MAIN_ARTISTS: 17,
  INDEX_FEAT_ARTISTS: 18,
  INDEX_ALBUM: 19,
  INDEX_TRACK_CODE: 20,
  INDEX_RESTRICTION: 21,
  INDEX_ALBUM_PART: 22,
  ACCESS_KEY: 24,
  CHART_INFO_INDEX: 25,
  HAS_LYRICS_BIT: 1,
  CAN_ADD_BIT: 2,
  CLAIMED_BIT: 4,
  HQ_BIT: 16,
  LONG_PERFORMER_BIT: 32,
  UMA_BIT: 128,
  REPLACEABLE: 512,
  EXPLICIT_BIT: 1024,
};

export function getDirectAudioURL(options) {
  const {
    userId,
    encodedURL,
  } = options;
  const decodedURL = decoder(parseInt(userId))(encodedURL).replace(/\?.+$/, '');
  let mp3URL = '';
  if (/\.mp3$/.test(decodedURL)) {
    mp3URL = decodedURL;
  }
  else if (!/\.m3u8$/.test(decodedURL)) {
    console.warn('Unsupported decodedURL extension type:', decodedURL);
  }
  // https://psv4.vkuseraudio.net/c1813/u2936142/<9a603c791>/audios/8247b6cc07cc/index.m3u8
  else if (/\/[0-9a-z]{9}\/audios\//.test(decodedURL)) {
    mp3URL = decodedURL
      .replace(/\/index\.m3u8$/, '.mp3')
      .replace(/\/[0-9a-z]{9}(\/audios\/)/, '$1');
  }
  // https://cs9-12v4.vkuseraudio.net/p1/<9ae86d41b>/22a161010a81e8/index.m3u8
  else if (/\/p\d+\/[0-9a-z]{9}\//.test(decodedURL)) {
    mp3URL = decodedURL
      .replace(/\/index\.m3u8$/, '.mp3')
      .replace(/(\/p\d+\/)[0-9a-z]{9}\//, '$1');
  }
  else {
    console.warn('Unsupported decodedURL scheme:', decodedURL);
  }
  return mp3URL;
}

export function getAllPerformers(audioData) {
  const {
    performer,
    mainArtists,
    featArtists,
  } = audioData;
  const main = Array.isArray(mainArtists)
    ? mainArtists.map(({ name }) => name).join(', ')
    : mainArtists || performer || '';
  const feat = Array.isArray(featArtists)
    ? featArtists.map(({ name }) => name).join(', ')
    : featArtists || '';
  return main && feat
    ? `${main} feat. ${feat}`
    : main;
}

export function getHumanDuration(duration) {
  const hours = Math.floor(duration / 60 / 60);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const time = hours > 0
    ? [hours, minutes, seconds]
    : [minutes, seconds];
  return time.map((item) => `${Math.round(item)}`.padStart(2, '0')).join(':');
}

export function mapAudioData(rawData) {
  const id = rawData[CONSTANTS.INDEX_ID];
  const ownerId = rawData[CONSTANTS.INDEX_OWNER_ID];
  const title = rawData[CONSTANTS.INDEX_TITLE] || '';
  const performer = rawData[CONSTANTS.INDEX_PERFORMER] || '';
  const subTitle = rawData[CONSTANTS.INDEX_SUBTITLE];
  const mainArtists = rawData[CONSTANTS.INDEX_MAIN_ARTISTS];
  const featArtists = rawData[CONSTANTS.INDEX_FEAT_ARTISTS];
  const authorLink = rawData[CONSTANTS.INDEX_AUTHOR_LINK];
  const duration = rawData[CONSTANTS.INDEX_DURATION];
  const lyrics = rawData[CONSTANTS.INDEX_LYRICS];
  const url = rawData[CONSTANTS.INDEX_URL];
  const flags = rawData[CONSTANTS.INDEX_FLAGS];
  const context = rawData[CONSTANTS.INDEX_CONTEXT];
  const extra = rawData[CONSTANTS.INDEX_EXTRA];
  const accessKey = rawData[CONSTANTS.ACCESS_KEY];
  // eslint-disable-next-line no-bitwise
  const isLongPerformer = flags & CONSTANTS.LONG_PERFORMER_BIT;
  // eslint-disable-next-line no-bitwise
  const canAdd = !!(flags & CONSTANTS.CAN_ADD_BIT);
  // eslint-disable-next-line no-bitwise
  const isClaimed = !!(flags & CONSTANTS.CLAIMED_BIT);
  // eslint-disable-next-line no-bitwise
  const isExplicit = !!(flags & CONSTANTS.EXPLICIT_BIT);
  // eslint-disable-next-line no-bitwise
  const isUMA = !!(flags & CONSTANTS.UMA_BIT);
  // eslint-disable-next-line no-bitwise
  const isReplaceable = !!(flags & CONSTANTS.REPLACEABLE);
  const ads = rawData[CONSTANTS.INDEX_ADS];
  const album = rawData[CONSTANTS.INDEX_ALBUM];
  const albumId = rawData[CONSTANTS.INDEX_ALBUM_ID];
  const albumPart = rawData[CONSTANTS.INDEX_ALBUM_PART];
  const trackCode = rawData[CONSTANTS.INDEX_TRACK_CODE];
  const restrictionStatus = rawData[CONSTANTS.INDEX_RESTRICTION];
  const chartInfo = rawData[CONSTANTS.CHART_INFO_INDEX];
  const fullId = `${ownerId}_${id}`;
  const allPerformers = getAllPerformers({
    performer,
    mainArtists,
    featArtists,
  });
  const humanDuration = getHumanDuration(duration);
  const fullTitle = `${allPerformers} - ${title}`;
  const hashes = (rawData[CONSTANTS.INDEX_HASHES] || '').split('/');
  const [coverUrlSmall, coverUrlBig] = (rawData[CONSTANTS.INDEX_COVER_URL] || '').split(',');
  const [
    addHash,
    editHash,
    actionHash,
    deleteHash,
    replaceHash,
    urlHash,
    restoreHash,
  ] = hashes;
  const tokenForEncodedURL = `${fullId}_${actionHash}_${urlHash}`;
  return {
    id,
    ownerId,
    title,
    performer,
    subTitle,
    mainArtists,
    featArtists,
    authorLink,
    duration,
    lyrics,
    url,
    flags,
    context,
    extra,
    accessKey,
    isLongPerformer,
    canAdd,
    isClaimed,
    isExplicit,
    isUMA,
    isReplaceable,
    ads,
    album,
    albumId,
    albumPart,
    trackCode,
    restrictionStatus,
    chartInfo,
    fullId,
    allPerformers,
    fullTitle,
    humanDuration,
    coverUrlSmall,
    coverUrlBig,
    addHash,
    editHash,
    actionHash,
    deleteHash,
    replaceHash,
    urlHash,
    restoreHash,
    tokenForEncodedURL,
  };
}

export function mapAudioPage(rawData) {
  return Object.values(rawData[0]).map(([, item]) => mapAudioData(item));
}

export function mapEncodedAudioData(rawData, userId) {
  if (!Array.isArray(rawData)) {
    return [];
  }
  return rawData[0].map((item) => {
    const id = item[CONSTANTS.INDEX_ID];
    const url = item[CONSTANTS.INDEX_URL];
    const directURL = getDirectAudioURL({
      userId,
      encodedURL: url,
    });
    return [id, directURL];
  });
}

export function getAudioPage(options) {
  return new Promise((resolve, reject) => {
    const {
      offset,
      userId,
      cookie,
    } = options;
    fetch(
      `https://m.vk.com/audios${userId}`,
      {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/x-www-form-urlencoded',
          'x-requested-with': 'XMLHttpRequest',
          'cookie': cookie,
        },
        body: `_ajax=1&offset=${offset}`,
        credentials: 'include',
      },
      {
        ...DEFAULT_RESPONSE,
        data: { 0: [[]] },
      },
    )
      .then((raw) => {
        return raw.json();
      })
      .then((res) => {
        resolve(mapAudioPage(res.data));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getDirectAudiosURL(options) {
  return new Promise((resolve, reject) => {
    const {
      userId,
      cookie,
      tokens,
    } = options;
    fetch(
      'https://m.vk.com/audio',
      {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/x-www-form-urlencoded',
          'x-requested-with': 'XMLHttpRequest',
          'cookie': cookie,
        },
        body: getStringFromQuery({
          act: 'reload_audio',
          ids: tokens.join(','),
        }),
        credentials: 'include',
      },
      {
        ...DEFAULT_RESPONSE,
        data: [[]],
      },
    )
      .then((raw) => {
        return raw.json();
      })
      .then((res) => {
        resolve(mapEncodedAudioData(res.data, userId));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function* fetchAudioList(options) {
  const {
    offset = 0,
    limit = 30,
    max = Infinity,
    userId = '',
    cookie = '',
  } = options || {};
  let list = [];
  let currentOffset = offset;
  while (list.length < max) {
    // eslint-disable-next-line no-await-in-loop
    const page = await getAudioPage({
      offset: currentOffset,
      userId,
      cookie,
    });
    list = list.concat(page);
    currentOffset = list.length + limit;
    if (page.length <= limit) {
      break;
    }
    yield page;
  }
  return list;
}
