<script>
  import { getContext, onMount, onDestroy } from 'svelte';
  import { getHumanDuration } from '~/src/helpers/audio';
  import Button from '~/src/components/Button.svelte';
  import Cover from '~/src/components/Cover.svelte';

  export let className = '';

  const stores = getContext('stores');
  const { player } = stores;

  let coverUrlSmall;
  let fullTitle;
  let title;
  let allPerformers;
  let duration;
  let humanDuration;
  let timelineEl = null;
  let timeWidth;
  let timeLeft;
  let prevVolume = $player.volume;

  $: {
    const track = $player.track || {};
    coverUrlSmall = track.coverUrlSmall || '';
    fullTitle = track.fullTitle || '';
    title = track.title || '';
    allPerformers = track.allPerformers || '';
    duration = track.duration || 0;
    humanDuration = track.humanDuration || getHumanDuration(0);
  }
  $: {
    const currentTime = $player.currentTime || 0;
    timeLeft = getHumanDuration(currentTime);
    timeWidth = (currentTime * 100 / duration).toFixed(3);
  }

  function handleMouseMove(e) {
    e.preventDefault();
    const { width, left } = timelineEl.getBoundingClientRect();
    const time = duration * ((e.pageX - left) * 100 / width) / 100;
    const nextTime = Math.min(time, duration - 1);
    stores.setPlayerTime(nextTime);
  }
  function handleMouseDown(e) {
    e.preventDefault();
    prevVolume = $player.volume;
    stores.setPlayerVolume(0);
    handleMouseMove(e);
    window.document.addEventListener('mousemove', handleMouseMove);
    window.document.addEventListener('mouseup', handleMouseUp);
  }
  function handleMouseUp(e) {
    e.preventDefault();
    stores.setPlayerVolume(prevVolume);
    window.document.removeEventListener('mousemove', handleMouseMove);
    window.document.removeEventListener('mouseup', handleMouseUp);
  }
  function handleVolumeChange(e) {
    const { target: { value } } = e;
    stores.setPlayerVolume(parseFloat(value));
  }
</script>

<div
  class="player {className}"
  class:player_has-track={$player.track}
  class:player_playing={$player.isPlaying}
  class:player_progress={$player.isLoading}
>
  <div class="player__wrp">
    <Button
      className="player__btn player__btn_prev"
      disabled={!$player.track || !$player.prevTrack}
      label="Prev"
      onClick={stores.playPrevTrack}
    />
    <Button
      className="player__btn player__btn_play"
      disabled={!$player.track}
      label={$player.isPlaying
        ? 'Pause'
        : 'Play'}
      onClick={stores.toggleCurrentTrack}
    />
    <Button
      className="player__btn player__btn_next"
      disabled={!$player.track || !$player.nextTrack}
      label="Next"
      onClick={stores.playNextTrack}
    />
    <Cover
      className="player__cover"
      src={coverUrlSmall}
      alt={fullTitle}
    />
    <span class="player__full-title">
      <span class="player__title">
        {@html title}
      </span>
      <span class="player__performers">
        {@html allPerformers}
      </span>
    </span>
    <span class="player__timings">
      {timeLeft} / {humanDuration}
    </span>
    <label class="player__volume-wrp">
      <input
        class="player__volume-field"
        type="number"
        value={$player.volume}
        min="0.0"
        max="1.0"
        step="0.1"
        on:change={handleVolumeChange}
      />
    </label>
  </div>
  <div
    class="player__timeline"
    bind:this={timelineEl}
    on:mousedown={handleMouseDown}
  >
    {#if $player.isLoading}
      <span class="player__progress-bar" />
    {/if}
    <span
      class="player__seek"
      style="width:{timeWidth}%;"
    >
      <span class="player__handler" />
    </span>
  </div>
</div>

<style global>
  @keyframes slide {
    from { transform: translateX(-25vw); }
    to { transform: translateX(100vw); }
  }
  .player {
    position: relative;
    width: 100%;
    padding: 12px 0;
    box-sizing: border-box;
    background-color: #222222;
  }
  .player::before {
    content: '';
    position: absolute;
    left: -16px;
    top: -40px;
    width: calc(100% + 32px);
    height: 40px;
    background: linear-gradient(to bottom, rgba(229, 229, 229, 0) 0%, rgba(51, 51, 51, 1) 100%);
    pointer-events: none;
  }
  .player__wrp {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  .player__btn {
    margin-right: 10px;
    text-indent: -9999px;
    background: center no-repeat;
    transition: opacity 0.15s;
  }
  .player__btn:hover {
    opacity: 0.75;
  }
  .player__btn_prev {
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='10' viewBox='0 0 9 10'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M2 4.709V.596A.604.604 0 0 0 1.4 0H.6C.27 0 0 .267 0 .596v8.808c0 .33.278.596.6.596h.8c.331 0 .6-.267.6-.596V5.291c.033.04.074.079.123.114L8.19 9.803c.447.324.81.138.81-.408V.604c0-.55-.359-.735-.81-.408L2.123 4.594A.65.65 0 0 0 2 4.71z'/%3E%3C/svg%3E");
    background-size: 12px auto;
  }
  .player__btn_next {
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='10' viewBox='0 0 9 10'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M7 4.709V.596C7 .266 7.278 0 7.6 0h.8c.331 0 .6.267.6.596v8.808a.604.604 0 0 1-.6.596h-.8a.598.598 0 0 1-.6-.596V5.291a.653.653 0 0 1-.123.114L.81 9.803c-.447.324-.81.138-.81-.408V.604c0-.55.359-.735.81-.408l6.067 4.398A.65.65 0 0 1 7 4.71z'/%3E%3C/svg%3E");
    background-size: 12px auto;
  }
  .player__btn_play {
    width: 40px;
    height: 40px;
    background-image: url("data:image/svg+xml,%3Csvg height='29' viewBox='0 0 28 29' width='28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m11.8 19.9c-.4.3-.8.1-.8-.4v-11c0-.5.4-.7.8-.4l7.7 5.5c.4.2.3.6 0 .8z' fill='%23fff'/%3E%3C/svg%3E");
    background-size: 48px auto;
  }
  .player_playing .player__btn_play {
    background-image: url("data:image/svg+xml,%3Csvg height='29' viewBox='36 0 28 29' width='28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m46 8.6c0-.3.3-.6.6-.6h1.8c.3 0 .6.3.6.6v10.8c0 .3-.3.6-.6.6h-1.8c-.3 0-.6-.3-.6-.6zm5 0c0-.3.3-.6.6-.6h1.8c.3 0 .6.3.6.6v10.8c0 .3-.3.6-.6.6h-1.8c-.3 0-.6-.3-.6-.6z' fill='%23fff'/%3E%3C/svg%3E");
  }
  .player__cover {
    width: 48px;
    height: 48px;
    margin-right: 10px;
    font-size: 12px;
  }
  .player__full-title {
    margin-right: 10px;
    font-size: 12px;
  }
  .player__title {
    display: block;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .player__performers {
    display: block;
    opacity: 0.75;
  }
  .player__timings {
    margin-left: auto;
  }
  .player__volume-wrp {
    margin-left: 10px;
  }
  .player__volume-field {
    font: inherit;
    color: inherit;
    background-color: transparent;
    border: 0;
    opacity: 0.75;
  }
  .player__timeline {
    position: relative;
    width: 100%;
    height: 4px;
    overflow: hidden;
    background-color: #383838;
  }
  .player_playing .player__timeline {
    cursor: pointer;
  }
  .player__progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 25%;
    height: 4px;
    background-color: #4b4b4b;
    animation: slide 1s linear infinite;
  }
  .player__seek {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 4px;
    background-color: #2fd87a;
  }
  .player__handler {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 4px;
    height: 4px;
    background-color: #2fd87a;
    opacity: 0;
    transition: height 0.15s, background-color 0.15s;
  }
  .player_playing .player__handler {
    opacity: 1;
  }
  .player__timeline:hover .player__handler {
    height: 8px;
    background-color: #2bb764;
  }
</style>
