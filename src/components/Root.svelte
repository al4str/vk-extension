<script>
  import { setContext, onMount } from 'svelte';
  import { getStores } from '~/src/helpers/store';
  import '~/src/styles/global.css';
  import Errors from '~/src/components/Errors.svelte';
  import User from '~/src/components/User.svelte';
  import Tabs from '~/src/components/Tabs.svelte';

  const stores = getStores();
  setContext('stores', stores);

  onMount(stores.init);
</script>

<Errors />
<User />
<Tabs />
