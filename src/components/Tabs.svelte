<script>
  import { getContext } from 'svelte';
  import List from '~/src/components/List.svelte';
  import Export from '~/src/components/Export.svelte';
  import Download from '~/src/components/Download.svelte';

  const TABS = {
    LIST: 'LIST',
    EXPORT: 'EXPORT',
    DOWNLOAD: 'DOWNLOAD',
  };

  export let className = '';
  let selectedTabKey = TABS.LIST;
  let tabs = [];

  const stores = getContext('stores');
  const { i18n } = stores;

  function handleTabSelect(nextTabKey) {
    selectedTabKey = nextTabKey;
  }

  $: tabs = [
    {
      key: TABS.LIST,
      label: $i18n.tabs.actionMain,
      selected: TABS.LIST === selectedTabKey,
      onSelect: () => handleTabSelect(TABS.LIST),
    },
    {
      key: TABS.EXPORT,
      label: $i18n.tabs.actionExport,
      selected: TABS.EXPORT === selectedTabKey,
      onSelect: () => handleTabSelect(TABS.EXPORT),
    },
    {
      key: TABS.DOWNLOAD,
      label: $i18n.tabs.actionDownload,
      selected: TABS.DOWNLOAD === selectedTabKey,
      onSelect: () => handleTabSelect(TABS.DOWNLOAD),
    },
  ]
</script>

<div class="tabs {className}">
  <ul class="tabs__list">
    {#each tabs as tab (tab.key)}
    <li class="tabs__item">
      <button
        class="btn tabs__tab-btn"
        class:tabs__tab-btn_selected={tab.selected}
        disabled={tab.selected}
        type="button"
        on:click={tab.onSelect}
      >
        <span class="btn__wrp">
          <span class="btn__label">
            {tab.label}
          </span>
        </span>
      </button>
    </li>
    {/each}
  </ul>
  {#if selectedTabKey === TABS.LIST}
  <List />
  {:else if selectedTabKey === TABS.EXPORT}
  <Export />
  {:else if selectedTabKey === TABS.DOWNLOAD}
  <Download />
  {/if}
</div>

<style global>
  .tabs {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .tabs__list {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    margin: 0 0 16px;
    padding: 0 16px;
    list-style: none;
    border-bottom: 4px solid #ffffff0a;
  }
  .tabs__item {
    padding: 0;
  }
  .tabs__tab-btn {
    padding: 8px 12px;
    color: #ffffffbf;
    transition: color 0.15s, background-color 0.15s;
  }
  .tabs__tab-btn:hover {
    background-color: #ffffff0a;
  }
  .tabs__tab-btn_selected {
    color: #ffffff;
    background-color: #ffffff0a;
    opacity: 1;
    pointer-events: none;
  }
</style>
