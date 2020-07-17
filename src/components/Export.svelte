<script>
  import { getContext } from 'svelte';
  import { downloadFromURL } from '~/src/helpers/downloader';
  import {
    getDefaultFieldsFrom,
    getMinimalFieldsFrom,
    getCSVAudioList,
  } from '~/src/helpers/audio';

  export let className = '';
  let disabled = true;

  const stores = getContext('stores');
  const { i18n, music } = stores;

  $: disabled = $music.list.length === 0;

  function getCSVListURL(list) {
    const data = getCSVAudioList(list);
    const blob = new window.Blob([data], { type: 'text/csv;charset=utf-8;' });
    return window.URL.createObjectURL(blob);
  }
  async function downloadDefaultList() {
    const list = $music.list.map(getDefaultFieldsFrom);
    const url = getCSVListURL(list);
    await downloadFromURL(url, `vk-${$music.ownerId}-playlist.csv`, true);
    window.URL.revokeObjectURL(url);
  }
  async function downloadMinimalList() {
    const list = $music.list.map(getMinimalFieldsFrom);
    const url = getCSVListURL(list);
    await downloadFromURL(url, `vk-${$music.ownerId}-playlist-mini.csv`, true);
    window.URL.revokeObjectURL(url);
  }
</script>

<div class="export {className}">
  <div class="export__wrp">
    <span class="export__label">
      <span>
        {$i18n.exportTab.messageThrough}
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
          {$i18n.exportTab.actionGetDefault}
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
          {$i18n.exportTab.actionGetMinimal}
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
