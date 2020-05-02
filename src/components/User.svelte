<script>
  import { getContext } from 'svelte';
  import { USER_READY_STATE } from '~/src/helpers/user';

  const stores = getContext('stores');
  const { user } = stores;

  $: partlyHiddenCookie = $user.cookieValue.slice(0, 12).concat('*****');

  function handleReTry() {
    stores.reTry();
  }
</script>

<div class="user {$$restProps.class || ''}">
  {#if $user.readyState === USER_READY_STATE.INITIAL}
    <p class="user__state">
      Initializing
    </p>
  {:else if $user.readyState === USER_READY_STATE.STORAGE}
    <p class="user__state">
      Getting user data from storage
    </p>
  {:else if $user.readyState === USER_READY_STATE.TABS}
    <p class="user__state">
      Getting user data from opened VK tab
    </p>
  {:else if $user.readyState === USER_READY_STATE.COOKIES}
    <p class="user__state">
      Getting cookie information
    </p>
  {:else if $user.readyState === USER_READY_STATE.EXPIRED}
    <p class="user__state">
      Cookie has expired
    </p>
  {:else if $user.readyState === USER_READY_STATE.NOT_FOUND}
    <p class="user__state">
      Would you be so kind to login into your vk account and open your audios page
    </p>
  {:else if $user.readyState === USER_READY_STATE.READY}
    <span class="user__item">
      User ID <span class="user__value">{$user.id}</span>
    </span>
    <span class="user__item">
      Cookie <span class="user__value">{partlyHiddenCookie}</span>
    </span>
  {/if}
  <button
    class="btn user__retry-btn"
    type="button"
    on:click={handleReTry}
  >
    Reload
  </button>
</div>

<style global>
  .user {
    display: flex;
    align-items: baseline;
  }
  .user__state {
    margin-right: 12px;
  }
  .user__item {
    margin-right: 12px;
  }
  .user__value {
    opacity: 0.75;
  }
  .user__retry-btn {
    margin-left: auto;
  }
</style>
