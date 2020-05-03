<script>
  import { getContext } from 'svelte';
  import { EXPORT_READY_STATE } from '~/src/helpers/export';
  import { getCSVAudioList } from '~/src/helpers/audio';
  import Pending from '~/src/components/Pending.svelte';

  export let className = '';

  const stores = getContext('stores');
  const exp = stores.export;
  const { music, startMusicExport } = stores;
  let url = '';

  function handleExportStart() {
    startMusicExport();
  }
  function handleDownloadLinkGet() {
    const data = getCSVAudioList($music.list);
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    url = window.URL.createObjectURL(blob);
  }
</script>

<div class="export {className}">
  <button
    class="btn export__start-btn"
    class:export__start-btn_progress={$exp.readyState === EXPORT_READY_STATE.PROCESSING}
    disabled={!!url || [
      EXPORT_READY_STATE.NOT_READY,
      EXPORT_READY_STATE.PROCESSING,
    ].includes($exp.readyState)}
    type="button"
    on:click={$exp.readyState === EXPORT_READY_STATE.FINISHED
      ? handleDownloadLinkGet
      : handleExportStart}
  >
    <span class="btn__wrp">
      <span class="btn__label">
        {#if $exp.readyState === EXPORT_READY_STATE.PROCESSING}
        Processing ({$exp.progress}%)
        {:else if $exp.readyState === EXPORT_READY_STATE.FINISHED}
        Get <code>.csv</code> file download link
        {:else}
        Start
        {/if}
      </span>
    </span>
    {#if $exp.readyState === EXPORT_READY_STATE.PROCESSING}
    <Pending
      className="export__start-pending"
      theme="dark"
    />
    {/if}
  </button>
  <p class="export__message">
    {#if $exp.readyState === EXPORT_READY_STATE.INITIAL}
    Press "Start" to initiate export
    {:else if $exp.readyState === EXPORT_READY_STATE.NOT_READY}
    Main playlist is empty
    {:else if $exp.readyState === EXPORT_READY_STATE.PROCESSING}
    <span class="export__item">
      {$exp.item}
    </span>
    {:else if $exp.readyState === EXPORT_READY_STATE.FINISHED}
    <span class="export__item">
      Main playlist export finished
      {#if url}
        <a
          class="export__link"
          href={url}
          download="vk-main-playlist.csv"
        >
          Download <code>.csv</code> file
        </a>
      {/if}
    </span>
    {/if}
  </p>
</div>

<style global>
  .export {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    padding: 0 16px 32px;
  }
  .export__start-btn {
    padding: 8px 12px;
    background-color: #ffffff0a;
    transition: background-color 0.15s;
  }
  .export__start-btn:hover {
    background-color: #ffffff0f;
  }
  .export__start-btn_progress {
    position: relative;
    opacity: 1;
    pointer-events: none;
  }
  .export__start-pending {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
  }
  .export__message {
    margin: 16px 0 0;
    color: #ffffffbe;
  }
  .export__item {
    display: block;
    max-width: 80vw;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    white-space: nowrap;
  }
  .export__link {
    display: block;
    color: inherit;
    text-decoration: underline;
    line-height: 1.5;
  }
</style>
