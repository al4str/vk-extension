<script>
  import { getContext, onMount, onDestroy } from 'svelte';
  import { getHumanDuration } from '~/src/helpers/audio';
  import Button from '~/src/components/Button.svelte';
  import Cover from '~/src/components/Cover.svelte';

  const stores = getContext('stores');
  const { player } = stores;

  let timelineEl = null;
  let timeWidth = 0;
  let timeLeft = 0;

  function handleMouseMove(e) {
    e.preventDefault();
    const { width, left } = timelineEl.getBoundingClientRect();
    const time = $player.audio.duration * ((e.pageX - left) * 100 / width) / 100;
    const nextTime = Math.min(time, $player.audio.duration - 1);
    stores.setPlayerTime(nextTime);
  }
  function handleMouseDown(e) {
    e.preventDefault();
    $player.audio.volume = 0;
    handleMouseMove(e);
    window.document.addEventListener('mousemove', handleMouseMove);
    window.document.addEventListener('mouseup', handleMouseUp);
  }
  function handleMouseUp(e) {
    e.preventDefault();
    $player.audio.volume = $player.volume;
    window.document.removeEventListener('mousemove', handleMouseMove);
    window.document.removeEventListener('mouseup', handleMouseUp);
  }

  function handleVolumeChange(e) {
    const { target: { value } } = e;
    stores.setPlayerVolume(parseFloat(value));
  }
  function handleTimeUpdate() {
    timeLeft = getHumanDuration($player.audio.currentTime);
    timeWidth = ($player.audio.currentTime * 100 / $player.audio.duration).toFixed(3);
  }

  onMount(() => {
    $player.audio.addEventListener('timeupdate', handleTimeUpdate);
  });
  onDestroy(() => {
    $player.audio.removeEventListener('timeupdate', handleTimeUpdate);
  })
</script>

<div class="player {$$restProps.class || ''}">
  <div class="player__wrp">
    <Button
      class="player__btn player__btn_prev"
      disabled={!$player.track || !$player.prevTrack}
      label="Prev"
      onClick={stores.playPrevTrack}
    />
    <Button
      class="player__btn player__btn_play"
      disabled={!$player.track}
      label={$player.isPlaying
        ? 'Pause'
        : 'Play'}
      onClick={stores.toggleCurrentTrack}
    />
    <Button
      class="player__btn player__btn_next"
      disabled={!$player.track || !$player.nextTrack}
      label="Next"
      onClick={stores.playNextTrack}
    />
    {#if $player.track}
      <Cover
        class="player__cover"
        src={$player.track.coverUrlSmall}
        alt={$player.track.fullTitle}
      />
      <span class="player__title">
        {@html $player.track.fullTitle}
      </span>
      <span class="player__duration">
        {$player.track.humanDuration}
      </span>
      <span class="player__time-left">
        {timeLeft}
      </span>
    {/if}
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
    <span
      class="player__time"
      style="width:{timeWidth}%;"
    />
  </div>
</div>

<style global>
  .player {
    position: sticky;
    z-index: 1;
    top: 0;
    width: 100%;
    padding: 12px 0;
    box-sizing: border-box;
    background-color: #222222;
  }
  .player__wrp {
    display: flex;
    align-items: baseline;
    margin-bottom: 12px;
  }
  .player__btn {
    display: block;
    margin-right: 10px;
  }
  .player__btn_prev {}
  .player__btn_play {}
  .player__btn_next {}
  .player__cover {
    align-self: center;
    margin-right: 10px;
  }
  .player__title {
    margin-right: 10px;
  }
  .player__duration {
    margin-right: 10px;
  }
  .player__time-left {
    margin-left: auto;
  }
  .player__volume-wrp {
    margin-left: 10px;
  }
  .player__volume-field {}
  .player__timeline {
    position: relative;
    width: 100%;
    height: 4px;
    background-color: #383838;
  }
  .player__time {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background-color: #2fd87a;
  }
</style>
