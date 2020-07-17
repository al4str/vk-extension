import { sendMessage, onMessage } from '~/src/helpers/messages';
import { DOWNLOAD_BULK_READY_STATE, startBulkDownload } from '~/src/helpers/download';

export function initBackground() {
  const downloadState = {
    readyState: DOWNLOAD_BULK_READY_STATE.INITIAL,
    progress: 0,
    tracks: [],
    failed: [],
    finished: [],
  };
  onMessage('download:state', async () => {
    try {
      await sendMessage('download:state', downloadState);
    }
    catch (err) {
      console.warn(err);
    }
  });
  onMessage('download:start', async (options) => {
    const {
      list,
      userId,
      cookie,
    } = options;
    await startBulkDownload({
      list,
      userId,
      cookie,
      onReadyStateChange(nextReadyState) {
        try {
          downloadState.readyState = nextReadyState;
          sendMessage('download:on-ready-state-change', nextReadyState);
        }
        catch (err) {
          console.warn(err);
        }
      },
      onProgressChange(nextProgress) {
        try {
          downloadState.progress = nextProgress;
          sendMessage('download:on-progress-change', nextProgress);
        }
        catch (err) {
          console.warn(err);
        }
      },
      onTrackProcess(tracks) {
        try {
          downloadState.tracks = tracks;
          sendMessage('download:on-track-process', tracks);
        }
        catch (err) {
          console.warn(err);
        }
      },
      onFinished(failed, finished) {
        try {
          const failedTracks = [];
          const finishedTracks = [];
          list.forEach((track) => {
            if (failed.includes(track.id)) {
              failedTracks.push(track);
            }
            else if (finished.includes(track.id)) {
              finishedTracks.push(track);
            }
          });
          downloadState.failed = failedTracks;
          downloadState.finished = finishedTracks;
          sendMessage('download:on-finish', {
            failed: failedTracks,
            finished: finishedTracks,
          });
        }
        catch (err) {
          console.warn(err);
        }
      },
    });
  });
}
