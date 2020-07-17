<script>
  import Image from '~/src/components/Image.svelte';

  export let className = '';
  export let src = '';
  export let alt = '';
</script>

<span class="cover {className}">
  {#if src}
    <Image
      className="cover__img"
      src={src}
      alt={alt}
    />
  {:else}
    <span class="cover__alt" />
  {/if}
</span>

<style global>
  .cover {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: 3px;
  }
  .cover__img {
    width: 100%;
    height: 100%;
  }
  .cover__alt {
    display: block;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0h24v24H0z' /%3E%3Cpath d='M13 11.485v5.648c0 4.513-.875 5.384-4.374 5.842C6.957 23.195 5 22.437 5 19.814c0-1.282.802-2.498 2.461-2.816 1.267-.243-.09.018 2.776-.515.696-.129.775-.378.775-.908l-.002-4.194h-.008V7.063s-.005-2.058 0-3.088c.007-1.23.68-1.683 2.664-2.084 0 0 3.023-.573 4.685-.875.368-.067.649.07.649.492 0 0-.01 2.622 0 4.054.003.416-.168.605-.59.68l-4.865.86c-.374.092-.545.355-.545.733z' fill='%23ffffff' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E") center no-repeat, #ffffff0f;
    background-size: 60% auto;
    opacity: 0.25;
  }
</style>
