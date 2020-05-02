import { writable, derived, get } from 'svelte/store';
import { ERROR_MESSAGE } from '~/src/helpers/error';
import { onMessage, sendMessage } from '~/src/helpers/messages';
import {
  COOKIE_NAME,
  isCookieExpired,
  getCookieString,
} from '~/src/helpers/cookies';
import {
  fetchAudioList,
  getDirectAudiosURL,
} from '~/src/helpers/audio';
import { setMediaActions } from '~/src/helpers/player';
import {
  USER_READY_STATE,
  getUserDataFromStorage,
  getUserIdFromOpenedTab,
  getUserCookieFromCookiesJar,
  setUserDataToStorage,
  deleteUserDataFromStorage,
} from '~/src/helpers/user';
import {
  LIST_READY_STATE,
  getListFromStorage,
  setListToStorage,
  getTrackByOffset,
} from '~/src/helpers/list';

function updater(update, key, value) {
  update((prevState) => {
    const nextState = {
      ...prevState,
      [key]: value,
    };
    return nextState;
  });
}

const USER_STATE = {
  readyState: USER_READY_STATE.INITIAL,
  id: '',
  cookieValue: '',
  cookieExpirationDate: 0,
};
const userStore = writable(USER_STATE);
const userSet = updater.bind(null, userStore.update);

const PLAYER_STATE = {
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  track: null,
  prevTrack: null,
  nextTrack: null,
  volume: 0.5,
};
const playerStore = writable(PLAYER_STATE);
const playerSet = updater.bind(null, playerStore.update);

const MUSIC_STATE = {
  readyState: LIST_READY_STATE.INITIAL,
  ownerId: '',
  list: [],
};
const musicStore = writable(MUSIC_STATE);
const musicSet = updater.bind(null, musicStore.update);
const tracksStore = derived(
  [musicStore, playerStore],
  ([$musicStore, $playerStore]) => {
    const { list } = $musicStore;
    const { isPlaying: isCurrentPlaying, track: currentTrack } = $playerStore;
    return list.map((track) => {
      const isCurrent = currentTrack && track.id === currentTrack.id;
      const isPlaying = isCurrent && isCurrentPlaying;
      const prevTrack = getTrackByOffset(list, track, -1);
      const nextTrack = getTrackByOffset(list, track, +1);
      return {
        ...track,
        isCurrent,
        isPlaying,
        prevTrack,
        nextTrack,
        async togglePlay() {
          await toggleTrack({
            ...track,
            prevTrack,
            nextTrack,
          });
        },
      };
    });
  },
  [],
);
const audioURLMap = new Map();

const ROOT_STATE = {
  errors: [],
};
const rootStore = writable(ROOT_STATE);

async function init() {
  try {
    await obtainUserData();
    await obtainMusicList();
    onMessage('player-error', addError);
    onMessage('player-end', handlePlayerEnd);
    onMessage('player-timeupdate', handlePlayerTimeUpdate);
    onMessage('player-loadstart', handlePlayerLoadStart);
    onMessage('player-canplaythrough', handlePlayerCanPlayThrough);
    onMessage('player-state', handlePlayerState);
    await sendMessage('player-state');
  }
  catch (err) {
    console.error(err);
    addError(err);
  }
}
async function reTry() {
  try {
    await obtainUserData();
    await obtainMusicList();
  }
  catch (err) {
    console.error(err);
    addError(err);
  }
}
async function obtainUserData() {
  try {
    userSet('readyState', USER_READY_STATE.STORAGE);
    let { id, cookieValue, cookieExpirationDate } = await getUserDataFromStorage() || {};
    if (!id || !cookieValue) {
      userSet('readyState', USER_READY_STATE.TABS);
      [
        id,
        { value: cookieValue, expirationDate: cookieExpirationDate } = {},
      ] = await Promise.all([
        getUserIdFromOpenedTab(),
        getUserCookieFromCookiesJar(),
      ]);
      if (!id || !cookieValue) {
        userSet('readyState', USER_READY_STATE.NOT_FOUND);
        return;
      }
      userSet('readyState', USER_READY_STATE.SYNC);
      await setUserDataToStorage({
        id,
        cookieValue,
        cookieExpirationDate,
      });
    }
    if (isCookieExpired(cookieExpirationDate)) {
      await deleteUserDataFromStorage();
      userSet('readyState', USER_READY_STATE.EXPIRED);
      return;
    }
    userSet('id', id);
    userSet('cookieValue', cookieValue);
    userSet('cookieExpirationDate', cookieExpirationDate);
    userSet('readyState', USER_READY_STATE.READY);
  }
  catch (err) {
    console.error(err);
    addError(err);
  }
}
async function obtainMusicList() {
  try {
    const { id, cookieValue, cookieExpirationDate } = get(userStore);
    let { ownerId } = get(musicStore);
    if (!ownerId) {
      ownerId = id;
      musicSet('ownerId', ownerId);
    }
    if (!ownerId || !cookieValue) {
      musicSet('readyState', LIST_READY_STATE.NO_USER);
      return;
    }
    if (isCookieExpired(cookieExpirationDate)) {
      await deleteUserDataFromStorage();
      musicSet('readyState', LIST_READY_STATE.EXPIRED);
      return;
    }
    musicSet('readyState', LIST_READY_STATE.STORAGE);
    const storageList = await getListFromStorage(ownerId);
    if (storageList) {
      musicSet('list', storageList);
      musicSet('readyState', LIST_READY_STATE.READY);
      return;
    }
    musicSet('readyState', LIST_READY_STATE.FETCH);
    const pageGenerator = fetchAudioList({
      userId: ownerId,
      cookie: getCookieString(COOKIE_NAME, cookieValue),
    });
    let list = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const page of pageGenerator) {
      list = list.concat(page);
      addMusicListPage(page);
    }
    musicSet('readyState', LIST_READY_STATE.SYNC);
    await setListToStorage(ownerId, list);
    musicSet('list', list);
    musicSet('readyState', LIST_READY_STATE.READY);
  }
  catch (err) {
    console.error(err);
    addError(err);
  }
}
async function toggleTrack(track) {
  try {
    await sendMessage('player-pause');
    if (!track) {
      return;
    }
    const { isPlaying, track: currentTrack } = get(playerStore);
    if (currentTrack && track.id === currentTrack.id && isPlaying) {
      playerSet('isPlaying', false);
      return;
    }
    const directURL = await getDirectURL(track);
    if (!directURL) {
      await deleteUserDataFromStorage();
      userSet('readyState', USER_READY_STATE.EXPIRED);
      musicSet('readyState', LIST_READY_STATE.EXPIRED);
      return;
    }
    const { list } = get(musicStore);
    const prevTrack = getTrackByOffset(list, track, -1);
    const nextTrack = getTrackByOffset(list, track, +1);
    playerSet('isPlaying', true);
    playerSet('track', track);
    playerSet('prevTrack', prevTrack);
    playerSet('nextTrack', nextTrack);
    await sendMessage('player-src', directURL);
    await sendMessage('player-play', track);
    setMediaActions({
      onPrev: playPrevTrack,
      onNext: playNextTrack,
    });
  }
  catch (err) {
    console.error(err);
    addError(err);
  }
}
async function getDirectURL(track) {
  let directURL = audioURLMap.get(track.id);
  if (!directURL) {
    const { id: userId, cookieValue } = get(userStore);
    const tokens = [track.tokenForEncodedURL];
    if (track.prevTrack) {
      tokens.push(track.prevTrack.tokenForEncodedURL);
    }
    if (track.nextTrack) {
      tokens.push(track.nextTrack.tokenForEncodedURL);
    }
    const nearestURLs = await getDirectAudiosURL({
      userId,
      cookie: getCookieString(COOKIE_NAME, cookieValue),
      tokens,
    });
    if (!nearestURLs.length) {
      directURL = '';
    }
    nearestURLs.forEach(([id, url]) => {
      audioURLMap.set(id, url);
      if (id === track.id) {
        directURL = url;
      }
    });
  }
  return directURL;
}
async function setPlayerVolume(nextVolume) {
  await sendMessage('player-volume', nextVolume);
  playerSet('volume', nextVolume);
}
async function setPlayerTime(nextTime) {
  await sendMessage('player-time', nextTime);
}
async function playPrevTrack() {
  const { prevTrack } = get(playerStore);
  await toggleTrack(prevTrack);
}
async function toggleCurrentTrack() {
  const { track } = get(playerStore);
  await toggleTrack(track);
}
async function playNextTrack() {
  const { nextTrack } = get(playerStore);
  await toggleTrack(nextTrack);
}
async function handlePlayerEnd() {
  const { nextTrack } = get(playerStore);
  await toggleTrack(nextTrack);
}
async function handlePlayerState(nextState) {
  const tracks = get(tracksStore);
  const {
    isPlaying,
    isLoading,
    currentTime,
    currentTrackId,
    volume,
  } = nextState;
  playerSet('isPlaying', isPlaying);
  playerSet('isLoading', isLoading);
  playerSet('currentTime', currentTime);
  if (volume) {
    playerSet('volume', volume);
  }
  else {
    await sendMessage('player-volume', PLAYER_STATE.volume);
  }
  let [track] = tracks;
  if (currentTrackId) {
    const currentTrack = tracks.find((item) => item.id === currentTrackId);
    if (currentTrack) {
      track = currentTrack;
    }
  }
  playerSet('track', track);
  playerSet('prevTrack', track.prevTrack);
  playerSet('nextTrack', track.nextTrack);
}
function handlePlayerTimeUpdate(nextCurrentTime) {
  playerSet('currentTime', nextCurrentTime);
}
function handlePlayerLoadStart() {
  playerSet('isLoading', true);
}
function handlePlayerCanPlayThrough() {
  playerSet('isLoading', false);
}
function addMusicListPage(page) {
  const { update } = musicStore;
  update((prevState) => {
    return {
      ...prevState,
      list: prevState.list.concat(page),
    };
  });
}
function setMusicOwnerId(nextOwnerId) {
  musicSet('ownerId', nextOwnerId);
}
function addError(err) {
  const { update } = rootStore;
  const timestamp = Date.now();
  const message = err.message || ERROR_MESSAGE;
  const error = {
    timestamp,
    message,
  };
  update((prevState) => {
    return {
      ...prevState,
      errors: prevState.errors.concat([error]),
    };
  });
}

export function getStores() {
  return {
    root: rootStore,
    user: userStore,
    player: playerStore,
    music: musicStore,
    tracks: tracksStore,
    init,
    reTry,
    obtainMusicList,
    setMusicOwnerId,
    setPlayerTime,
    playPrevTrack,
    toggleCurrentTrack,
    playNextTrack,
    setPlayerVolume,
  };
}
