import { writable, get } from 'svelte/store';
import { ERROR_MESSAGE } from '~/src/helpers/error';
import {
  COOKIE_NAME,
  isCookieExpired,
  getCookieString,
} from '~/src/helpers/cookies';
import {
  fetchAudioList,
} from '~/src/helpers/audio';
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
  deleteListFromStorage,
} from '~/src/helpers/list';
import {
  EXPORT_READY_STATE,
  startExport,
} from '~/src/helpers/export';

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

const MUSIC_STATE = {
  readyState: LIST_READY_STATE.INITIAL,
  ownerId: '',
  list: [],
};
const musicStore = writable(MUSIC_STATE);
const musicSet = updater.bind(null, musicStore.update);

const ROOT_STATE = {
  errors: [],
};
const rootStore = writable(ROOT_STATE);

const EXPORT_STATE = {
  readyState: EXPORT_READY_STATE.INITIAL,
  progress: 0,
  item: null,
};
const exportStore = writable(EXPORT_STATE);
const exportSet = updater.bind(null, exportStore.update);

async function init() {
  try {
    await obtainUserData();
    await obtainMusicList();
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
async function obtainMusicList(forceRefresh = false) {
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
    if (forceRefresh) {
      await deleteListFromStorage(ownerId);
    }
    else {
      musicSet('readyState', LIST_READY_STATE.STORAGE);
      const storageList = await getListFromStorage(ownerId);
      if (storageList) {
        musicSet('list', storageList);
        musicSet('readyState', LIST_READY_STATE.READY);
        return;
      }
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
async function startMusicExport() {
  const { list } = get(musicStore);
  if (!list.length) {
    exportSet('readyState', EXPORT_READY_STATE.NOT_READY);
    return;
  }
  exportSet('readyState', EXPORT_READY_STATE.PROCESSING);
  await startExport({
    list,
    onProcess(item, progress) {
      if (progress === 100) {
        exportSet('readyState', EXPORT_READY_STATE.FINISHED);
        exportSet('progress', 0);
        exportSet('item', null);
        return;
      }
      exportSet('progress', progress);
      exportSet('item', item
        ? item.fullTitle
        : 'Unknown');
    },
  });
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

export function getStores() {
  return {
    root: rootStore,
    user: userStore,
    music: musicStore,
    export: exportStore,
    init,
    reTry,
    obtainMusicList,
    setMusicOwnerId,
    startMusicExport,
  };
}
