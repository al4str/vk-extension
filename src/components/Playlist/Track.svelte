<script>
  import Cover from '~/src/components/Cover.svelte';

  export let index = 0;
  export let track = {};
</script>

<div
  class="track {$$restProps.class || ''}"
  class:track_current={track.isCurrent}
  class:track_playing={track.isPlaying}
>
  <div class="track__cover-wrp">
    <Cover
      class="track__cover"
      src={track.coverUrlSmall}
      alt={track.fullTitle}
    />
    <button
      class="btn track__play-btn"
      type="button"
      on:click={track.togglePlay}
    >
      {#if track.isPlaying}
        Playing
      {:else}
        Play
      {/if}
    </button>
  </div>
  <span class="track__full-title">
    <span class="track__title">
      {@html track.title}
    </span>
    <span class="track__performers">
      {@html track.allPerformers}
    </span>
  </span>
  <span class="track__meta">
    <span class="track__duration">
      {track.humanDuration}
    </span>
    <span class="track__index">
      #{index + 1}
    </span>
  </span>
</div>

<style global>
  .track {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    box-sizing: border-box;
    border-radius: 3px;
  }
  .track_current {
    background-color: #383838;
  }
  .track_playing {}
  .track__cover-wrp {
    position: relative;
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  .track__cover {
    width: 40px;
    height: 40px;
    font-size: 10px;
  }
  .track__play-btn {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    text-indent: -9999px;
    background: center no-repeat;
    transition: background 0.15s;
  }
  .track_current .track__play-btn,
  .track:hover .track__play-btn {
    background-color: rgba(0, 0, 0, 0.35);
    background-image: url("data:image/svg+xml,%3Csvg height='29' viewBox='0 0 28 29' width='28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m11.8 19.9c-.4.3-.8.1-.8-.4v-11c0-.5.4-.7.8-.4l7.7 5.5c.4.2.3.6 0 .8z' fill='%23fff'/%3E%3C/svg%3E");
  }
  .track_playing .track__play-btn,
  .track_playing:hover .track__play-btn {
    background-color: rgba(0, 0, 0, 0.35);
    background-image: url("data:image/svg+xml,%3Csvg height='29' viewBox='36 0 28 29' width='28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m46 8.6c0-.3.3-.6.6-.6h1.8c.3 0 .6.3.6.6v10.8c0 .3-.3.6-.6.6h-1.8c-.3 0-.6-.3-.6-.6zm5 0c0-.3.3-.6.6-.6h1.8c.3 0 .6.3.6.6v10.8c0 .3-.3.6-.6.6h-1.8c-.3 0-.6-.3-.6-.6z' fill='%23fff'/%3E%3C/svg%3E");
  }
  .track__full-title {
    margin-right: 10px;
    font-size: 12px;
  }
  .track__title {
    display: block;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .track__performers {
    display: block;
    opacity: 0.75;
  }
  .track__meta {
    margin-left: auto;
    text-align: right;
    font-size: 12px;
  }
  .track__duration {
    display: block;
    margin-bottom: 4px;
  }
  .track__index {
    display: block;
    opacity: 0.75;
  }
</style>
