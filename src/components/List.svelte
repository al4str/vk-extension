<script>
  import { getContext, onMount, onDestroy, afterUpdate } from 'svelte';
  import { LIST_READY_STATE } from '~/src/helpers/list';
  import Track from '~/src/components/Playlist/Track.svelte';

  export let className = '';

  const stores = getContext('stores');
  const { music } = stores;

  let offset = 0;
  let limit = 20;
  let observer = null;
  let observingEl = null;
  let limitedTracks = [];

  $: limitedTracks = $music.list.slice(0, offset);

  function handleUserIdChange(e) {
    const { target: { value } } = e;
    stores.setMusicOwnerId(value);
  }
  function handleListRefresh() {
    stores.obtainMusicList();
  }

  onMount(() => {
    observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        offset += limit;
      }
    });
  });
  afterUpdate(() => {
    if (observer && observingEl) {
      observer.observe(observingEl);
    }
  });
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
    observer = null;
  });
</script>

<div class="list {className}">
  {#if $music.readyState === LIST_READY_STATE.INITIAL}
    <p class="list__state">
      List initializing
    </p>
  {:else if $music.readyState === LIST_READY_STATE.STORAGE}
    <p class="list__state">
      Getting list from storage
    </p>
  {:else if $music.readyState === LIST_READY_STATE.FETCH}
    <p class="list__state">
      Loading list
    </p>
  {:else}
    <div class="list__actions">
      <label class="list__owner-wrp">
        <span class="list__owner-label">
          Music owner ID
        </span>
        <input
          class="input list__owner-field"
          value={$music.ownerId}
          on:input={handleUserIdChange}
        />
      </label>
      <button
        class="btn list__refresh-btn"
        type="button"
        on:click={handleListRefresh}
      >
        Refresh
      </button>
    </div>
    <ul class="list__list">
      {#each limitedTracks as track, index (track.id)}
        <li class="list__item">
          <Track
            index={index}
            track={track}
          />
        </li>
      {/each}
    </ul>
    <span bind:this={observingEl} />
  {/if}
</div>

<style global>
  .list {
    padding: 0 16px 32px;
  }
  .list__state {
    margin: 0;
  }
  .list__actions {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  .list__owner-wrp {
    display: block;
    margin-right: 12px;
  }
  .list__owner-label {
    display: block;
  }
  .list__owner-field {
    display: block;
    color: #ffffffbe;
    transition: color 0.15s;
  }
  .list__owner-field:hover,
  .list__owner-field:focus {
    color: #ffffff;
  }
  .list__refresh-btn {
    margin-left: auto;
    padding: 8px 12px;
    background-color: #ffffff0a;
    transition: background-color 0.15s;
  }
  .list__refresh-btn:hover {
    background-color: #ffffff0f;
  }
  .list__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .list__item {
    padding: 0;
  }
</style>
