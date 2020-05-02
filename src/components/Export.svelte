<script>
  import { getContext } from 'svelte';
  import { EXPORT_READY_STATE } from '~/src/helpers/export';
  import Pending from '~/src/components/Pending.svelte';

  export let className = '';

  const stores = getContext('stores');
  const exp = stores.export;
  const { startMusicExport } = stores;

  function handleExportStart() {
    startMusicExport();
  }
</script>

<div class="export {className}">
  <button
    class="btn export__start-btn"
    class:export__start-btn_progress={$exp.readyState === EXPORT_READY_STATE.PROCESSING}
    disabled={[
      EXPORT_READY_STATE.NOT_READY,
      EXPORT_READY_STATE.PROCESSING,
    ].includes($exp.readyState)}
    type="button"
    on:click={handleExportStart}
  >
    <span class="btn__wrp">
      <span class="btn__label">
        {#if $exp.readyState === EXPORT_READY_STATE.PROCESSING}
        Processing ({$exp.progress}%)
        {:else if $exp.readyState === EXPORT_READY_STATE.FINISHED}
        Start again
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
    Main playlist export finished
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
</style>
