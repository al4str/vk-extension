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
    yield {
      item: list[index],
      progress: Math.round(((index + 1) * 100) / list.length),
    };
    // eslint-disable-next-line no-await-in-loop
    await sleep();
    index += 1;
  }
  return {
    item: list[list.length - 1],
    progress: 100,
  };
}

function sleep() {
  return new Promise((resolve) => {
    setTimeout(resolve, 50);
  });
}
