<script>
  import Cover from '~/src/components/Cover.svelte';

  export let className = '';
  export let index = 0;
  export let track = {};

  function handleDownload() {}
</script>

<div class="track {className}">
  <div class="track__cover-wrp">
    <Cover
      className="track__cover"
      src={track.coverUrlSmall}
      alt={track.fullTitle}
    />
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
    padding: 8px 0;
    box-sizing: border-box;
    border-radius: 3px;
  }
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
    color: #ffffffbe;
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
    color: #ffffffbe;
  }
</style>
