<script>
  import { getContext, onMount, onDestroy, afterUpdate } from 'svelte';
  import { LIST_READY_STATE } from '~/src/helpers/list';
  import Track from '~/src/components/Playlist/Track.svelte';

  const stores = getContext('stores');
  const { music, tracks } = stores;

  let offset = 0;
  let limit = 20;
  let observer = null;
  let observingEl = null;

  $: limitedTracks = $tracks.slice(0, offset);

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

<div class="list {$$restProps.class || ''}">
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
        Music owner ID&nbsp;
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
      {#each limitedTracks as track, index}
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
  .list {}
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
  .list__owner-field {
    display: inline-block;
    opacity: 0.75;
  }
  .list__refresh-btn {
    margin-left: auto;
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
