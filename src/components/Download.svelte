<script>
  import { getContext, afterUpdate } from 'svelte';
  import { DOWNLOAD_BULK_READY_STATE } from '~/src/helpers/download';
  import { getCSVAudioList } from '~/src/helpers/audio';
  import Pending from '~/src/components/Pending.svelte';

  export let className = '';
  let pending = false;
  let url = '';

  const { download, startMusicDownload } = getContext('stores');

  $: pending = [
    DOWNLOAD_BULK_READY_STATE.NOT_READY,
    DOWNLOAD_BULK_READY_STATE.DOWNLOADING,
  ].includes($download.readyState);

  function handleDownloadStart() {
    startMusicDownload();
  }

  afterUpdate(() => {
    if ($download.readyState === DOWNLOAD_BULK_READY_STATE.FINISHED
      && $download.failedList.length > 0) {
      const data = getCSVAudioList($download.failedList);
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      url = window.URL.createObjectURL(blob);
    }
    else {
      url = '';
    }
  })
</script>

<div class="download {className}">
  <button
    class="btn download__start-btn"
    class:download__start-btn_progress={$download.readyState === DOWNLOAD_BULK_READY_STATE.DOWNLOADING}
    disabled={pending}
    type="button"
    on:click={handleDownloadStart}
  >
    <span class="btn__wrp">
      <span class="btn__label">
        {#if $download.readyState === DOWNLOAD_BULK_READY_STATE.DOWNLOADING}
          Downloading ({$download.progress}%)
        {:else}
          Start
        {/if}
      </span>
    </span>
    {#if $download.readyState === DOWNLOAD_BULK_READY_STATE.DOWNLOADING}
      <Pending
        className="download__start-pending"
        theme="dark"
      />
    {/if}
  </button>
  <p class="download__message">
    {#if $download.readyState === DOWNLOAD_BULK_READY_STATE.INITIAL}
      Press "Start" to initiate download
    {:else if $download.readyState === DOWNLOAD_BULK_READY_STATE.NOT_READY}
      Main playlist is empty or there are no user id and cookie session
    {:else if $download.readyState === DOWNLOAD_BULK_READY_STATE.DOWNLOADING}
      <span class="download__item">
        {$download.item}
      </span>
    {:else if $download.readyState === DOWNLOAD_BULK_READY_STATE.FINISHED}
      <span class="download__item">
        Main playlist downloaded
      </span>
      {#if url}
        <a
          class="export__link"
          href={url}
          download="download-failed-playlist.csv"
        >
          But some couldn't.<br>
          Get <code>.csv</code> file of failed ones
        </a>
      {/if}
    {/if}
  </p>
</div>

<style global>
  .download {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    padding: 0 16px 32px;
  }
  .download__start-btn {
    padding: 8px 12px;
    background-color: #ffffff0a;
    transition: background-color 0.15s;
  }
  .download__start-btn:hover {
    background-color: #ffffff0f;
  }
  .download__start-btn_progress {
    position: relative;
    opacity: 1;
    pointer-events: none;
  }
  .download__start-pending {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
  }
  .download__message {
    margin: 16px 0 0;
    color: #ffffffbe;
    text-align: center;
  }
  .download__item {
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
