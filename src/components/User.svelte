<script>
  import { getContext } from 'svelte';
  import { USER_READY_STATE } from '~/src/helpers/user';

  export let className = '';

  const stores = getContext('stores');
  const { i18n, user } = stores;
  let partlyHiddenCookie = '';

  $: partlyHiddenCookie = $user.cookieValue.slice(0, 12).concat('*****');

  function handleReTry() {
    stores.reTry();
  }
</script>

<div class="user {className}">
  {#if $user.readyState === USER_READY_STATE.INITIAL}
    <p class="user__state">
      {$i18n.user.stateInitial}
    </p>
  {:else if $user.readyState === USER_READY_STATE.STORAGE}
    <p class="user__state">
      {$i18n.user.stateStorage}
    </p>
  {:else if $user.readyState === USER_READY_STATE.TABS}
    <p class="user__state">
      {$i18n.user.stateTabs}
    </p>
  {:else if $user.readyState === USER_READY_STATE.COOKIES}
    <p class="user__state">
      {$i18n.user.stateCookies}
    </p>
  {:else if $user.readyState === USER_READY_STATE.EXPIRED}
    <p class="user__state">
      {$i18n.user.stateExpired}
    </p>
  {:else if $user.readyState === USER_READY_STATE.NOT_FOUND}
    <p class="user__state">
      {$i18n.user.stateNotFound}
    </p>
  {:else if $user.readyState === USER_READY_STATE.READY}
    <span class="user__item">
      <span class="user__label">
        {$i18n.user.labelUserId}
      </span>
      <span class="user__value">
        {$user.id}
      </span>
    </span>
    <span class="user__item">
      <span class="user__label">
        {$i18n.user.labelCookie}
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
    <span class="btn__wrp">
      <span class="btn__label">
        {$i18n.user.actionRetry}
      </span>
    </span>
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
    flex-shrink: 0;
    margin-left: auto;
    padding: 8px 12px;
    background-color: #ffffff0a;
    transition: background-color 0.15s;
  }
  .user__retry-btn:hover {
    background-color: #ffffff0f;
  }
</style>
