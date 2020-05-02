import { onMessage, sendMessage } from '~/src/helpers/messages';

export function setMediaSession(track) {
  if (!('mediaSession' in window.navigator)) {
    return;
  }
  const media = window.navigator.mediaSession;
  media.metadata = new window.MediaMetadata({
    title: track.title,
    artist: track.allPerformers,
    artwork: [
      {
        src: track.coverUrlSmall,
        sizes: '80x80',
        type: 'image/jpeg',
      },
      {
        src: track.coverUrlBig,
        sizes: '150x150',
        type: 'image/jpeg',
      },
    ],
  });
}

export function setMediaActions(actions) {
  if (!('mediaSession' in window.navigator)) {
    return;
  }
  const media = window.navigator.mediaSession;
  if (typeof actions.onPlay === 'function') {
    media.setActionHandler('play', actions.onPlay);
  }
  if (typeof actions.onPause === 'function') {
    media.setActionHandler('pause', actions.onPause);
  }
  if (typeof actions.onPrev === 'function') {
    media.setActionHandler('previoustrack', actions.onPrev);
  }
  if (typeof actions.onNext === 'function') {
    media.setActionHandler('nexttrack', actions.onNext);
  }
  media.setActionHandler('seekbackward', null);
  media.setActionHandler('seekforward', null);
}

export function getPlayer() {
  let queue = [];
  let currentTrack = null;
  const player = new Audio();
  player.onerror = handleError;
  player.ontimeupdate = handleTimeUpdate;
  player.onloadstart = handleLoadStart;
  player.oncanplaythrough = handleCanPlayThrough;
  player.onended = handleEnd;

  async function handlePlay(track) {
    try {
      if (!player.src) {
        return;
      }
      currentTrack = track;
      await player.play();
      setMediaSession(track);
    }
    catch (err) {
      handleError(err);
    }
  }
  function handlePause() {
    player.pause();
  }
  function handleVolumeChange(volume) {
    player.volume = volume;
  }
  function handleSourceChange(src) {
    if (player.src !== src) {
      player.src = src;
    }
  }
  function handleTimeChange(time) {
    player.currentTime = Math.max(0, Math.min(time, player.duration - 0.1));
  }
  function handleError(err) {
    sendMessage('player-error', err);
  }
  function handleTimeUpdate() {
    sendMessage('player-timeupdate', player.currentTime);
  }
  function handleLoadStart() {
    sendMessage('player-loadstart');
  }
  function handleCanPlayThrough() {
    sendMessage('player-canplaythrough');
  }
  function handleEnd() {
    sendMessage('player-end');
  }
  function handleState() {
    sendMessage('player-state', {
      isPlaying: !player.paused,
      isLoading: player.readyState === HTMLMediaElement.HAVE_FUTURE_DATA,
      currentTime: player.currentTime,
      currentTrackId: currentTrack && currentTrack.id,
      volume: player.volume,
    });
  }

  onMessage('player-play', handlePlay);
  onMessage('player-pause', handlePause);
  onMessage('player-volume', handleVolumeChange);
  onMessage('player-src', handleSourceChange);
  onMessage('player-time', handleTimeChange);
  onMessage('player-state', handleState);
}
