<script>
  import { getContext } from 'svelte';

  export let className = '';

  const stores = getContext('stores');
  const { root } = stores;
</script>

{#if $root.errors.length}
  <ul class="errors {className}">
    {#each $root.errors as error}
      <li class="errors__item">
        {new Date(error.timestamp).toLocaleTimeString()} - {error.message}
      </li>
    {/each}
  </ul>
{/if}

<style global>
  .errors {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 16px;
    font-size: 10px;
    background-color: #f32c51;
    list-style: none;
  }
  .errors__item:not(:last-child) {
    margin-bottom: 12px;
  }
</style>
