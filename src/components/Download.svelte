<script>
  import { getContext } from 'svelte';
  import { downloadFromURL, showDownloadedFile } from '~/src/helpers/downloader';
  import { DOWNLOAD_BULK_READY_STATE } from '~/src/helpers/download';
  import { AUDIO_DIR_NAME, getCSVAudioList } from '~/src/helpers/audio';
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

  const { i18n, music, download, tag, startMusicDownload } = getContext('stores');

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

  function getCSVListURL(list) {
    const data = getCSVAudioList(list);
    const blob = new window.Blob([data], { type: 'text/csv;charset=utf-8;' });
    return window.URL.createObjectURL(blob);
  }

  async function handleFailedTracksDownload() {
    const url = getCSVListURL($download.failed);
    await downloadFromURL(url, `vk-${$music.ownerId}-failed-to-download.csv`, true);
    window.URL.revokeObjectURL(url);
  }

  function handleShowDir() {
    showDownloadedFile(AUDIO_DIR_NAME);
  }
</script>

<div class="download {className}">
  <div class="download__wrp">
    <button
      class="btn download__btn"
      class:download__btn_progress={pending}
      disabled={notReady || pending}
      type="button"
      on:click={(initial || finished)
        ? handleDownloadStart
        : null}
    >
      <span class="btn__wrp">
        <span class="btn__label">
          {#if filtering}
            {$i18n.downloadTab.stateFiltering} ({$download.progress}%)
          {:else if obtaining}
            {$i18n.downloadTab.stateObtaining} ({$download.progress}%)
          {:else if downloading}
            {$i18n.downloadTab.stateDownloading} ({$download.progress}%)
          {:else if finished}
            {$i18n.downloadTab.actionStartAgain}
          {:else}
            {$i18n.downloadTab.actionStart}
          {/if}
        </span>
      </span>
      {#if pending}
        <Pending
          className="download__pending"
          theme="dark"
        />
      {/if}
    </button>
    <p class="download__message">
      {#if initial}
        {$i18n.downloadTab.messageInitial}
      {:else if notReady}
        {$i18n.downloadTab.messageNotReady}
      {:else if pending}
        <span class="download__items">
          {#each current as trackTitle}
            <span class="download__item">
              {trackTitle}
            </span>
          {/each}
        </span>
      {:else if finished}
        {$i18n.downloadTab.messageFinished} {$download.finished.length}/{$download.finished.length + $download.failed.length}
      {/if}
    </p>
    {#if finished}
      <div class="download__actions">
        {#if $download.failed.length > 0}
          <button
            class="btn download__action download__btn"
            type="button"
            on:click={handleFailedTracksDownload}
          >
            <span class="btn__wrp">
              <span class="btn__label">
                {tag($i18n.downloadTab.actionGetFailed, $download.failed.length)}
              </span>
            </span>
          </button>
        {/if}
        <button
          class="btn download__action download__btn"
          type="button"
          on:click={handleShowDir}
        >
          <span class="btn__wrp">
            <span class="btn__label">
              {$i18n.downloadTab.actionShowDir}
            </span>
          </span>
        </button>
      </div>
    {/if}
  </div>
</div>

<style global>
  .download {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 16px 32px;
  }
  .download__wrp {
    max-width: 80vw;
  }
  .download__btn {
    padding: 8px 12px;
    background-color: #ffffff0a;
    transition: background-color 0.15s;
  }
  .download__btn:hover {
    background-color: #ffffff0f;
  }
  .download__btn_progress {
    position: relative;
    opacity: 1;
    pointer-events: none;
  }
  .download__pending {
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
  }
  .download__items {}
  .download__item {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .download__actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 16px;
  }
  .download__action + .download__action {
    margin-top: 16px;
  }
</style>
