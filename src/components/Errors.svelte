<script>
  import { getContext } from 'svelte';

  const stores = getContext('stores');
  const { root } = stores;
</script>

{#if $root.errors.length}
  <ul class="errors {$$restProps.class || ''}">
    {#each $root.errors as error}
      <li class="errors__item">
        {new Date(error.timestamp).toLocaleTimeString()} - {error.message}
      </li>
    {/each}
  </ul>
{/if}

<style global>
  .errors {
    margin: 0;
    padding: 8px;
    font-size: 10px;
    background-color: #f32c51;
    list-style: none;
  }
  .errors__item:not(:last-child) {
    margin-bottom: 12px;
  }
</style>
