export const LOCALES = {
  EN: 'en-US',
  RU: 'ru-RU',
  UA: 'uk-UA',
  BY: 'ru_BY',
};

export const DEFAULT_LOCALE = LOCALES.EN;

export const I18N_STRINGS = {
  [LOCALES.EN]: {
    downloadTab: {
      stateFiltering: 'Filtering already downloaded',
      stateObtaining: 'Obtaining direct urls',
      stateDownloading: 'Downloading',
      actionStartAgain: 'Start again',
      actionStart: 'Start',
      messageInitial: 'Press "Start" to initiate download',
      messageNotReady: 'Main playlist is empty / stale cookie / no user ID / no cookie',
      messageFinished: 'Download finished',
      actionGetFailed: 'Get .csv file of failed {$0} tracks',
      actionShowDir: 'Show directory',
    },
    exportTab: {
      messageThrough: 'Files for exporting through',
      actionGetDefault: 'Download .csv file with default track fields',
      actionGetMinimal: 'Download .csv file with only title and performer fields',
    },
    listTab: {
      stateInitial: 'List initializing..',
      stateStorage: 'Getting list from storage..',
      stateFetching: 'Loading list..',
      stateNoUser: 'No user to show music tracks from',
      stateNoTracks: 'No tracks found',
      labelOwnerId: 'Music owner ID',
      actionRefresh: 'Refresh',
    },
    tabs: {
      actionMain: 'Main playlist',
      actionExport: 'Export',
      actionDownload: 'Download',
    },
    user: {
      stateInitial: 'Initializing',
      stateStorage: 'Getting user data from storage',
      stateTabs: 'Getting user data from opened VK tab',
      stateCookies: 'Getting cookie information',
      stateExpired: 'Cookie has expired',
      stateNotFound: 'Would you be so kind to login into your vk account and open your audios page',
      labelUserId: 'User ID',
      labelCookie: 'Cookie',
      actionRetry: 'Retry',
    },
  },
  [LOCALES.RU]: {
    downloadTab: {
      stateFiltering: 'Фильтрация уже скачанных',
      stateObtaining: 'Получение прямых ссылок',
      stateDownloading: 'Скачивание',
      actionStartAgain: 'Повторить',
      actionStart: 'Начать',
      messageInitial: 'Нажмите "Начать" для скачивания',
      messageNotReady: 'Либо нет аудиозаписей, либо устаревшая cookie, либо нет юзера, либо нет cookie',
      messageFinished: 'Скачивание завершено',
      actionGetFailed: 'Скачать .csv файл с не скачанными {$0} аудиозаписями',
      actionShowDir: 'Открыть папку',
    },
    exportTab: {
      messageThrough: 'Файлы для экспорта через',
      actionGetDefault: 'Скачать .csv файл со всеми полями аудиозаписей',
      actionGetMinimal: 'Скачать .csv файл только с названием и исполнителями',
    },
    listTab: {
      stateInitial: 'Получение списка..',
      stateStorage: 'Получение из локального хранилища..',
      stateFetching: 'Загрузка списка..',
      stateNoUser: 'Нет юзера',
      stateNoTracks: 'Нет аудиозаписей',
      labelOwnerId: 'Чьи аудиозаписи',
      actionRefresh: 'Обновить',
    },
    tabs: {
      actionMain: 'Аудиозаписи',
      actionExport: 'Экспорт',
      actionDownload: 'Скачивание',
    },
    user: {
      stateInitial: 'Инициализация',
      stateStorage: 'Получение из хранилища',
      stateTabs: 'Получение из вкладки VK',
      stateCookies: 'Чтение cookie',
      stateExpired: 'Cookie устарела',
      stateNotFound: 'Будьте добры войти в свой аккаунт vk и открыть свою страницу с аудиозаписями',
      labelUserId: 'Юзер ID',
      labelCookie: 'Cookie',
      actionRetry: 'Повторить',
    },
  },
};

/**
 * Returns i18n strings of current browser locale
 * @return {Object} i18n
 * */
export function getI18NStrings() {
  const locale = detectLocale();
  switch (locale) {
    case LOCALES.UA:
    case LOCALES.BY:
    case LOCALES.RU:
      return I18N_STRINGS[LOCALES.RU];
    case LOCALES.EN:
    default:
      return I18N_STRINGS[LOCALES.EN];
  }
}

/**
 * Replaces `{$i}` tokens with provided values
 * @param {string} string
 * @param {...*} values
 * @return {string}
 * */
export function replaceI18NString(string, ...values) {
  return values.reduce((result, value, index) => result.replace(`{$${index}}`, value), string);
}

function detectLocale() {
  return (window.navigator.languages && window.navigator.languages[0])
    || window.navigator.language
    || DEFAULT_LOCALE;
}
