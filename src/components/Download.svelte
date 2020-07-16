<script>
  import { getContext, afterUpdate } from 'svelte';
  import { DOWNLOAD_BULK_READY_STATE } from '~/src/helpers/download';
  import { getCSVAudioList } from '~/src/helpers/audio';
  import Pending from '~/src/components/Pending.svelte';

  export let className = '';
  let initial = true;
  let notReady = false;
  let filtering = false;
  let obtaining = false;
  let downloading = false;
  let finished = false;
  let pending = false;
  let current = '';
  let url = '';

  const {
    download,
    startMusicDownload,
  } = getContext('stores');

  $: initial = $download.readyState === DOWNLOAD_BULK_READY_STATE.INITIAL;
  $: notReady = $download.readyState === DOWNLOAD_BULK_READY_STATE.NOT_READY;
  $: filtering = $download.readyState === DOWNLOAD_BULK_READY_STATE.FILTERING;
  $: obtaining = $download.readyState === DOWNLOAD_BULK_READY_STATE.OBTAINING_URL;
  $: downloading = $download.readyState === DOWNLOAD_BULK_READY_STATE.DOWNLOADING;
  $: finished = $download.readyState === DOWNLOAD_BULK_READY_STATE.FINISHED;
  $: pending = filtering || obtaining || downloading;
  $: current = $download.current.length
    ? $download.current.map((track) => track.fullTitle)
    : [];

  function handleDownloadStart() {
    startMusicDownload();
  }

  afterUpdate(() => {
    if (finished && $download.failed.length > 0) {
      const data = getCSVAudioList($download.failed);
      const blob = new window.Blob([data], { type: 'text/csv;charset=utf-8;' });
      url = window.URL.createObjectURL(blob);
    }
    else {
      window.URL.revokeObjectURL(url);
      url = '';
    }
  });
</script>

<div class="download {className}">
  <button
    class="btn download__start-btn"
    class:download__start-btn_progress={pending}
    disabled={notReady || pending}
    type="button"
    on:click={(initial || finished) ? handleDownloadStart : null}
  >
    <span class="btn__wrp">
      <span class="btn__label">
        {#if filtering}
          Filtering already downloaded ({$download.progress}%)
        {:else if obtaining}
          Obtaining direct urls ({$download.progress}%)
        {:else if downloading}
          Downloading ({$download.progress}%)
        {:else}
          Start
        {/if}
      </span>
    </span>
    {#if pending}
      <Pending
        className="download__start-pending"
        theme="dark"
      />
    {/if}
  </button>
  <p class="download__message">
    {#if initial}
      Press "Start" to initiate download
    {:else if notReady}
      Main playlist is empty / stale cookie / no user ID ? no cookie
    {:else if pending}
      <span class="download__items">
        {#each current as trackTitle}
          <span class="download__item">
            {trackTitle}
          </span>
        {/each}
      </span>
    {:else if finished}
      Downloaded
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
  .download__items {}
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
