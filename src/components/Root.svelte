<script>
  import { setContext, onMount } from 'svelte';
  import { getStores } from '~/src/helpers/store';
  import '~/src/styles/global.css';
  import User from '~/src/components/User.svelte';
  import List from '~/src/components/List.svelte';
  import Player from '~/src/components/Player/Player.svelte';
  import Errors from '~/src/components/Errors.svelte';

  const stores = getStores();
  setContext('stores', stores);

  onMount(stores.init);
</script>

<Errors class="errors" />
<User class="user" />
<List class="list" />
<Player class="player" />

<style global>
  .errors {
    margin-bottom: 16px;
  }
  .user {
    margin-bottom: 16px;
  }
  .list {
    margin-bottom: 16px;
  }
  .player {
    position: sticky;
    z-index: 1;
    bottom: 0;
  }
</style>
