<script>
  import { getContext } from 'svelte';
  import { USER_READY_STATE } from '~/src/helpers/user';

  export let className = '';

  const stores = getContext('stores');
  const { user } = stores;
  let partlyHiddenCookie = '';

  $: partlyHiddenCookie = $user.cookieValue.slice(0, 12).concat('*****');

  function handleReTry() {
    stores.reTry();
  }
</script>

<div class="user {className}">
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
      <span class="user__label">
        User ID
      </span>
      <span class="user__value">
        {$user.id}
      </span>
    </span>
    <span class="user__item">
      <span class="user__label">
        Cookie
      </span>
      <span class="user__value">
        {partlyHiddenCookie}
      </span>
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
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 16px;
  }
  .user__state {
    margin-right: 12px;
  }
  .user__item {
    margin-right: 12px;
  }
  .user__label {
    display: block;
  }
  .user__value {
    display: block;
    color: #ffffffbe;
  }
  .user__retry-btn {
    margin-left: auto;
    padding: 8px 12px;
    background-color: #ffffff0a;
    transition: background-color 0.15s;
  }
  .user__retry-btn:hover {
    background-color: #ffffff0f;
  }
</style>
