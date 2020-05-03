import { createTrack } from '~/src/helpers/library';
import { WHITELISTED_AUDIO_FIELDS } from '~/src/helpers/audio';

export const EXPORT_READY_STATE = {
  INITIAL: 'INITIAL',
  NOT_READY: 'NOT_READY',
  PROCESSING: 'PROCESSING',
  FINISHED: 'FINISHED',
};

export async function startExport(options) {
  const {
    list = [],
    onProcess = Function.prototype,
  } = options || {};
  const exportGenerator = exportList(list);
  // eslint-disable-next-line no-restricted-syntax
  for await (const itemProgress of exportGenerator) {
    onProcess(itemProgress.item, itemProgress.progress);
  }
}

async function* exportList(list) {
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
      await createTrack(track);
    }
    catch (err) {
      console.error(err);
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
