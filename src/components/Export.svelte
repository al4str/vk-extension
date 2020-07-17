<script>
  import { getContext, onDestroy } from 'svelte';
  import { downloadFromURL } from '~/src/helpers/downloader';
  import {
    getDefaultFieldsFrom,
    getMinimalFieldsFrom,
    getCSVAudioList,
  } from '~/src/helpers/audio';

  export let className = '';
  let minimalListURL = '';
  let defaultListURL = '';
  let disabled = true;

  const stores = getContext('stores');
  const { music } = stores;

  $: disabled = $music.list.length === 0;

  function getCSVListURL(list) {
    const data = getCSVAudioList(list);
    const blob = new window.Blob([data], { type: 'text/csv;charset=utf-8;' });
    return window.URL.createObjectURL(blob);
  }
  async function downloadDefaultList() {
    const defaultList = $music.list.map(getDefaultFieldsFrom);
    const defaultListURL = getCSVListURL(defaultList);
    await downloadFromURL(defaultListURL, `vk-${$music.ownerId}-playlist.csv`, true);
  }
  async function downloadMinimalList() {
    const minimalList = $music.list.map(getMinimalFieldsFrom);
    const defaultListURL = getCSVListURL(minimalList);
    await downloadFromURL(defaultListURL, `vk-${$music.ownerId}-playlist-mini.csv`, true);
  }

  onDestroy(() => {
    if (defaultListURL) {
      window.URL.revokeObjectURL(defaultListURL);
    }
    if (minimalListURL) {
      window.URL.revokeObjectURL(minimalListURL);
    }
  })
</script>

<div class="export {className}">
  <div class="export__wrp">
    <span class="export__label">
      <span>
        Files for exporting through
      </span>
      <a
        class="export__link"
        href="https://www.tunemymusic.com/"
        target="_blank"
        rel="noreferrer noopener"
      >
        TuneMyMusic
      </a>
    </span>
    <button
      class="btn export__download-link"
      disabled={disabled}
      type="button"
      on:click={downloadDefaultList}
    >
      <span class="btn__wrp">
        <span class="btn__label btn__label_multi">
          Download .csv file with default track fields
        </span>
      </span>
    </button>
    <button
      class="btn export__download-link"
      disabled={disabled}
      type="button"
      on:click={downloadMinimalList}
    >
      <span class="btn__wrp">
        <span class="btn__label btn__label_multi">
          Download .csv file with only title and performer fields
        </span>
      </span>
    </button>
  </div>
</div>

<style global>
  .export {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 16px 32px;
  }
  .export__wrp {
    max-width: 80vw;
  }
  .export__label {
    display: block;
    color: #ffffffbe;
  }
  .export__link {
    display: inline-block;
    color: inherit;
    text-decoration: underline;
  }
  .export__download-link {
    display: block;
    width: 100%;
    margin-top: 16px;
    padding: 8px 12px;
    background-color: #ffffff0a;
    transition: background-color 0.15s;
  }
  .export__download-link:hover {
    background-color: #ffffff0f;
  }
  .export__link_disabled,
  .export__link_disabled:disabled {
    background-color: #ffffff0a;
  }
</style>
